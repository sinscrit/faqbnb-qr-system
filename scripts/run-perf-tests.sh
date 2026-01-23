#!/usr/bin/env bash
#
# Performance Test Runner Script
#
# This script runs all performance benchmark tests for the L10N Epic 4
# guest experience feature. It provides formatted output with benchmark
# results and statistics.
#
# Usage:
#   ./scripts/run-perf-tests.sh
#
# See also:
#   - REQ-E04-026: Performance validation specification
#   - npm run test:perf: Alternative way to run tests
#
# Last Modified: 2026-01-23 22:50

set -e

echo ""
echo "╔══════════════════════════════════════════════════════════════════════════════╗"
echo "║           FAQBNB Performance Benchmark Suite - Epic 4 Guest L10N            ║"
echo "╠══════════════════════════════════════════════════════════════════════════════╣"
echo "║ Testing performance targets:                                                 ║"
echo "║   • Language Detection: < 5ms (P95)                                         ║"
echo "║   • Content Loading:    < 200ms (P95)                                       ║"
echo "║   • Client Toggle:      < 100ms (P95)                                       ║"
echo "║   • Component Render:   < 50ms (P90)                                        ║"
echo "║   • SSR Data Fetch:     < 500ms (P80)                                       ║"
echo "║   • TTFB Delta:         < 50ms (mean)                                       ║"
echo "╚══════════════════════════════════════════════════════════════════════════════╝"
echo ""

# Run the performance tests with verbose output
npm run test:perf

echo ""
echo "╔══════════════════════════════════════════════════════════════════════════════╗"
echo "║                      Performance Tests Complete!                             ║"
echo "╚══════════════════════════════════════════════════════════════════════════════╝"
echo ""
