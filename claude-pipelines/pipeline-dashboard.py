#!/Library/Developer/CommandLineTools/usr/bin/python3
# =============================================================================
# Pipeline Dashboard - Terminal UI for Pipeline State Visualization
# =============================================================================
# A rich terminal dashboard that displays pipeline state as a Kanban board.
# Auto-refreshes to show real-time progress of pipeline processing.
#
# Usage:
#   python scripts/pipeline-dashboard.py [--refresh N] [--file STATE_FILE]
#
# Examples:
#   python scripts/pipeline-dashboard.py                    # Auto-detect state files
#   python scripts/pipeline-dashboard.py --refresh 5        # Refresh every 5 seconds
#   python scripts/pipeline-dashboard.py --file pipeline-state.json
#
# Created: 2026-01-05
# Last Modified: 2026-01-20 (Added error clearing when rate limit is lifted)
# =============================================================================

import json
import os
import sys
import time
import glob
import argparse
import re
from datetime import datetime
from pathlib import Path
from typing import Optional
from urllib.request import urlopen, Request
from urllib.error import URLError, HTTPError
from urllib.parse import urljoin

try:
    import yaml
    HAS_YAML = True
except ImportError:
    HAS_YAML = False

try:
    from rich.console import Console
    from rich.table import Table
    from rich.panel import Panel
    from rich.layout import Layout
    from rich.live import Live
    from rich.text import Text
    from rich.columns import Columns
    from rich import box
except ImportError:
    print("Error: 'rich' library is required.")
    print("Install it with: pip install rich")
    sys.exit(1)

# =============================================================================
# Configuration
# =============================================================================

# Status column mapping
STATUS_COLUMNS = {
    "pending": "Backlog",
    "processing": "In Progress",
    "completed": "Done",
    "failed": "Failed",
}

# Column colors
COLUMN_COLORS = {
    "Backlog": "white",
    "In Progress": "yellow",
    "Done": "green",
    "Failed": "red",
}

# Status emojis
STATUS_EMOJIS = {
    "pending": "⏳",
    "processing": "🔄",
    "completed": "✅",
    "failed": "❌",
}

# Worktree status colors
WORKTREE_COLORS = {
    "active": "green",
    "merging": "yellow",
    "conflict": "red",
    "idle": "dim",
}

# Stage timing estimates (calculated from historical data - 2026-01-22)
# Used for initial ETC calculations when no completed tasks exist yet.
STAGE_TIMING_ESTIMATES = {
    'request': {
        'avg_seconds': 81,      # ~1m 21s
        'min_seconds': 40,
        'max_seconds': 204,
    },
    'overview': {
        'avg_seconds': 191,     # ~3m 11s
        'min_seconds': 72,
        'max_seconds': 562,
    },
    'details': {
        'avg_seconds': 178,     # ~2m 58s
        'min_seconds': 33,
        'max_seconds': 414,
    },
    'implementation': {
        'avg_seconds': 721,     # ~12m 1s
        'min_seconds': 135,
        'max_seconds': 1277,
    },
    'qa_validation': {
        'avg_seconds': 384,     # ~6m 24s
        'min_seconds': 180,
        'max_seconds': 600,
    },
}

# =============================================================================
# Rate Limit Monitor
# =============================================================================

