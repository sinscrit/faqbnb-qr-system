# REQ-357: Set Up Railway Cron Job (or Alternative) - Detailed Task Breakdown

**Generated:** 2026-01-19 22:15:00 UTC
**Last Modified:** 2026-01-19 22:15:00 UTC
**Request Reference:** REQ-357 in docs/gen_requests_epic3.md
**Overview Document:** REQ-357-set-up-railway-cron-job-or-alternative-overview.md
**Implementation Plan Reference:** Plan-111-L10N-Epic3-Dynamic-Content-Translation.md (Phase 5, Task 5.2)
**Epic:** Localization Epic 3 - Dynamic Content Translation
**Type:** NEW FEATURE (Infrastructure Configuration)
**Size:** M (Medium)
**Estimated Story Points:** 3

---

## Summary

Configure an automated scheduled job mechanism to invoke the translation job processing endpoint (`POST /api/admin/process-translations`) at regular intervals. This ensures content translations are processed continuously without manual intervention. The primary implementation uses Railway's built-in cron job service, with documented alternatives for fallback scenarios.

---

## Prerequisites

Before starting implementation, verify these dependencies are complete:

- [x] REQ-356: Job Processing API Route (`/src/app/api/admin/process-translations/route.ts`)
- [x] REQ-243: Translation Job Queue Module (`/src/lib/job-queue/`)
- [x] REQ-244: Job Processor (`/src/lib/job-queue/job-processor.ts`)

### Quick Verification

```bash
# Check process-translations endpoint exists
ls -la src/app/api/admin/process-translations/route.ts

# Verify endpoint is deployed (staging)
curl -s -o /dev/null -w "%{http_code}" -X OPTIONS https://faqbnb-staging.up.railway.app/api/admin/process-translations

# Check SUPABASE_SERVICE_ROLE_KEY exists in Railway dashboard
# Navigate to Railway > Project > Variables
```

---

## Detailed Tasks

### Task 1: Create Cron Shell Script for External Execution

**Story Points:** 1
**Priority:** High (core deliverable)

Create a shell script that can invoke the translation processing endpoint. This script serves multiple purposes:
1. Local testing of cron invocation
2. Alternative trigger via external cron services (GitHub Actions, cron-job.org)
3. Manual one-off invocations during debugging

#### 1.1 Create Script Directory Structure

Verify the `/scripts` directory exists and create the cron script.

**File to CREATE:** `/scripts/process-translations-cron.sh`

