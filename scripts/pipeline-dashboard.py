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

    @property
    def tasks(self) -> list:
        return self.data.get("tasks", [])

    def get_tasks_by_status(self) -> dict:
        """Group tasks by status."""
        result = {col: [] for col in STATUS_COLUMNS.values()}
        result["Failed"] = []  # Ensure Failed column exists

        for task in self.tasks:
            status = task.get("status", "pending")
            column = STATUS_COLUMNS.get(status, "Backlog")
            result[column].append(task)

        return result

    def get_progress(self) -> tuple:
        """Return (completed, total) task counts."""
        tasks = self.tasks
        completed = sum(1 for t in tasks if t.get("status") == "completed")
        return completed, len(tasks)

    def get_current_task(self) -> Optional[dict]:
        """Get the currently processing task."""
        for task in self.tasks:
            if task.get("status") == "processing":
                return task
        return None


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
            emoji = STATUS_EMOJIS.get(status, "")

            # Truncate title if too long
            display_title = task_title[:35] + "..." if len(task_title) > 35 else task_title

            line = f"{emoji} [bold]{task_id}[/bold] {display_title}"
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

        if p.updated_at:
            lines.append(f"  [dim]Updated: {p.updated_at}[/dim]")
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

def find_state_files(directory: str = ".") -> list:
    """Find all pipeline state JSON files in the directory."""
    patterns = [
        "pipeline-state.json",
        "pipeline-*-state.json",
    ]

    files = []
    for pattern in patterns:
        files.extend(glob.glob(os.path.join(directory, pattern)))

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

    args = parser.parse_args()

    # Determine which files to monitor
    if args.file:
        state_files = args.file
    else:
        state_files = find_state_files(args.dir)

    run_dashboard(state_files, args.refresh, args.once)


if __name__ == "__main__":
    main()
