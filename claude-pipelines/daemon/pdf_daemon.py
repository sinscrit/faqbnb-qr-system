#!/usr/bin/env python3
# claude-pipelines/daemon/pdf_daemon.py
# PDF Pipeline Daemon - Main Entry Point
# Created: 2026-01-11
# Last Modified: 2026-01-11 (refactored: PDF = single PRD, Agent 00 handles holistically)
#
# Automated daemon for PDF → Pipeline processing.
# Monitors inbox, processes PDF as a single PRD through agent pipeline.

"""
PDF Pipeline Daemon

Watches an inbox directory for PDF files containing feature requests.
Treats each PDF as a SINGLE PRD document and processes holistically:

Workflow:
  1. PDF (the PRD) → Extract text
  2. Agent 00 → Creates global implementation plan (may add requests)
  3. Agent 00b → Creates pipeline YAML
  4. Agent 01 (via orchestrator) → Breaks down into individual requests

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
import yaml
from pathlib import Path
from datetime import datetime
from typing import Optional, List, Dict, Any
from dataclasses import dataclass, field, asdict

# Local imports - handle both module and direct execution
try:
    from .pdf_extractor import extract_pdf_text, ExtractionResult
    from .config import load_config, DaemonConfig
    from .state import DaemonState, load_state, save_state
    from .route_tracer import trace_prd_routes, save_trace_result
except ImportError:
    from pdf_extractor import extract_pdf_text, ExtractionResult
    from config import load_config, DaemonConfig
    from state import DaemonState, load_state, save_state
    from route_tracer import trace_prd_routes, save_trace_result

# Setup logging
logger = logging.getLogger(__name__)


@dataclass
class PDFJobState:
    """
    Tracks progress for a single PDF through the pipeline.
    Enables resumption if interrupted.
    """
    pdf_path: str
    project_code: Optional[str] = None
    stage: str = "pending"  # pending, extracting, creating_prd, agent_00, agent_00b, orchestrator, completed, failed
    started_at: Optional[str] = None
    updated_at: Optional[str] = None

    # Paths to intermediate outputs (for resumption)
    prd_path: Optional[str] = None
    plan_path: Optional[str] = None
    yaml_path: Optional[str] = None

    # Error info
    error: Optional[str] = None

    def save(self, state_dir: Path) -> Path:
        """Save job state to YAML file."""
        state_dir.mkdir(parents=True, exist_ok=True)
        filename = Path(self.pdf_path).stem + ".job.yaml"
        state_file = state_dir / filename
        self.updated_at = datetime.now().isoformat()

        with open(state_file, 'w') as f:
            yaml.dump(asdict(self), f, default_flow_style=False)
        return state_file

    @classmethod
    def load(cls, state_file: Path) -> Optional['PDFJobState']:
        """Load job state from YAML file."""
        if not state_file.exists():
            return None
        try:
            with open(state_file, 'r') as f:
                data = yaml.safe_load(f)
            return cls(**data)
        except Exception:
            return None

    @classmethod
    def find_incomplete(cls, state_dir: Path) -> List['PDFJobState']:
        """Find all incomplete job states, including failed jobs that can be resumed."""
        incomplete = []
        if not state_dir.exists():
            return incomplete
        for state_file in state_dir.glob("*.job.yaml"):
            job = cls.load(state_file)
            if not job:
                continue
            # Include incomplete jobs
            if job.stage not in ("completed", "failed"):
                incomplete.append(job)
            # Also include "failed" jobs that have yaml_path - these failed at orchestrator
            # stage and can be resumed from there
            elif job.stage == "failed" and job.yaml_path:
                job.stage = "orchestrator"  # Reset to orchestrator for retry
                incomplete.append(job)
        return incomplete


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
        logger.info(f"  Pipeline depth: {self.config.daemon.pipeline_depth}")
        logger.info("=" * 60)

        # Check for incomplete jobs to resume
        self._resume_incomplete_jobs()

        try:
            while self.running:
                self.check_inbox()
                if self.running:
                    import time
                    time.sleep(self.config.daemon.poll_interval)
        finally:
            self.stop()

    def _resume_incomplete_jobs(self) -> None:
        """Check for and resume any incomplete jobs from previous runs."""
        job_state_dir = self.config.daemon.state_file.parent / "jobs"
        incomplete_jobs = PDFJobState.find_incomplete(job_state_dir)

        if not incomplete_jobs:
            logger.info("No incomplete jobs to resume")
            return

        logger.info(f"Found {len(incomplete_jobs)} incomplete job(s) to resume")

        for job in incomplete_jobs:
            if not self.running:
                break

            pdf_path = Path(job.pdf_path)

            # Check if PDF still exists (might be in inbox, processed, or failed)
            if not pdf_path.exists():
                # Check in failed directory
                failed_path = self.config.daemon.failed_dir / pdf_path.name
                if failed_path.exists():
                    # Move back to process
                    logger.info(f"Moving {pdf_path.name} from failed back to inbox for resumption")
                    shutil.move(str(failed_path), str(pdf_path))
                else:
                    logger.warning(f"Cannot resume {pdf_path.name}: PDF not found")
                    job.stage = "failed"
                    job.error = "PDF file not found for resumption"
                    job.save(job_state_dir)
                    continue

            logger.info(f"Resuming job: {pdf_path.name} from stage '{job.stage}'")
            try:
                self.process_pdf(pdf_path, job.project_code, job)
            except Exception as e:
                logger.error(f"Failed to resume {pdf_path.name}: {e}")

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

    def process_pdf(self, pdf_path: Path, project_code: Optional[str] = None,
                     job: Optional[PDFJobState] = None) -> None:
        """
        Process a single PDF through the full pipeline.
        Supports resumption from any stage using job state.

        The PDF is treated as a SINGLE PRD document. Agent 00 looks at the
        totality of requests to create a global implementation plan.

        Workflow:
          1. Extract text from PDF
          2. Create PRD markdown from extracted text
          3. Agent 00: Create global implementation plan (holistic view)
          4. Agent 00b: Create pipeline YAML
          5. Orchestrator runs (Agent 01 breaks down into individual requests)

        Args:
            pdf_path: Path to the PDF file
            project_code: Project code from filename (e.g., "FAQBNB")
            job: Optional existing job state for resumption
        """
        logger.info(f"Processing: {pdf_path.name}")

        # Get job state directory
        job_state_dir = self.config.daemon.state_file.parent / "jobs"

        # Create or load job state
        if job is None:
            job = PDFJobState(
                pdf_path=str(pdf_path),
                project_code=project_code,
                stage="pending",
                started_at=datetime.now().isoformat()
            )
        else:
            logger.info(f"Resuming from stage: {job.stage}")

        self.state.start_job(str(pdf_path), job.stage, project_code=project_code)
        save_state(self.state, self.config.daemon.state_file)

        depth = self.config.daemon.pipeline_depth

        # Stage order for resumption logic
        stages = ["pending", "extracting", "creating_prd", "agent_00", "agent_00b", "orchestrator"]
        current_stage_idx = stages.index(job.stage) if job.stage in stages else 0

        try:
            # Step 1: Extract text from PDF (skip if already done)
            if current_stage_idx <= stages.index("extracting"):
                job.stage = "extracting"
                job.save(job_state_dir)

                logger.info("Step 1: Extracting text from PDF")
                extraction = extract_pdf_text(pdf_path, timeout=self.config.pdf_extraction.timeout)

                if not extraction.success:
                    raise Exception(f"PDF extraction failed: {extraction.error}")

                if extraction.is_empty:
                    raise Exception("PDF extraction returned empty text")

                logger.info(f"Extracted {len(extraction.text)} chars from {extraction.page_count} pages")
                self._last_extraction_text = extraction.text  # Cache for PRD creation
            else:
                logger.info("Step 1: Skipped (already extracted)")

            # Check if we should stop at extraction
            if depth == "extract_only":
                logger.info("Pipeline depth is 'extract_only', stopping after extraction")
                job.stage = "completed"
                job.save(job_state_dir)
                self._move_to_processed(pdf_path)
                self.state.complete_job(str(pdf_path), 0, [])
                save_state(self.state, self.config.daemon.state_file)
                return

            # Step 2: Create PRD from entire PDF content (skip if already done)
            prd_path = Path(job.prd_path) if job.prd_path else None

            if current_stage_idx <= stages.index("creating_prd") or not prd_path or not prd_path.exists():
                job.stage = "creating_prd"
                self.state.update_job(str(pdf_path), "creating_prd")
                save_state(self.state, self.config.daemon.state_file)
                job.save(job_state_dir)

                logger.info("Step 2: Creating PRD from PDF content")
                # Re-extract if needed (for resumption)
                if not hasattr(self, '_last_extraction_text'):
                    extraction = extract_pdf_text(pdf_path, timeout=self.config.pdf_extraction.timeout)
                    self._last_extraction_text = extraction.text

                prd_path = self._create_prd_from_pdf(pdf_path, self._last_extraction_text, project_code)
                job.prd_path = str(prd_path)
                job.save(job_state_dir)
                logger.info(f"Created PRD: {prd_path}")
            else:
                logger.info(f"Step 2: Skipped (PRD exists: {prd_path})")

            # Check if we should stop at PRD creation
            if depth == "parse_only":
                logger.info("Pipeline depth is 'parse_only', stopping after PRD creation")
                job.stage = "completed"
                job.save(job_state_dir)
                self._move_to_processed(pdf_path)
                self.state.complete_job(str(pdf_path), 1, [str(prd_path)])
                save_state(self.state, self.config.daemon.state_file)
                return

            # Step 3: Agent 00 - Create global implementation plan (skip if already done)
            plan_path = Path(job.plan_path) if job.plan_path else None

            if current_stage_idx <= stages.index("agent_00") or not plan_path or not plan_path.exists():
                job.stage = "agent_00"
                self.state.update_job(str(pdf_path), "agent_00")
                save_state(self.state, self.config.daemon.state_file)
                job.save(job_state_dir)

                logger.info("Step 3: Agent 00 - Creating global implementation plan")
                plan_path = self._invoke_agent_00(prd_path)

                if not plan_path:
                    raise Exception("Agent 00 did not produce implementation plan")

                job.plan_path = str(plan_path)
                job.save(job_state_dir)
                logger.info(f"Implementation plan: {plan_path}")
            else:
                logger.info(f"Step 3: Skipped (plan exists: {plan_path})")

            # Check if we should stop at plan
            if depth == "plan_only":
                logger.info("Pipeline depth is 'plan_only', stopping after implementation plan")
                job.stage = "completed"
                job.save(job_state_dir)
                self._move_to_processed(pdf_path)
                self.state.complete_job(str(pdf_path), 1, [str(plan_path)])
                save_state(self.state, self.config.daemon.state_file)
                return

            # Step 4: Agent 00b - Create pipeline YAML (skip if already done)
            yaml_path = Path(job.yaml_path) if job.yaml_path else None

            if current_stage_idx <= stages.index("agent_00b") or not yaml_path or not yaml_path.exists():
                job.stage = "agent_00b"
                self.state.update_job(str(pdf_path), "agent_00b")
                save_state(self.state, self.config.daemon.state_file)
                job.save(job_state_dir)

                logger.info("Step 4: Agent 00b - Creating pipeline YAML")
                yaml_path = self._invoke_agent_00b(plan_path)

                if not yaml_path:
                    raise Exception("Agent 00b did not produce pipeline YAML")

                job.yaml_path = str(yaml_path)
                job.save(job_state_dir)
                logger.info(f"Pipeline YAML: {yaml_path}")
            else:
                logger.info(f"Step 4: Skipped (YAML exists: {yaml_path})")

            # Step 5: Run orchestrator (includes Agent 01 for request breakdown)
            job.stage = "orchestrator"
            self.state.update_job(str(pdf_path), "orchestrator")
            save_state(self.state, self.config.daemon.state_file)
            job.save(job_state_dir)

            logger.info("Step 5: Running orchestrator (Agent 01 will break down into requests)")
            success = self._run_orchestrator(yaml_path)

            if not success:
                raise Exception("Orchestrator failed")

            # Complete successfully
            job.stage = "completed"
            job.save(job_state_dir)
            self._move_to_processed(pdf_path)
            self.state.complete_job(str(pdf_path), 1, [str(yaml_path)])
            save_state(self.state, self.config.daemon.state_file)
            logger.info(f"Successfully processed {pdf_path.name}")

        except Exception as e:
            error_msg = str(e)
            logger.error(f"Failed to process {pdf_path.name}: {error_msg}")
            job.error = error_msg
            job.stage = "failed"
            job.save(job_state_dir)
            self.state.fail_job(str(pdf_path), "processing", error_msg)
            save_state(self.state, self.config.daemon.state_file)
            self._move_to_failed(pdf_path, error_msg)

    def _create_prd_from_pdf(self, pdf_path: Path, extracted_text: str,
                              project_code: Optional[str] = None) -> Path:
        """
        Create a PRD markdown file from the entire PDF content.

        The PDF is treated as a single PRD document. This method converts
        the extracted text into a properly formatted PRD markdown file.

        Args:
            pdf_path: Original PDF path (for naming)
            extracted_text: Full extracted text from PDF
            project_code: Project code from filename

        Returns:
            Path to created PRD file
        """
        output_dir = self.config.parser_skill.output_dir
        output_dir.mkdir(parents=True, exist_ok=True)

        # Generate filename from PDF name
        pdf_stem = pdf_path.stem  # e.g., "CPL-FAQBNB-Review-2026-01-11"
        timestamp = datetime.now().strftime('%Y%m%d-%H%M%S')
        filename = f"prd-{pdf_stem}-{timestamp}.md"
        prd_path = output_dir / filename

        # Create PRD content
        content = f"""# {pdf_stem}