```bash
#!/bin/bash
# =============================================================================
# Translation Job Processing Cron Script
# REQ-357: Automated job processing trigger
# =============================================================================
#
# Purpose:
#   Invokes the translation job processing endpoint to trigger background
#   processing of queued translation jobs.
#
# Usage:
#   ./scripts/process-translations-cron.sh
#
# Environment Variables Required:
#   SUPABASE_SERVICE_ROLE_KEY - Authentication key (required)
#
# Environment Variables Optional:
#   PROCESS_TRANSLATIONS_URL - Full URL to the endpoint
#                              Default: https://faqbnb-staging.up.railway.app/api/admin/process-translations
#   BATCH_SIZE               - Number of jobs per invocation (default: 10)
#   VERBOSE                  - Set to 'true' for detailed output
#
# Exit Codes:
#   0 - Success (including rate limit - expected behavior)
#   1 - Configuration error (missing variables)
#   2 - Network/connectivity error
#   3 - Authentication error (401/403)
#   4 - Server error (5xx)
#
# Created: 2026-01-19
# Last Modified: 2026-01-19
# =============================================================================

set -e

# =============================================================================
# Configuration
# =============================================================================

# Default URL (staging - override for production)
URL="${PROCESS_TRANSLATIONS_URL:-https://faqbnb-staging.up.railway.app/api/admin/process-translations}"

# Authentication key
AUTH_KEY="${SUPABASE_SERVICE_ROLE_KEY}"

# Batch size
BATCH_SIZE="${BATCH_SIZE:-10}"

# Verbose mode
VERBOSE="${VERBOSE:-false}"

# Timeout in seconds
TIMEOUT="${TIMEOUT:-60}"

# =============================================================================
# Logging Functions
# =============================================================================

log_info() {
    echo "[INFO] $(date -u '+%Y-%m-%d %H:%M:%S UTC') $1"
}

log_error() {
    echo "[ERROR] $(date -u '+%Y-%m-%d %H:%M:%S UTC') $1" >&2
}

log_warn() {
    echo "[WARN] $(date -u '+%Y-%m-%d %H:%M:%S UTC') $1"
}

log_success() {
    echo "[SUCCESS] $(date -u '+%Y-%m-%d %H:%M:%S UTC') $1"
}

log_debug() {
    if [ "$VERBOSE" = "true" ]; then
        echo "[DEBUG] $(date -u '+%Y-%m-%d %H:%M:%S UTC') $1"
    fi
}

# =============================================================================
# Validation
# =============================================================================

log_info "Translation Job Processing Cron - Starting"
log_debug "URL: $URL"
log_debug "Batch Size: $BATCH_SIZE"

# Validate required variables
if [ -z "$AUTH_KEY" ]; then
    log_error "SUPABASE_SERVICE_ROLE_KEY environment variable is required"
    log_error "Set this variable before running the script"
    exit 1
fi

# Validate batch size is a number
if ! [[ "$BATCH_SIZE" =~ ^[0-9]+$ ]]; then
    log_error "BATCH_SIZE must be a positive integer, got: $BATCH_SIZE"
    exit 1
fi

# Validate batch size range
if [ "$BATCH_SIZE" -lt 1 ] || [ "$BATCH_SIZE" -gt 100 ]; then
    log_error "BATCH_SIZE must be between 1 and 100, got: $BATCH_SIZE"
    exit 1
fi

# =============================================================================
# API Call
# =============================================================================

log_info "Triggering translation job processing"
log_info "Endpoint: $URL"
log_info "Batch Size: $BATCH_SIZE"

# Make the API call and capture both response body and HTTP code
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$URL" \
    --connect-timeout 10 \
    --max-time "$TIMEOUT" \
    -H "Authorization: Bearer $AUTH_KEY" \
    -H "Content-Type: application/json" \
    -d "{\"batchSize\": $BATCH_SIZE}" 2>&1) || {
    log_error "curl command failed - network error or timeout"
    log_error "Response: $RESPONSE"
    exit 2
}

# Parse response
HTTP_CODE=$(echo "$RESPONSE" | tail -n 1)
BODY=$(echo "$RESPONSE" | head -n -1)

log_debug "HTTP Status: $HTTP_CODE"
log_debug "Response Body: $BODY"

# =============================================================================
# Response Handling
# =============================================================================

case "$HTTP_CODE" in
    200)
        # Success - parse and log statistics
        log_success "Translation jobs processed successfully"

        # Extract statistics using grep/sed (portable)
        if command -v jq &> /dev/null; then
            # Use jq if available
            PROCESSED=$(echo "$BODY" | jq -r '.data.processedCount // 0')
            SUCCESS=$(echo "$BODY" | jq -r '.data.successCount // 0')
            FAILURES=$(echo "$BODY" | jq -r '.data.failureCount // 0')
            DURATION=$(echo "$BODY" | jq -r '.data.durationMs // 0')

            log_info "Statistics: processed=$PROCESSED, success=$SUCCESS, failures=$FAILURES, duration=${DURATION}ms"
        else
            # Fallback without jq - just log raw response
            log_info "Response: $BODY"
        fi
        exit 0
        ;;

    429)
        # Rate limited - this is expected behavior, not an error
        log_warn "Rate limited - will retry on next schedule"
        log_debug "Response: $BODY"
        exit 0
        ;;

    401)
        log_error "Authentication failed (401 Unauthorized)"
        log_error "Check SUPABASE_SERVICE_ROLE_KEY is correct and not expired"
        log_debug "Response: $BODY"
        exit 3
        ;;

    403)
        log_error "Access forbidden (403 Forbidden)"
        log_error "Service role key may not have required permissions"
        log_debug "Response: $BODY"
        exit 3
        ;;

    400)
        log_error "Bad request (400)"
        log_error "Check batch size and request format"
        log_error "Response: $BODY"
        exit 1
        ;;

    5*)
        log_error "Server error (HTTP $HTTP_CODE)"
        log_error "The translation processing endpoint encountered an error"
        log_error "Response: $BODY"
        exit 4
        ;;

    *)
        log_error "Unexpected HTTP status: $HTTP_CODE"
        log_error "Response: $BODY"
        exit 4
        ;;
esac
```

