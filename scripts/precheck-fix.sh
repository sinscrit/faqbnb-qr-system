#!/bin/bash
# precheck-fix.sh - Standalone precheck and auto-fix script
# Last Modified: 2026-01-23
#
# Runs precheck (TypeScript + dev server) and spawns fixer agent if needed.
#
# Usage:
#   ./scripts/precheck-fix.sh              # Run precheck with auto-fix
#   ./scripts/precheck-fix.sh --check-only # Check only, no auto-fix
#   ./scripts/precheck-fix.sh --fix-only   # Run fixer agent directly (skip checks)

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Flags
CHECK_ONLY=false
FIX_ONLY=false
VERBOSE=false

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --check-only)
            CHECK_ONLY=true
            shift
            ;;
        --fix-only)
            FIX_ONLY=true
            shift
            ;;
        --verbose|-v)
            VERBOSE=true
            shift
            ;;
        --help|-h)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --check-only    Run checks only, no auto-fix"
            echo "  --fix-only      Run fixer agent directly (skip checks)"
            echo "  --verbose, -v   Show detailed output"
            echo "  --help, -h      Show this help"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

echo -e "${BLUE}============================================================${NC}"
echo -e "${BLUE}PRECHECK & AUTO-FIX${NC}"
echo -e "${BLUE}============================================================${NC}"
echo ""

# Track failures
TYPESCRIPT_FAILED=false
TYPESCRIPT_ERRORS=0
DEV_SERVER_FAILED=false
MCP_FAILED=false
FAILURES=""

run_typescript_check() {
    echo -e "${YELLOW}[1/3] TypeScript Check${NC}"

    # Run tsc and capture output
    TSC_OUTPUT=$(npx tsc --noEmit 2>&1) || true

    # Count production errors (exclude test files, stories, etc.)
    TYPESCRIPT_ERRORS=$(echo "$TSC_OUTPUT" | grep -E "^src/.*\.tsx?.*error TS" | grep -v "\.test\." | grep -v "\.spec\." | grep -v "\.stories\." | wc -l | tr -d ' ')

    if [ "$TYPESCRIPT_ERRORS" -gt 0 ]; then
        echo -e "  ${RED}FAILED${NC} - $TYPESCRIPT_ERRORS production error(s)"
        TYPESCRIPT_FAILED=true
        FAILURES="${FAILURES}- TypeScript: ${TYPESCRIPT_ERRORS} production error(s)\n"
        if [ "$VERBOSE" = true ]; then
            echo "$TSC_OUTPUT" | grep -E "^src/.*\.tsx?.*error TS" | grep -v "\.test\." | grep -v "\.spec\." | grep -v "\.stories\." | head -20
        fi
    else
        echo -e "  ${GREEN}PASSED${NC} - No production errors"
    fi
    echo ""
}

run_dev_server_check() {
    echo -e "${YELLOW}[2/3] Dev Server Check${NC}"

    # Check if server responds (5 second timeout)
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 5 --max-time 10 http://localhost:3000/ 2>/dev/null || echo "000")

    if [ "$HTTP_CODE" = "200" ]; then
        echo -e "  ${GREEN}PASSED${NC} - Server responding (HTTP $HTTP_CODE)"
    else
        echo -e "  ${RED}FAILED${NC} - Server not responding (HTTP $HTTP_CODE)"
        DEV_SERVER_FAILED=true
        FAILURES="${FAILURES}- dev_server: not responding (HTTP ${HTTP_CODE})\n"
    fi
    echo ""
}

run_mcp_check() {
    echo -e "${YELLOW}[3/3] MCP Tools Check${NC}"

    # Basic check - just verify claude CLI is available
    if command -v claude &> /dev/null; then
        echo -e "  ${GREEN}PASSED${NC} - Claude CLI available"
    else
        echo -e "  ${RED}FAILED${NC} - Claude CLI not found"
        MCP_FAILED=true
        FAILURES="${FAILURES}- mcp: Claude CLI not available\n"
    fi
    echo ""
}

