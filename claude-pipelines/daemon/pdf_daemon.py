#!/usr/bin/env python3
# claude-pipelines/daemon/pdf_daemon.py
# PDF Pipeline Daemon - Main Entry Point
# Created: 2026-01-11
# Last Modified: 2026-01-11 (added 24-hour file age filter)
#
# Automated daemon for PDF → Pipeline processing.
# Monitors inbox, extracts requests, invokes agents, runs pipelines.

"""
PDF Pipeline Daemon

Watches an inbox directory for PDF files containing feature requests,
extracts and parses them, then processes through the agent pipeline.

Usage:
    # Start daemon in foreground
    python -m claude_pipelines.daemon.pdf_daemon --config daemon_config.yaml

    # Start as background daemon
    python -m claude_pipelines.daemon.pdf_daemon --config daemon_config.yaml --daemon

    # Check status
    python -m claude_pipelines.daemon.pdf_daemon --status

    # Stop daemon
    python -m claude_pipelines.daemon.pdf_daemon --stop

    # Process single PDF (no daemon)
    python -m claude_pipelines.daemon.pdf_daemon --single /path/to/file.pdf
"""

import os
import sys
import json
import signal
import logging
import argparse
import subprocess
import shutil
import re
import time
from pathlib import Path
from datetime import datetime
from typing import Optional, List, Dict, Any
from dataclasses import dataclass

# Local imports
from .pdf_extractor import extract_pdf_text, ExtractionResult
from .config import load_config, DaemonConfig
from .state import DaemonState, load_state, save_state

# Setup logging
logger = logging.getLogger(__name__)


@dataclass
class PDFFileInfo:
    """Parsed information from PDF filename."""
    filename: str
    prefix: str
    project_code: str
    identifier: str
    is_valid: bool
    rejection_reason: Optional[str] = None


def parse_pdf_filename(
    filename: str,
    expected_prefix: str,
    project_code_length: int
) -> PDFFileInfo:
    """
    Parse a PDF filename to extract prefix, project code, and identifier.

    Expected format: {prefix}-{project_code}-{identifier}.pdf
    Example: CPL-FAQBNB-review-20260111.pdf

    Args:
        filename: PDF filename (not full path)
        expected_prefix: Expected prefix (e.g., "CPL")
        project_code_length: Expected length of project code (e.g., 6)

    Returns:
        PDFFileInfo with parsed components and validation status
    """
    # Must be a PDF
    if not filename.lower().endswith('.pdf'):
        return PDFFileInfo(
            filename=filename,
            prefix="",
            project_code="",
            identifier="",
            is_valid=False,
            rejection_reason="Not a PDF file"
        )

    # Remove .pdf extension
    name = filename[:-4]

    # Split by hyphen
    parts = name.split('-', 2)  # Split into at most 3 parts

    # Must have at least prefix-project-identifier
    if len(parts) < 3:
        return PDFFileInfo(
            filename=filename,
            prefix=parts[0] if parts else "",
            project_code="",
            identifier="",
            is_valid=False,
            rejection_reason=None  # Silent ignore - doesn't match pattern
        )

    prefix, project_code, identifier = parts[0], parts[1], parts[2]

    # Check prefix matches
    if prefix != expected_prefix:
        return PDFFileInfo(
            filename=filename,
            prefix=prefix,
            project_code=project_code,
            identifier=identifier,
            is_valid=False,
            rejection_reason=None  # Silent ignore - wrong prefix
        )

    # Check project code length
    if len(project_code) != project_code_length:
        return PDFFileInfo(
            filename=filename,
            prefix=prefix,
            project_code=project_code,
            identifier=identifier,
            is_valid=False,
            rejection_reason=None  # Silent ignore - wrong project code length
        )

    # Valid format - project code will be validated against approved list separately
    return PDFFileInfo(
        filename=filename,
        prefix=prefix,
        project_code=project_code,
        identifier=identifier,
        is_valid=True
    )


@dataclass
class ParsedRequest:
    """A single parsed request from the PDF."""
    id: int
    title: str
    screen: str
    priority: str
    current_state: str
    problem: str
    required_changes: List[str]

    def to_prd_content(self, session_info: Dict[str, Any]) -> str:
        """Generate PRD markdown content for this request."""
        changes_md = "\n".join(f"- {c}" for c in self.required_changes)

        return f"""# {self.title}

**Created:** {datetime.now().strftime('%Y-%m-%d')}
**Last Modified:** {datetime.now().strftime('%Y-%m-%d')}
**Priority:** {self.priority.upper()}
**Screen/Component:** {self.screen}
**Source:** PDF Review ({session_info.get('date', 'unknown')})

---

## Overview

{self.problem}

## Current State

{self.current_state}

## Requirements

### Required Changes

{changes_md}

## Acceptance Criteria

- [ ] All required changes implemented
- [ ] Code follows existing patterns
- [ ] Tests pass
- [ ] No regressions introduced

## Technical Notes

- Originated from PDF request #{self.id}
- Auto-generated by PDF Pipeline Daemon
"""