#### 1.2 Make Script Executable

After creating the file, ensure it's executable:

```bash
chmod +x scripts/process-translations-cron.sh
```

#### Acceptance Criteria for Task 1
- [ ] Script file exists at `/scripts/process-translations-cron.sh`
- [ ] Script has executable permissions
- [ ] Script validates `SUPABASE_SERVICE_ROLE_KEY` is present
- [ ] Script validates `BATCH_SIZE` is within 1-100 range
- [ ] Script handles all HTTP response codes appropriately
- [ ] Script returns exit code 0 for success (including 429 rate limit)
- [ ] Script returns non-zero exit codes for errors
- [ ] Script includes comprehensive logging with timestamps
- [ ] Script supports `VERBOSE=true` for debug output

---

### Task 2: Update Environment Variables Documentation

**Story Points:** 0.5
**Priority:** High

Update `.env.example` to document the cron-specific configuration variables.

#### 2.1 Add Cron Configuration Section

**File to MODIFY:** `/.env.example`

Add the following section at the end of the file:

```bash
# =============================================================================
# Translation Job Cron Configuration (REQ-357)
# =============================================================================

# URL for the translation processing endpoint
# Used by external cron scripts or services
# Default (staging): https://faqbnb-staging.up.railway.app/api/admin/process-translations
# Production: https://your-production-domain/api/admin/process-translations
PROCESS_TRANSLATIONS_URL=https://faqbnb-staging.up.railway.app/api/admin/process-translations

# Batch size for cron invocations (optional, default: 10)
# Higher values process more jobs per invocation but take longer
# Recommended range: 10-50 depending on workload
# Maximum: 100
TRANSLATION_CRON_BATCH_SIZE=10
```

#### Acceptance Criteria for Task 2
- [ ] `.env.example` contains `PROCESS_TRANSLATIONS_URL` with description
- [ ] `.env.example` contains `TRANSLATION_CRON_BATCH_SIZE` with description
- [ ] Documentation includes staging URL as default
- [ ] Documentation explains recommended batch size range

---

### Task 3: Document Railway Dashboard Cron Configuration

**Story Points:** 1
**Priority:** Critical (primary implementation)

Create comprehensive documentation for configuring the cron job via Railway's dashboard. This is the primary scheduled job mechanism.

#### 3.1 Create Configuration Guide

**File to CREATE:** `/docs/operations/railway-cron-configuration.md`

