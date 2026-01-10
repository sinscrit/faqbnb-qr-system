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
# =============================================================================

import json
import os
import sys
import time
import glob
import argparse
from datetime import datetime
from pathlib import Path
from typing import Optional

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

# =============================================================================
# Pipeline State Reader
# =============================================================================

class PipelineState:
    """Reads and parses pipeline state JSON files."""

    def __init__(self, file_path: str):
        self.file_path = file_path
        self.data = {}
        self.load()

    def load(self) -> bool:
        """Load state from JSON file."""
        try:
            with open(self.file_path, 'r') as f:
                self.data = json.load(f)
            return True
        except (FileNotFoundError, json.JSONDecodeError) as e:
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

        return result

    def get_progress(self) -> tuple:
        """Return (completed, total) task counts based on implementation completion."""
        tasks = self.tasks
        # Count tasks where implementation is actually completed
        completed = sum(1 for t in tasks if t.get("implementation_completed", False))
        return completed, len(tasks)

    def get_current_task(self) -> Optional[dict]:
        """Get the currently processing task."""
        for task in self.tasks:
            if task.get("status") == "processing":
                return task
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

    Returns something like: [R✓O✓D✓I○] showing which stages are complete.
    """
    r = "✓" if task.get("request_completed") else "○"
    o = "✓" if task.get("overview_completed") else "○"
    d = "✓" if task.get("details_completed") else "○"
    i = "✓" if task.get("implementation_completed") else "○"

    # Color the indicators
    r_color = "green" if task.get("request_completed") else "dim"
    o_color = "green" if task.get("overview_completed") else "dim"
    d_color = "green" if task.get("details_completed") else "dim"
    i_color = "green" if task.get("implementation_completed") else "dim"

    return f"[{r_color}]R{r}[/{r_color}][{o_color}]O{o}[/{o_color}][{d_color}]D{d}[/{d_color}][{i_color}]I{i}[/{i_color}]"


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
        completed, total = p.get_progress()
        pct = (completed / total * 100) if total > 0 else 0
        status = p.status

        # Create progress bar
        bar_width = 20
        filled = int(bar_width * pct / 100)
        bar = "█" * filled + "░" * (bar_width - filled)

        status_color = "green" if status == "completed" else "yellow" if status == "running" else "white"

        lines.append(f"[bold]{p.name}[/bold]")
        lines.append(f"  Status: [{status_color}]{status}[/{status_color}] | Progress: [{status_color}]{bar}[/{status_color}] {completed}/{total} ({pct:.0f}%)")

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


def create_dashboard(pipelines: list, use_layout: bool = True) -> Layout:
    """Create the full dashboard layout."""
    if not use_layout:
        # Simple panel list for non-live mode
        from rich.console import Group
        parts = [create_header(pipelines)]
        for p in pipelines:
            kanban = create_kanban(p)
            panel = Panel(
                kanban,
                title=f"[bold]{p.name}[/bold]",
                border_style="blue",
            )
            parts.append(panel)
        return Group(*parts)

    layout = Layout()

    # Split into header and body
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


def run_dashboard(state_files: list, refresh_interval: int = 3, once: bool = False):
    """Run the live dashboard."""
    console = Console()

    if not state_files:
        console.print("[red]No pipeline state files found![/red]")
        console.print("Looking for: pipeline-state.json, pipeline-*-state.json")
        return

    console.print(f"[green]Found {len(state_files)} state file(s):[/green]")
    for f in state_files:
        console.print(f"  - {f}")
    console.print()

    # Load pipelines
    pipelines = [PipelineState(f) for f in state_files]
    pipelines = [p for p in pipelines if p.data]

    if not pipelines:
        console.print("[red]No valid pipeline state files found[/red]")
        return

    # Single render mode
    if once:
        dashboard = create_dashboard(pipelines, use_layout=False)
        console.print(dashboard)
        return

    console.print(f"[dim]Refreshing every {refresh_interval} seconds. Press Ctrl+C to exit.[/dim]")
    console.print()
    time.sleep(1)

    try:
        with Live(console=console, refresh_per_second=1, screen=True) as live:
            while True:
                # Reload all state files
                pipelines = [PipelineState(f) for f in state_files]

                # Filter out failed loads
                pipelines = [p for p in pipelines if p.data]

                if not pipelines:
                    live.update(Panel("[red]No valid pipeline state files found[/red]"))
                else:
                    dashboard = create_dashboard(pipelines)
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

    args = parser.parse_args()

    # Determine which files to monitor
    if args.file:
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

    run_dashboard(state_files, args.refresh, args.once)


if __name__ == "__main__":
    main()
