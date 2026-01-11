# claude-pipelines/daemon/state.py
# Daemon State Management Module
# Created: 2026-01-11
# Last Modified: 2026-01-11
#
# Persistent state tracking for the PDF Pipeline Daemon.

"""
Daemon State Management

Tracks daemon status, active jobs, and processing history.
Provides resume capability after daemon restart.

Usage:
    from daemon.state import DaemonState, load_state, save_state

    state = load_state(Path("state.json"))
    state.start_job("review.pdf", "parsing")
    save_state(state, Path("state.json"))
"""

import json
import logging
from pathlib import Path
from datetime import datetime
from dataclasses import dataclass, field, asdict
from typing import Optional, List, Dict, Any

logger = logging.getLogger(__name__)

# State schema version for migrations
STATE_VERSION = "1.0"


@dataclass
class ActiveJob:
    """Represents an in-progress PDF processing job."""
    pdf_path: str
    stage: str  # parsing, agent_00, agent_00b, orchestrator
    started_at: str
    project_code: Optional[str] = None
    request_index: int = 0
    request_total: int = 0
    current_request_id: Optional[str] = None

    @classmethod
    def from_dict(cls, data: dict) -> 'ActiveJob':
        return cls(
            pdf_path=data.get("pdf_path", ""),
            stage=data.get("stage", "unknown"),
            started_at=data.get("started_at", ""),
            project_code=data.get("project_code"),
            request_index=data.get("request_index", 0),
            request_total=data.get("request_total", 0),
            current_request_id=data.get("current_request_id"),
        )


@dataclass
class CompletedJob:
    """Represents a completed PDF processing job."""
    pdf_path: str
    requests_count: int
    completed_at: str
    pipelines_created: List[str] = field(default_factory=list)
    duration_seconds: float = 0.0
    project_code: Optional[str] = None

    @classmethod
    def from_dict(cls, data: dict) -> 'CompletedJob':
        return cls(
            pdf_path=data.get("pdf_path", ""),
            requests_count=data.get("requests_count", 0),
            completed_at=data.get("completed_at", ""),
            pipelines_created=data.get("pipelines_created", []),
            duration_seconds=data.get("duration_seconds", 0.0),
            project_code=data.get("project_code"),
        )


@dataclass
class FailedJob:
    """Represents a failed PDF processing job."""
    pdf_path: str
    failed_at: str
    stage: str
    error: str
    request_index: Optional[int] = None

    @classmethod
    def from_dict(cls, data: dict) -> 'FailedJob':
        return cls(
            pdf_path=data.get("pdf_path", ""),
            failed_at=data.get("failed_at", ""),
            stage=data.get("stage", "unknown"),
            error=data.get("error", ""),
            request_index=data.get("request_index"),
        )


@dataclass
class DaemonStats:
    """Daemon processing statistics."""
    pdfs_processed: int = 0
    pdfs_failed: int = 0
    requests_generated: int = 0
    pipelines_created: int = 0
    total_runtime_seconds: float = 0.0

    @classmethod
    def from_dict(cls, data: dict) -> 'DaemonStats':
        return cls(
            pdfs_processed=data.get("pdfs_processed", 0),
            pdfs_failed=data.get("pdfs_failed", 0),
            requests_generated=data.get("requests_generated", 0),
            pipelines_created=data.get("pipelines_created", 0),
            total_runtime_seconds=data.get("total_runtime_seconds", 0.0),
        )


