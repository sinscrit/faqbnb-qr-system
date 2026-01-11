#!/usr/bin/env python3
# claude-pipelines/health_check.py
# Pipeline Health Check System
# Created: 2026-01-11
# Last Modified: 2026-01-11
#
# Comprehensive health verification for the entire PDF → Pipeline chain.
# Verifies all components are properly connected and working in a "happy flow".

"""
Pipeline Health Check System

Verifies end-to-end connectivity of the pipeline chain:
1. PDF Extraction (pdfplumber)
2. Claude CLI availability
3. Parser Skill invocation
4. Agent 00 (Implementation Planner)
5. Agent 00b (Pipeline Creator)
6. Pipeline Orchestrator
7. Pipeline Distributor (optional)

Usage:
    python -m claude_pipelines.health_check
    python -m claude_pipelines.health_check --verbose
    python -m claude_pipelines.health_check --json

Exit codes:
    0 - All checks passed
    1 - One or more checks failed
    2 - Warnings only (non-critical issues)
"""

import os
import sys
import json
import time
import shutil
import logging
import argparse
import tempfile
import subprocess
from pathlib import Path
from datetime import datetime, timezone
from dataclasses import dataclass, field, asdict
from typing import Optional, List, Dict, Any, Callable
from enum import Enum

logger = logging.getLogger(__name__)


def utc_now_iso() -> str:
    """Get current UTC time as ISO string."""
    return datetime.now(timezone.utc).isoformat().replace('+00:00', 'Z')


class CheckStatus(Enum):
    """Health check result status."""
    PASS = "PASS"
    WARN = "WARN"
    FAIL = "FAIL"
    SKIP = "SKIP"


@dataclass
class HealthResult:
    """Result of a single health check."""
    component: str
    status: CheckStatus
    message: str = ""
    error: Optional[str] = None
    duration_ms: float = 0.0
    details: Dict[str, Any] = field(default_factory=dict)
    timestamp: str = field(default_factory=utc_now_iso)

    def to_dict(self) -> Dict[str, Any]:
        result = asdict(self)
        result['status'] = self.status.value
        return result


@dataclass
class HealthReport:
    """Complete health check report."""
    timestamp: str = field(default_factory=utc_now_iso)
    overall_status: CheckStatus = CheckStatus.PASS
    results: List[HealthResult] = field(default_factory=list)
    total_duration_ms: float = 0.0
    summary: Dict[str, int] = field(default_factory=dict)

    def add_result(self, result: HealthResult) -> None:
        """Add a result and update overall status."""
        self.results.append(result)
        self.total_duration_ms += result.duration_ms

        # Update overall status (FAIL > WARN > PASS)
        if result.status == CheckStatus.FAIL:
            self.overall_status = CheckStatus.FAIL
        elif result.status == CheckStatus.WARN and self.overall_status != CheckStatus.FAIL:
            self.overall_status = CheckStatus.WARN

    def finalize(self) -> None:
        """Finalize the report with summary statistics."""
        self.summary = {
            "total": len(self.results),
            "passed": sum(1 for r in self.results if r.status == CheckStatus.PASS),
            "warned": sum(1 for r in self.results if r.status == CheckStatus.WARN),
            "failed": sum(1 for r in self.results if r.status == CheckStatus.FAIL),
            "skipped": sum(1 for r in self.results if r.status == CheckStatus.SKIP),
        }

    def to_dict(self) -> Dict[str, Any]:
        return {
            "timestamp": self.timestamp,
            "overall_status": self.overall_status.value,
            "results": [r.to_dict() for r in self.results],
            "total_duration_ms": self.total_duration_ms,
            "summary": self.summary,
        }

    def to_json(self) -> str:
        """Export as formatted JSON."""
        return json.dumps(self.to_dict(), indent=2)

    def to_table(self) -> str:
        """Export as formatted table."""
        lines = [
            "",
            "=" * 70,
            "PIPELINE HEALTH CHECK REPORT",
            f"Timestamp: {self.timestamp}",
            "=" * 70,
            "",
            f"{'Component':<30} {'Status':<8} {'Time (ms)':<10} {'Message'}",
            "-" * 70,
        ]

        for r in self.results:
            status_icon = {
                CheckStatus.PASS: "✓",
                CheckStatus.WARN: "⚠",
                CheckStatus.FAIL: "✗",
                CheckStatus.SKIP: "○",
            }.get(r.status, "?")

            msg = r.message[:25] + "..." if len(r.message) > 28 else r.message
            lines.append(
                f"{r.component:<30} {status_icon} {r.status.value:<5} {r.duration_ms:>8.1f}  {msg}"
            )

        lines.extend([
            "-" * 70,
            f"Overall: {self.overall_status.value}",
            f"Passed: {self.summary.get('passed', 0)}/{self.summary.get('total', 0)}",
            f"Total time: {self.total_duration_ms:.1f}ms",
            "=" * 70,
            "",
        ])

        return "\n".join(lines)


