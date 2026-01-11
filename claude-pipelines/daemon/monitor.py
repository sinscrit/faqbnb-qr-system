# claude-pipelines/daemon/monitor.py
# Daemon Monitoring Module
# Created: 2026-01-11
# Last Modified: 2026-01-11
#
# Visual monitoring for the PDF Pipeline Daemon.

"""
Daemon Monitoring

Provides terminal-based visual monitoring for the PDF Pipeline Daemon.
Uses the 'rich' library for formatted output.

Usage:
    from daemon.monitor import show_status, run_dashboard

    # One-time status display
    show_status(state_path, config)

    # Live dashboard
    run_dashboard(state_path, config, log_path)
"""

import os
import time
from pathlib import Path
from datetime import datetime, timezone
from typing import Optional, List

try:
    from rich.console import Console
    from rich.table import Table
    from rich.panel import Panel
    from rich.layout import Layout
    from rich.live import Live
    from rich.text import Text
    from rich.style import Style
    from rich import box
    RICH_AVAILABLE = True
except ImportError:
    RICH_AVAILABLE = False

# Local imports - handle both module and direct execution
try:
    from .state import DaemonState, load_state
    from .config import DaemonConfig, load_config
except ImportError:
    from state import DaemonState, load_state
    from config import DaemonConfig, load_config


def check_rich_available() -> bool:
    """Check if rich library is available."""
    if not RICH_AVAILABLE:
        print("Error: 'rich' library not installed.")
        print("Install with: pip install rich")
        return False
    return True


def check_daemon_process(pid_file: Path) -> tuple[bool, Optional[int]]:
    """
    Check if daemon process is actually running.

    Args:
        pid_file: Path to PID file

    Returns:
        Tuple of (is_running, pid)
    """
    import os
    import signal

    if not pid_file.exists():
        return False, None

    try:
        pid = int(pid_file.read_text().strip())
        # Check if process exists by sending signal 0
        os.kill(pid, 0)
        return True, pid
    except (ValueError, ProcessLookupError, PermissionError):
        return False, None


