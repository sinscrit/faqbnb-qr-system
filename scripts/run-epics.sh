#!/usr/bin/env bash
# =============================================================================
# Epic Pipeline Orchestrator
# =============================================================================
# Master script to run multiple L10N epic pipelines with parallelization options.
#
# Usage:
#   ./scripts/run-epics.sh                     # Run all epics sequentially (default)
#   ./scripts/run-epics.sh --parallel          # Run epics in parallel (Option A - separate request files)
#   ./scripts/run-epics.sh --staged            # Run Stage 1 sequential, then Stage 2+ parallel (Option B)
#   ./scripts/run-epics.sh --epics "1,2,3"     # Run specific epics only
#   ./scripts/run-epics.sh --stages "request"  # Run specific stages only
#   ./scripts/run-epics.sh --dry-run           # Show what would be executed
#
# Options:
#   --parallel    Enable full parallelization using separate request files per epic
#   --staged      Run Stage 1 (request) sequentially, then Stage 2+ in parallel
#   --epics       Comma-separated list of epic numbers (1-5)
#   --stages      Comma-separated list of stages (request,overview,details,implementation)
#   --dry-run     Show commands without executing
#   --help        Show this help message
#
# Created: 2026-01-18
# =============================================================================

set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_DIR="$( dirname "$SCRIPT_DIR" )"
PIPELINES_DIR="$PROJECT_DIR/pipelines-execution"
ORCHESTRATOR="$PROJECT_DIR/claude-pipelines/pipeline_orchestrator.py"

# Default values
PARALLEL_MODE=""
EPICS="1,2,3,4,5"
STAGES=""
DRY_RUN=false

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to get pipeline config for an epic
get_pipeline_config() {
    local epic=$1
    case $epic in
        1) echo "pipeline-l10n-epic1-foundation.yaml" ;;
        2) echo "pipeline-l10n-epic2-static-ui.yaml" ;;
        3) echo "pipeline-l10n-epic3-dynamic-content.yaml" ;;
        4) echo "pipeline-l10n-epic4-guest-experience.yaml" ;;
        5) echo "pipeline-l10n-epic5-owner-management.yaml" ;;
        *) echo "" ;;
    esac
}

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --parallel)
            PARALLEL_MODE="parallel"
            shift
            ;;
        --staged)
            PARALLEL_MODE="staged"
            shift
            ;;
        --epics)
            EPICS="$2"
            shift 2
            ;;
        --stages)
            STAGES="$2"
            shift 2
            ;;
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        --help|-h)
            head -30 "$0" | tail -25
            exit 0
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            exit 1
            ;;
    esac
done

# Convert comma-separated epics to space-separated for iteration
EPIC_LIST=$(echo "$EPICS" | tr ',' ' ')

echo -e "${BLUE}======================================${NC}"
echo -e "${BLUE}Epic Pipeline Orchestrator${NC}"
echo -e "${BLUE}======================================${NC}"
echo ""
echo -e "Mode: ${YELLOW}${PARALLEL_MODE:-sequential}${NC}"
echo -e "Epics: ${YELLOW}${EPICS}${NC}"
echo -e "Stages: ${YELLOW}${STAGES:-all}${NC}"
echo -e "Dry run: ${YELLOW}${DRY_RUN}${NC}"
echo ""

# Function to run a single pipeline
run_pipeline() {
    local epic=$1
    local stages=$2
    local config_name=$(get_pipeline_config $epic)
    local config="${PIPELINES_DIR}/${config_name}"

    if [[ ! -f "$config" ]]; then
        echo -e "${RED}Config not found: $config${NC}"
        return 1
    fi

    local cmd="python3 $ORCHESTRATOR --config $config"

    if [[ -n "$stages" ]]; then
        cmd="$cmd --stages \"$stages\""
    fi

    echo -e "${GREEN}[Epic $epic]${NC} $cmd"

    if [[ "$DRY_RUN" == "false" ]]; then
        eval $cmd
    fi
}

# Function to create parallel-safe pipeline config (Option A)
create_parallel_config() {
    local epic=$1
    local config_name=$(get_pipeline_config $epic)
    local original="${PIPELINES_DIR}/${config_name}"
    local parallel="${PIPELINES_DIR}/parallel-${config_name}"

    if [[ ! -f "$original" ]]; then
        echo -e "${RED}Original config not found: $original${NC}"
        return 1
    fi

    # Create a copy with epic-specific request file
    sed "s|gen_requests.md|gen_requests_epic${epic}.md|g" "$original" > "$parallel"
    echo "$parallel"
}

# =============================================================================
# Main Execution Logic
# =============================================================================

case "$PARALLEL_MODE" in
    "parallel")
        # Option A: Full parallelization with separate request files
        echo -e "${BLUE}Running in PARALLEL mode (separate request files)${NC}"
        echo ""

        # Create epic-specific request files if they don't exist
        for epic in $EPIC_LIST; do
            request_file="${PROJECT_DIR}/docs/gen_requests_epic${epic}.md"
            if [[ ! -f "$request_file" ]]; then
                echo -e "${YELLOW}Creating request file for Epic $epic...${NC}"
                cat > "$request_file" << EOF