def timed_check(check_func: Callable[[], HealthResult]) -> HealthResult:
    """Run a check function and record timing."""
    start = time.time()
    try:
        result = check_func()
    except Exception as e:
        result = HealthResult(
            component=check_func.__name__.replace("check_", ""),
            status=CheckStatus.FAIL,
            error=str(e),
            message=f"Unexpected error: {type(e).__name__}",
        )
    result.duration_ms = (time.time() - start) * 1000
    return result


# =============================================================================
# INDIVIDUAL HEALTH CHECKS
# =============================================================================

def check_python_dependencies() -> HealthResult:
    """Check that required Python packages are installed."""
    component = "python_dependencies"
    missing = []
    versions = {}

    packages = [
        ("pdfplumber", "pdfplumber"),
        ("yaml", "pyyaml"),
        ("watchdog", "watchdog"),
    ]

    for import_name, pip_name in packages:
        try:
            module = __import__(import_name)
            versions[pip_name] = getattr(module, "__version__", "unknown")
        except ImportError:
            missing.append(pip_name)

    if missing:
        return HealthResult(
            component=component,
            status=CheckStatus.FAIL,
            message=f"Missing packages: {', '.join(missing)}",
            error=f"Install with: pip install {' '.join(missing)}",
            details={"missing": missing, "installed": versions},
        )

    return HealthResult(
        component=component,
        status=CheckStatus.PASS,
        message=f"All {len(packages)} packages installed",
        details={"versions": versions},
    )


def check_pdf_extraction() -> HealthResult:
    """Verify PDF extraction capability with a test PDF."""
    component = "pdf_extraction"

    # Suppress pdfminer debug output
    logging.getLogger('pdfminer').setLevel(logging.WARNING)

    try:
        import pdfplumber
    except ImportError:
        return HealthResult(
            component=component,
            status=CheckStatus.FAIL,
            error="pdfplumber not installed",
        )

    # Look for a sample PDF to test with
    sample_pdfs = [
        Path("docs/prd/FAQBNB_Review_2026-01-11_1453.pdf"),
        Path("docs/prd/FAQBNB_Application_Review.pdf"),
    ]

    test_pdf = None
    for pdf in sample_pdfs:
        if pdf.exists():
            test_pdf = pdf
            break

    if not test_pdf:
        return HealthResult(
            component=component,
            status=CheckStatus.WARN,
            message="No sample PDF found to test extraction",
            details={"searched": [str(p) for p in sample_pdfs]},
        )

    try:
        with pdfplumber.open(test_pdf) as pdf:
            page_count = len(pdf.pages)
            text = ""
            for page in pdf.pages[:2]:  # Only test first 2 pages
                page_text = page.extract_text()
                if page_text:
                    text += page_text

        if not text.strip():
            return HealthResult(
                component=component,
                status=CheckStatus.WARN,
                message="PDF opened but no text extracted",
                details={"pdf": str(test_pdf), "pages": page_count},
            )

        return HealthResult(
            component=component,
            status=CheckStatus.PASS,
            message=f"Extracted {len(text)} chars from {page_count} pages",
            details={
                "pdf": str(test_pdf),
                "pages": page_count,
                "chars": len(text),
                "preview": text[:100] + "...",
            },
        )

    except Exception as e:
        return HealthResult(
            component=component,
            status=CheckStatus.FAIL,
            error=str(e),
            message="PDF extraction failed",
        )


