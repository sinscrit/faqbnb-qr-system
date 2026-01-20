#!/bin/bash
# =============================================================================
# Pipeline Dashboard Launcher
# =============================================================================
# Quick launcher for the pipeline dashboard TUI and PDF daemon monitor.
#
# Usage:
#   ./scripts/dashboard.sh              # Run pipeline dashboard with defaults
#   ./scripts/dashboard.sh --once       # Single render (no live update)
#   ./scripts/dashboard.sh -r 5         # Refresh every 5 seconds
#   ./scripts/dashboard.sh --worktrees  # Include worktree state files
#   ./scripts/dashboard.sh --deps       # Show dependency graph
#   ./scripts/dashboard.sh --latest     # Show only the most recent pipeline
#   ./scripts/dashboard.sh --remote URL # Fetch state files from WebDAV server
#
# PDF Daemon commands:
#   ./scripts/dashboard.sh daemon       # Start PDF daemon in foreground
#   ./scripts/dashboard.sh monitor      # Run daemon monitor dashboard
#   ./scripts/dashboard.sh status       # Show daemon status
#   ./scripts/dashboard.sh stop         # Stop running daemon
#
# Created: 2026-01-05
# Last Modified: 2026-01-19
# =============================================================================

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_DIR="$( dirname "$SCRIPT_DIR" )"

cd "$PROJECT_DIR"

# Handle daemon commands
case "$1" in
    daemon)
        shift
        python3 claude-pipelines/daemon/pdf_daemon.py "$@"
        exit $?
        ;;
    monitor)
        shift
        python3 claude-pipelines/daemon/pdf_daemon.py --monitor "$@"
        exit $?
        ;;
    status)
        shift
        python3 claude-pipelines/daemon/pdf_daemon.py --status "$@"
        exit $?
        ;;
    stop)
        python3 claude-pipelines/daemon/pdf_daemon.py --stop
        exit $?
        ;;
    health|health-check)
        shift
        python3 claude-pipelines/daemon/pdf_daemon.py --health-check "$@"
        exit $?
        ;;
esac

# Pipeline execution directory (where state/log files are stored)
PIPELINES_EXEC_DIR="$PROJECT_DIR/pipelines-execution"

# Automatically add state files from pipelines-execution directory
PIPELINE_ARGS=""
if [[ -d "$PIPELINES_EXEC_DIR" ]]; then
    for STATE_FILE in "$PIPELINES_EXEC_DIR"/pipeline-*-state.json; do
        if [[ -f "$STATE_FILE" ]]; then
            PIPELINE_ARGS="$PIPELINE_ARGS --file $STATE_FILE"
        fi
    done
fi

# Check for active worktrees and add their state files automatically
WORKTREE_ARGS=""
if [[ "$*" == *"--worktrees"* ]] || [[ "$*" == *"-w"* ]]; then
    # Find all git worktrees
    if command -v git &> /dev/null; then
        WORKTREES=$(git worktree list --porcelain 2>/dev/null | grep "^worktree " | cut -d' ' -f2-)
        for WT in $WORKTREES; do
            # Skip the main worktree (current directory)
            if [[ "$WT" != "$PROJECT_DIR" ]]; then
                # Look for state files in worktree root (legacy)
                for STATE_FILE in "$WT"/pipeline-*-state.json; do
                    if [[ -f "$STATE_FILE" ]]; then
                        WORKTREE_ARGS="$WORKTREE_ARGS --file $STATE_FILE"
                    fi
                done
                # Look for state files in worktree pipelines-execution directory
                for STATE_FILE in "$WT"/pipelines-execution/pipeline-*-state.json; do
                    if [[ -f "$STATE_FILE" ]]; then
                        WORKTREE_ARGS="$WORKTREE_ARGS --file $STATE_FILE"
                    fi
                done
            fi
        done
    fi
fi

# Also check the standard worktree location
WORKTREE_DIR="../.worktrees"
if [[ -d "$WORKTREE_DIR" ]]; then
    for WT_DIR in "$WORKTREE_DIR"/*; do
        if [[ -d "$WT_DIR" ]]; then
            # Check root (legacy)
            for STATE_FILE in "$WT_DIR"/pipeline-*-state.json; do
                if [[ -f "$STATE_FILE" ]]; then
                    WORKTREE_ARGS="$WORKTREE_ARGS --file $STATE_FILE"
                fi
            done
            # Check pipelines-execution directory
            for STATE_FILE in "$WT_DIR"/pipelines-execution/pipeline-*-state.json; do
                if [[ -f "$STATE_FILE" ]]; then
                    WORKTREE_ARGS="$WORKTREE_ARGS --file $STATE_FILE"
                fi
            done
        fi
    done
fi

# Pass pipelines-execution as search directory for --watch-new
python3 "$PROJECT_DIR/claude-pipelines/pipeline-dashboard.py" $PIPELINE_ARGS $WORKTREE_ARGS --dir "$PIPELINES_EXEC_DIR" "$@"