# Generated Requests - Epic ${epic}

This file contains auto-generated feature requests for L10N Epic ${epic}.

---

EOF
            fi
        done

        # Create parallel-safe configs and store paths
        PARALLEL_CONFIGS=""
        for epic in $EPIC_LIST; do
            echo -e "${YELLOW}Creating parallel config for Epic $epic...${NC}"
            parallel_config=$(create_parallel_config $epic)
            PARALLEL_CONFIGS="$PARALLEL_CONFIGS $epic:$parallel_config"
        done
        echo ""

        # Run all epics in parallel
        PIDS=""
        for epic in $EPIC_LIST; do
            config_name=$(get_pipeline_config $epic)
            config="${PIPELINES_DIR}/parallel-${config_name}"
            logfile="${PIPELINES_DIR}/epic${epic}-parallel.log"

            cmd="python3 $ORCHESTRATOR --config $config"
            if [[ -n "$STAGES" ]]; then
                cmd="$cmd --stages \"$STAGES\""
            fi

            echo -e "${GREEN}[Epic $epic]${NC} Starting in background (log: $logfile)"

            if [[ "$DRY_RUN" == "false" ]]; then
                eval $cmd > "$logfile" 2>&1 &
                PIDS="$PIDS $!"
            fi
        done

        if [[ "$DRY_RUN" == "false" ]]; then
            echo ""
            echo -e "${YELLOW}Waiting for all epics to complete...${NC}"
            echo -e "PIDs:$PIDS"
            echo ""
            echo -e "Monitor progress with: ${GREEN}./scripts/dashboard.sh --refresh 5${NC}"
            echo ""

            # Wait for all background processes
            for pid in $PIDS; do
                wait $pid
                echo -e "${GREEN}Process $pid completed${NC}"
            done
        fi
        ;;

    "staged")
        # Option B: Stage 1 sequential, then Stage 2+ parallel
        echo -e "${BLUE}Running in STAGED mode (Stage 1 sequential, Stage 2+ parallel)${NC}"
        echo ""

        # Stage 1: Run request stage sequentially for all epics
        echo -e "${YELLOW}=== Phase 1: Running REQUEST stage sequentially ===${NC}"
        for epic in $EPIC_LIST; do
            run_pipeline $epic "request"
            echo ""
        done

        echo -e "${GREEN}=== Phase 1 Complete: All REQUEST stages done ===${NC}"
        echo ""

        # Determine remaining stages
        if [[ -n "$STAGES" ]]; then
            # Remove 'request' from stages if present
            REMAINING_STAGES=$(echo "$STAGES" | sed 's/request,//g' | sed 's/,request//g' | sed 's/^request$//g')
        else
            REMAINING_STAGES="overview,details,implementation"
        fi

        if [[ -n "$REMAINING_STAGES" ]]; then
            echo -e "${YELLOW}=== Phase 2: Running remaining stages in parallel ===${NC}"
            echo -e "Stages: ${REMAINING_STAGES}"
            echo ""

            # Run remaining stages in parallel
            PIDS=""
            for epic in $EPIC_LIST; do
                config_name=$(get_pipeline_config $epic)
                config="${PIPELINES_DIR}/${config_name}"
                logfile="${PIPELINES_DIR}/epic${epic}-staged.log"

                cmd="python3 $ORCHESTRATOR --config $config --stages \"$REMAINING_STAGES\""

                echo -e "${GREEN}[Epic $epic]${NC} Starting in background (log: $logfile)"

                if [[ "$DRY_RUN" == "false" ]]; then
                    eval $cmd > "$logfile" 2>&1 &
                    PIDS="$PIDS $!"
                fi
            done

            if [[ "$DRY_RUN" == "false" ]]; then
                echo ""
                echo -e "${YELLOW}Waiting for all epics to complete...${NC}"
                echo -e "PIDs:$PIDS"
                echo ""
                echo -e "Monitor progress with: ${GREEN}./scripts/dashboard.sh --refresh 5${NC}"
                echo ""

                # Wait for all background processes
                for pid in $PIDS; do
                    wait $pid
                    echo -e "${GREEN}Process $pid completed${NC}"
                done
            fi
        fi

        echo -e "${GREEN}=== All stages complete ===${NC}"
        ;;

    *)
        # Default: Sequential execution
        echo -e "${BLUE}Running in SEQUENTIAL mode${NC}"
        echo ""

        for epic in $EPIC_LIST; do
            echo -e "${YELLOW}=== Epic $epic ===${NC}"
            run_pipeline $epic "$STAGES"
            echo ""
        done

        echo -e "${GREEN}=== All epics complete ===${NC}"
        ;;
esac

echo ""
echo -e "${BLUE}======================================${NC}"
echo -e "${GREEN}Done!${NC}"
echo -e "${BLUE}======================================${NC}"