```markdown
# Railway Cron Job Configuration for Translation Processing

**Created:** 2026-01-19
**Last Modified:** 2026-01-19
**Related:** REQ-357, REQ-356

---

## Overview

This guide documents the configuration of Railway's cron job service to automatically trigger translation job processing at regular intervals.

---

## Configuration Steps

### Step 1: Access Railway Project

1. Navigate to https://railway.app/dashboard
2. Select the FAQBNB project
3. You should see the existing service (Next.js application)

### Step 2: Create Cron Service

1. Click **"+ New"** in the project dashboard
2. Select **"Cron Job"** from the service types
3. Name the service: `translation-processor`

### Step 3: Configure Schedule

Choose a schedule based on your requirements:

| Schedule | Cron Expression | Use Case |
|----------|-----------------|----------|
| Every minute | `* * * * *` | Low latency (recommended) |
| Every 5 minutes | `*/5 * * * *` | Cost optimized |
| Every 15 minutes | `*/15 * * * *` | Very low volume |

**Recommended:** `* * * * *` (every minute) for production workloads.

> **Note:** Railway's minimum cron interval is 1 minute. For sub-minute intervals, consider using a different approach or processing larger batches.

### Step 4: Configure HTTP Request

**Method:** `POST`

**URL:**
```
https://faqbnb-staging.up.railway.app/api/admin/process-translations
```

> Replace with your production domain when deploying to production.

**Headers:**
```
Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}
Content-Type: application/json
```

**Body:**
```json
{"batchSize": 10}
```

**Timeout:** `60 seconds`

### Step 5: Configure Environment Variables

1. In the cron service settings, go to **Variables**
2. Add the following variable:
   - Name: `SUPABASE_SERVICE_ROLE_KEY`
   - Value: (copy from your main service or Supabase dashboard)

Alternatively, reference the variable from your main service if Railway supports variable sharing in your plan.

### Step 6: Enable the Service

1. Ensure all configuration is saved
2. Toggle the cron service to **Active**
3. The first invocation will occur at the next scheduled time

### Step 7: Verify Configuration

1. Wait for the first scheduled invocation
2. Check cron service logs in Railway dashboard
3. Expected log output for successful invocation:
   ```
   HTTP 200 OK
   {"success":true,"data":{"processedCount":5,"successCount":5,...}}
   ```

---

## Configuration Variations

### Low Latency Configuration (Recommended for Production)

- **Schedule:** `* * * * *` (every minute)
- **Batch Size:** `20`
- **Result:** ~20 jobs processed per minute, translations available within 1-2 minutes

### Cost Optimized Configuration

- **Schedule:** `*/5 * * * *` (every 5 minutes)
- **Batch Size:** `50`
- **Result:** ~50 jobs processed every 5 minutes, lower operational cost

### High Volume Configuration

- **Schedule:** `* * * * *` (every minute)
- **Batch Size:** `50`
- **Result:** ~50 jobs per minute maximum throughput

---

## Operational Procedures

### Starting the Cron Service

1. Navigate to Railway dashboard
2. Select the `translation-processor` cron service
3. Click **"Deploy"** or toggle **"Active"** to On

### Stopping the Cron Service

1. Navigate to Railway dashboard
2. Select the `translation-processor` cron service
3. Go to **Settings** → Toggle **"Active"** to Off

### Pausing During Maintenance

1. Stop the cron service (see above)
2. Perform maintenance
3. Re-enable the cron service after maintenance

### Adjusting Schedule

1. Navigate to cron service settings
2. Modify the cron expression
3. Save changes (takes effect immediately)

### Adjusting Batch Size

1. Navigate to cron service settings
2. Modify the request body JSON
3. Change `"batchSize": 10` to desired value (1-100)
4. Save changes

---

## Monitoring

### Checking Cron Execution History

1. Railway dashboard → Cron service → **Logs**
2. Look for invocation timestamps and HTTP status codes

### Key Metrics to Monitor

| Metric | Normal Range | Alert Threshold |
|--------|--------------|-----------------|
| HTTP Status | 200, 429 | 401, 403, 5xx |
| Processed Count | > 0 | Consistently 0 |
| Failure Count | < 10% of processed | > 50% |
| Duration | < 30 seconds | > 55 seconds |

### Alerting

Consider setting up alerts for:
- 3+ consecutive 5xx errors
- 10+ consecutive empty queues (may indicate upstream issue)
- Authentication failures (401/403)

---

## Troubleshooting

| Issue | Possible Cause | Solution |
|-------|---------------|----------|
| 401 Unauthorized | Invalid service role key | Verify SUPABASE_SERVICE_ROLE_KEY |
| 403 Forbidden | Key doesn't have permissions | Check Supabase role permissions |
| 429 Rate Limited | Too frequent calls | Reduce schedule frequency or increase batch size |
| Timeouts | Large batch + slow API | Reduce batch size to 10-20 |
| Jobs not processing | Cron not active | Verify cron service is enabled |
| Queue growing | Batch size too small | Increase batch size |
| All jobs failing | Translation API down | Check Claude/OpenAI API status |

---

## Security Considerations

1. **Service Role Key Protection**
   - Never expose the key in client-side code
   - Use Railway's secret management
   - Rotate the key periodically

2. **Network Security**
   - HTTPS only for endpoint invocations
   - Railway cron uses internal networking when possible

3. **Rate Limiting**
   - The endpoint limits to 10 requests/minute/user
   - Service role counts as one "user"
   - Don't schedule more frequently than 1/minute

---

## References

- [Railway Cron Jobs Documentation](https://docs.railway.app/reference/cron-jobs)
- REQ-356: Job Processing API Route (endpoint documentation)
- REQ-357: Set Up Railway Cron Job (this configuration)
```