run_fixer_agent() {
    echo -e "${BLUE}============================================================${NC}"
    echo -e "${BLUE}RUNNING FIXER AGENT${NC}"
    echo -e "${BLUE}============================================================${NC}"
    echo ""

    if [ -z "$FAILURES" ]; then
        echo -e "${GREEN}No failures to fix!${NC}"
        return 0
    fi

    echo -e "Failures to fix:"
    echo -e "$FAILURES"
    echo ""

    # Build the prompt
    PROMPT="You are the Precheck Fixer Agent. Fix the following precheck failures so the pipeline can proceed.

**Failed Checks:**
$(echo -e "$FAILURES")

**Instructions:**
1. Fix TypeScript errors first (if any) - read the files, fix the issues
2. Fix dev server issues:
   - Check if port 3000 is in use: \`lsof -ti:3000\`
   - Kill stuck processes if needed: \`kill -9 <pid>\`
   - ALWAYS clear the .next cache: \`rm -rf .next\` (prevents corrupted cache issues)
   - Start dev server in background if not running
3. Verify fixes by checking that:
   - \`npx tsc --noEmit\` has no production errors
   - \`curl -s -o /dev/null -w \"%{http_code}\" http://localhost:3000/\` returns 200

**IMPORTANT:**
- ALWAYS run \`rm -rf .next\` before starting the dev server to ensure clean state
- For dev server, use \`nohup npm run dev > /tmp/nextjs-dev.log 2>&1 &\` so it persists after Claude's task ends
- Wait for server to be ready by polling \`curl -s -o /dev/null -w \"%{http_code}\" http://localhost:3000/\` until it returns 200 (may take 15-20 seconds)
- Do NOT start Chrome - that requires manual user action
- Focus on automated fixes only

**OUTPUT REQUIREMENT - MANDATORY:**
You MUST end your response with exactly this format (no code blocks, plain text):

PRECHECK FIX SUMMARY:
======================
ACTIONS TAKEN:
- [Describe each action you took]
- [List every file edited and what was changed]
- [List every command run and its result]

ISSUES FIXED:
- TypeScript: FIXED/FAILED/SKIPPED - [brief description]
- dev_server: FIXED/FAILED/SKIPPED - [brief description]

ISSUES REQUIRING MANUAL ACTION:
- [List any issues you could not fix]

STATUS: SUCCESS/PARTIAL/FAILED"

    # Run the fixer agent
    echo "Spawning Claude fixer agent..."
    echo ""

    claude -p "$PROMPT" --allowedTools "Read,Write,Edit,Bash,Glob,Grep"

    FIXER_EXIT=$?

    if [ $FIXER_EXIT -eq 0 ]; then
        echo ""
        echo -e "${GREEN}Fixer agent completed${NC}"
    else
        echo ""
        echo -e "${RED}Fixer agent failed (exit code: $FIXER_EXIT)${NC}"
    fi

    return $FIXER_EXIT
}

# Main logic
if [ "$FIX_ONLY" = true ]; then
    # Skip checks, run fixer directly with generic prompt
    FAILURES="- TypeScript: check needed\n- dev_server: check needed\n"
    run_fixer_agent
    exit $?
fi

# Run all checks
run_typescript_check
run_dev_server_check
run_mcp_check

# Summary
echo -e "${BLUE}============================================================${NC}"
echo -e "${BLUE}PRECHECK SUMMARY${NC}"
echo -e "${BLUE}============================================================${NC}"

if [ "$TYPESCRIPT_FAILED" = false ] && [ "$DEV_SERVER_FAILED" = false ] && [ "$MCP_FAILED" = false ]; then
    echo -e "${GREEN}All checks passed!${NC}"
    exit 0
else
    echo -e "${RED}Some checks failed:${NC}"
    echo -e "$FAILURES"

    if [ "$CHECK_ONLY" = true ]; then
        echo -e "${YELLOW}Skipping auto-fix (--check-only mode)${NC}"
        exit 1
    fi

    echo ""
    run_fixer_agent
    FIXER_RESULT=$?

    # Re-run checks after fix
    echo ""
    echo -e "${BLUE}============================================================${NC}"
    echo -e "${BLUE}RE-RUNNING CHECKS AFTER FIX${NC}"
    echo -e "${BLUE}============================================================${NC}"
    echo ""

    # Reset failures
    TYPESCRIPT_FAILED=false
    DEV_SERVER_FAILED=false
    MCP_FAILED=false
    FAILURES=""

    run_typescript_check
    run_dev_server_check
    run_mcp_check

    if [ "$TYPESCRIPT_FAILED" = false ] && [ "$DEV_SERVER_FAILED" = false ] && [ "$MCP_FAILED" = false ]; then
        echo -e "${GREEN}All checks now passing!${NC}"
        exit 0
    else
        echo -e "${RED}Some checks still failing after fix attempt${NC}"
        exit 1
    fi
fi