class PipelineDaemon:
    """
    Main daemon class for PDF → Pipeline processing.

    Monitors inbox for PDFs, extracts text, parses requests,
    and processes each through the agent pipeline.
    """

    def __init__(self, config: DaemonConfig):
        """
        Initialize the daemon.

        Args:
            config: DaemonConfig instance
        """
        self.config = config
        self.state = load_state(config.daemon.state_file)
        self.running = False
        self._setup_signal_handlers()

    def _setup_signal_handlers(self) -> None:
        """Setup graceful shutdown handlers."""
        signal.signal(signal.SIGTERM, self._handle_shutdown)
        signal.signal(signal.SIGINT, self._handle_shutdown)

    def _handle_shutdown(self, signum: int, frame: Any) -> None:
        """Handle shutdown signal gracefully."""
        logger.info(f"Shutdown signal received (signal {signum}), finishing current job...")
        self.running = False

    def _ensure_directories(self) -> None:
        """Ensure all required directories exist."""
        dirs = [
            self.config.daemon.inbox_dir,
            self.config.daemon.processed_dir,
            self.config.daemon.failed_dir,
            self.config.daemon.rejected_dir,
            self.config.parser_skill.output_dir,
            self.config.daemon.state_file.parent,
            self.config.daemon.log_file.parent,
        ]
        for d in dirs:
            d.mkdir(parents=True, exist_ok=True)

    def start(self) -> None:
        """Start the daemon main loop."""
        self._ensure_directories()
        self.running = True
        self.state.start()
        save_state(self.state, self.config.daemon.state_file)

        logger.info("=" * 60)
        logger.info("PDF Pipeline Daemon started")
        logger.info(f"  Inbox: {self.config.daemon.inbox_dir}")
        logger.info(f"  Poll interval: {self.config.daemon.poll_interval}s")
        logger.info("=" * 60)

        try:
            while self.running:
                self.check_inbox()
                if self.running:
                    import time
                    time.sleep(self.config.daemon.poll_interval)
        finally:
            self.stop()

    def stop(self) -> None:
        """Stop the daemon gracefully."""
        self.running = False
        self.state.stop()
        save_state(self.state, self.config.daemon.state_file)
        logger.info("PDF Pipeline Daemon stopped")

    def check_inbox(self) -> None:
        """Check inbox for new PDFs to process."""
        inbox = self.config.daemon.inbox_dir
        pdfs = list(inbox.glob("*.pdf"))

        if pdfs:
            logger.debug(f"Found {len(pdfs)} PDF(s) in inbox")

        for pdf_path in pdfs:
            if not self.running:
                break

            # Skip if already processing
            if self.state.get_active_job(str(pdf_path)):
                logger.debug(f"Skipping {pdf_path.name}, already processing")
                continue

            # Skip files older than 24 hours
            file_age_seconds = time.time() - pdf_path.stat().st_mtime
            max_age_seconds = 24 * 60 * 60  # 24 hours
            if file_age_seconds > max_age_seconds:
                logger.debug(f"Ignoring {pdf_path.name}: file is older than 24 hours "
                           f"({file_age_seconds / 3600:.1f} hours old)")
                continue

            # Validate filename format
            file_info = parse_pdf_filename(
                pdf_path.name,
                self.config.daemon.pdf_prefix,
                self.config.daemon.project_code_length
            )

            # Silently ignore files that don't match the expected pattern
            if not file_info.is_valid:
                logger.debug(f"Ignoring {pdf_path.name}: does not match pattern "
                           f"{self.config.daemon.pdf_prefix}-XXXXXX-*.pdf")
                continue

            # Check if project code is in approved list
            if file_info.project_code not in self.config.daemon.approved_projects:
                logger.warning(f"Rejecting {pdf_path.name}: unknown project code "
                             f"'{file_info.project_code}'")
                self._move_to_rejected(
                    pdf_path,
                    f"Unknown project code: {file_info.project_code}. "
                    f"Approved: {self.config.daemon.approved_projects}"
                )
                continue

            # Valid file - process it
            logger.info(f"Processing: {pdf_path.name} (project: {file_info.project_code})")

            try:
                self.process_pdf(pdf_path, file_info.project_code)
            except Exception as e:
                logger.error(f"Unexpected error processing {pdf_path.name}: {e}")
                self._move_to_failed(pdf_path, str(e))

    def process_pdf(self, pdf_path: Path, project_code: Optional[str] = None) -> None:
        """
        Process a single PDF through the full pipeline.

        Args:
            pdf_path: Path to the PDF file
            project_code: Project code from filename (e.g., "FAQBNB")
        """
        logger.info(f"Processing: {pdf_path.name}")
        self.state.start_job(str(pdf_path), "extracting", project_code=project_code)
        save_state(self.state, self.config.daemon.state_file)

        try:
            # Step 1: Extract text from PDF
            logger.info("Step 1: Extracting text from PDF")
            extraction = extract_pdf_text(pdf_path, timeout=self.config.pdf_extraction.timeout)

            if not extraction.success:
                raise Exception(f"PDF extraction failed: {extraction.error}")

            if extraction.is_empty:
                raise Exception("PDF extraction returned empty text")

            logger.info(f"Extracted {len(extraction.text)} chars from {extraction.page_count} pages")

            # Step 2: Parse requests using Claude skill
            self.state.update_job(str(pdf_path), "parsing")
            save_state(self.state, self.config.daemon.state_file)

            logger.info("Step 2: Parsing requests with Claude skill")
            parsed = self._invoke_parser_skill(extraction.text, pdf_path.name)

            if not parsed.get("requests"):
                raise Exception("No requests found in PDF")

            requests = parsed["requests"]
            session_info = parsed.get("session", {})
            logger.info(f"Parsed {len(requests)} request(s)")

            # Step 3: Process each request
            pipelines_created = []
            for i, req_data in enumerate(requests):
                if not self.running:
                    logger.info("Shutdown requested, stopping at current request")
                    break

                self.state.update_job(
                    str(pdf_path), "processing",
                    request_index=i + 1,
                    request_total=len(requests)
                )
                save_state(self.state, self.config.daemon.state_file)

                request = ParsedRequest(
                    id=req_data.get("id", i + 1),
                    title=req_data.get("title", f"Request {i+1}"),
                    screen=req_data.get("screen", "Unknown"),
                    priority=req_data.get("priority", "medium"),
                    current_state=req_data.get("current_state", ""),
                    problem=req_data.get("problem", ""),
                    required_changes=req_data.get("required_changes", []),
                )

                pipeline_yaml = self._process_request(request, session_info, pdf_path)
                if pipeline_yaml:
                    pipelines_created.append(str(pipeline_yaml))

            # Step 4: Move to processed
            if self.running:
                self._move_to_processed(pdf_path)
                self.state.complete_job(str(pdf_path), len(requests), pipelines_created)
                save_state(self.state, self.config.daemon.state_file)
                logger.info(f"Successfully processed {pdf_path.name}")

        except Exception as e:
            error_msg = str(e)
            logger.error(f"Failed to process {pdf_path.name}: {error_msg}")
            self.state.fail_job(str(pdf_path), "processing", error_msg)
            save_state(self.state, self.config.daemon.state_file)
            self._move_to_failed(pdf_path, error_msg)

    def _process_request(self, request: ParsedRequest, session_info: Dict[str, Any],
                         source_pdf: Path) -> Optional[Path]:
        """
        Process a single request through agents and orchestrator.

        Args:
            request: ParsedRequest to process
            session_info: Session metadata from PDF
            source_pdf: Source PDF path for tracking

        Returns:
            Path to created pipeline YAML, or None if failed
        """
        logger.info(f"Processing request #{request.id}: {request.title}")

        try:
            # Create PRD file
            prd_path = self._create_prd_file(request, session_info)
            logger.info(f"Created PRD: {prd_path}")

            # Agent 00: Create implementation plan
            self.state.update_job(str(source_pdf), "agent_00", request_id=str(request.id))
            save_state(self.state, self.config.daemon.state_file)

            plan_path = self._invoke_agent_00(prd_path)
            if not plan_path:
                logger.warning(f"Agent 00 did not produce implementation plan for {request.title}")
                return None

            logger.info(f"Implementation plan: {plan_path}")

            # Agent 00b: Create pipeline YAML
            self.state.update_job(str(source_pdf), "agent_00b", request_id=str(request.id))
            save_state(self.state, self.config.daemon.state_file)

            yaml_path = self._invoke_agent_00b(plan_path)
            if not yaml_path:
                logger.warning(f"Agent 00b did not produce pipeline YAML for {request.title}")
                return None

            logger.info(f"Pipeline YAML: {yaml_path}")

            # Run orchestrator
            self.state.update_job(str(source_pdf), "orchestrator", request_id=str(request.id))
            save_state(self.state, self.config.daemon.state_file)

            self._run_orchestrator(yaml_path)

            return yaml_path

        except Exception as e:
            logger.error(f"Failed processing request #{request.id}: {e}")
            return None

    def _invoke_parser_skill(self, text: str, source_filename: str) -> Dict[str, Any]:
        """
        Invoke Claude skill to parse PDF text.

        Args:
            text: Extracted PDF text
            source_filename: Original PDF filename

        Returns:
            Parsed JSON with requests array
        """
        skill_file = self.config.parser_skill.skill_file

        # Read skill definition
        if skill_file.exists():
            skill_prompt = skill_file.read_text()
        else:
            logger.warning(f"Skill file not found: {skill_file}, using minimal prompt")
            skill_prompt = "Parse the following PDF text into JSON with a 'requests' array."

        # Combine skill prompt with input text
        full_prompt = f"{skill_prompt}\n\n---\n\n## INPUT TEXT:\n\n{text}"

        try:
            result = subprocess.run(
                ["claude", "-p", full_prompt, "--output-format", "json"],
                capture_output=True,
                text=True,
                timeout=self.config.parser_skill.timeout,
                cwd=self.config.project_root,
            )

            if result.returncode != 0:
                logger.error(f"Parser skill failed: {result.stderr}")
                raise Exception(f"Parser skill returned code {result.returncode}")

            # Parse JSON from output
            output = result.stdout.strip()

            # Try to find JSON in output
            try:
                return json.loads(output)
            except json.JSONDecodeError:
                # Try to extract JSON from response
                json_match = re.search(r'\{[\s\S]*\}', output)
                if json_match:
                    return json.loads(json_match.group())
                raise Exception("Could not parse JSON from skill output")

        except subprocess.TimeoutExpired:
            raise Exception(f"Parser skill timed out after {self.config.parser_skill.timeout}s")

    def _create_prd_file(self, request: ParsedRequest, session_info: Dict[str, Any]) -> Path:
        """
        Create PRD file from parsed request.

        Args:
            request: ParsedRequest to convert
            session_info: Session metadata

        Returns:
            Path to created PRD file
        """
        output_dir = self.config.parser_skill.output_dir
        output_dir.mkdir(parents=True, exist_ok=True)

        # Generate filename
        safe_title = re.sub(r'[^\w\s-]', '', request.title.lower())
        safe_title = re.sub(r'[\s]+', '-', safe_title)[:50]
        filename = f"prd-{safe_title}-{datetime.now().strftime('%Y%m%d-%H%M%S')}.md"
        prd_path = output_dir / filename

        # Write PRD content
        content = request.to_prd_content(session_info)
        prd_path.write_text(content)

        return prd_path

    def _invoke_agent_00(self, prd_path: Path) -> Optional[Path]:
        """
        Invoke implementation planner agent.

        Args:
            prd_path: Path to PRD file

        Returns:
            Path to generated implementation plan, or None
        """
        prompt = f"Use agent 00-implementation-planner for PRD at {prd_path}"

        try:
            result = subprocess.run(
                [
                    "claude", "-p", prompt,
                    "--allowedTools", self.config.implementation_planner.allowed_tools,
                ],
                capture_output=True,
                text=True,
                timeout=self.config.implementation_planner.timeout,
                cwd=self.config.project_root,
            )

            if result.returncode != 0:
                logger.error(f"Agent 00 failed: {result.stderr[:500]}")
                return None

            # Find the generated plan file
            return self._find_output_file(
                prd_path.parent,
                pattern="*implementation-plan*.md",
                after=datetime.now()
            )

        except subprocess.TimeoutExpired:
            logger.error(f"Agent 00 timed out after {self.config.implementation_planner.timeout}s")
            return None

    def _invoke_agent_00b(self, plan_path: Path) -> Optional[Path]:
        """
        Invoke pipeline creator agent.

        Args:
            plan_path: Path to implementation plan

        Returns:
            Path to generated pipeline YAML, or None
        """
        prompt = f"Use agent 00b-pipeline-creator for plan at {plan_path}"

        try:
            result = subprocess.run(
                [
                    "claude", "-p", prompt,
                    "--allowedTools", self.config.pipeline_creator.allowed_tools,
                ],
                capture_output=True,
                text=True,
                timeout=self.config.pipeline_creator.timeout,
                cwd=self.config.project_root,
            )

            if result.returncode != 0:
                logger.error(f"Agent 00b failed: {result.stderr[:500]}")
                return None

            # Find the generated YAML file
            return self._find_output_file(
                self.config.project_root,
                pattern="pipeline-*.yaml",
                after=datetime.now()
            )

        except subprocess.TimeoutExpired:
            logger.error(f"Agent 00b timed out after {self.config.pipeline_creator.timeout}s")
            return None

    def _run_orchestrator(self, yaml_path: Path) -> bool:
        """
        Run the pipeline orchestrator.

        Args:
            yaml_path: Path to pipeline YAML

        Returns:
            True if successful
        """
        logger.info(f"Running orchestrator with: {yaml_path}")

        try:
            result = subprocess.run(
                [
                    "python", str(self.config.orchestrator.script),
                    "--config", str(yaml_path),
                ],
                capture_output=True,
                text=True,
                cwd=self.config.project_root,
                # No timeout - let orchestrator manage its own
            )

            if result.returncode != 0:
                logger.error(f"Orchestrator failed: {result.stderr[:1000]}")
                return False

            logger.info("Orchestrator completed successfully")
            return True

        except Exception as e:
            logger.error(f"Orchestrator error: {e}")
            return False

    def _find_output_file(self, directory: Path, pattern: str,
                          after: datetime) -> Optional[Path]:
        """
        Find most recently created file matching pattern.

        Args:
            directory: Directory to search
            pattern: Glob pattern
            after: Only consider files modified after this time

        Returns:
            Path to newest matching file, or None
        """
        import time

        # Wait briefly for file to be created
        time.sleep(1)

        files = list(directory.glob(pattern))
        if not files:
            # Check parent directory too
            files = list(directory.parent.glob(pattern))

        if not files:
            return None

        # Sort by modification time, newest first
        files.sort(key=lambda f: f.stat().st_mtime, reverse=True)
        return files[0]

    def _move_to_processed(self, pdf_path: Path) -> None:
        """Move PDF to processed directory."""
        dest = self.config.daemon.processed_dir / pdf_path.name
        shutil.move(str(pdf_path), str(dest))
        logger.info(f"Moved to processed: {dest}")

    def _move_to_failed(self, pdf_path: Path, error: str) -> None:
        """Move PDF to failed directory with error log."""
        dest = self.config.daemon.failed_dir / pdf_path.name
        shutil.move(str(pdf_path), str(dest))

        # Write error log
        error_log = dest.with_suffix('.error.txt')
        error_log.write_text(f"Failed: {datetime.now().isoformat()}\nError: {error}\n")

        logger.info(f"Moved to failed: {dest}")

    def _move_to_rejected(self, pdf_path: Path, reason: str) -> None:
        """Move PDF to rejected directory with rejection reason."""
        dest = self.config.daemon.rejected_dir / pdf_path.name
        shutil.move(str(pdf_path), str(dest))

        # Write rejection log
        rejection_log = dest.with_suffix('.rejected.txt')
        rejection_log.write_text(
            f"Rejected: {datetime.now().isoformat()}\n"
            f"Reason: {reason}\n"
        )

        logger.info(f"Moved to rejected: {dest}")

    def process_single(self, pdf_path: Path) -> bool:
        """
        Process a single PDF without daemon mode.

        Args:
            pdf_path: Path to PDF file

        Returns:
            True if successful
        """
        self._ensure_directories()

        if not pdf_path.exists():
            logger.error(f"PDF not found: {pdf_path}")
            return False

        try:
            self.process_pdf(pdf_path)
            return True
        except Exception as e:
            logger.error(f"Processing failed: {e}")
            return False