**Created:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
**Source:** {pdf_path.name}
**Project:** {project_code or 'Unknown'}

---

## Overview

This PRD was generated from a PDF review document containing multiple feature requests.
Agent 00 should analyze all requests holistically to create a comprehensive implementation plan.

---

## PDF Content

{extracted_text}

---

## Processing Instructions

This document contains multiple requests that may have dependencies or overlapping concerns.
The implementation plan should:

1. Identify all distinct requests/features
2. Analyze dependencies between requests
3. Determine optimal implementation order
4. Identify any additional requests needed for completeness
5. Create a unified implementation strategy

"""
        prd_path.write_text(content)
        return prd_path

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

            # Claude's --output-format json wraps the result
            # Format: {"type":"result","result":"```json\n{...}\n```"}
            try:
                wrapper = json.loads(output)
                if isinstance(wrapper, dict) and "result" in wrapper:
                    # Extract inner content from wrapper
                    inner = wrapper["result"]
                    # Strip markdown code fences if present
                    if inner.startswith("```"):
                        inner = re.sub(r'^```(?:json)?\n?', '', inner)
                        inner = re.sub(r'\n?```$', '', inner)
                    return json.loads(inner)
                # Not a wrapper, try direct parse
                if isinstance(wrapper, dict) and "requests" in wrapper:
                    return wrapper
            except json.JSONDecodeError:
                pass

            # Fallback: try to extract JSON from response
            json_match = re.search(r'\{[\s\S]*"requests"[\s\S]*\}', output)
            if json_match:
                return json.loads(json_match.group())
            raise Exception("Could not parse JSON from skill output")

        except subprocess.TimeoutExpired:
            raise Exception(f"Parser skill timed out after {self.config.parser_skill.timeout}s")

    def _format_route_trace_for_prompt(self, trace_result) -> str:
        """
        Format route trace result into a readable string for Agent 00 prompt.

        Args:
            trace_result: RouteTraceResult from route_tracer

        Returns:
            Formatted string with trace data
        """
        lines = []

        # Header
        lines.append(f"**Framework:** {trace_result.framework_detected}")
        lines.append(f"**Project Root:** {trace_result.project_root}")
        lines.append("")

        # Summary
        lines.append("### Summary")
        lines.append(f"- Routes found: {trace_result.summary['total_routes']}")
        lines.append(f"- Components identified: {trace_result.summary['components_identified']}")
        if trace_result.summary.get('unique_components'):
            lines.append(f"- Unique components: {', '.join(trace_result.summary['unique_components'])}")
        lines.append("")

        # Detailed traces
        lines.append("### Route → Component Mapping")
        lines.append("")
        lines.append("| Route | Page File | Component | Directory |")
        lines.append("|-------|-----------|-----------|-----------|")

        for trace in trace_result.traces:
            status = "✓" if trace.page_file_exists else "✗"
            page = trace.page_file if trace.page_file_exists else f"NOT FOUND: {trace.page_file}"
            comp = trace.primary_component or "UNKNOWN"
            comp_dir = trace.component_directory or "N/A"
            # Shorten paths for readability
            if trace.page_file:
                page_short = trace.page_file.replace(trace_result.project_root, "").lstrip("/")
            else:
                page_short = "N/A"
            if trace.component_directory:
                dir_short = trace.component_directory.replace(trace_result.project_root, "").lstrip("/")
            else:
                dir_short = "N/A"
            lines.append(f"| {status} {trace.route} | {page_short} | {comp} | {dir_short} |")

        lines.append("")

        # Verification hints
        lines.append("### Verification Hints")
        lines.append("")
        for trace in trace_result.traces:
            if trace.verification_hints:
                lines.append(f"**{trace.route}:**")
                for hint in trace.verification_hints:
                    lines.append(f"- {hint}")
                lines.append("")

        return "\n".join(lines)

    def _invoke_agent_00(self, prd_path: Path) -> Optional[Path]:
        """
        Invoke implementation planner agent.
        Only reuses existing plan if a YAML also exists (proving plan was completed).

        Args:
            prd_path: Path to PRD file

        Returns:
            Path to generated implementation plan, or None
        """
        docs_prd = self.config.project_root / "docs" / "prd"
        pipelines_dir = self.config.project_root / "claude-pipelines"
        prd_stem = prd_path.stem

        # ================================================================
        # ROUTE TRACING (Layer 1 verification)
        # Pre-trace routes from PRD to identify correct components
        # ================================================================
        route_trace_data = None
        route_trace_path = None
        try:
            logger.info("Running route tracer to identify target components...")
            trace_result = trace_prd_routes(prd_path, self.config.project_root)

            # Save trace result to JSON file alongside PRD
            route_trace_path = prd_path.parent / f"{prd_stem}-route-trace.json"
            save_trace_result(trace_result, route_trace_path)
            logger.info(f"Route trace saved: {route_trace_path}")

            # Format trace data for prompt
            route_trace_data = self._format_route_trace_for_prompt(trace_result)

            # Log summary
            logger.info(f"Route trace: {trace_result.summary['routes_found']} routes found, "
                       f"{trace_result.summary['components_identified']} components identified")
            for trace in trace_result.traces:
                status = "✓" if trace.page_file_exists else "✗"
                comp = trace.primary_component or "UNKNOWN"
                logger.info(f"  {status} {trace.route} → {comp}")

        except Exception as e:
            logger.warning(f"Route tracing failed (non-fatal): {e}")
            route_trace_data = "Route tracing was not available for this PRD."

        # Check if a plan already exists for this PRD
        existing_plan = None
        for search_dir in [docs_prd, prd_path.parent]:
            for pattern in ["*Implementation*.md", "*implementation*.md", "*Plan*.md", "*plan*.md"]:
                for plan_file in search_dir.glob(pattern):
                    # Check if plan references this PRD
                    try:
                        with open(plan_file, 'r') as f:
                            content = f.read()
                        if prd_path.name in content or prd_stem in content:
                            existing_plan = plan_file
                            break
                    except Exception:
                        continue
                if existing_plan:
                    break
            if existing_plan:
                break

        # Only reuse plan if a YAML also exists that references it
        # This proves the plan was fully completed (Agent 00b ran after Agent 00)
        if existing_plan:
            plan_stem = existing_plan.stem
            yaml_exists = False
            for yaml_file in pipelines_dir.glob("*.yaml"):
                try:
                    with open(yaml_file, 'r') as f:
                        yaml_content = f.read()
                    if existing_plan.name in yaml_content or plan_stem in yaml_content:
                        yaml_exists = True
                        break
                except Exception:
                    continue

            if yaml_exists:
                logger.info(f"Found verified implementation plan (YAML exists): {existing_plan}")
                return existing_plan
            else:
                logger.info(f"Found plan but no YAML - uncertain state, will recreate: {existing_plan}")
                # Don't reuse - fall through to create new plan

        # Record existing plan files BEFORE invoking agent
        existing_files = set()
        for pattern in ["*Implementation*.md", "*implementation*.md", "*Plan*.md", "*plan*.md"]:
            existing_files.update(docs_prd.glob(pattern))
            existing_files.update(prd_path.parent.glob(pattern))

        # Build prompt with route trace data
        prompt = f"""Use agent 00-implementation-planner for PRD at {prd_path}