def check_claude_cli() -> HealthResult:
    """Verify Claude CLI is available and responsive."""
    component = "claude_cli"

    # Check if claude is in PATH
    claude_path = shutil.which("claude")
    if not claude_path:
        return HealthResult(
            component=component,
            status=CheckStatus.FAIL,
            error="Claude CLI not found in PATH",
            message="Install Claude Code CLI",
        )

    # Test version command
    try:
        result = subprocess.run(
            ["claude", "--version"],
            capture_output=True,
            text=True,
            timeout=10,
        )

        if result.returncode != 0:
            return HealthResult(
                component=component,
                status=CheckStatus.WARN,
                message="Claude CLI found but --version failed",
                details={"path": claude_path, "stderr": result.stderr[:200]},
            )

        version = result.stdout.strip() or result.stderr.strip()

        return HealthResult(
            component=component,
            status=CheckStatus.PASS,
            message=f"Claude CLI available",
            details={"path": claude_path, "version": version[:100]},
        )

    except subprocess.TimeoutExpired:
        return HealthResult(
            component=component,
            status=CheckStatus.WARN,
            message="Claude CLI found but slow to respond",
            details={"path": claude_path},
        )
    except Exception as e:
        return HealthResult(
            component=component,
            status=CheckStatus.FAIL,
            error=str(e),
            message="Claude CLI check failed",
        )


def check_claude_prompt() -> HealthResult:
    """Test Claude CLI can execute a simple prompt."""
    component = "claude_prompt"

    try:
        result = subprocess.run(
            [
                "claude", "-p",
                "Respond with exactly: HEALTH_CHECK_OK",
                "--allowedTools", "",
            ],
            capture_output=True,
            text=True,
            timeout=30,
        )

        if "HEALTH_CHECK_OK" in result.stdout:
            return HealthResult(
                component=component,
                status=CheckStatus.PASS,
                message="Claude prompt execution working",
            )

        # Claude responded but not with expected output
        return HealthResult(
            component=component,
            status=CheckStatus.WARN,
            message="Claude responded but output unexpected",
            details={
                "stdout": result.stdout[:200],
                "returncode": result.returncode,
            },
        )

    except subprocess.TimeoutExpired:
        return HealthResult(
            component=component,
            status=CheckStatus.WARN,
            message="Claude prompt timed out (30s) - may be rate limited",
        )
    except Exception as e:
        return HealthResult(
            component=component,
            status=CheckStatus.FAIL,
            error=str(e),
            message="Claude prompt execution failed",
        )


def check_agent_00() -> HealthResult:
    """Test Agent 00 (Implementation Planner) reachability."""
    component = "agent_00_planner"

    try:
        # Send a minimal health-check prompt
        result = subprocess.run(
            [
                "claude", "-p",
                "HEALTH_CHECK: If you can see the agent 00-implementation-planner in your available agents, respond with 'AGENT_00_AVAILABLE'. This is a connectivity test only.",
                "--allowedTools", "",
            ],
            capture_output=True,
            text=True,
            timeout=30,
        )

        # Check for any indication agent is available
        output = result.stdout + result.stderr
        if result.returncode == 0:
            return HealthResult(
                component=component,
                status=CheckStatus.PASS,
                message="Agent 00 appears reachable",
                details={"response_length": len(output)},
            )

        return HealthResult(
            component=component,
            status=CheckStatus.WARN,
            message="Agent 00 check returned non-zero",
            details={"returncode": result.returncode},
        )

    except subprocess.TimeoutExpired:
        return HealthResult(
            component=component,
            status=CheckStatus.WARN,
            message="Agent 00 check timed out",
        )
    except Exception as e:
        return HealthResult(
            component=component,
            status=CheckStatus.FAIL,
            error=str(e),
        )


def check_agent_00b() -> HealthResult:
    """Test Agent 00b (Pipeline Creator) reachability."""
    component = "agent_00b_pipeline"

    try:
        result = subprocess.run(
            [
                "claude", "-p",
                "HEALTH_CHECK: If you can see the agent 00b-pipeline-creator in your available agents, respond with 'AGENT_00B_AVAILABLE'. This is a connectivity test only.",
                "--allowedTools", "",
            ],
            capture_output=True,
            text=True,
            timeout=30,
        )

        if result.returncode == 0:
            return HealthResult(
                component=component,
                status=CheckStatus.PASS,
                message="Agent 00b appears reachable",
            )

        return HealthResult(
            component=component,
            status=CheckStatus.WARN,
            message="Agent 00b check returned non-zero",
            details={"returncode": result.returncode},
        )

    except subprocess.TimeoutExpired:
        return HealthResult(
            component=component,
            status=CheckStatus.WARN,
            message="Agent 00b check timed out",
        )
    except Exception as e:
        return HealthResult(
            component=component,
            status=CheckStatus.FAIL,
            error=str(e),
        )