#### Acceptance Criteria for Task 3
- [ ] Configuration guide created at `/docs/operations/railway-cron-configuration.md`
- [ ] Step-by-step instructions for Railway dashboard configuration
- [ ] Multiple schedule configurations documented (low latency, cost optimized)
- [ ] Operational procedures documented (start, stop, pause, adjust)
- [ ] Troubleshooting table included
- [ ] Security considerations documented

---

### Task 4: Document Alternative Scheduling Methods

**Story Points:** 0.5
**Priority:** Medium (fallback options)

Create documentation for alternative scheduling mechanisms in case Railway cron is unavailable or insufficient.

#### 4.1 Create GitHub Actions Workflow File

**File to CREATE:** `/.github/workflows/process-translations.yml`

```yaml
# =============================================================================
# Translation Job Processing - GitHub Actions Workflow
# REQ-357: Alternative scheduling mechanism
# =============================================================================
#
# This workflow provides an alternative to Railway's cron service for
# triggering translation job processing. Use this if:
# - Railway cron is unavailable
# - You need more control over scheduling logic
# - You want to use GitHub-native scheduling
#
# NOTE: GitHub Actions scheduled workflows have a minimum interval of 5 minutes
# and may experience delays during high-load periods.
#
# Created: 2026-01-19
# Last Modified: 2026-01-19
# =============================================================================

name: Process Translation Jobs

on:
  # Run every 5 minutes (GitHub Actions minimum practical interval)
  schedule:
    - cron: '*/5 * * * *'

  # Allow manual triggering for testing
  workflow_dispatch:
    inputs:
      batch_size:
        description: 'Number of jobs to process (1-100)'
        required: false
        default: '20'
      target_url:
        description: 'Target URL (leave empty for default)'
        required: false
        default: ''

# Prevent concurrent runs
concurrency:
  group: translation-processing
  cancel-in-progress: false

jobs:
  process-translations:
    name: Process Translation Queue
    runs-on: ubuntu-latest
    timeout-minutes: 5

    steps:
      - name: Determine Configuration
        id: config
        run: |
          # Use input or default values
          BATCH_SIZE="${{ github.event.inputs.batch_size || '20' }}"
          TARGET_URL="${{ github.event.inputs.target_url || secrets.PROCESS_TRANSLATIONS_URL || 'https://faqbnb-staging.up.railway.app/api/admin/process-translations' }}"

          echo "batch_size=$BATCH_SIZE" >> $GITHUB_OUTPUT
          echo "target_url=$TARGET_URL" >> $GITHUB_OUTPUT
          echo "Configuration: batch_size=$BATCH_SIZE, url=$TARGET_URL"

      - name: Trigger Translation Processing
        id: trigger
        run: |
          echo "Triggering translation job processing..."
          echo "Timestamp: $(date -u '+%Y-%m-%d %H:%M:%S UTC')"
          echo "URL: ${{ steps.config.outputs.target_url }}"
          echo "Batch Size: ${{ steps.config.outputs.batch_size }}"

          RESPONSE=$(curl -s -w "\n%{http_code}" -X POST \
            "${{ steps.config.outputs.target_url }}" \
            -H "Authorization: Bearer ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}" \
            -H "Content-Type: application/json" \
            -d '{"batchSize": ${{ steps.config.outputs.batch_size }}}' \
            --connect-timeout 10 \
            --max-time 60)

          HTTP_CODE=$(echo "$RESPONSE" | tail -n 1)
          BODY=$(echo "$RESPONSE" | head -n -1)

          echo "HTTP Status: $HTTP_CODE"
          echo "Response: $BODY"

          # Store outputs
          echo "http_code=$HTTP_CODE" >> $GITHUB_OUTPUT
          echo "response_body=$BODY" >> $GITHUB_OUTPUT

          # Determine success (200 and 429 are both acceptable)
          if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "429" ]; then
            echo "status=success" >> $GITHUB_OUTPUT
            echo "Processing completed successfully (HTTP $HTTP_CODE)"
          else
            echo "status=failure" >> $GITHUB_OUTPUT
            echo "::error::Processing failed with HTTP $HTTP_CODE"
            exit 1
          fi

      - name: Parse and Log Statistics
        if: steps.trigger.outputs.http_code == '200'
        run: |
          echo "=== Processing Statistics ==="
          echo '${{ steps.trigger.outputs.response_body }}' | jq -r '
            if .data then
              "Processed: \(.data.processedCount // 0)",
              "Success: \(.data.successCount // 0)",
              "Failures: \(.data.failureCount // 0)",
              "Duration: \(.data.durationMs // 0)ms"
            else
              "No data in response"
            end
          ' 2>/dev/null || echo "Could not parse response"

      - name: Handle Rate Limit
        if: steps.trigger.outputs.http_code == '429'
        run: |
          echo "Rate limited - this is expected behavior"
          echo "Jobs will be processed on next scheduled run"
```