class RateLimitMonitor:
    """Monitors Claude API rate limit status and triggers pipeline relaunch when cleared."""

    def __init__(self, check_interval: int = 300):
        """
        Args:
            check_interval: Seconds between rate limit checks (default: 60)
        """
        self.check_interval = check_interval
        self.last_check_time: Optional[datetime] = None
        self.last_check_result: Optional[bool] = None  # True = rate limit cleared
        self.is_checking: bool = False
        self.relaunch_in_progress: bool = False
        self.relaunched_pipelines: list = []
        self.check_error: Optional[str] = None

    def should_check(self) -> bool:
        """Determine if it's time to check rate limit status."""
        if self.is_checking or self.relaunch_in_progress:
            return False

        if self.last_check_time is None:
            return True

        elapsed = (datetime.now() - self.last_check_time).total_seconds()
        return elapsed >= self.check_interval

    def check_rate_limit_cleared(self) -> bool:
        """
        Check if Claude API rate limit has cleared by running a minimal CLI command.

        Returns True if rate limit is cleared, False if still limited.
        """
        import subprocess

        self.is_checking = True
        self.check_error = None

        try:
            # Run a minimal Claude CLI command to test
            result = subprocess.run(
                ["claude", "-p", "respond with just: ok", "--max-turns", "1"],
                capture_output=True,
                text=True,
                timeout=30,
                cwd=os.getcwd(),
            )

            self.last_check_time = datetime.now()

            # Check if rate limit error in output
            combined_output = (result.stdout or "") + (result.stderr or "")

            rate_limit_patterns = [
                "hit your limit",
                "rate limit",
                "Rate limit",
                "too many requests",
                "429",
            ]

            for pattern in rate_limit_patterns:
                if pattern.lower() in combined_output.lower():
                    self.last_check_result = False
                    return False

            # If exit code is 0 and no rate limit message, assume cleared
            if result.returncode == 0:
                self.last_check_result = True
                return True

            # Non-zero exit but not rate limit - might be other error
            self.check_error = f"Exit {result.returncode}: {combined_output[:100]}"
            self.last_check_result = False
            return False

        except subprocess.TimeoutExpired:
            self.check_error = "Timeout"
            self.last_check_result = None
            return False
        except FileNotFoundError:
            self.check_error = "Claude CLI not found"
            self.last_check_result = None
            return False
        except Exception as e:
            self.check_error = str(e)[:100]
            self.last_check_result = None
            return False
        finally:
            self.is_checking = False

    def clear_rate_limit_errors_from_state(self, state_file_path: str) -> bool:
        """
        Clear rate limit errors from a pipeline state file.

        This should be called when rate limit is confirmed cleared to ensure
        the dashboard no longer shows the rate limit warning.

        Args:
            state_file_path: Path to the pipeline state JSON file

        Returns:
            True if errors were cleared successfully, False otherwise
        """
        try:
            with open(state_file_path, 'r') as f:
                state_data = json.load(f)

            # Clear the errors array
            if "errors" in state_data:
                old_error_count = len(state_data.get("errors", []))
                state_data["errors"] = []

                # Also clear recent_errors if present
                if "recent_errors" in state_data:
                    state_data["recent_errors"] = []

                # Update the timestamp
                state_data["updated_at"] = datetime.now().isoformat()

                # Write back
                with open(state_file_path, 'w') as f:
                    json.dump(state_data, f, indent=2)

                print(f"[dim]Cleared {old_error_count} error(s) from {os.path.basename(state_file_path)}[/dim]")
                return True

            return True  # No errors to clear

        except Exception as e:
            print(f"[yellow]Warning: Could not clear errors from {state_file_path}: {e}[/yellow]")
            return False

    def relaunch_pipelines(self, yaml_files: list, search_dir: str = ".", state_files: list = None) -> list:
        """
        Relaunch pipelines by spawning orchestrator processes.

        Args:
            yaml_files: List of pipeline YAML config file paths
            search_dir: Directory context for running orchestrator
            state_files: List of state file paths to clear errors from (optional)

        Returns:
            List of (yaml_file, success, message) tuples
        """
        import subprocess

        self.relaunch_in_progress = True
        results = []

        # Clear errors from state files before relaunching
        if state_files:
            for state_file in state_files:
                self.clear_rate_limit_errors_from_state(state_file)

        # Find the orchestrator script
        orchestrator_paths = [
            os.path.join(search_dir, "claude-pipelines", "pipeline_orchestrator.py"),
            os.path.join(search_dir, "pipeline_orchestrator.py"),
            "claude-pipelines/pipeline_orchestrator.py",
            "pipeline_orchestrator.py",
        ]

        orchestrator_path = None
        for path in orchestrator_paths:
            if os.path.exists(path):
                orchestrator_path = path
                break

        if not orchestrator_path:
            self.relaunch_in_progress = False
            return [(f, False, "Orchestrator not found") for f in yaml_files]

        for yaml_file in yaml_files:
            try:
                # Spawn orchestrator in background
                process = subprocess.Popen(
                    ["python3", orchestrator_path, yaml_file],
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE,
                    cwd=os.getcwd(),
                    start_new_session=True,  # Detach from parent
                )

                results.append((yaml_file, True, f"Launched (PID: {process.pid})"))
                self.relaunched_pipelines.append({
                    "yaml_file": yaml_file,
                    "pid": process.pid,
                    "launched_at": datetime.now().isoformat(),
                })

            except Exception as e:
                results.append((yaml_file, False, str(e)[:100]))

        self.relaunch_in_progress = False
        return results

    def get_status_display(self) -> str:
        """Get a formatted status string for display in dashboard."""
        if self.is_checking:
            return "[yellow]🔄 Checking rate limit...[/yellow]"

        if self.relaunch_in_progress:
            return "[cyan]🚀 Relaunching pipelines...[/cyan]"

        if self.last_check_result is True:
            return "[green]✓ Rate limit cleared[/green]"

        if self.last_check_result is False:
            next_check = ""
            if self.last_check_time:
                elapsed = (datetime.now() - self.last_check_time).total_seconds()
                remaining = max(0, self.check_interval - elapsed)
                # Format remaining time nicely
                if remaining >= 60:
                    mins = int(remaining // 60)
                    secs = int(remaining % 60)
                    next_check = f" (next check in {mins}m {secs}s)"
                else:
                    next_check = f" (next check in {int(remaining)}s)"
            return f"[red]⏳ Still rate limited{next_check}[/red]"

        if self.check_error:
            return f"[yellow]⚠ Check error: {self.check_error}[/yellow]"

        return "[dim]Monitoring inactive[/dim]"


# Global rate limit monitor instance
_rate_limit_monitor: Optional[RateLimitMonitor] = None


def get_rate_limit_monitor() -> RateLimitMonitor:
    """Get or create the global rate limit monitor."""
    global _rate_limit_monitor
    if _rate_limit_monitor is None:
        _rate_limit_monitor = RateLimitMonitor(check_interval=60)
    return _rate_limit_monitor

# =============================================================================
# Pipeline State Reader
# =============================================================================

class PipelineState:
    """Reads and parses pipeline state JSON files (local or remote via HTTP/WebDAV)."""

    def __init__(self, file_path: str):
        self.file_path = file_path
        self.is_remote = file_path.startswith(('http://', 'https://'))
        self.data = {}
        self.load()

    def load(self) -> bool:
        """Load state from JSON file (local or remote URL)."""
        try:
            if self.is_remote:
                # Fetch from HTTP/WebDAV URL
                req = Request(self.file_path, headers={'User-Agent': 'PipelineDashboard/1.0'})
                with urlopen(req, timeout=10) as response:
                    self.data = json.loads(response.read().decode('utf-8'))
            else:
                # Load from local file
                with open(self.file_path, 'r') as f:
                    self.data = json.load(f)
            return True
        except (FileNotFoundError, json.JSONDecodeError, URLError, HTTPError) as e:
            self.data = {}
            return False

    @property
    def name(self) -> str:
        return self.data.get("pipeline", "Unknown Pipeline")

    @property
    def status(self) -> str:
        return self.data.get("status", "unknown")

    @property
    def updated_at(self) -> Optional[str]:
        updated = self.data.get("updated_at")
        if updated:
            try:
                dt = datetime.fromisoformat(updated)
                return dt.strftime("%Y-%m-%d %H:%M:%S")
            except:
                return updated
        return None

    @property
    def updated_at_datetime(self) -> Optional[datetime]:
        """Return the updated_at as a datetime object."""
        updated = self.data.get("updated_at")
        if updated:
            try:
                return datetime.fromisoformat(updated)
            except:
                return None
        return None

    def get_time_since_update(self) -> Optional[str]:
        """Return a human-readable string of time since last update."""
        dt = self.updated_at_datetime
        if not dt:
            return None

        now = datetime.now()
        delta = now - dt

        total_seconds = int(delta.total_seconds())

        if total_seconds < 0:
            return "in the future"

        if total_seconds < 60:
            return f"{total_seconds}s ago"
        elif total_seconds < 3600:
            minutes = total_seconds // 60
            return f"{minutes}m ago"
        elif total_seconds < 86400:
            hours = total_seconds // 3600
            minutes = (total_seconds % 3600) // 60
            if minutes > 0:
                return f"{hours}h {minutes}m ago"
            return f"{hours}h ago"
        else:
            days = total_seconds // 86400
            hours = (total_seconds % 86400) // 3600
            if hours > 0:
                return f"{days}d {hours}h ago"
            return f"{days}d ago"

    def get_timeout_seconds(self) -> int:
        """Get the maximum timeout from the pipeline YAML config.

        Returns the largest timeout value from:
        - default_timeout in pipeline section
        - individual stage timeouts in request_stages

        Falls back to 1800 (30 min) if YAML can't be read.
        """
        config_file = self.data.get("metadata", {}).get("config_file")
        if not config_file or not HAS_YAML:
            return 1800  # Default 30 minutes

        try:
            # Handle relative paths
            if not os.path.isabs(config_file):
                state_dir = os.path.dirname(self.file_path)
                config_file = os.path.join(state_dir, config_file)

            with open(config_file, 'r') as f:
                config = yaml.safe_load(f)

            # Get default timeout
            default_timeout = config.get("pipeline", {}).get("default_timeout", 900)

            # Get max timeout from stages
            max_timeout = default_timeout
            for stage in config.get("request_stages", []):
                stage_timeout = stage.get("agent", {}).get("timeout", 0)
                max_timeout = max(max_timeout, stage_timeout)

            return max_timeout
        except Exception:
            return 1800  # Default 30 minutes

    def get_staleness_status(self) -> tuple:
        """Determine staleness based on pipeline timeout.

        Returns (color, is_stale, threshold_seconds).
        - Green: within timeout (actively processing)
        - Yellow: between 1x and 2x timeout (possibly stalled)
        - Red: beyond 2x timeout (likely stalled or completed)
        """
        dt = self.updated_at_datetime
        if not dt:
            return ("dim", False, 0)

        timeout = self.get_timeout_seconds()
        delta_seconds = (datetime.now() - dt).total_seconds()

        # If pipeline is completed, always show as neutral
        if self.status == "completed":
            return ("dim", False, timeout)

        if delta_seconds < timeout:
            return ("green", False, timeout)
        elif delta_seconds < timeout * 2:
            return ("yellow", True, timeout)
        else:
            return ("red", True, timeout)

    @property
    def tasks(self) -> list:
        return self.data.get("tasks", [])

    def get_tasks_by_status(self) -> dict:
        """Group tasks by status based on stage completion flags.

        A task is considered:
        - Done: implementation_completed is True
        - In Progress: currently processing OR implementation started but not complete
        - Failed: has errors
        - Backlog: everything else (including tasks with only request/overview/details done)
        """
        result = {col: [] for col in STATUS_COLUMNS.values()}
        result["Failed"] = []  # Ensure Failed column exists

        for task in self.tasks:
            # Check stage completion flags
            impl_completed = task.get("implementation_completed", False)
            impl_started = task.get("files", {}).get("details") and not impl_completed

            # Check if task has failed
            if task.get("status") == "failed" or task.get("error"):
                result["Failed"].append(task)
            # Implementation completed = Done
            elif impl_completed:
                result["Done"].append(task)
            # Currently processing
            elif task.get("status") == "processing":
                result["In Progress"].append(task)
            # Has details file but no implementation = ready for implementation (Backlog)
            else:
                result["Backlog"].append(task)

        # Reverse Done list so most recently completed appears first
        result["Done"] = list(reversed(result["Done"]))

        return result

    def get_progress(self) -> tuple:
        """Return (completed_work_units, total_work_units) for overall progress.

        Calculates progress across all 4 stages (request, overview, details, implementation).
        Each stage completion for each task counts as 1 work unit.
        Total = tasks * 4 stages.
        """
        tasks = self.tasks
        total_tasks = len(tasks)

        if total_tasks == 0:
            return 0, 0

        # Count completed stage flags across all tasks
        stages = ["request", "overview", "details", "implementation"]
        completed_units = 0

        for task in tasks:
            for stage in stages:
                if task.get(f"{stage}_completed", False):
                    completed_units += 1

        total_units = total_tasks * len(stages)
        return completed_units, total_units

    def get_tasks_completed(self) -> tuple:
        """Return (completed, total) task counts based on implementation completion."""
        tasks = self.tasks
        completed = sum(1 for t in tasks if t.get("implementation_completed", False))
        return completed, len(tasks)

    def get_stage_completion_stats(self) -> dict:
        """Return completion counts for each stage.

        Returns dict with keys: request, overview, details, implementation
        Each value is a tuple of (completed, total).
        """
        tasks = self.tasks
        total = len(tasks)

        return {
            "request": (sum(1 for t in tasks if t.get("request_completed")), total),
            "overview": (sum(1 for t in tasks if t.get("overview_completed")), total),
            "details": (sum(1 for t in tasks if t.get("details_completed")), total),
            "implementation": (sum(1 for t in tasks if t.get("implementation_completed")), total),
        }

    def get_last_error(self) -> Optional[dict]:
        """Get the last error from the pipeline.

        Returns dict with keys: task_id, task_title, error, request_id
        Returns None if no errors found.
        """
        # First check pipeline-level errors array
        errors = self.data.get("errors", [])
        if errors:
            last_error = errors[-1]
            return {
                "task_id": last_error.get("task_id", "unknown"),
                "task_title": last_error.get("task_title", ""),
                "error": last_error.get("error", "Unknown error"),
                "request_id": last_error.get("request_id", ""),
            }

        # Then check for failed tasks
        for task in reversed(self.tasks):
            if task.get("status") == "failed" or task.get("error"):
                error_msg = task.get("error", "Task failed")
                # Truncate long error messages
                if len(error_msg) > 60:
                    error_msg = error_msg[:57] + "..."
                return {
                    "task_id": task.get("id", "unknown"),
                    "task_title": task.get("title", ""),
                    "error": error_msg,
                    "request_id": task.get("request_id", ""),
                }

        return None

    def get_current_task(self) -> Optional[dict]:
        """Get the currently processing task based on stage completion flags."""
        stage_order = ["request", "overview", "details", "implementation"]

        # Method 1: Check stage status for running stage
        stages = self.data.get("stages", {})
        for stage_id in stage_order:
            stage_data = stages.get(stage_id, {})
            if stage_data.get("status") == "running":
                stage_completed_key = f"{stage_id}_completed"
                for task in self.tasks:
                    if not task.get(stage_completed_key, False):
                        if stage_id == "request":
                            return task
                        elif stage_id == "overview" and task.get("request_completed"):
                            return task
                        elif stage_id == "details" and task.get("overview_completed"):
                            return task
                        elif stage_id == "implementation" and task.get("details_completed"):
                            return task
                break

        # Method 2: Infer current task from completion flags (when stage status not tracked)
        # Find first task that hasn't completed all stages
        for task in self.tasks:
            if task.get("implementation_completed"):
                continue  # Fully done

            # Find which stage this task is at
            if not task.get("request_completed"):
                return task  # In request stage
            elif not task.get("overview_completed"):
                return task  # In overview stage
            elif not task.get("details_completed"):
                return task  # In details stage
            elif not task.get("implementation_completed"):
                return task  # In implementation stage

        return None

    def get_current_stage_name(self) -> Optional[str]:
        """Get the name of the current stage being worked on."""
        current_task = self.get_current_task()
        if not current_task:
            return None

        if not current_task.get("request_completed"):
            return "request"
        elif not current_task.get("overview_completed"):
            return "overview"
        elif not current_task.get("details_completed"):
            return "details"
        elif not current_task.get("implementation_completed"):
            return "implementation"
        return None

    def get_testcheck_status(self) -> Optional[dict]:
        """Get testcheck stage status with its sub-phases (precheck, verification)."""
        # Check if testcheck has run at all
        has_precheck = bool(self.data.get("precheck"))
        has_verification = bool(self.data.get("verification"))
        testcheck_completed = self.data.get("testcheck_completed", False)

        if not has_precheck and not has_verification and not testcheck_completed:
            return None  # Testcheck stage hasn't run yet

        result = {
            "status": "completed" if testcheck_completed else "running",
            "completed_at": self.data.get("testcheck_completed_at"),
            "phases": {},
        }

        # Precheck phase
        precheck = self.data.get("precheck", {})
        if precheck:
            result["phases"]["precheck"] = {
                "status": precheck.get("status"),
                "completed_at": precheck.get("completed_at"),
            }

        # Verification phase
        verification = self.data.get("verification", {})
        if verification:
            result["phases"]["verification"] = {
                "status": verification.get("status"),
                "completed_at": verification.get("completed_at"),
            }

        return result

    def get_dependencies_info(self) -> Optional[dict]:
        """Get dependency tracking information from state."""
        deps = self.data.get("dependencies")
        if not deps:
            return None

        tasks_deps = deps.get("tasks", {})
        graph = deps.get("graph", {})
        execution = deps.get("execution", {})

        return {
            "tasks_count": len(tasks_deps),
            "nodes": len(graph.get("nodes", [])),
            "edges": len(graph.get("edges", [])),
            "roots": graph.get("roots", []),
            "leaves": graph.get("leaves", []),
            "has_cycles": execution.get("has_cycles", False),
            "cycle_tasks": execution.get("cycle_tasks", []),
            "critical_path": execution.get("critical_path", []),
            "parallel_clusters": execution.get("parallel_clusters", []),
            "topological_order": execution.get("topological_order", []),
            "last_updated": deps.get("last_updated"),
        }

    def get_worktree_info(self) -> Optional[dict]:
        """Get worktree/parallel execution information from state."""
        parallel = self.data.get("parallelization")
        if not parallel:
            return None

        return {
            "enabled": parallel.get("enabled", False),
            "active_worktrees": parallel.get("active_worktrees", []),
            "completed_clusters": parallel.get("completed_clusters", []),
            "pending_clusters": parallel.get("pending_clusters", []),
            "merge_queue": parallel.get("merge_queue", []),
        }

    def get_task_by_id(self, task_id: str) -> Optional[dict]:
        """Get a specific task by its ID."""
        for task in self.tasks:
            if task.get("id") == task_id:
                return task
        return None

    def get_ready_tasks(self) -> list:
        """Get tasks that are ready to execute (all dependencies satisfied)."""
        deps_info = self.data.get("dependencies", {})
        tasks_deps = deps_info.get("tasks", {})

        completed_ids = set(
            t.get("id") for t in self.tasks if t.get("status") == "completed"
        )

        ready = []
        for task in self.tasks:
            task_id = task.get("id")
            if task.get("status") != "pending":
                continue

            # Check if all dependencies are satisfied
            task_dep_info = tasks_deps.get(task_id, {})
            upstream = set(task_dep_info.get("depends_on", []))

            if upstream <= completed_ids:
                ready.append(task)

        return ready

    def get_etc_estimates(self) -> dict:
        """
        Calculate estimated time to completion (ETC) for stages and pipeline.

        Returns dict with:
        - current_stage: {name, elapsed, completed, remaining, avg_per_task, etc_seconds, etc_display}
        - pipeline: {elapsed, completed, remaining, avg_per_task, etc_seconds, etc_display}
        - phases: list of {name, status, duration, etc_display}
        """
        from datetime import datetime

        result = {
            "current_stage": None,
            "pipeline": None,
            "phases": [],
        }

        stages = self.data.get("stages", {})
        tasks = self.tasks
        total_tasks = len(tasks)

        if total_tasks == 0:
            return result

        now = datetime.now()

        # Get current stage from task flags (fallback when stage status not tracked)
        inferred_stage = self.get_current_stage_name()

        # Calculate per-stage ETCs
        stage_order = ["request", "overview", "details", "implementation"]

        for stage_id in stage_order:
            stage_data = stages.get(stage_id, {})

            # Count completed tasks for this stage from task flags (source of truth)
            stage_completed_key = f"{stage_id}_completed"
            tasks_completed_from_flags = sum(1 for t in tasks if t.get(stage_completed_key, False))

            started_at_str = stage_data.get("started_at") if stage_data else None
            completed_at_str = stage_data.get("completed_at") if stage_data else None
            # Always use task flags as source of truth (stages dict may be stale)
            tasks_completed = tasks_completed_from_flags

            # ALWAYS determine status from task flags (authoritative over stale state)
            if tasks_completed_from_flags >= total_tasks:
                status = "completed"
            elif tasks_completed_from_flags > 0:
                if inferred_stage == stage_id:
                    status = "running"
                else:
                    # Partial completion = in progress even if state says otherwise
                    status = "in_progress"
            else:
                # No tasks completed - use state file status or default to pending
                status = stage_data.get("status", "pending") if stage_data else "pending"

            phase_info = {
                "name": stage_id,
                "status": status,
                "duration": None,
                "etc_display": None,
                "tasks_completed": tasks_completed_from_flags,
                "tasks_total": total_tasks,
            }

            if status == "completed" and started_at_str and completed_at_str:
                # Completed stage - show actual duration
                started_at = datetime.fromisoformat(started_at_str)
                completed_at = datetime.fromisoformat(completed_at_str)
                duration = (completed_at - started_at).total_seconds()
                phase_info["duration"] = duration
                phase_info["etc_display"] = self._format_duration(duration)

            elif status in ("running", "in_progress"):
                # Running/in-progress stage - calculate ETC
                # Use explicit started_at if available, otherwise estimate from pipeline created_at
                if started_at_str:
                    started_at = datetime.fromisoformat(started_at_str)
                    elapsed = (now - started_at).total_seconds()
                else:
                    # Fallback: estimate stage start from pipeline creation + completed stage times
                    # or just use a portion of total pipeline time
                    created_at_str = self.data.get("created_at")
                    if created_at_str:
                        created_at = datetime.fromisoformat(created_at_str)
                        total_elapsed = (now - created_at).total_seconds()
                        # Estimate: each prior stage took proportional time
                        stages_before = stage_order.index(stage_id)
                        total_stages = len(stage_order)
                        if stages_before > 0 and total_tasks > 0:
                            # Completed tasks in prior stages estimate prior time
                            prior_tasks_completed = 0
                            for prior_stage in stage_order[:stages_before]:
                                prior_key = f"{prior_stage}_completed"
                                prior_tasks_completed += sum(1 for t in tasks if t.get(prior_key, False))
                            # Current stage started after prior work completed
                            if prior_tasks_completed > 0:
                                avg_per_prior_task = total_elapsed / (prior_tasks_completed + tasks_completed_from_flags) if (prior_tasks_completed + tasks_completed_from_flags) > 0 else 60
                                estimated_prior_time = prior_tasks_completed * avg_per_prior_task
                                elapsed = total_elapsed - estimated_prior_time
                                elapsed = max(30, elapsed)  # At least 30s running
                            else:
                                elapsed = total_elapsed / total_stages
                        else:
                            elapsed = total_elapsed
                    else:
                        elapsed = 60  # Default fallback

                remaining_tasks = total_tasks - tasks_completed

                if tasks_completed > 0 and elapsed > 0:
                    avg_per_task = elapsed / tasks_completed
                    etc_seconds = remaining_tasks * avg_per_task
                    phase_info["elapsed"] = elapsed
                    phase_info["avg_per_task"] = avg_per_task
                    phase_info["etc_seconds"] = etc_seconds
                    phase_info["etc_display"] = f"~{self._format_duration(etc_seconds)} remaining"

                    # Calculate current task ETC (countdown)
                    # Use updated_at as proxy for when last task completed (= current task started)
                    updated_at_str = self.data.get("updated_at")
                    if updated_at_str:
                        updated_at = datetime.fromisoformat(updated_at_str)
                        task_elapsed = (now - updated_at).total_seconds()
                    else:
                        # Fallback: estimate from stage progress
                        task_elapsed = elapsed - (tasks_completed * avg_per_task)
                        task_elapsed = max(0, task_elapsed)

                    task_etc_seconds = max(0, avg_per_task - task_elapsed)

                    # Set as current stage with task ETC
                    result["current_stage"] = {
                        "name": stage_id,
                        "elapsed": elapsed,
                        "completed": tasks_completed,
                        "remaining": remaining_tasks,
                        "avg_per_task": avg_per_task,
                        "avg_per_task_display": self._format_duration(avg_per_task),
                        "etc_seconds": etc_seconds,
                        "etc_display": self._format_duration(etc_seconds),
                        "task_elapsed": task_elapsed,
                        "task_etc_seconds": task_etc_seconds,
                        "current_task_etc": self._format_duration(task_etc_seconds) if task_etc_seconds > 0 else "any moment",
                    }
                elif elapsed > 0:
                    # No tasks completed yet in this stage, estimate from overall avg
                    created_at_str = self.data.get("created_at")
                    if created_at_str:
                        created_at = datetime.fromisoformat(created_at_str)
                        total_elapsed = (now - created_at).total_seconds()
                        # Count all completed work units across all stages
                        total_completed = sum(
                            sum(1 for t in tasks if t.get(f"{s}_completed", False))
                            for s in stage_order
                        )
                        if total_completed > 0:
                            avg_per_task = total_elapsed / total_completed
                            etc_seconds = remaining_tasks * avg_per_task
                            phase_info["avg_per_task"] = avg_per_task
                            phase_info["etc_seconds"] = etc_seconds
                            phase_info["etc_display"] = f"~{self._format_duration(etc_seconds)} remaining"

                            # Task ETC when none completed in this stage yet
                            updated_at_str = self.data.get("updated_at")
                            if updated_at_str:
                                updated_at = datetime.fromisoformat(updated_at_str)
                                task_elapsed = (now - updated_at).total_seconds()
                                task_etc_seconds = max(0, avg_per_task - task_elapsed)
                            else:
                                task_etc_seconds = avg_per_task

                            result["current_stage"] = {
                                "name": stage_id,
                                "elapsed": elapsed,
                                "completed": 0,
                                "remaining": remaining_tasks,
                                "avg_per_task": avg_per_task,
                                "avg_per_task_display": self._format_duration(avg_per_task),
                                "etc_seconds": etc_seconds,
                                "etc_display": self._format_duration(etc_seconds),
                                "task_elapsed": task_elapsed if updated_at_str else 0,
                                "task_etc_seconds": task_etc_seconds,
                                "current_task_etc": self._format_duration(task_etc_seconds) if task_etc_seconds > 0 else "any moment",
                            }
                        else:
                            # Use historical timing estimates when no task data available
                            est = STAGE_TIMING_ESTIMATES.get(stage_id, {})
                            avg_per_task = est.get('avg_seconds', 300)
                            etc_seconds = remaining_tasks * avg_per_task
                            phase_info["avg_per_task"] = avg_per_task
                            phase_info["etc_seconds"] = etc_seconds
                            phase_info["etc_display"] = f"~{self._format_duration(etc_seconds)} (est)"
                            result["current_stage"] = {
                                "name": stage_id,
                                "elapsed": elapsed,
                                "completed": 0,
                                "remaining": remaining_tasks,
                                "avg_per_task": avg_per_task,
                                "avg_per_task_display": self._format_duration(avg_per_task),
                                "etc_seconds": etc_seconds,
                                "etc_display": self._format_duration(etc_seconds),
                                "task_elapsed": 0,
                                "task_etc_seconds": avg_per_task,
                                "current_task_etc": f"~{self._format_duration(avg_per_task)} (est)",
                            }
                    else:
                        # Use historical estimates when no completed tasks in pipeline
                        est = STAGE_TIMING_ESTIMATES.get(stage_id, {})
                        avg_per_task = est.get('avg_seconds', 300)
                        etc_seconds = remaining_tasks * avg_per_task
                        phase_info["etc_display"] = f"~{self._format_duration(etc_seconds)} (est)"
                        result["current_stage"] = {
                            "name": stage_id,
                            "elapsed": elapsed,
                            "completed": tasks_completed,
                            "remaining": remaining_tasks,
                            "avg_per_task": avg_per_task,
                            "avg_per_task_display": self._format_duration(avg_per_task),
                            "etc_seconds": etc_seconds,
                            "etc_display": self._format_duration(etc_seconds),
                            "task_elapsed": 0,
                            "task_etc_seconds": avg_per_task,
                            "current_task_etc": f"~{self._format_duration(avg_per_task)} (est)",
                        }
                else:
                    # Use historical estimates when no elapsed time available
                    est = STAGE_TIMING_ESTIMATES.get(stage_id, {})
                    avg_per_task = est.get('avg_seconds', 300)
                    etc_seconds = remaining_tasks * avg_per_task
                    phase_info["etc_display"] = f"~{self._format_duration(etc_seconds)} (est)"
                    result["current_stage"] = {
                        "name": stage_id,
                        "elapsed": 0,
                        "completed": tasks_completed,
                        "remaining": remaining_tasks,
                        "avg_per_task": avg_per_task,
                        "avg_per_task_display": self._format_duration(avg_per_task),
                        "etc_seconds": etc_seconds,
                        "etc_display": self._format_duration(etc_seconds),
                        "task_elapsed": 0,
                        "task_etc_seconds": avg_per_task,
                        "current_task_etc": f"~{self._format_duration(avg_per_task)} (est)",
                    }

            result["phases"].append(phase_info)

        # Calculate overall pipeline ETC
        created_at_str = self.data.get("created_at")
        if created_at_str:
            created_at = datetime.fromisoformat(created_at_str)
            total_elapsed = (now - created_at).total_seconds()

            # Count fully completed tasks (implementation_completed)
            completed_tasks = sum(1 for t in tasks if t.get("implementation_completed", False))
            remaining_tasks = total_tasks - completed_tasks

            if completed_tasks > 0 and total_elapsed > 0:
                avg_per_task = total_elapsed / completed_tasks
                etc_seconds = remaining_tasks * avg_per_task

                result["pipeline"] = {
                    "elapsed": total_elapsed,
                    "elapsed_display": self._format_duration(total_elapsed),
                    "completed": completed_tasks,
                    "remaining": remaining_tasks,
                    "avg_per_task": avg_per_task,
                    "avg_display": self._format_duration(avg_per_task),
                    "etc_seconds": etc_seconds,
                    "etc_display": self._format_duration(etc_seconds),
                }
            elif total_elapsed > 0:
                # No tasks completed yet - estimate from current stage progress or historical data
                current = result.get("current_stage")
                if current and current.get("avg_per_task"):
                    # Estimate: 4 stages * avg_per_task * remaining_tasks
                    stages_remaining = 4  # request, overview, details, implementation
                    etc_seconds = stages_remaining * current["avg_per_task"] * remaining_tasks
                    result["pipeline"] = {
                        "elapsed": total_elapsed,
                        "elapsed_display": self._format_duration(total_elapsed),
                        "completed": 0,
                        "remaining": remaining_tasks,
                        "etc_seconds": etc_seconds,
                        "etc_display": f"~{self._format_duration(etc_seconds)} (est)",
                    }
                else:
                    # Use historical estimates for full pipeline
                    total_per_task = sum(
                        STAGE_TIMING_ESTIMATES.get(s, {}).get('avg_seconds', 300)
                        for s in ['request', 'overview', 'details', 'implementation']
                    )
                    etc_seconds = total_per_task * remaining_tasks
                    result["pipeline"] = {
                        "elapsed": total_elapsed,
                        "elapsed_display": self._format_duration(total_elapsed),
                        "completed": 0,
                        "remaining": remaining_tasks,
                        "etc_seconds": etc_seconds,
                        "etc_display": f"~{self._format_duration(etc_seconds)} (est)",
                    }

        return result

    def _format_duration(self, seconds: float) -> str:
        """Format seconds into human-readable duration."""
        if seconds < 60:
            return f"{int(seconds)}s"
        elif seconds < 3600:
            mins = int(seconds // 60)
            secs = int(seconds % 60)
            return f"{mins}m {secs}s" if secs > 0 else f"{mins}m"
        else:
            hours = int(seconds // 3600)
            mins = int((seconds % 3600) // 60)
            return f"{hours}h {mins}m" if mins > 0 else f"{hours}h"

    def get_yaml_config_path(self) -> Optional[str]:
        """Get the YAML config file path for this pipeline.

        Returns the path to the pipeline YAML file that can be used to relaunch.
        """
        # Try to get from metadata
        config_file = self.data.get("metadata", {}).get("config_file")
        if config_file:
            # Handle relative paths
            if not os.path.isabs(config_file):
                state_dir = os.path.dirname(self.file_path)
                config_file = os.path.join(state_dir, config_file)
            if os.path.exists(config_file):
                return config_file

        # Try to infer from state file name
        # e.g., pipeline-l10n-epic2-static-ui-state.json -> pipeline-l10n-epic2-static-ui.yaml
        state_basename = os.path.basename(self.file_path)
        if state_basename.endswith("-state.json"):
            yaml_name = state_basename.replace("-state.json", ".yaml")
            state_dir = os.path.dirname(self.file_path)
            yaml_path = os.path.join(state_dir, yaml_name)
            if os.path.exists(yaml_path):
                return yaml_path

        # Try source_file from state
        source_file = self.data.get("source_file")
        if source_file and os.path.exists(source_file):
            return source_file

        return None

    def get_rate_limit_info(self) -> Optional[dict]:
        """Check if pipeline stopped due to Claude API rate limit.

        Returns dict with:
        - detected: True if rate limit error found
        - reset_time: Extracted reset time string (e.g., "2pm (Europe/Paris)")
        - last_error_time: Timestamp of the last rate limit error
        - error_count: Number of consecutive rate limit errors

        Returns None if no rate limit detected.
        """
        errors = self.data.get("errors", [])
        if not errors:
            return None

        # Check recent errors for rate limit pattern
        rate_limit_patterns = [
            r"You've hit your limit",
            r"rate limit",
            r"Rate limit",
            r"too many requests",
            r"429",
        ]

        # Compile patterns
        rate_limit_regex = re.compile('|'.join(rate_limit_patterns), re.IGNORECASE)

        # Extract reset time pattern: "resets Xpm (Timezone)" or "resets at X:XX"
        reset_time_regex = re.compile(r'resets?\s+(?:at\s+)?(\d+(?::\d+)?(?:am|pm)?(?:\s*\([^)]+\))?)', re.IGNORECASE)

        rate_limit_errors = []
        reset_time = None

        # Check last 10 errors (most recent)
        for error_entry in reversed(errors[-10:]):
            error_msg = error_entry.get("error", "")
            timestamp = error_entry.get("timestamp", "")

            if rate_limit_regex.search(error_msg):
                rate_limit_errors.append({
                    "timestamp": timestamp,
                    "error": error_msg
                })

                # Try to extract reset time
                reset_match = reset_time_regex.search(error_msg)
                if reset_match and not reset_time:
                    reset_time = reset_match.group(1)

        if not rate_limit_errors:
            return None

        # Check if this is a recent/current issue (within last 30 minutes)
        last_error_time = rate_limit_errors[0].get("timestamp")
        is_recent = False
        if last_error_time:
            try:
                error_dt = datetime.fromisoformat(last_error_time)
                delta = datetime.now() - error_dt
                is_recent = delta.total_seconds() < 1800  # 30 minutes
            except:
                is_recent = True  # Assume recent if we can't parse

        return {
            "detected": True,
            "reset_time": reset_time,
            "last_error_time": last_error_time,
            "error_count": len(rate_limit_errors),
            "is_recent": is_recent,
        }


def parse_subtasks_from_detailed(details_file: str) -> dict:
    """Parse subtasks from a detailed markdown file.

    Returns dict with:
    - completed: list of completed subtask titles
    - pending: list of pending subtask titles
    - total: total count
    - completed_count: completed count
    """
    result = {
        "completed": [],
        "pending": [],
        "total": 0,
        "completed_count": 0,
    }

    if not details_file or not os.path.exists(details_file):
        return result

    import re
    # Pattern 1: - [x] **1.1** Task title (with ID)
    checkbox_with_id = re.compile(r'^\s*-\s*\[(x| )\]\s*\*\*(\d+\.\d+)\*\*\s*(.+?)(?:\s*\*.*\*)?$', re.IGNORECASE)
    # Pattern 2: - [x] Task title (without ID)
    checkbox_simple = re.compile(r'^\s*-\s*\[(x| )\]\s*(.+)$', re.IGNORECASE)

    task_counter = 0
    try:
        with open(details_file, 'r') as f:
            for line in f:
                line = line.strip()

                # Try pattern with ID first
                match = checkbox_with_id.match(line)
                if match:
                    is_done = match.group(1).lower() == 'x'
                    task_id = match.group(2)
                    task_title = match.group(3).strip()
                else:
                    # Try simple pattern
                    match = checkbox_simple.match(line)
                    if match:
                        is_done = match.group(1).lower() == 'x'
                        task_counter += 1
                        task_id = str(task_counter)
                        task_title = match.group(2).strip()
                        # Clean up markdown artifacts
                        task_title = re.sub(r'\*\*|\*|`', '', task_title)
                        task_title = task_title[:60]  # Truncate long titles
                    else:
                        continue

                subtask = {"id": task_id, "title": task_title}
                result["total"] += 1

                if is_done:
                    result["completed"].append(subtask)
                    result["completed_count"] += 1
                else:
                    result["pending"].append(subtask)
    except Exception:
        pass

    return result


def get_task_subtasks(task: dict) -> dict:
    """Get subtasks for a task from its detailed markdown file."""
    details_file = task.get("files", {}).get("details")
    if details_file:
        return parse_subtasks_from_detailed(details_file)
    return {"completed": [], "pending": [], "total": 0, "completed_count": 0}


# =============================================================================
# Dashboard UI Components
# =============================================================================

def create_rate_limit_alert(pipelines: list, show_monitor: bool = True) -> Optional[Panel]:
    """Create a prominent rate limit alert banner if any pipeline hit rate limits.

    Returns a bright red/yellow panel that stands out, or None if no rate limit detected.

    Args:
        pipelines: List of PipelineState objects to check
        show_monitor: Whether to show auto-relaunch monitor status
    """
    rate_limited_pipelines = []

    for p in pipelines:
        rate_info = p.get_rate_limit_info()
        if rate_info and rate_info.get("detected"):
            rate_limited_pipelines.append({
                "name": p.name,
                "info": rate_info,
                "status": p.status,
                "yaml_path": p.get_yaml_config_path(),
                "state_path": p.file_path,
            })

    # Also check epic pipelines
    epic_files = find_recent_epic_pipelines(".", max_age_minutes=60)  # Check last hour
    for filepath, epic_name, mtime in epic_files:
        try:
            pipeline = PipelineState(filepath)
            if pipeline.data:
                rate_info = pipeline.get_rate_limit_info()
                if rate_info and rate_info.get("detected"):
                    # Avoid duplicates
                    if not any(p["name"] == epic_name for p in rate_limited_pipelines):
                        rate_limited_pipelines.append({
                            "name": epic_name,
                            "info": rate_info,
                            "status": pipeline.status,
                            "yaml_path": pipeline.get_yaml_config_path(),
                            "state_path": filepath,
                        })
        except:
            pass

    if not rate_limited_pipelines:
        return None

    # Build the alert content
    lines = [
        "[bold white on red] ⚠️  RATE LIMIT DETECTED  ⚠️ [/bold white on red]",
        "",
    ]

    # Aggregate reset times (they should all be the same)
    reset_times = set()
    total_errors = 0
    recent_count = 0

    for p in rate_limited_pipelines:
        info = p["info"]
        total_errors += info.get("error_count", 0)
        if info.get("is_recent"):
            recent_count += 1
        if info.get("reset_time"):
            reset_times.add(info["reset_time"])

    # Show reset time prominently
    if reset_times:
        reset_str = ", ".join(sorted(reset_times))
        lines.append(f"[bold yellow]Rate limit resets at: {reset_str}[/bold yellow]")
        lines.append("")

    # List affected pipelines
    lines.append(f"[white]Affected pipelines ({len(rate_limited_pipelines)}):[/white]")
    for p in rate_limited_pipelines[:5]:  # Show max 5
        info = p["info"]
        status_indicator = "[yellow]●[/yellow]" if info.get("is_recent") else "[dim]○[/dim]"
        error_count = info.get("error_count", 0)
        yaml_indicator = "[green]✓[/green]" if p.get("yaml_path") else "[red]✗[/red]"
        lines.append(f"  {status_indicator} {p['name']} ({error_count} errors) {yaml_indicator}")

    if len(rate_limited_pipelines) > 5:
        lines.append(f"  [dim]... and {len(rate_limited_pipelines) - 5} more[/dim]")

    # Show monitor status if enabled
    if show_monitor:
        monitor = get_rate_limit_monitor()
        lines.append("")
        lines.append(f"[bold cyan]Auto-Relaunch Monitor:[/bold cyan] {monitor.get_status_display()}")

        # Show recently relaunched pipelines
        if monitor.relaunched_pipelines:
            lines.append(f"[dim]Recently relaunched: {len(monitor.relaunched_pipelines)} pipeline(s)[/dim]")
    else:
        lines.append("")
        lines.append("[dim]Pipeline processing paused. Use --auto-relaunch to enable auto-recovery.[/dim]")

    return Panel(
        "\n".join(lines),
        border_style="bold red",
        box=box.DOUBLE,
        padding=(1, 2),
        title="[bold white on red] RATE LIMIT [/bold white on red]",
        title_align="center",
    )


def get_rate_limited_yaml_files(pipelines: list, search_dir: str = ".") -> tuple:
    """Get list of YAML config files and state files for rate-limited pipelines.

    Returns tuple of (yaml_files, state_files) lists.
    """
    yaml_files = []
    state_files = []

    for p in pipelines:
        rate_info = p.get_rate_limit_info()
        if rate_info and rate_info.get("detected"):
            yaml_path = p.get_yaml_config_path()
            if yaml_path and yaml_path not in yaml_files:
                yaml_files.append(yaml_path)
            # Also track the state file for error clearing
            if p.file_path and p.file_path not in state_files:
                state_files.append(p.file_path)

    # Also check epic pipelines
    epic_files = find_recent_epic_pipelines(search_dir, max_age_minutes=60)
    for filepath, epic_name, mtime in epic_files:
        try:
            pipeline = PipelineState(filepath)
            if pipeline.data:
                rate_info = pipeline.get_rate_limit_info()
                if rate_info and rate_info.get("detected"):
                    yaml_path = pipeline.get_yaml_config_path()
                    if yaml_path and yaml_path not in yaml_files:
                        yaml_files.append(yaml_path)
                    # Track the state file
                    if filepath not in state_files:
                        state_files.append(filepath)
        except:
            pass

    return yaml_files, state_files


def create_task_card(task: dict, compact: bool = False) -> Panel:
    """Create a panel for a single task."""
    task_id = task.get("id", "?")
    title = task.get("title", "Unknown Task")
    req_id = task.get("request_id", "")
    status = task.get("status", "pending")
    phase = task.get("phase_name", "")

    emoji = STATUS_EMOJIS.get(status, "❓")

    if compact:
        content = f"{emoji} {task_id}: {title[:30]}..."
        return Text(content)

    lines = []
    lines.append(f"[bold]{task_id}[/bold]: {title}")
    if req_id:
        lines.append(f"[dim]Request: {req_id}[/dim]")
    if phase:
        lines.append(f"[dim]Phase: {phase}[/dim]")

    content = "\n".join(lines)

    border_color = "white"
    if status == "completed":
        border_color = "green"
    elif status == "processing":
        border_color = "yellow"
    elif status == "failed":
        border_color = "red"

    return Panel(
        content,
        border_style=border_color,
        box=box.ROUNDED,
        padding=(0, 1),
    )


def get_stage_indicators(task: dict) -> str:
    """Get stage completion indicators for a task.

    Returns something like: [R✓O✓D✓I✓T✓] showing which stages are complete.
    Implementation shows test status:
    - I✓ (green) = implemented & tests passed
    - I⚠ (yellow) = implemented but tests failed
    - I? (cyan) = implemented but test status unclear
    - I○ (dim) = not implemented
    T indicator shows explicit test verification:
    - T✓ (green) = tests passed
    - T✗ (red) = tests failed
    - (no T) = no test info
    """
    r = "✓" if task.get("request_completed") else "○"
    o = "✓" if task.get("overview_completed") else "○"
    d = "✓" if task.get("details_completed") else "○"

    # Color the indicators
    r_color = "green" if task.get("request_completed") else "dim"
    o_color = "green" if task.get("overview_completed") else "dim"
    d_color = "green" if task.get("details_completed") else "dim"

    # Implementation indicator with test status
    impl_completed = task.get("implementation_completed", False)
    tests_passed = task.get("tests_passed")
    tests_ran = task.get("tests_ran", False)

    if not impl_completed:
        i = "○"
        i_color = "dim"
    elif tests_ran:
        if tests_passed is True:
            i = "✓"
            i_color = "green"
        elif tests_passed is False:
            i = "⚠"
            i_color = "yellow"
        else:
            i = "?"
            i_color = "cyan"
    else:
        i = "✓"
        i_color = "green"  # No tests, but implementation done

    # Build the indicator string
    result = f"[{r_color}]R{r}[/{r_color}][{o_color}]O{o}[/{o_color}][{d_color}]D{d}[/{d_color}][{i_color}]I{i}[/{i_color}]"

    # Add explicit test indicator if tests were run
    if tests_ran:
        if tests_passed is True:
            result += "[green]T✓[/green]"
        elif tests_passed is False:
            result += "[red]T✗[/red]"
        else:
            result += "[cyan]T?[/cyan]"

    return result


def create_column(title: str, tasks: list, max_items: int = 8) -> Panel:
    """Create a Kanban column panel."""
    color = COLUMN_COLORS.get(title, "white")

    if not tasks:
        content = "[dim]No tasks[/dim]"
    else:
        items = []
        for task in tasks[:max_items]:
            task_id = task.get("id", "?")
            task_title = task.get("title", "Unknown")
            req_id = task.get("request_id", "")
            status = task.get("status", "pending")

            # Get stage indicators instead of simple emoji
            stage_ind = get_stage_indicators(task)

            # Truncate title if too long
            display_title = task_title[:30] + "..." if len(task_title) > 30 else task_title

            line = f"{stage_ind} [bold]{task_id}[/bold] {display_title}"
            if req_id:
                line += f" [dim]({req_id})[/dim]"
            items.append(line)

        if len(tasks) > max_items:
            items.append(f"[dim]... and {len(tasks) - max_items} more[/dim]")

        content = "\n".join(items)

    header = f"[bold {color}]{title}[/bold {color}] ({len(tasks)})"

    return Panel(
        content,
        title=header,
        border_style=color,
        box=box.ROUNDED,
        expand=True,
        padding=(0, 1),
    )


def create_header(pipelines: list) -> Panel:
    """Create the dashboard header."""
    now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    lines = [
        "[bold blue]Pipeline Dashboard[/bold blue]",
        f"[dim]Last refresh: {now}[/dim]",
        "",
    ]

    for p in pipelines:
        # Get work unit progress (stages completed across all tasks)
        completed_units, total_units = p.get_progress()
        pct = (completed_units / total_units * 100) if total_units > 0 else 0

        # Get task completion count
        tasks_done, tasks_total = p.get_tasks_completed()

        status = p.status

        # Check for rate limit
        rate_info = p.get_rate_limit_info()

        # Create progress bar
        bar_width = 20
        filled = int(bar_width * pct / 100)
        bar = "█" * filled + "░" * (bar_width - filled)

        status_color = "green" if status == "completed" else "yellow" if status == "running" else "white"

        # Add rate limit indicator to status if detected
        rate_limit_indicator = ""
        if rate_info and rate_info.get("detected"):
            reset_time = rate_info.get("reset_time", "unknown")
            rate_limit_indicator = f" [bold red]⛔ RATE LIMITED[/bold red] [dim](resets {reset_time})[/dim]"

        lines.append(f"[bold]{p.name}[/bold]")
        lines.append(f"  Status: [{status_color}]{status}[/{status_color}]{rate_limit_indicator} | Progress: [{status_color}]{bar}[/{status_color}] {pct:.0f}% ({tasks_done}/{tasks_total} tasks done)")

        # Add stage-by-stage completion stats with percentages
        stage_stats = p.get_stage_completion_stats()
        r_done, r_total = stage_stats["request"]
        o_done, o_total = stage_stats["overview"]
        d_done, d_total = stage_stats["details"]
        i_done, i_total = stage_stats["implementation"]

        # Color code: green if complete, yellow if in progress, dim if not started
        def stage_color(done, total):
            if done == total and total > 0:
                return "green"
            elif done > 0:
                return "yellow"
            return "dim"

        def pct(done, total):
            return int(done / total * 100) if total > 0 else 0

        r_col = stage_color(r_done, r_total)
        o_col = stage_color(o_done, o_total)
        d_col = stage_color(d_done, d_total)
        i_col = stage_color(i_done, i_total)

        lines.append(f"  Stages: [{r_col}]R:{r_done}/{r_total} ({pct(r_done, r_total)}%)[/{r_col}] → [{o_col}]O:{o_done}/{o_total} ({pct(o_done, o_total)}%)[/{o_col}] → [{d_col}]D:{d_done}/{d_total} ({pct(d_done, d_total)}%)[/{d_col}] → [{i_col}]I:{i_done}/{i_total} ({pct(i_done, i_total)}%)[/{i_col}]")

        current = p.get_current_task()
        if current:
            lines.append(f"  [yellow]▶ Working on: {current.get('id', '?')} - {current.get('title', 'Unknown')}[/yellow]")

            # Show subtask progress from detailed markdown
            subtasks = get_task_subtasks(current)
            if subtasks["total"] > 0:
                sub_pct = (subtasks["completed_count"] / subtasks["total"] * 100)
                sub_bar_width = 15
                sub_filled = int(sub_bar_width * sub_pct / 100)
                sub_bar = "█" * sub_filled + "░" * (sub_bar_width - sub_filled)
                lines.append(f"    [cyan]Subtasks: {sub_bar} {subtasks['completed_count']}/{subtasks['total']} ({sub_pct:.0f}%)[/cyan]")

                # Show next pending subtask
                if subtasks["pending"]:
                    next_sub = subtasks["pending"][0]
                    lines.append(f"    [dim]Next: {next_sub['id']} - {next_sub['title'][:40]}{'...' if len(next_sub['title']) > 40 else ''}[/dim]")

        # Show ETC estimates
        etc = p.get_etc_estimates()
        if etc:
            current_stage = etc.get("current_stage")
            pipeline = etc.get("pipeline")

            # Build consolidated ETC line
            etc_parts = []

            # Current task ETC (based on avg of completed tasks in this stage)
            if current_stage:
                task_etc = current_stage.get("current_task_etc")
                if task_etc:
                    etc_parts.append(f"[yellow]task[/yellow]: ~{task_etc}")

            # Current stage ETC
            if current_stage:
                stage_name = current_stage["name"]
                stage_etc = current_stage["etc_display"]
                stage_done = current_stage["completed"]
                stage_total = stage_done + current_stage["remaining"]
                etc_parts.append(f"[cyan]{stage_name}[/cyan]: ~{stage_etc} ({stage_done}/{stage_total})")

            # Pipeline ETC
            if pipeline:
                pipe_etc = pipeline["etc_display"]
                pipe_done = pipeline["completed"]
                pipe_total = pipe_done + pipeline["remaining"]
                etc_parts.append(f"[magenta]pipeline[/magenta]: ~{pipe_etc} ({pipe_done}/{pipe_total})")

            if etc_parts:
                lines.append(f"  [bold]⏱ ETC:[/bold] " + " | ".join(etc_parts))

            # Show phase timeline (completed phases only, running phase shown in ETC line above)
            phases = etc.get("phases", [])
            completed_phases = [ph for ph in phases if ph["status"] == "completed"]
            if completed_phases:
                phase_strs = [f"[green]✓{ph['name']}[/green] ({ph['etc_display']})" for ph in completed_phases]
                lines.append(f"  [dim]Completed:[/dim] " + " → ".join(phase_strs))

        # Show time since last update with staleness based on YAML timeout
        time_ago = p.get_time_since_update()
        if time_ago:
            time_color, is_stale, timeout = p.get_staleness_status()

            # Format timeout for display
            timeout_mins = timeout // 60
            if timeout_mins >= 60:
                timeout_str = f"{timeout_mins // 60}h {timeout_mins % 60}m"
            else:
                timeout_str = f"{timeout_mins}m"

            # Build the update line
            stale_indicator = " ⚠️ STALE" if is_stale else ""
            lines.append(f"  [dim]Updated:[/dim] [{time_color}]{time_ago}[/{time_color}]{stale_indicator} [dim](timeout: {timeout_str})[/dim]")

        # Show testcheck stage status
        testcheck = p.get_testcheck_status()
        if testcheck:
            tc_status = testcheck.get("status", "unknown")
            if tc_status == "completed":
                tc_display = "[green]✓ Testcheck[/green]"
            elif tc_status == "running":
                tc_display = "[yellow]▶ Testcheck[/yellow]"
            else:
                tc_display = f"[dim]Testcheck: {tc_status}[/dim]"

            # Show sub-phases
            phase_parts = []
            for phase_name in ["precheck", "verification"]:
                phase_info = testcheck.get("phases", {}).get(phase_name)
                if phase_info:
                    phase_status = phase_info.get("status", "unknown")
                    if phase_status in ("passed", "completed"):
                        phase_parts.append(f"[green]✓{phase_name}[/green]")
                    elif phase_status == "failed":
                        phase_parts.append(f"[red]✗{phase_name}[/red]")
                    else:
                        phase_parts.append(f"[dim]{phase_name}[/dim]")

            if phase_parts:
                lines.append(f"  {tc_display} ({', '.join(phase_parts)})")
            else:
                lines.append(f"  {tc_display}")

        # Show dependency information
        deps_info = p.get_dependencies_info()
        if deps_info:
            deps_display = f"[cyan]📊 Dependencies:[/cyan] "
            deps_display += f"{deps_info['tasks_count']} tasks tracked, "
            deps_display += f"{deps_info['edges']} edges"

            if deps_info['has_cycles']:
                deps_display += f" [red]⚠ CYCLES: {deps_info['cycle_tasks']}[/red]"

            lines.append(f"  {deps_display}")

            # Show critical path
            if deps_info['critical_path']:
                cp_display = " → ".join(deps_info['critical_path'][:5])
                if len(deps_info['critical_path']) > 5:
                    cp_display += f" → ... ({len(deps_info['critical_path'])} total)"
                lines.append(f"  [dim]Critical path: {cp_display}[/dim]")

            # Show parallel clusters count
            clusters = deps_info['parallel_clusters']
            if clusters:
                lines.append(f"  [dim]Parallel clusters: {len(clusters)} identified[/dim]")

        # Show worktree information
        wt_info = p.get_worktree_info()
        if wt_info and wt_info.get('enabled'):
            active = wt_info.get('active_worktrees', [])
            completed = wt_info.get('completed_clusters', [])
            pending = wt_info.get('pending_clusters', [])

            wt_display = f"[magenta]🌳 Worktrees:[/magenta] "
            if active:
                wt_display += f"[green]{len(active)} active[/green] "
            if completed:
                wt_display += f"[dim]{len(completed)} merged[/dim] "
            if pending:
                wt_display += f"[yellow]{len(pending)} pending[/yellow]"

            lines.append(f"  {wt_display}")

            # Show active worktree details
            for wt in active[:3]:
                wt_name = wt.get('name', 'unknown')
                wt_cluster = wt.get('cluster', [])
                wt_status = wt.get('status', 'unknown')
                color = WORKTREE_COLORS.get(wt_status, 'dim')
                lines.append(f"    [{color}]• {wt_name}: {wt_cluster}[/{color}]")

        # Show ready tasks (tasks whose dependencies are satisfied)
        ready_tasks = p.get_ready_tasks()
        if ready_tasks and p.status not in ('completed', 'not_started'):
            ready_ids = [t.get('id') for t in ready_tasks[:5]]
            ready_display = ", ".join(ready_ids)
            if len(ready_tasks) > 5:
                ready_display += f" (+{len(ready_tasks) - 5} more)"
            lines.append(f"  [green]🚀 Ready to run:[/green] {ready_display}")

        lines.append("")

    return Panel(
        "\n".join(lines),
        border_style="blue",
        box=box.DOUBLE,
        padding=(0, 1),
    )


def create_kanban(pipeline: PipelineState) -> Table:
    """Create the Kanban board table."""
    tasks_by_status = pipeline.get_tasks_by_status()

    # Create columns
    columns = []
    for col_name in ["Backlog", "In Progress", "Done", "Failed"]:
        tasks = tasks_by_status.get(col_name, [])
        columns.append(create_column(col_name, tasks))

    # Use Columns for horizontal layout
    return Columns(columns, equal=True, expand=True)


def find_recent_epic_pipelines(search_dir: str = ".", max_age_minutes: int = 10) -> list:
    """Find parallel epic pipeline state files modified within the last N minutes.

    Returns list of tuples: (file_path, epic_name, mtime)
    """
    import re

    epic_files = []
    now = time.time()
    max_age_seconds = max_age_minutes * 60

    # Look for parallel-pipeline-l10n-epic*-state.json or pipeline-l10n-epic*-state.json
    patterns = [
        os.path.join(search_dir, "pipeline-l10n-epic*-state.json"),
    ]

    for pattern in patterns:
        for filepath in glob.glob(pattern):
            try:
                mtime = os.path.getmtime(filepath)
                age = now - mtime

                if age <= max_age_seconds:
                    # Extract epic name from filename
                    basename = os.path.basename(filepath)
                    match = re.search(r'epic(\d+)-([^-]+)', basename)
                    if match:
                        epic_num = match.group(1)
                        epic_type = match.group(2).replace('-state.json', '')
                        epic_name = f"Epic {epic_num}"
                    else:
                        epic_name = basename.replace('-state.json', '')

                    epic_files.append((filepath, epic_name, mtime))
            except OSError:
                pass

    # Sort by epic number
    epic_files.sort(key=lambda x: x[1])
    return epic_files


def create_epics_panel(search_dir: str = ".") -> Optional[Panel]:
    """Create the Epics summary panel showing all recently active epic pipelines."""
    epic_files = find_recent_epic_pipelines(search_dir, max_age_minutes=10)

    if not epic_files:
        return None

    lines = []

    for filepath, epic_name, mtime in epic_files:
        # Load the state file
        try:
            pipeline = PipelineState(filepath)
            if not pipeline.data:
                continue

            # Get stage completion stats
            stage_stats = pipeline.get_stage_completion_stats()
            r_done, r_total = stage_stats["request"]
            o_done, o_total = stage_stats["overview"]
            d_done, d_total = stage_stats["details"]
            i_done, i_total = stage_stats["implementation"]

            # Color code: green if complete, yellow if in progress, dim if not started
            def stage_color(done, total):
                if done == total and total > 0:
                    return "green"
                elif done > 0:
                    return "yellow"
                return "dim"

            def pct(done, total):
                return int(done / total * 100) if total > 0 else 0

            r_col = stage_color(r_done, r_total)
            o_col = stage_color(o_done, o_total)
            d_col = stage_color(d_done, d_total)
            i_col = stage_color(i_done, i_total)

            # Get pipeline status
            status = pipeline.status
            status_color = "green" if status == "completed" else "yellow" if status == "running" else "red" if status == "failed" else "dim"

            # Get time since update
            time_ago = pipeline.get_time_since_update() or "unknown"

            # Format the line
            stages_line = (
                f"[{r_col}]R:{r_done}/{r_total} ({pct(r_done, r_total)}%)[/{r_col}] → "
                f"[{o_col}]O:{o_done}/{o_total} ({pct(o_done, o_total)}%)[/{o_col}] → "
                f"[{d_col}]D:{d_done}/{d_total} ({pct(d_done, d_total)}%)[/{d_col}] → "
                f"[{i_col}]I:{i_done}/{i_total} ({pct(i_done, i_total)}%)[/{i_col}]"
            )

            lines.append(f"[bold cyan]{epic_name}[/bold cyan] [{status_color}]({status})[/{status_color}] [dim]{time_ago}[/dim]")
            lines.append(f"  Stages: {stages_line}")

            # Show error info for paused/failed pipelines
            if status in ("paused", "failed"):
                last_error = pipeline.get_last_error()
                if last_error:
                    task_id = last_error.get("task_id", "")
                    request_id = last_error.get("request_id", "")
                    error_msg = last_error.get("error", "Unknown error")
                    # Truncate error message for display
                    if len(error_msg) > 50:
                        error_msg = error_msg[:47] + "..."
                    task_ref = f"[{request_id}]" if request_id else f"Task {task_id}"
                    lines.append(f"  [red]⚠ {task_ref} failed: {error_msg}[/red]")

        except Exception as e:
            lines.append(f"[dim]{epic_name}: Error loading state[/dim]")

    if not lines:
        return None

    return Panel(
        "\n".join(lines),
        title="[bold magenta]Epics[/bold magenta]",
        border_style="magenta",
        box=box.ROUNDED,
        padding=(0, 1),
    )


def create_dashboard(pipelines: list, use_layout: bool = True, search_dir: str = ".") -> Layout:
    """Create the full dashboard layout."""
    # Check for rate limit alert first
    rate_limit_alert = create_rate_limit_alert(pipelines)

    if not use_layout:
        # Simple panel list for non-live mode
        from rich.console import Group
        parts = []

        # Rate limit alert at the very top if present
        if rate_limit_alert:
            parts.append(rate_limit_alert)

        parts.append(create_header(pipelines))
        for p in pipelines:
            kanban = create_kanban(p)
            panel = Panel(
                kanban,
                title=f"[bold]{p.name}[/bold]",
                border_style="blue",
            )
            parts.append(panel)
        # Add Epics panel if available
        epics_panel = create_epics_panel(search_dir)
        if epics_panel:
            parts.append(epics_panel)
        return Group(*parts)

    layout = Layout()

    # Check if we have epics to show
    epics_panel = create_epics_panel(search_dir)

    # Calculate alert size (if present)
    alert_size = 10 if rate_limit_alert else 0

    if epics_panel:
        if rate_limit_alert:
            # Split into alert, header, body, and epics footer
            layout.split_column(
                Layout(name="alert", size=alert_size),
                Layout(name="header", size=12 + len(pipelines) * 5),
                Layout(name="body"),
                Layout(name="epics", size=6 + 2 * len(find_recent_epic_pipelines(search_dir, 10))),
            )
            layout["alert"].update(rate_limit_alert)
        else:
            # Split into header, body, and epics footer
            layout.split_column(
                Layout(name="header", size=12 + len(pipelines) * 5),
                Layout(name="body"),
                Layout(name="epics", size=6 + 2 * len(find_recent_epic_pipelines(search_dir, 10))),
            )
        layout["epics"].update(epics_panel)
    else:
        if rate_limit_alert:
            # Split into alert, header and body
            layout.split_column(
                Layout(name="alert", size=alert_size),
                Layout(name="header", size=12 + len(pipelines) * 5),
                Layout(name="body"),
            )
            layout["alert"].update(rate_limit_alert)
        else:
            # Split into header and body only
            layout.split_column(
                Layout(name="header", size=12 + len(pipelines) * 5),
                Layout(name="body"),
            )

    # Header
    layout["header"].update(create_header(pipelines))

    # Body: Kanban boards for each pipeline
    if len(pipelines) == 1:
        layout["body"].update(create_kanban(pipelines[0]))
    else:
        # Multiple pipelines: show tabs or stacked
        body_parts = []
        for p in pipelines:
            panel = Panel(
                create_kanban(p),
                title=f"[bold]{p.name}[/bold]",
                border_style="blue",
            )
            body_parts.append(Layout(panel, name=p.name))

        layout["body"].split_column(*body_parts)

    return layout


# =============================================================================
# Main Application
# =============================================================================

def find_remote_state_files(base_url: str) -> list:
    """Find pipeline state JSON files from a WebDAV/HTTP server.

    Uses WebDAV PROPFIND to list files, falls back to parsing HTML directory listing.
    """
    files = []

    # Ensure base_url ends with /
    if not base_url.endswith('/'):
        base_url += '/'

    try:
        # Try WebDAV PROPFIND first
        propfind_body = '<?xml version="1.0"?><d:propfind xmlns:d="DAV:"><d:prop><d:displayname/></d:prop></d:propfind>'
        req = Request(
            base_url,
            data=propfind_body.encode('utf-8'),
            headers={
                'User-Agent': 'PipelineDashboard/1.0',
                'Content-Type': 'application/xml',
                'Depth': '1'
            },
            method='PROPFIND'
        )

        with urlopen(req, timeout=10) as response:
            content = response.read().decode('utf-8')
            # Parse WebDAV response - look for href elements containing .json
            hrefs = re.findall(r'<[dD]:href>([^<]+)</[dD]:href>', content)
            for href in hrefs:
                if href.endswith('.json') and 'state' in href.lower():
                    # Build full URL
                    if href.startswith('/'):
                        # Extract just the filename
                        filename = href.split('/')[-1]
                        files.append(urljoin(base_url, filename))
                    elif href.startswith('http'):
                        files.append(href)
                    else:
                        files.append(urljoin(base_url, href))
    except (URLError, HTTPError):
        # Try simple HTTP GET for HTML directory listing
        try:
            req = Request(base_url, headers={'User-Agent': 'PipelineDashboard/1.0'})
            with urlopen(req, timeout=10) as response:
                content = response.read().decode('utf-8')
                # Parse HTML links - look for pipeline-*-state.json
                links = re.findall(r'href=["\']([^"\']*pipeline[^"\']*state\.json)["\']', content, re.IGNORECASE)
                for link in links:
                    if link.startswith('http'):
                        files.append(link)
                    else:
                        files.append(urljoin(base_url, link))
        except (URLError, HTTPError) as e:
            print(f"[yellow]Warning: Could not fetch remote file list from {base_url}: {e}[/yellow]")

    return sorted(set(files))


def find_state_files(directory: str = ".", include_worktrees: bool = False) -> list:
    """Find all pipeline state JSON files in the directory and optionally worktrees."""
    patterns = [
        "pipeline-state.json",
        "pipeline-*-state.json",
    ]

    files = []
    for pattern in patterns:
        files.extend(glob.glob(os.path.join(directory, pattern)))

    # Also check for worktree state files
    if include_worktrees:
        # Check standard worktree location
        worktree_base = os.path.join(os.path.dirname(directory), ".worktrees")
        if os.path.isdir(worktree_base):
            for wt_dir in os.listdir(worktree_base):
                wt_path = os.path.join(worktree_base, wt_dir)
                if os.path.isdir(wt_path):
                    for pattern in patterns:
                        files.extend(glob.glob(os.path.join(wt_path, pattern)))

        # Try to get worktrees from git
        try:
            import subprocess
            result = subprocess.run(
                ["git", "worktree", "list", "--porcelain"],
                capture_output=True,
                text=True,
                cwd=directory
            )
            if result.returncode == 0:
                for line in result.stdout.split('\n'):
                    if line.startswith('worktree '):
                        wt_path = line[9:].strip()
                        if wt_path != os.path.abspath(directory):
                            for pattern in patterns:
                                files.extend(glob.glob(os.path.join(wt_path, pattern)))
        except Exception:
            pass

    return sorted(set(files))


def run_dashboard(state_files: list, refresh_interval: int = 3, once: bool = False,
                  watch_new: bool = False, search_dir: str = ".", include_worktrees: bool = False,
                  latest_only: bool = False, auto_relaunch: bool = False,
                  relaunch_check_interval: int = 300):
    """Run the live dashboard.

    Args:
        state_files: Initial list of state files to monitor
        refresh_interval: Seconds between refreshes
        once: If True, render once and exit
        watch_new: If True, continuously scan for new state files
        search_dir: Directory to scan for new state files (when watch_new=True)
        include_worktrees: Include state files from git worktrees
        latest_only: If True with watch_new, only show the most recent pipeline (not all)
        auto_relaunch: If True, monitor rate limit and auto-relaunch when cleared
        relaunch_check_interval: Seconds between rate limit checks (default: 60)
    """
    console = Console()

    if not state_files and not watch_new:
        console.print("[red]No pipeline state files found![/red]")
        console.print("Looking for: pipeline-state.json, pipeline-*-state.json")
        return

    if state_files:
        console.print(f"[green]Found {len(state_files)} state file(s):[/green]")
        for f in state_files:
            console.print(f"  - {f}")
        console.print()

    if watch_new:
        console.print(f"[cyan]--watch-new enabled: scanning for new pipelines in {search_dir}[/cyan]")
        console.print()

    if auto_relaunch:
        interval_min = relaunch_check_interval // 60
        interval_display = f"{interval_min} min" if interval_min > 0 else f"{relaunch_check_interval}s"
        console.print(f"[cyan]--auto-relaunch enabled: will check rate limit every {interval_display} and relaunch when cleared[/cyan]")
        console.print()
        # Initialize the monitor with specified interval
        monitor = get_rate_limit_monitor()
        monitor.check_interval = relaunch_check_interval

    # Load pipelines
    pipelines = [PipelineState(f) for f in state_files]
    pipelines = [p for p in pipelines if p.data]

    if not pipelines and not watch_new:
        console.print("[red]No valid pipeline state files found[/red]")
        return

    # Single render mode
    if once:
        dashboard = create_dashboard(pipelines, use_layout=False, search_dir=search_dir)
        console.print(dashboard)
        return

    mode_info = f"Refreshing every {refresh_interval} seconds"
    if watch_new:
        mode_info += " + watching for new pipelines"
    if auto_relaunch:
        mode_info += " + auto-relaunch on rate limit clear"
    console.print(f"[dim]{mode_info}. Press Ctrl+C to exit.[/dim]")
    console.print()
    time.sleep(1)

    # Track known state files for watch_new mode
    known_files = set(state_files)

    # Track if we're currently in rate limit state
    was_rate_limited = False

    try:
        with Live(console=console, refresh_per_second=1, screen=True) as live:
            while True:
                # If watch_new is enabled, scan for new state files
                if watch_new:
                    current_files = find_state_files(search_dir, include_worktrees=include_worktrees)

                    if latest_only:
                        # Only show the most recently modified file
                        if current_files:
                            files_with_mtime = []
                            for f in current_files:
                                try:
                                    mtime = os.path.getmtime(f)
                                    files_with_mtime.append((f, mtime))
                                except OSError:
                                    pass
                            if files_with_mtime:
                                files_with_mtime.sort(key=lambda x: x[1], reverse=True)
                                state_files = [files_with_mtime[0][0]]
                    else:
                        # Accumulate all new files
                        new_files = set(current_files) - known_files
                        if new_files:
                            known_files.update(new_files)
                            state_files = list(known_files)

                # Reload all state files
                pipelines = [PipelineState(f) for f in state_files]

                # Filter out failed loads
                pipelines = [p for p in pipelines if p.data]

                # Check for rate limit and handle auto-relaunch
                if auto_relaunch and pipelines:
                    monitor = get_rate_limit_monitor()

                    # Check if any pipeline is rate limited
                    yaml_files, state_files = get_rate_limited_yaml_files(pipelines, search_dir)
                    is_rate_limited = len(yaml_files) > 0

                    if is_rate_limited:
                        was_rate_limited = True

                        # Check if it's time to ping Claude
                        if monitor.should_check():
                            # This will run in the main thread - consider making async for better UX
                            rate_limit_cleared = monitor.check_rate_limit_cleared()

                            if rate_limit_cleared:
                                # Rate limit cleared! Clear errors and relaunch pipelines
                                console.print(f"\n[bold green]✓ Rate limit cleared! Clearing errors and relaunching {len(yaml_files)} pipeline(s)...[/bold green]")

                                # Clear errors from state files first
                                for state_file in state_files:
                                    monitor.clear_rate_limit_errors_from_state(state_file)

                                # Then relaunch
                                results = monitor.relaunch_pipelines(yaml_files, search_dir, state_files)
                                for yaml_file, success, message in results:
                                    status = "[green]✓[/green]" if success else "[red]✗[/red]"
                                    console.print(f"  {status} {os.path.basename(yaml_file)}: {message}")
                                console.print()
                                time.sleep(2)  # Brief pause to show relaunch message

                    elif was_rate_limited:
                        # We were rate limited but now we're not (maybe pipelines completed or errors cleared)
                        was_rate_limited = False

                if not pipelines:
                    if watch_new:
                        live.update(Panel(
                            "[yellow]Waiting for pipeline state files...[/yellow]\n"
                            f"[dim]Scanning: {search_dir}[/dim]",
                            title="[cyan]--watch-new[/cyan]"
                        ))
                    else:
                        live.update(Panel("[red]No valid pipeline state files found[/red]"))
                else:
                    dashboard = create_dashboard(pipelines, search_dir=search_dir)
                    live.update(dashboard)

                time.sleep(refresh_interval)
    except KeyboardInterrupt:
        console.print("\n[yellow]Dashboard stopped.[/yellow]")


def main():
    parser = argparse.ArgumentParser(
        description="Pipeline Dashboard - Terminal UI for Pipeline State Visualization"
    )
    parser.add_argument(
        "--refresh", "-r",
        type=int,
        default=3,
        help="Refresh interval in seconds (default: 3)"
    )
    parser.add_argument(
        "--file", "-f",
        type=str,
        action="append",
        help="Specific state file(s) to monitor (can be specified multiple times)"
    )
    parser.add_argument(
        "--dir", "-d",
        type=str,
        default=".",
        help="Directory to search for state files (default: current directory)"
    )
    parser.add_argument(
        "--once", "-o",
        action="store_true",
        help="Render once and exit (no live updates)"
    )
    parser.add_argument(
        "--deps",
        action="store_true",
        help="Show detailed dependency graph information"
    )
    parser.add_argument(
        "--worktrees", "-w",
        action="store_true",
        help="Include state files from git worktrees"
    )
    parser.add_argument(
        "--latest", "-l",
        action="store_true",
        help="Show only the most recently modified pipeline"
    )
    parser.add_argument(
        "--watch-new",
        action="store_true",
        help="Continuously scan for new pipeline state files (useful when daemon creates new pipelines)"
    )
    parser.add_argument(
        "--remote", "-R",
        type=str,
        help="WebDAV/HTTP server URL to fetch state files from (e.g., http://192.168.1.4:8080/)"
    )
    parser.add_argument(
        "--auto-relaunch", "-a",
        action="store_true",
        help="Automatically check if rate limit has cleared and relaunch paused pipelines"
    )
    parser.add_argument(
        "--relaunch-interval",
        type=int,
        default=300,
        help="Seconds between rate limit checks when --auto-relaunch is enabled (default: 300 = 5 min)"
    )

    args = parser.parse_args()

    # Determine which files to monitor
    if args.remote:
        # Fetch from remote WebDAV/HTTP server
        print(f"[cyan]Connecting to remote server: {args.remote}[/cyan]")
        state_files = find_remote_state_files(args.remote)
        if not state_files:
            print(f"[yellow]No state files found at {args.remote}[/yellow]")
            print("[dim]Make sure the WebDAV server is running and contains pipeline-*-state.json files[/dim]")
        else:
            print(f"[green]Found {len(state_files)} remote state file(s)[/green]")
    elif args.file:
        state_files = args.file
    else:
        state_files = find_state_files(args.dir, include_worktrees=args.worktrees)

    # Filter to latest if requested
    if args.latest and state_files:
        # Sort by modification time, most recent first
        state_files_with_mtime = []
        for f in state_files:
            try:
                mtime = os.path.getmtime(f)
                state_files_with_mtime.append((f, mtime))
            except OSError:
                pass

        if state_files_with_mtime:
            state_files_with_mtime.sort(key=lambda x: x[1], reverse=True)
            state_files = [state_files_with_mtime[0][0]]
            print(f"[--latest] Showing most recent: {state_files[0]}")

    run_dashboard(
        state_files,
        refresh_interval=args.refresh,
        once=args.once,
        watch_new=args.watch_new,
        search_dir=args.dir,
        include_worktrees=args.worktrees,
        latest_only=args.latest,
        auto_relaunch=args.auto_relaunch,
        relaunch_check_interval=args.relaunch_interval
    )


if __name__ == "__main__":
    main()
