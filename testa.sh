#!/bin/bash
# Test Claude Code headless invocation with the request-fa agent

claude -p "use agent 01-request-fa to create the request for: Phase 1 (Foundation), Task 1.1: Create component directory structure
Details:
  - Create /src/components/ItemCapture/ directory
  - Set up barrel exports in index.ts
  - Create ItemCapture.types.ts with all interfaces" \
  --permission-mode acceptEdits \
  --allowedTools "Read,Write,Bash" \
  --output-format json