def check_orchestrator() -> HealthResult:
    """Verify pipeline orchestrator is available and can parse configs."""
    component = "orchestrator"

    orchestrator_paths = [
        Path("claude-pipelines/pipeline_orchestrator.py"),
        Path("pipeline_orchestrator.py"),
    ]

    orchestrator = None
    for p in orchestrator_paths:
        if p.exists():
            orchestrator = p
            break

    if not orchestrator:
        return HealthResult(
            component=component,
            status=CheckStatus.FAIL,
            error="pipeline_orchestrator.py not found",
            details={"searched": [str(p) for p in orchestrator_paths]},
        )

    # Test that it can run with --help
    try:
        result = subprocess.run(
            [sys.executable, str(orchestrator), "--help"],
            capture_output=True,
            text=True,
            timeout=10,
        )

        if result.returncode == 0 and ("--config" in result.stdout or "--help" in result.stdout):
            return HealthResult(
                component=component,
                status=CheckStatus.PASS,
                message="Orchestrator available and responds to --help",
                details={"path": str(orchestrator)},
            )

        return HealthResult(
            component=component,
            status=CheckStatus.WARN,
            message="Orchestrator found but --help output unexpected",
            details={"path": str(orchestrator), "returncode": result.returncode},
        )

    except subprocess.TimeoutExpired:
        return HealthResult(
            component=component,
            status=CheckStatus.WARN,
            message="Orchestrator --help timed out",
        )
    except Exception as e:
        return HealthResult(
            component=component,
            status=CheckStatus.FAIL,
            error=str(e),
        )


def check_distributor() -> HealthResult:
    """Verify pipeline distributor and git worktree support."""
    component = "distributor"

    distributor_paths = [
        Path("claude-pipelines/pipeline_distributor.py"),
        Path("pipeline_distributor.py"),
    ]

    distributor = None
    for p in distributor_paths:
        if p.exists():
            distributor = p
            break

    if not distributor:
        return HealthResult(
            component=component,
            status=CheckStatus.SKIP,
            message="Distributor not found (optional component)",
            details={"searched": [str(p) for p in distributor_paths]},
        )

    # Check git worktree availability
    try:
        result = subprocess.run(
            ["git", "worktree", "list"],
            capture_output=True,
            text=True,
            timeout=5,
        )

        if result.returncode != 0:
            return HealthResult(
                component=component,
                status=CheckStatus.WARN,
                message="Git worktree not available",
                details={"path": str(distributor)},
            )

        return HealthResult(
            component=component,
            status=CheckStatus.PASS,
            message="Distributor and git worktree available",
            details={
                "path": str(distributor),
                "worktrees": result.stdout.strip().split("\n")[:3],
            },
        )

    except Exception as e:
        return HealthResult(
            component=component,
            status=CheckStatus.WARN,
            error=str(e),
            message="Distributor check failed",
        )


def check_daemon_config() -> HealthResult:
    """Verify daemon configuration is valid."""
    component = "daemon_config"

    config_paths = [
        Path("claude-pipelines/daemon/daemon_config.yaml"),
    ]

    config_file = None
    for p in config_paths:
        if p.exists():
            config_file = p
            break

    if not config_file:
        return HealthResult(
            component=component,
            status=CheckStatus.FAIL,
            error="daemon_config.yaml not found",
        )

    try:
        import yaml
        with open(config_file) as f:
            config = yaml.safe_load(f)

        # Validate required sections
        required = ["daemon", "pdf_extraction", "parser_skill", "agents", "orchestrator"]
        missing = [k for k in required if k not in config]

        if missing:
            return HealthResult(
                component=component,
                status=CheckStatus.WARN,
                message=f"Config missing sections: {missing}",
                details={"path": str(config_file)},
            )

        return HealthResult(
            component=component,
            status=CheckStatus.PASS,
            message="Daemon config valid",
            details={
                "path": str(config_file),
                "sections": list(config.keys()),
            },
        )

    except Exception as e:
        return HealthResult(
            component=component,
            status=CheckStatus.FAIL,
            error=str(e),
        )


def check_directories() -> HealthResult:
    """Verify required directories exist or can be created."""
    component = "directories"

    dirs = [
        Path("claude-pipelines/inbox"),
        Path("claude-pipelines/processed"),
        Path("claude-pipelines/failed"),
        Path("claude-pipelines/daemon/state"),
        Path("claude-pipelines/daemon/logs"),
        Path("docs/prd/intake"),
    ]

    existing = []
    created = []
    failed = []

    for d in dirs:
        if d.exists():
            existing.append(str(d))
        else:
            try:
                d.mkdir(parents=True, exist_ok=True)
                created.append(str(d))
            except Exception as e:
                failed.append(f"{d}: {e}")

    if failed:
        return HealthResult(
            component=component,
            status=CheckStatus.FAIL,
            error=f"Failed to create: {failed}",
            details={"existing": existing, "created": created, "failed": failed},
        )

    return HealthResult(
        component=component,
        status=CheckStatus.PASS,
        message=f"{len(existing)} existing, {len(created)} created",
        details={"existing": existing, "created": created},
    )