def format_duration(seconds: float) -> str:
    """Format duration in human-readable form."""
    if seconds < 60:
        return f"{seconds:.1f}s"
    elif seconds < 3600:
        mins = int(seconds // 60)
        secs = int(seconds % 60)
        return f"{mins}m {secs}s"
    else:
        hours = int(seconds // 3600)
        mins = int((seconds % 3600) // 60)
        return f"{hours}h {mins}m"


def format_time_ago(iso_timestamp: str) -> str:
    """Format timestamp as 'X ago'."""
    if not iso_timestamp:
        return "never"
    try:
        # Parse ISO timestamp
        ts = iso_timestamp.rstrip('Z')
        dt = datetime.fromisoformat(ts).replace(tzinfo=timezone.utc)
        now = datetime.now(timezone.utc)
        delta = (now - dt).total_seconds()

        if delta < 60:
            return f"{int(delta)}s ago"
        elif delta < 3600:
            return f"{int(delta // 60)}m ago"
        elif delta < 86400:
            return f"{int(delta // 3600)}h ago"
        else:
            return f"{int(delta // 86400)}d ago"
    except Exception:
        return iso_timestamp[:19]


def get_status_style(status: str) -> str:
    """Get style for status text."""
    styles = {
        "running": "bold green",
        "stopped": "bold yellow",
        "error": "bold red",
    }
    return styles.get(status, "white")


def show_status(state_path: Path, config: Optional[DaemonConfig] = None) -> None:
    """
    Display a formatted status summary.

    Args:
        state_path: Path to daemon state JSON file
        config: Optional daemon configuration
    """
    if not check_rich_available():
        return

    console = Console()
    state = load_state(state_path)

    # Check actual process status
    is_running, pid = False, None
    if config:
        is_running, pid = check_daemon_process(config.daemon.pid_file)

    # Determine actual status
    if is_running:
        actual_status = "running"
    elif state.status == "running":
        actual_status = "stale"  # State says running but process is dead
    else:
        actual_status = state.status

    # Header
    console.print()
    console.print(Panel.fit(
        "[bold blue]PDF Pipeline Daemon Status[/bold blue]",
        border_style="blue"
    ))
    console.print()

    # Status info
    status_style = get_status_style(actual_status if actual_status != "stale" else "error")
    status_table = Table(show_header=False, box=box.SIMPLE, padding=(0, 2))
    status_table.add_column("Key", style="dim")
    status_table.add_column("Value")

    if actual_status == "stale":
        status_table.add_row("Status", "[bold red]NOT RUNNING[/bold red] [dim](stale state)[/dim]")
    else:
        status_table.add_row("Status", f"[{status_style}]{actual_status.upper()}[/{status_style}]")

    if is_running and pid:
        status_table.add_row("PID", f"[green]{pid}[/green]")

    if config:
        status_table.add_row("Inbox", f"[cyan]{config.daemon.inbox_dir}[/cyan]")
    if state.started_at:
        status_table.add_row("Started", format_time_ago(state.started_at))
    if state.stopped_at:
        status_table.add_row("Stopped", format_time_ago(state.stopped_at))

    console.print(status_table)
    console.print()

    # Statistics
    console.print("[bold]Statistics[/bold]")
    stats_table = Table(box=box.ROUNDED)
    stats_table.add_column("Metric", style="cyan")
    stats_table.add_column("Value", justify="right")

    stats_table.add_row("PDFs Processed", str(state.stats.pdfs_processed))
    stats_table.add_row("PDFs Failed", str(state.stats.pdfs_failed))
    stats_table.add_row("Requests Generated", str(state.stats.requests_generated))
    stats_table.add_row("Pipelines Created", str(state.stats.pipelines_created))

    console.print(stats_table)
    console.print()

    # Active Jobs
    if state.active_jobs:
        console.print("[bold]Active Jobs[/bold]")
        jobs_table = Table(box=box.ROUNDED)
        jobs_table.add_column("PDF", style="cyan")
        jobs_table.add_column("Project")
        jobs_table.add_column("Stage")
        jobs_table.add_column("Progress")
        jobs_table.add_column("Started")

        for job in state.active_jobs:
            progress = ""
            if job.request_total > 0:
                progress = f"{job.request_index}/{job.request_total}"
            jobs_table.add_row(
                Path(job.pdf_path).name,
                job.project_code or "-",
                job.stage,
                progress,
                format_time_ago(job.started_at)
            )

        console.print(jobs_table)
        console.print()

    # Recent History
    if state.history:
        console.print("[bold]Recent Completions[/bold] (last 5)")
        history_table = Table(box=box.ROUNDED)
        history_table.add_column("PDF", style="green")
        history_table.add_column("Project")
        history_table.add_column("Requests", justify="right")
        history_table.add_column("Pipelines", justify="right")
        history_table.add_column("Duration")
        history_table.add_column("Completed")

        for job in reversed(state.history[-5:]):
            history_table.add_row(
                Path(job.pdf_path).name,
                job.project_code or "-",
                str(job.requests_count),
                str(len(job.pipelines_created)),
                format_duration(job.duration_seconds),
                format_time_ago(job.completed_at)
            )

        console.print(history_table)
        console.print()

    # Recent Failures
    if state.failed:
        console.print("[bold red]Recent Failures[/bold red] (last 5)")
        failed_table = Table(box=box.ROUNDED)
        failed_table.add_column("PDF", style="red")
        failed_table.add_column("Stage")
        failed_table.add_column("Error")
        failed_table.add_column("When")

        for job in reversed(state.failed[-5:]):
            # Truncate error message
            error = job.error[:50] + "..." if len(job.error) > 50 else job.error
            failed_table.add_row(
                Path(job.pdf_path).name,
                job.stage,
                error,
                format_time_ago(job.failed_at)
            )

        console.print(failed_table)
        console.print()


def read_log_tail(log_path: Path, lines: int = 10) -> List[str]:
    """Read last N lines from log file."""
    if not log_path.exists():
        return ["(no log file)"]

    try:
        with open(log_path, 'r') as f:
            all_lines = f.readlines()
            return [line.rstrip() for line in all_lines[-lines:]]
    except Exception as e:
        return [f"(error reading log: {e})"]


def create_dashboard_layout(state: DaemonState, log_lines: List[str],
                           config: Optional[DaemonConfig] = None,
                           is_running: bool = False, pid: Optional[int] = None) -> Layout:
    """Create the dashboard layout."""
    layout = Layout()

    # Split into top and bottom
    layout.split_column(
        Layout(name="header", size=5),
        Layout(name="main"),
        Layout(name="logs", size=14),
    )

    # Split main into left and right
    layout["main"].split_row(
        Layout(name="status", ratio=1),
        Layout(name="jobs", ratio=2),
    )

    # Determine actual status
    if is_running:
        actual_status = "running"
    elif state.status == "running":
        actual_status = "stale"
    else:
        actual_status = state.status

    # Header
    status_style = get_status_style(actual_status if actual_status != "stale" else "error")
    header_text = Text()
    header_text.append("PDF Pipeline Daemon", style="bold blue")
    header_text.append("  |  Status: ")
    if actual_status == "stale":
        header_text.append("NOT RUNNING", style="bold red")
        header_text.append(" (stale)", style="dim")
    else:
        header_text.append(actual_status.upper(), style=status_style)
    if is_running and pid:
        header_text.append(f"  |  PID: {pid}", style="green")
    header_text.append(f"  |  {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    if config:
        header_text.append(f"\nInbox: {config.daemon.inbox_dir}", style="cyan")
    layout["header"].update(Panel(header_text, border_style="blue"))

    # Status panel with stats
    stats_table = Table(show_header=False, box=None, padding=(0, 1))
    stats_table.add_column("Metric", style="dim")
    stats_table.add_column("Value", justify="right", style="cyan")

    stats_table.add_row("Processed", str(state.stats.pdfs_processed))
    stats_table.add_row("Failed", str(state.stats.pdfs_failed))
    stats_table.add_row("Requests", str(state.stats.requests_generated))
    stats_table.add_row("Pipelines", str(state.stats.pipelines_created))

    if state.started_at:
        stats_table.add_row("", "")
        stats_table.add_row("Running", format_time_ago(state.started_at))

    layout["status"].update(Panel(stats_table, title="[bold]Stats[/bold]", border_style="green"))

    # Jobs panel
    if state.active_jobs:
        jobs_table = Table(box=box.SIMPLE, padding=(0, 1))
        jobs_table.add_column("PDF", style="cyan", max_width=30)
        jobs_table.add_column("Stage")
        jobs_table.add_column("Progress")

        for job in state.active_jobs:
            progress = ""
            if job.request_total > 0:
                pct = int((job.request_index / job.request_total) * 100)
                progress = f"{job.request_index}/{job.request_total} ({pct}%)"
            jobs_table.add_row(
                Path(job.pdf_path).name[:30],
                job.stage,
                progress
            )
        jobs_content = jobs_table
    else:
        jobs_content = Text("No active jobs", style="dim italic")

    # Add recent history to jobs panel
    if state.history:
        history_text = Text("\n\nRecent:\n", style="bold dim")
        for job in reversed(state.history[-3:]):
            history_text.append(f"  {Path(job.pdf_path).name[:25]}", style="green")
            history_text.append(f" ({job.requests_count} req)\n", style="dim")

        if state.active_jobs:
            jobs_panel_content = Table.grid()
            jobs_panel_content.add_row(jobs_content)
            jobs_panel_content.add_row(history_text)
        else:
            jobs_panel_content = history_text
    else:
        jobs_panel_content = jobs_content

    layout["jobs"].update(Panel(jobs_panel_content, title="[bold]Jobs[/bold]", border_style="yellow"))

    # Logs panel
    log_text = Text()
    for line in log_lines:
        # Color code log lines
        if "ERROR" in line or "error" in line.lower():
            log_text.append(line + "\n", style="red")
        elif "WARNING" in line or "warning" in line.lower():
            log_text.append(line + "\n", style="yellow")
        elif "Processing:" in line or "completed" in line.lower():
            log_text.append(line + "\n", style="green")
        else:
            log_text.append(line + "\n", style="dim")

    layout["logs"].update(Panel(log_text, title="[bold]Recent Logs[/bold]", border_style="dim"))

    return layout


def run_dashboard(state_path: Path, config: DaemonConfig,
                  refresh_interval: float = 2.0) -> None:
    """
    Run the live monitoring dashboard.

    Args:
        state_path: Path to daemon state JSON file
        config: Daemon configuration
        refresh_interval: Seconds between refreshes
    """
    if not check_rich_available():
        return

    console = Console()
    log_path = config.daemon.log_file

    console.print("[bold blue]Starting live dashboard...[/bold blue]")
    console.print("[dim]Press Ctrl+C to exit[/dim]\n")
    time.sleep(1)

    try:
        with Live(console=console, refresh_per_second=1, screen=True) as live:
            while True:
                # Reload state
                state = load_state(state_path)

                # Check actual process status
                is_running, pid = check_daemon_process(config.daemon.pid_file)

                # Read recent logs
                log_lines = read_log_tail(log_path, lines=10)

                # Create and display layout
                layout = create_dashboard_layout(state, log_lines, config, is_running, pid)
                live.update(layout)

                time.sleep(refresh_interval)

    except KeyboardInterrupt:
        console.print("\n[yellow]Dashboard closed[/yellow]")


# CLI support
if __name__ == "__main__":
    import sys
    import argparse

    parser = argparse.ArgumentParser(description="PDF Pipeline Daemon Monitor")
    parser.add_argument("--state", type=Path,
                       default=Path("./claude-pipelines/daemon/state/daemon-state.json"),
                       help="Path to state file")
    parser.add_argument("--config", type=Path,
                       default=Path("./claude-pipelines/daemon/daemon_config.yaml"),
                       help="Path to config file")
    parser.add_argument("--dashboard", "-d", action="store_true",
                       help="Run live dashboard instead of one-time status")
    parser.add_argument("--refresh", type=float, default=2.0,
                       help="Dashboard refresh interval in seconds")

    args = parser.parse_args()

    # Load config
    config = load_config(args.config) if args.config.exists() else None

    if args.dashboard:
        if config is None:
            print("Error: Config file required for dashboard mode")
            sys.exit(1)
        run_dashboard(args.state, config, args.refresh)
    else:
        show_status(args.state, config)