## Route-to-Component Trace Data (Pre-verified by Daemon)

{route_trace_data}

## Your Task

1. Review the route trace data above - it maps PRD routes to actual page files and components
2. Perform SEMANTIC VERIFICATION: Confirm the traced component matches PRD description
   - If PRD says "Step X of 10", verify the component has 10 steps
   - If PRD shows specific UI elements, verify the component has them
3. If there's a mismatch, search for the correct component before proceeding
4. Create a comprehensive implementation plan targeting the VERIFIED component

## CRITICAL: Anti-Rationalization Rules

When the PRD description doesn't match the component you find, DO NOT:
- ❌ Conclude "the PRD must be outdated"
- ❌ Conclude "the screenshot is from an older version"
- ❌ Target a child/wrapper component instead of the traced component
- ❌ Rationalize the mismatch away

Instead, you MUST:
- ✓ Check if the TRACED component (not its children) has the described behavior
- ✓ Look for MULTIPLE step/stage systems (parent vs child components may differ)
- ✓ The PRD is the source of truth - find the component that SHOULD match, then plan changes to MAKE it match
- ✓ If traced component has 10 steps and PRD says "8 steps", plan to CHANGE it to 8 steps

Example: If route tracer says `/dashboard2/create → ItemCreationWorkflow`:
- Check ItemCreationWorkflow.tsx for step definitions (e.g., WORKFLOW_STEPS)
- Do NOT immediately dive into child components like ItemCapture
- If ItemCreationWorkflow has WORKFLOW_STEPS with 10 entries and PRD says "8 of 8", plan to reduce to 8
- The child component's PROGRESS_STAGES (4 stages) is a DIFFERENT concept - don't confuse them