#### 4.2 Document Required GitHub Secrets

Add to the configuration guide:

**Required GitHub Secrets:**

| Secret Name | Description | Where to Find |
|-------------|-------------|---------------|
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key for authentication | Supabase Dashboard > Settings > API |
| `PROCESS_TRANSLATIONS_URL` | (Optional) Override endpoint URL | Your deployment URL |

**Setting Up Secrets:**
1. Go to GitHub repository → Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Add `SUPABASE_SERVICE_ROLE_KEY` with your service role key value

#### 4.3 Add External Cron Service Documentation

Append to `/docs/operations/railway-cron-configuration.md`:

```markdown
---

## Alternative: External Cron Services

If Railway cron is unavailable, consider these alternatives:

### Option 1: GitHub Actions

See `/.github/workflows/process-translations.yml`

**Pros:**
- Free for public repositories
- Native GitHub integration
- Manual trigger via workflow_dispatch

**Cons:**
- Minimum 5-minute interval
- May have execution delays
- Requires GitHub Secrets setup

### Option 2: cron-job.org (Free)

1. Create account at https://cron-job.org
2. Create new cron job:
   - **URL:** `https://faqbnb-staging.up.railway.app/api/admin/process-translations`
   - **Method:** POST
   - **Schedule:** Every 1-5 minutes
   - **Headers:**
     - `Authorization: Bearer <YOUR_SERVICE_ROLE_KEY>`
     - `Content-Type: application/json`
   - **Body:** `{"batchSize": 10}`
3. Enable notifications for failures

**Pros:**
- Free tier available
- Sub-minute intervals possible
- Simple web UI

**Cons:**
- Third-party service dependency
- Service role key in external system

### Option 3: EasyCron

Similar to cron-job.org with additional features:
- Better monitoring
- Retry configuration
- More reliable execution

### Option 4: Self-Hosted (Advanced)

Run a cron daemon on your own infrastructure:

```bash
# Example crontab entry (every minute)
* * * * * /path/to/process-translations-cron.sh >> /var/log/translation-cron.log 2>&1
```

**Pros:**
- Full control
- No external dependencies

**Cons:**
- Requires server maintenance
- Must handle failures/monitoring yourself
```

#### Acceptance Criteria for Task 4
- [ ] GitHub Actions workflow file created at `/.github/workflows/process-translations.yml`
- [ ] Workflow supports manual trigger via workflow_dispatch
- [ ] Workflow handles success and rate limit responses
- [ ] Documentation includes GitHub Secrets setup instructions
- [ ] Alternative services (cron-job.org, EasyCron) documented
- [ ] Self-hosted option documented

---

### Task 5: Test Cron Script Locally

**Story Points:** 0.5
**Priority:** High (validation)

Test the cron script locally to ensure it works correctly before deploying.

#### 5.1 Local Testing Steps

**Test 1: Missing Environment Variable**

```bash
# Clear any existing key
unset SUPABASE_SERVICE_ROLE_KEY

