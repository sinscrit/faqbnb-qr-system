#!/bin/bash
# agent-log.sh - Log agent progress with guaranteed accurate timestamps
# Last Modified: 2026-01-23 14:05
#
# Usage:
#   ./scripts/agent-log.sh --ctx REQ-E04-008 STARTING "Subtask 1.1 - Create directory"
#   ./scripts/agent-log.sh --ctx REQ-E04-008 COMPLETED "Subtask 1.1"
#   ./scripts/agent-log.sh --ctx REQ-E04-008 DECISION "Using Radix UI for accessibility"
#   ./scripts/agent-log.sh --ctx REQ-E04-008 ISSUE "Type mismatch → fixed imports"
#   ./scripts/agent-log.sh --ctx REQ-E04-008 PHASE "Phase 1 complete"
#   ./scripts/agent-log.sh --ctx REQ-E04-008 --init  # Initialize with context header
#
# Without context (backwards compatible):
#   ./scripts/agent-log.sh STARTING "Subtask 1.1"
#   ./scripts/agent-log.sh --init

JOURNAL_FILE="pipelines-execution/agent-journal.log"
CONTEXT=""

# Parse --ctx flag if present
if [ "$1" = "--ctx" ]; then
    CONTEXT="$2"
    shift 2
fi

# Handle --init flag
if [ "$1" = "--init" ]; then
    # Ensure journal directory exists
    mkdir -p "$(dirname "$JOURNAL_FILE")"

    if [ -n "$CONTEXT" ]; then
        echo "" >> "$JOURNAL_FILE"
        echo "[$(date '+%H:%M:%S')] ════════════════════════════════════════" >> "$JOURNAL_FILE"
        echo "[$(date '+%H:%M:%S')] [$CONTEXT] AGENT STARTED: $(date '+%Y-%m-%d %H:%M:%S')" >> "$JOURNAL_FILE"
        echo "[$(date '+%H:%M:%S')] ════════════════════════════════════════" >> "$JOURNAL_FILE"
    else
        echo "" >> "$JOURNAL_FILE"
        echo "[$(date '+%H:%M:%S')] ========================================" >> "$JOURNAL_FILE"
        echo "[$(date '+%H:%M:%S')] AGENT STARTED: $(date '+%Y-%m-%d %H:%M:%S')" >> "$JOURNAL_FILE"
        echo "[$(date '+%H:%M:%S')] ========================================" >> "$JOURNAL_FILE"
    fi
    exit 0
fi

# If first arg is a known tag, format accordingly
case "$1" in
    STARTING|COMPLETED|DECISION|ISSUE|PHASE|BLOCKED|THINKING|ERROR|SUCCESS|TYPECHECK|BUILD|TEST)
        TAG="$1"
        shift
        MESSAGE="$*"
        ;;
    *)
        TAG=""
        MESSAGE="$*"
        ;;
esac

# Ensure journal directory exists
mkdir -p "$(dirname "$JOURNAL_FILE")"

# Log with actual system timestamp and optional context
if [ -n "$CONTEXT" ]; then
    if [ -n "$TAG" ]; then
        echo "[$(date '+%H:%M:%S')] [$CONTEXT] $TAG: $MESSAGE" >> "$JOURNAL_FILE"
    else
        echo "[$(date '+%H:%M:%S')] [$CONTEXT] $MESSAGE" >> "$JOURNAL_FILE"
    fi
else
    if [ -n "$TAG" ]; then
        echo "[$(date '+%H:%M:%S')] $TAG: $MESSAGE" >> "$JOURNAL_FILE"
    else
        echo "[$(date '+%H:%M:%S')] $MESSAGE" >> "$JOURNAL_FILE"
    fi
fi