IMPORTANT: Include a "Route-to-Component Verification" section in your plan documenting:
- The route trace results
- Your semantic verification findings
- Confirmation or correction of the target component
- Which specific file/constant defines the step count you're modifying"""

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

            # Find NEW plan files created by agent (comparing before/after)
            new_files = set()
            for pattern in ["*Implementation*.md", "*implementation*.md", "*Plan*.md", "*plan*.md"]:
                new_files.update(docs_prd.glob(pattern))
                new_files.update(prd_path.parent.glob(pattern))

            created_files = new_files - existing_files

            if created_files:
                # Return the most recently modified new file
                newest = max(created_files, key=lambda f: f.stat().st_mtime)
                logger.info(f"Agent 00 created: {newest}")
                return newest

            logger.error("Agent 00 did not create any new plan files")
            return None

        except subprocess.TimeoutExpired:
            logger.error(f"Agent 00 timed out after {self.config.implementation_planner.timeout}s")
            return None

    def _invoke_agent_00b(self, plan_path: Path) -> Optional[Path]:
        """
        Invoke pipeline creator agent.
        Only creates a new YAML if none exists for this plan.

        Args:
            plan_path: Path to implementation plan

        Returns:
            Path to generated pipeline YAML, or None
        """
        pipelines_dir = self.config.project_root / "claude-pipelines"
        project_root = self.config.project_root

        # Check if a pipeline YAML already exists for this plan
        # Look for YAMLs that might be related to this plan
        # Search both claude-pipelines/ and project root
        plan_stem = plan_path.stem
        existing_yaml = None

        # Check for exact match first in both directories
        for search_dir in [pipelines_dir, project_root]:
            for pattern in [f"pipeline-*{plan_stem[:30]}*.yaml", "pipeline*.yaml"]:
                for yaml_file in search_dir.glob(pattern):
                    # Read YAML to check if it references this plan
                    try:
                        with open(yaml_file, 'r') as f:
                            content = f.read()
                        if plan_path.name in content or plan_stem in content:
                            existing_yaml = yaml_file
                            break
                    except Exception:
                        continue
                if existing_yaml:
                    break
            if existing_yaml:
                break

        if existing_yaml:
            logger.info(f"Found existing pipeline YAML for this plan: {existing_yaml}")
            return existing_yaml

        # Record existing pipeline YAML files BEFORE invoking agent
        # Search both claude-pipelines/ and project root
        existing_files = set(pipelines_dir.glob("pipeline*.yaml"))
        existing_files.update(pipelines_dir.glob("*.yaml"))
        existing_files.update(project_root.glob("pipeline*.yaml"))
        existing_files.update(project_root.glob("*.yaml"))

        prompt = f"""Use agent 00b-pipeline-creator for plan at {plan_path}

Create a COMPLETE pipeline YAML configuration for this implementation plan.

## REQUIRED: All 6 Stages

The pipeline MUST include ALL 6 stages:
1. request (per-task) - Creates REQ-XXX entries
2. overview (per-task) - Creates overview documents
3. details (per-task) - Creates detailed task breakdowns
4. implementation (per-task) - Implements the code
5. testcheck (pipeline-level) - Verifies implementation, generates test harness
6. usecases (pipeline-level) - Generates E2E test scenarios

## REQUIRED: Context Section

Extract from the implementation plan and include a 'context' section:

```yaml
context:
  prd_vision: |
    <Extract the overall goal/vision from the implementation plan header>

  user_stories:
    - <User story 1>
    - <User story 2>

  key_features:
    - <Feature 1 being implemented>
    - <Feature 2 being implemented>

  epic_specific_scenarios:
    - <Testing scenarios specific to this epic>
```

## Request Stage Template

For the request stage, use 01p-request-fa-pipeline (requires explicit file path):

  invocation_template: |
    use agent 01p-request-fa-pipeline to create the request for: {{full_task}}

    CRITICAL: Target requests file is: {{requests_file_path}}

    IMPORTANT: Before creating the request:
    1. Read {{requests_file_path}} to find the HIGHEST existing REQ-XXX number
    2. Use the NEXT sequential number (e.g., if REQ-180 exists, use REQ-181)
    3. Format MUST be REQ-XXX (three digits minimum, e.g., REQ-181, not REQ-2)
    4. Append the new request to {{requests_file_path}}

## Overview Stage Template (CRITICAL: Dependencies Section)

For the overview stage, use 02p-techlead-overview-pipeline (requires explicit file path).
The invocation_template MUST include
instructions to write a Dependencies section for parallel execution planning.

See: claude-pipelines/templates/overview-stage-template.yaml

The overview document MUST include:

```markdown
## Dependencies

### Depends On (Completed First)
- **REQ-XXX** (Task X.Y): <Description>
  - <What this task provides that we need>

### Blocks (Requires This First)
- **REQ-XXX** (Task X.Y): <Description>
  - <What we provide that they need>

### Parallel Safety
- **Files touched**: <List of files modified>
- **Conflicts with**: <Tasks with file overlap>
- **Safe to parallelize with**: <Tasks with no conflicts>
```

This information is parsed by pipeline_dependencies.py to:
- Build dependency graph for parallel execution
- Compute topological execution order
- Identify parallel clusters (tasks that can run simultaneously)
- Detect dependency cycles

## Pipeline-Level Stages (testcheck, usecases)

For stages 5 and 6, set `mode: pipeline` and use the templates in:
- claude-pipelines/templates/pipeline-level-stages-template.yaml

These stages:
- Run ONCE for the entire pipeline (not per-task)
- Include {{prd_vision}}, {{user_stories}}, {{epic_specific_scenarios}} variables
- testcheck generates test harness at src/app/testing/{{pipeline_slug}}/page.tsx
- usecases adds scenarios to state file

## Reference Templates

- Request stage: claude-pipelines/templates/request-stage-template.yaml
- Overview stage: claude-pipelines/templates/overview-stage-template.yaml
- Pipeline-level stages: claude-pipelines/templates/pipeline-level-stages-template.yaml"""

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

            # Find NEW YAML files created by agent (comparing before/after)
            # Search both claude-pipelines/ and project root (agents may create in either)
            new_files = set(pipelines_dir.glob("pipeline*.yaml"))
            new_files.update(pipelines_dir.glob("*.yaml"))
            new_files.update(project_root.glob("pipeline*.yaml"))
            new_files.update(project_root.glob("*.yaml"))

            created_files = new_files - existing_files

            if created_files:
                # Return the most recently modified new file
                newest = max(created_files, key=lambda f: f.stat().st_mtime)
                logger.info(f"Agent 00b created: {newest}")
                return newest

            logger.error("Agent 00b did not create any new pipeline YAML files")
            return None

        except subprocess.TimeoutExpired:
            logger.error(f"Agent 00b timed out after {self.config.pipeline_creator.timeout}s")
            return None

    def _run_orchestrator(self, yaml_path: Path) -> bool:
        """
        Run the pipeline orchestrator in 3 phases.

        Phase 1: request,overview (horizontal) - all tasks get requests/overviews first
        Phase 2: details,implementation (per-task) - detailed work per task
        Phase 3: testcheck,usecases (pipeline-level) - verification after all tasks complete

        Args:
            yaml_path: Path to pipeline YAML

        Returns:
            True if successful
        """
        logger.info(f"Running orchestrator with: {yaml_path}")

        # Define the 3 orchestrator phases
        # --keep: Skip rerun prompt, keep existing requests and continue
        # --force: Continue even if precheck fails
        phases = [
            {
                "name": "Planning (horizontal)",
                "args": ["--stages", "request,overview", "--horizontal", "--keep", "--force"],
            },
            {
                "name": "Detailed work (per-task)",
                "args": ["--stages", "details,implementation", "--keep", "--force"],
            },
            {
                "name": "Verification (pipeline-level)",
                "args": ["--stages", "testcheck,usecases", "--keep", "--force"],
            },
        ]

        base_cmd = ["python", str(self.config.orchestrator.script), "--config", str(yaml_path)]

        for i, phase in enumerate(phases, 1):
            logger.info(f"Orchestrator phase {i}/3: {phase['name']}")

            try:
                result = subprocess.run(
                    base_cmd + phase["args"],
                    capture_output=True,
                    text=True,
                    cwd=self.config.project_root,
                    # No timeout - let orchestrator manage its own
                )

                if result.returncode != 0:
                    logger.error(f"Orchestrator phase {i} failed: {result.stderr[:1000]}")
                    # Continue to next phase even if one fails (orchestrator handles partial state)
                    # Only return False if it's a critical failure
                    if "critical" in result.stderr.lower() or "fatal" in result.stderr.lower():
                        return False

                logger.info(f"Orchestrator phase {i} completed")

            except Exception as e:
                logger.error(f"Orchestrator phase {i} error: {e}")
                return False

        logger.info("Orchestrator completed all 3 phases successfully")
        return True

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

        # Set status to running so monitor shows activity
        self.state.start()
        save_state(self.state, self.config.daemon.state_file)

        try:
            self.process_pdf(pdf_path)
            return True
        except Exception as e:
            logger.error(f"Processing failed: {e}")
            return False
        finally:
            # Set status back to stopped
            self.state.stop()
            save_state(self.state, self.config.daemon.state_file)


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
  %(prog)s --status                              Show formatted daemon status
  %(prog)s --status --status-json                Show status as JSON
  %(prog)s --monitor                             Live monitoring dashboard
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
    parser.add_argument(
        "--monitor", "-m",
        action="store_true",
        help="Run live monitoring dashboard"
    )
    parser.add_argument(
        "--status-json",
        action="store_true",
        help="Output status as JSON (default is rich formatted)"
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
        if args.status_json:
            status = get_status(config)
            print(json.dumps(status, indent=2))
        else:
            # Use rich formatted status
            try:
                from .monitor import show_status
            except ImportError:
                from monitor import show_status
            show_status(config.daemon.state_file, config)
        return 0

    if args.monitor:
        try:
            from .monitor import run_dashboard
        except ImportError:
            from monitor import run_dashboard
        run_dashboard(config.daemon.state_file, config)
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

    # Write PID file for foreground mode too
    if not args.daemon:
        config.daemon.pid_file.parent.mkdir(parents=True, exist_ok=True)
        config.daemon.pid_file.write_text(str(os.getpid()))

    try:
        daemon.start()
    finally:
        # Clean up PID file on exit
        if config.daemon.pid_file.exists():
            config.daemon.pid_file.unlink()

    return 0


if __name__ == "__main__":
    sys.exit(main())