# Run script - should fail with exit code 1
./scripts/process-translations-cron.sh
echo "Exit code: $?"
# Expected: Exit code 1, error about missing key
```

**Test 2: Invalid Batch Size**

```bash
export SUPABASE_SERVICE_ROLE_KEY="test-key"
export BATCH_SIZE=200

./scripts/process-translations-cron.sh
echo "Exit code: $?"
# Expected: Exit code 1, error about batch size
```

**Test 3: Successful Invocation (Staging)**

```bash
# Set real service role key
export SUPABASE_SERVICE_ROLE_KEY="your-real-service-role-key"
export BATCH_SIZE=5
export VERBOSE=true

./scripts/process-translations-cron.sh
echo "Exit code: $?"
# Expected: Exit code 0, success message with statistics
```

**Test 4: Rate Limiting**

```bash
# Run multiple times quickly
for i in {1..12}; do
  ./scripts/process-translations-cron.sh
  sleep 1
done
# Expected: Eventually get 429 rate limit, but script still exits 0
```

#### Acceptance Criteria for Task 5
- [ ] Script fails gracefully when SUPABASE_SERVICE_ROLE_KEY is missing
- [ ] Script validates batch size range correctly
- [ ] Script successfully invokes staging endpoint
- [ ] Script handles rate limiting (429) as success
- [ ] Verbose mode shows detailed output

---

### Task 6: Configure Railway Cron Service

**Story Points:** 0.5
**Priority:** Critical (production deployment)

This is a manual task performed in the Railway dashboard.

#### 6.1 Configuration Checklist

Follow the steps in `/docs/operations/railway-cron-configuration.md`:

- [ ] Logged into Railway dashboard
- [ ] Selected FAQBNB project
- [ ] Created new Cron Job service named `translation-processor`
- [ ] Set schedule to `* * * * *` (every minute)
- [ ] Configured HTTP POST request with:
  - URL: `https://faqbnb-staging.up.railway.app/api/admin/process-translations`
  - Header: `Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
  - Header: `Content-Type: application/json`
  - Body: `{"batchSize": 20}`
  - Timeout: 60 seconds
- [ ] Added `SUPABASE_SERVICE_ROLE_KEY` environment variable
- [ ] Enabled the cron service
- [ ] Verified first invocation in logs

#### Acceptance Criteria for Task 6
- [ ] Cron service created and named `translation-processor`
- [ ] Schedule configured correctly
- [ ] HTTP request configured with proper authentication
- [ ] Environment variable set securely
- [ ] Service is active and processing
- [ ] First invocation logged successfully

---

### Task 7: Verify End-to-End Functionality

**Story Points:** 0.5
**Priority:** Critical (validation)

Verify the complete cron → endpoint → job processing flow works correctly.

#### 7.1 Verification Steps

**Step 1: Create Test Translation Jobs**

```sql
-- Create test items that will generate translation jobs
-- (Or use the application to create a new item)
```

**Step 2: Monitor Job Processing**

```bash
# Check translation jobs table
# In Supabase dashboard or via SQL:
SELECT status, COUNT(*)
FROM translation_jobs
WHERE created_at > now() - interval '1 hour'
GROUP BY status;
```

**Step 3: Verify Cron Execution**

1. Go to Railway dashboard → Cron service → Logs
2. Look for successful invocations (HTTP 200)
3. Verify `processedCount > 0` in responses

**Step 4: Verify Translations Created**

```sql
-- Check that translations were actually stored
SELECT * FROM item_translations
WHERE created_at > now() - interval '1 hour'
ORDER BY created_at DESC
LIMIT 10;
```

#### Acceptance Criteria for Task 7
- [ ] Cron service is executing on schedule
- [ ] Jobs are being picked up from queue
- [ ] Translations are being stored in database
- [ ] Job status changes from 'queued' to 'completed'
- [ ] No unexpected errors in logs

---

## Testing Checklist

### Local Testing

- [ ] Cron script validates missing environment variables
- [ ] Cron script validates batch size range
- [ ] Cron script handles all HTTP status codes
- [ ] Cron script returns correct exit codes
- [ ] Verbose mode provides detailed output

### Integration Testing

```bash
# Test 1: Manual invocation via script
export SUPABASE_SERVICE_ROLE_KEY="your-key"
./scripts/process-translations-cron.sh