def setup_logging(config: DaemonConfig, verbose: bool = False) -> None:
    """Configure logging for the daemon."""
    log_level = logging.DEBUG if verbose else logging.INFO

    # Ensure log directory exists
    config.daemon.log_file.parent.mkdir(parents=True, exist_ok=True)

    # Setup handlers
    handlers = [
        logging.StreamHandler(sys.stdout),
        logging.FileHandler(config.daemon.log_file),
    ]

    logging.basicConfig(
        level=log_level,
        format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
        handlers=handlers,
    )


def get_status(config: DaemonConfig) -> Dict[str, Any]:
    """Get daemon status information."""
    state = load_state(config.daemon.state_file)

    return {
        "status": state.status,
        "started_at": state.started_at,
        "stopped_at": state.stopped_at,
        "stats": {
            "pdfs_processed": state.stats.pdfs_processed,
            "pdfs_failed": state.stats.pdfs_failed,
            "requests_generated": state.stats.requests_generated,
            "pipelines_created": state.stats.pipelines_created,
        },
        "active_jobs": len(state.active_jobs),
        "inbox_pdfs": len(list(config.daemon.inbox_dir.glob("*.pdf"))),
    }


def main():
    """Main entry point for CLI."""
    parser = argparse.ArgumentParser(
        description="PDF Pipeline Daemon - Automated PDF → Pipeline processing",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  %(prog)s --config daemon_config.yaml           Start daemon in foreground
  %(prog)s --config daemon_config.yaml --daemon  Start as background daemon
  %(prog)s --status                              Show daemon status
  %(prog)s --single /path/to/file.pdf            Process single PDF
  %(prog)s --health-check                        Run pipeline health check
  %(prog)s --health-check --verbose              Health check with progress
  %(prog)s --health-check-json                   Health check as JSON
        """
    )

    parser.add_argument(
        "--config", "-c",
        type=Path,
        default=Path("claude-pipelines/daemon/daemon_config.yaml"),
        help="Path to configuration YAML file"
    )
    parser.add_argument(
        "--daemon", "-d",
        action="store_true",
        help="Run as background daemon"
    )
    parser.add_argument(
        "--status", "-s",
        action="store_true",
        help="Show daemon status"
    )
    parser.add_argument(
        "--stop",
        action="store_true",
        help="Stop running daemon"
    )
    parser.add_argument(
        "--single",
        type=Path,
        help="Process single PDF file (no daemon)"
    )
    parser.add_argument(
        "--verbose", "-v",
        action="store_true",
        help="Enable verbose logging"
    )
    parser.add_argument(
        "--health-check",
        action="store_true",
        help="Run health check on entire pipeline chain"
    )
    parser.add_argument(
        "--health-check-json",
        action="store_true",
        help="Run health check and output as JSON"
    )
    parser.add_argument(
        "--skip-claude-checks",
        action="store_true",
        help="Skip Claude CLI checks in health check (faster)"
    )

    args = parser.parse_args()

    # Load config
    config = load_config(args.config)

    # Setup logging
    setup_logging(config, args.verbose)

    # Handle commands
    if args.health_check or args.health_check_json:
        # Import health check module
        try:
            from claude_pipelines.health_check import run_health_check
        except ImportError:
            # Try relative import
            import sys
            sys.path.insert(0, str(Path(__file__).parent.parent))
            from health_check import run_health_check

        report = run_health_check(
            skip_claude=args.skip_claude_checks,
            verbose=args.verbose and not args.health_check_json,
        )

        if args.health_check_json:
            print(report.to_json())
        else:
            print(report.to_table())

        # Exit with appropriate code
        from health_check import CheckStatus
        if report.overall_status == CheckStatus.FAIL:
            return 1
        elif report.overall_status == CheckStatus.WARN:
            return 2
        return 0

    if args.status:
        status = get_status(config)
        print(json.dumps(status, indent=2))
        return 0

    if args.stop:
        pid_file = config.daemon.pid_file
        if pid_file.exists():
            pid = int(pid_file.read_text().strip())
            try:
                os.kill(pid, signal.SIGTERM)
                print(f"Sent SIGTERM to daemon (PID {pid})")
                pid_file.unlink()
                return 0
            except ProcessLookupError:
                print(f"Daemon not running (stale PID file)")
                pid_file.unlink()
                return 1
        else:
            print("Daemon not running (no PID file)")
            return 1

    if args.single:
        daemon = PipelineDaemon(config)
        success = daemon.process_single(args.single)
        return 0 if success else 1

    if args.daemon:
        # Fork to background
        pid = os.fork()
        if pid > 0:
            # Parent process
            config.daemon.pid_file.parent.mkdir(parents=True, exist_ok=True)
            config.daemon.pid_file.write_text(str(pid))
            print(f"Daemon started (PID {pid})")
            return 0
        else:
            # Child process - continue to daemon
            os.setsid()

    # Start daemon
    daemon = PipelineDaemon(config)
    daemon.start()
    return 0


if __name__ == "__main__":
    sys.exit(main())