@dataclass
class DaemonState:
    """Complete daemon state."""
    version: str = STATE_VERSION
    status: str = "stopped"  # running, stopped, error
    started_at: Optional[str] = None
    stopped_at: Optional[str] = None
    stats: DaemonStats = field(default_factory=DaemonStats)
    active_jobs: List[ActiveJob] = field(default_factory=list)
    history: List[CompletedJob] = field(default_factory=list)
    failed: List[FailedJob] = field(default_factory=list)

    def start(self) -> None:
        """Mark daemon as started."""
        self.status = "running"
        self.started_at = datetime.utcnow().isoformat() + "Z"
        self.stopped_at = None
        logger.info(f"Daemon state: started at {self.started_at}")

    def stop(self) -> None:
        """Mark daemon as stopped."""
        self.status = "stopped"
        self.stopped_at = datetime.utcnow().isoformat() + "Z"
        logger.info(f"Daemon state: stopped at {self.stopped_at}")

    def start_job(self, pdf_path: str, stage: str = "parsing",
                  project_code: Optional[str] = None) -> ActiveJob:
        """
        Start tracking a new job.

        Args:
            pdf_path: Path to the PDF being processed
            stage: Initial processing stage
            project_code: Project code from PDF filename

        Returns:
            The new ActiveJob instance
        """
        job = ActiveJob(
            pdf_path=str(pdf_path),
            stage=stage,
            started_at=datetime.utcnow().isoformat() + "Z",
            project_code=project_code,
        )
        self.active_jobs.append(job)
        logger.info(f"Job started: {pdf_path} (project: {project_code}, stage: {stage})")
        return job

    def update_job(self, pdf_path: str, stage: str, request_index: int = 0,
                   request_total: int = 0, request_id: Optional[str] = None) -> None:
        """Update an active job's progress."""
        for job in self.active_jobs:
            if job.pdf_path == str(pdf_path):
                job.stage = stage
                job.request_index = request_index
                job.request_total = request_total
                job.current_request_id = request_id
                logger.debug(f"Job updated: {pdf_path} -> {stage} ({request_index}/{request_total})")
                return
        logger.warning(f"Job not found for update: {pdf_path}")

    def complete_job(self, pdf_path: str, requests_count: int,
                     pipelines_created: List[str]) -> None:
        """
        Mark a job as completed.

        Args:
            pdf_path: Path to the completed PDF
            requests_count: Number of requests processed
            pipelines_created: List of pipeline YAML paths created
        """
        # Find and remove from active jobs
        job_to_remove = None
        for job in self.active_jobs:
            if job.pdf_path == str(pdf_path):
                job_to_remove = job
                break

        project_code = None
        if job_to_remove:
            self.active_jobs.remove(job_to_remove)
            started = datetime.fromisoformat(job_to_remove.started_at.rstrip("Z"))
            duration = (datetime.utcnow() - started).total_seconds()
            project_code = job_to_remove.project_code
        else:
            duration = 0.0

        # Add to history
        completed = CompletedJob(
            pdf_path=str(pdf_path),
            requests_count=requests_count,
            completed_at=datetime.utcnow().isoformat() + "Z",
            pipelines_created=pipelines_created,
            duration_seconds=duration,
            project_code=project_code,
        )
        self.history.append(completed)

        # Update stats
        self.stats.pdfs_processed += 1
        self.stats.requests_generated += requests_count
        self.stats.pipelines_created += len(pipelines_created)

        logger.info(f"Job completed: {pdf_path} ({requests_count} requests, {len(pipelines_created)} pipelines)")

    def fail_job(self, pdf_path: str, stage: str, error: str,
                 request_index: Optional[int] = None) -> None:
        """
        Mark a job as failed.

        Args:
            pdf_path: Path to the failed PDF
            stage: Stage where failure occurred
            error: Error message
            request_index: Optional request index where failure occurred
        """
        # Remove from active jobs
        self.active_jobs = [j for j in self.active_jobs if j.pdf_path != str(pdf_path)]

        # Add to failed
        failed = FailedJob(
            pdf_path=str(pdf_path),
            failed_at=datetime.utcnow().isoformat() + "Z",
            stage=stage,
            error=error,
            request_index=request_index,
        )
        self.failed.append(failed)

        # Update stats
        self.stats.pdfs_failed += 1

        logger.error(f"Job failed: {pdf_path} at {stage} - {error}")

    def get_active_job(self, pdf_path: str) -> Optional[ActiveJob]:
        """Get active job by PDF path."""
        for job in self.active_jobs:
            if job.pdf_path == str(pdf_path):
                return job
        return None

    def has_active_jobs(self) -> bool:
        """Check if there are any active jobs."""
        return len(self.active_jobs) > 0

    def to_dict(self) -> Dict[str, Any]:
        """Convert state to dictionary for JSON serialization."""
        return {
            "version": self.version,
            "status": self.status,
            "started_at": self.started_at,
            "stopped_at": self.stopped_at,
            "stats": asdict(self.stats),
            "active_jobs": [asdict(j) for j in self.active_jobs],
            "history": [asdict(j) for j in self.history[-100:]],  # Keep last 100
            "failed": [asdict(j) for j in self.failed[-50:]],  # Keep last 50
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'DaemonState':
        """Create state from dictionary."""
        return cls(
            version=data.get("version", STATE_VERSION),
            status=data.get("status", "stopped"),
            started_at=data.get("started_at"),
            stopped_at=data.get("stopped_at"),
            stats=DaemonStats.from_dict(data.get("stats", {})),
            active_jobs=[ActiveJob.from_dict(j) for j in data.get("active_jobs", [])],
            history=[CompletedJob.from_dict(j) for j in data.get("history", [])],
            failed=[FailedJob.from_dict(j) for j in data.get("failed", [])],
        )


def load_state(state_path: Path) -> DaemonState:
    """
    Load daemon state from JSON file.

    Args:
        state_path: Path to state JSON file

    Returns:
        DaemonState instance (empty if file doesn't exist)
    """
    if not state_path.exists():
        logger.info(f"No existing state file, starting fresh: {state_path}")
        return DaemonState()

    try:
        with open(state_path, 'r') as f:
            data = json.load(f)
        state = DaemonState.from_dict(data)
        logger.info(f"State loaded: {state.stats.pdfs_processed} processed, {len(state.active_jobs)} active")
        return state
    except Exception as e:
        logger.error(f"Failed to load state, starting fresh: {e}")
        return DaemonState()


def save_state(state: DaemonState, state_path: Path) -> bool:
    """
    Save daemon state to JSON file.

    Args:
        state: DaemonState to save
        state_path: Path to write state file

    Returns:
        True if successful, False otherwise
    """
    try:
        # Ensure directory exists
        state_path.parent.mkdir(parents=True, exist_ok=True)

        # Write atomically via temp file
        temp_path = state_path.with_suffix('.tmp')
        with open(temp_path, 'w') as f:
            json.dump(state.to_dict(), f, indent=2)

        temp_path.rename(state_path)
        logger.debug(f"State saved to: {state_path}")
        return True
    except Exception as e:
        logger.error(f"Failed to save state: {e}")
        return False


# CLI support
if __name__ == "__main__":
    import sys

    logging.basicConfig(
        level=logging.DEBUG,
        format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    )

    if len(sys.argv) < 2:
        print("Usage:")
        print("  python state.py show <state_file>  - Show state")
        print("  python state.py clear <state_file> - Clear state")
        sys.exit(1)

    command = sys.argv[1]
    state_path = Path(sys.argv[2]) if len(sys.argv) > 2 else Path("daemon-state.json")

    if command == "show":
        state = load_state(state_path)
        print(json.dumps(state.to_dict(), indent=2))
    elif command == "clear":
        state = DaemonState()
        save_state(state, state_path)
        print(f"State cleared: {state_path}")
    else:
        print(f"Unknown command: {command}")
        sys.exit(1)