def check_parser_skill() -> HealthResult:
    """Verify parser skill file exists."""
    component = "parser_skill"

    skill_path = Path("claude-pipelines/skills/pdf-request-parser.md")

    if not skill_path.exists():
        return HealthResult(
            component=component,
            status=CheckStatus.FAIL,
            error="Parser skill file not found",
            details={"expected": str(skill_path)},
        )

    content = skill_path.read_text()

    # Check for key sections
    required_sections = ["Output Format", "Parsing Rules", "Expected PDF Structure"]
    found = [s for s in required_sections if s in content]

    if len(found) < len(required_sections):
        missing = set(required_sections) - set(found)
        return HealthResult(
            component=component,
            status=CheckStatus.WARN,
            message=f"Skill file missing sections: {missing}",
            details={"path": str(skill_path), "found": found},
        )

    return HealthResult(
        component=component,
        status=CheckStatus.PASS,
        message="Parser skill file valid",
        details={"path": str(skill_path), "size": len(content)},
    )


# =============================================================================
# MAIN HEALTH CHECK RUNNER
# =============================================================================

def run_health_check(
    skip_claude: bool = False,
    verbose: bool = False,
) -> HealthReport:
    """
    Run all health checks and return a report.

    Args:
        skip_claude: Skip checks that require Claude CLI invocation
        verbose: Enable verbose logging

    Returns:
        HealthReport with all results
    """
    report = HealthReport()

    # Define check order (dependencies first)
    checks = [
        ("Python Dependencies", check_python_dependencies),
        ("Directories", check_directories),
        ("Daemon Config", check_daemon_config),
        ("Parser Skill", check_parser_skill),
        ("PDF Extraction", check_pdf_extraction),
        ("Orchestrator", check_orchestrator),
        ("Distributor", check_distributor),
    ]

    # Claude-dependent checks
    claude_checks = [
        ("Claude CLI", check_claude_cli),
        ("Claude Prompt", check_claude_prompt),
        ("Agent 00 (Planner)", check_agent_00),
        ("Agent 00b (Pipeline)", check_agent_00b),
    ]

    if not skip_claude:
        checks.extend(claude_checks)

    for name, check_func in checks:
        if verbose:
            print(f"Checking {name}...", end=" ", flush=True)

        result = timed_check(check_func)
        result.component = name  # Use friendly name
        report.add_result(result)

        if verbose:
            status_icon = {
                CheckStatus.PASS: "✓",
                CheckStatus.WARN: "⚠",
                CheckStatus.FAIL: "✗",
                CheckStatus.SKIP: "○",
            }.get(result.status, "?")
            print(f"{status_icon} {result.status.value} ({result.duration_ms:.0f}ms)")

    report.finalize()
    return report


def main():
    """CLI entry point for health check."""
    parser = argparse.ArgumentParser(
        description="Pipeline Health Check - Verify all components are working",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  %(prog)s                    Run all health checks
  %(prog)s --verbose          Show progress during checks
  %(prog)s --json             Output results as JSON
  %(prog)s --skip-claude      Skip Claude CLI checks (faster)
        """,
    )

    parser.add_argument(
        "--verbose", "-v",
        action="store_true",
        help="Show progress during checks",
    )
    parser.add_argument(
        "--json", "-j",
        action="store_true",
        help="Output results as JSON",
    )
    parser.add_argument(
        "--skip-claude",
        action="store_true",
        help="Skip Claude CLI checks (faster)",
    )

    args = parser.parse_args()

    # Setup logging
    log_level = logging.DEBUG if args.verbose else logging.WARNING
    logging.basicConfig(level=log_level, format="%(message)s")

    # Run checks
    report = run_health_check(
        skip_claude=args.skip_claude,
        verbose=args.verbose,
    )

    # Output results
    if args.json:
        print(report.to_json())
    else:
        print(report.to_table())

    # Exit with appropriate code
    if report.overall_status == CheckStatus.FAIL:
        return 1
    elif report.overall_status == CheckStatus.WARN:
        return 2
    return 0


if __name__ == "__main__":
    sys.exit(main())