# Test 2: Direct API call
curl -X POST https://faqbnb-staging.up.railway.app/api/admin/process-translations \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{"batchSize": 5}'

# Test 3: Rate limit test (run 11+ times in 1 minute)
for i in {1..12}; do
  curl -s -o /dev/null -w "%{http_code}\n" -X POST \
    https://faqbnb-staging.up.railway.app/api/admin/process-translations \
    -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
    -H "Content-Type: application/json" \
    -d '{"batchSize": 1}'
  sleep 2
done
# Should see 429 after 10 requests
```

### Production Readiness

- [ ] Railway cron service is active
- [ ] Environment variables are set correctly
- [ ] Logs show successful invocations
- [ ] Jobs are being processed automatically
- [ ] Translations appear in database
- [ ] No authentication errors
- [ ] No unexpected 5xx errors

---

## Acceptance Criteria Summary

From REQ-357 requirements document:

- [ ] Scheduled job configuration is documented in project documentation
- [ ] Configuration specifies job invocation interval (recommended: 30 seconds for low latency, 5 minutes for cost savings)
- [ ] Scheduled job authenticates using service role credentials stored in environment variables
- [ ] Scheduled job invokes the translation job processing API endpoint via HTTP POST request
- [ ] Job includes appropriate authentication headers or API keys for service role access
- [ ] Job passes configured batch size parameter to processing endpoint (recommended: 10-20 jobs per invocation)
- [ ] Scheduled job handles HTTP response codes appropriately (logs success, retries on transient failures, alerts on persistent failures)
- [ ] Configuration supports adjustment of invocation interval without code deployment
- [ ] Alternative scheduling mechanism is documented if primary scheduler becomes unavailable
- [ ] Documentation includes instructions for enabling, disabling, and monitoring the scheduled job
- [ ] Documentation includes cost-benefit analysis comparing different scheduling intervals
- [ ] Scheduled job respects maximum processing capacity to prevent queue overload
- [ ] Job execution logs include timestamp, batch size, and processing outcome for operational monitoring
- [ ] Alert mechanism notifies operators when scheduled job fails consecutively more than 3 times
- [ ] Configuration allows temporary pause of automated processing during maintenance windows

---

## Files Summary

### Files to CREATE

| File | Purpose |
|------|---------|
| `/scripts/process-translations-cron.sh` | Shell script for cron invocation |
| `/docs/operations/railway-cron-configuration.md` | Railway cron configuration guide |
| `/.github/workflows/process-translations.yml` | GitHub Actions alternative |

### Files to MODIFY

| File | Changes |
|------|---------|
| `/.env.example` | Add cron-specific environment variables |

### Files to READ (Dependencies)

| File | Purpose |
|------|---------|
| `/src/app/api/admin/process-translations/route.ts` | Endpoint being invoked |
| `/railway.json` | Existing Railway configuration |

### External Configuration (Railway Dashboard)

| Configuration | Purpose |
|---------------|---------|
| Cron Service `translation-processor` | Scheduled job invocation |
| Environment Variable `SUPABASE_SERVICE_ROLE_KEY` | Authentication for cron |

---

## Risk Considerations

1. **Service Role Key Exposure:** Never log or expose the service role key. Store only in environment variables or secret management.

2. **Rate Limiting:** The endpoint has a 10 request/minute limit. Don't schedule cron more frequently than once per minute.

3. **Timeout Issues:** Large batch sizes may cause timeouts. Start with batch size 10-20 and adjust based on performance.

4. **Railway Cron Reliability:** Railway cron may occasionally miss scheduled runs. Consider monitoring and alerting.

5. **Cost Considerations:** Each cron invocation counts toward Railway usage. Balance frequency vs. cost.

---

## Downstream Dependencies

- **REQ-358 (Task 5.3):** Job Monitoring Endpoint - will provide visibility into processing statistics
- **Epic 4:** Guest Experience - depends on translations being available

---

*Detailed task breakdown generated for FAQBNB Localization Epic 3 - Phase 5: Job Processing Trigger Setup (Task 5.2)*
