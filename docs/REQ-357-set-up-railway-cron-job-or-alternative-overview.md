# REQ-357: Set Up Railway Cron Job (or Alternative) for Translation Job Processing - Implementation Overview

**Generated:** 2026-01-19 21:00:00 UTC
**Last Modified:** 2026-01-19 21:00:00 UTC
**Request Reference:** REQ-357 in docs/gen_requests_epic3.md
**Implementation Plan Reference:** Plan-111-L10N-Epic3-Dynamic-Content-Translation.md (Phase 5, Task 5.2)
**Epic:** Localization Epic 3 - Dynamic Content Translation
**Type:** NEW FEATURE (Infrastructure Configuration)
**Size:** M (Medium)

---

## Summary

Configure an automated scheduled job mechanism to invoke the translation job processing endpoint (`POST /api/admin/process-translations`) at regular intervals. This ensures content translations are processed continuously without manual intervention. The primary implementation uses Railway's built-in cron job service, with documented alternatives for fallback scenarios.

---

## Technical Context

### Existing Stack

| Technology | Details |
|------------|---------|
| **Deployment Platform** | Railway |
| **Framework** | Next.js 15.5.9 with App Router |
| **Database** | Supabase (PostgreSQL with RLS) |
| **Job Processing Endpoint** | `POST /api/admin/process-translations` (REQ-356) |
| **Authentication** | Service role key via `SUPABASE_SERVICE_ROLE_KEY` |

### Existing Dependencies

| Component | Location | Purpose |
|-----------|----------|---------|
| `process-translations` endpoint | `/src/app/api/admin/process-translations/route.ts` | Job processing API (REQ-356) |
| Railway configuration | `/railway.json` | Deployment configuration |
| Service role key | `SUPABASE_SERVICE_ROLE_KEY` env var | Authentication for cron invocations |
| Job processor | `/src/lib/job-queue/job-processor.ts` | Background job processing logic |

### Current railway.json Configuration

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "numReplicas": 1,
    "sleepApplication": false,
    "restartPolicyType": "ON_FAILURE"
  }
}
```

### Environment Variables (from .env.example)

```bash
# Service role key for cron authentication
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Job processor configuration
TRANSLATION_JOB_INTERVAL_MS=30000          # 30 seconds
TRANSLATION_JOB_BATCH_SIZE=10              # Default batch size
TRANSLATION_JOB_MAX_ERRORS=5               # Max consecutive errors
TRANSLATION_JOB_ERROR_PAUSE_MS=300000      # 5 minute pause
```

---

## Implementation Approach

### Railway Cron Job Configuration

Railway supports cron jobs as separate services within a project. The recommended approach creates a dedicated cron service that invokes the translation processing endpoint.

### Configuration Options

#### Option A: Low Latency (Recommended for Production)
- **Interval:** Every 30 seconds (`*/30 * * * * *` - note: Railway may require minute granularity)
- **Use Case:** Near-real-time translation processing
- **Trade-off:** Higher API invocation costs, faster translation availability

#### Option B: Cost Optimized
- **Interval:** Every 5 minutes (`*/5 * * * *`)
- **Use Case:** Budget-conscious deployments
- **Trade-off:** Lower costs, 5-minute maximum delay for translations

#### Option C: Balanced
- **Interval:** Every 1 minute (`* * * * *`)
- **Use Case:** Balance between latency and cost
- **Trade-off:** Moderate costs, reasonable translation latency

### Cron Service Architecture

```
Railway Project
├── Main Service (Next.js App)
│   ├── Handles web traffic
│   └── Exposes /api/admin/process-translations
│
└── Cron Service (Translation Processor)
    ├── Runs on schedule
    ├── Calls process-translations endpoint
    └── Uses service role key for auth
```

---

## Ordered Task List

### Task 1: Create Railway Cron Service Configuration

Create a new service in Railway specifically for the cron job.

**Implementation Steps:**
1. In Railway dashboard, navigate to project
2. Click "New Service" → "Cron Job"
3. Configure the cron expression based on chosen interval
4. Set up the HTTP request configuration

**Cron Service Settings:**
```yaml
# Railway Cron Service Configuration
name: translation-job-processor
schedule: "* * * * *"  # Every minute (adjust as needed)
command_type: http
http_request:
  method: POST
  url: "${RAILWAY_PUBLIC_DOMAIN}/api/admin/process-translations"
  headers:
    Authorization: "Bearer ${SUPABASE_SERVICE_ROLE_KEY}"
    Content-Type: "application/json"
  body: '{"batchSize": 10}'
timeout: 60000  # 60 seconds
```

### Task 2: Add Environment Variables to Cron Service

Ensure the cron service has access to required environment variables:

**Required Variables:**
| Variable | Purpose |
|----------|---------|
| `SUPABASE_SERVICE_ROLE_KEY` | Authentication for process-translations endpoint |
| `RAILWAY_PUBLIC_DOMAIN` | Target URL for the main application |

### Task 3: Create Cron Script for Alternative Implementation

For environments where Railway's native cron service is unavailable or insufficient, create a shell script that can be run via external cron services.

**File:** `/scripts/process-translations-cron.sh`

```bash
#!/bin/bash
# Translation Job Processing Cron Script
# REQ-357: Automated job processing trigger
#
# Usage:
#   ./scripts/process-translations-cron.sh
#
# Environment Variables Required:
#   PROCESS_TRANSLATIONS_URL - Full URL to the endpoint
#   SUPABASE_SERVICE_ROLE_KEY - Authentication key
#   BATCH_SIZE (optional) - Number of jobs per invocation (default: 10)

set -e

# Configuration
URL="${PROCESS_TRANSLATIONS_URL:-https://faqbnb-staging.up.railway.app/api/admin/process-translations}"
AUTH_KEY="${SUPABASE_SERVICE_ROLE_KEY}"
BATCH_SIZE="${BATCH_SIZE:-10}"

# Validate required variables
if [ -z "$AUTH_KEY" ]; then
    echo "[ERROR] SUPABASE_SERVICE_ROLE_KEY is required"
    exit 1
fi

# Make the API call
echo "[INFO] Triggering translation job processing at $(date -u '+%Y-%m-%d %H:%M:%S UTC')"
echo "[INFO] URL: $URL"
echo "[INFO] Batch Size: $BATCH_SIZE"

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$URL" \
    -H "Authorization: Bearer $AUTH_KEY" \
    -H "Content-Type: application/json" \
    -d "{\"batchSize\": $BATCH_SIZE}")

# Parse response
HTTP_CODE=$(echo "$RESPONSE" | tail -n 1)
BODY=$(echo "$RESPONSE" | head -n -1)

echo "[INFO] HTTP Status: $HTTP_CODE"
echo "[INFO] Response: $BODY"

# Check for success
if [ "$HTTP_CODE" -eq 200 ]; then
    echo "[SUCCESS] Translation jobs processed successfully"
    exit 0
elif [ "$HTTP_CODE" -eq 429 ]; then
    echo "[WARN] Rate limited - will retry on next schedule"
    exit 0
else
    echo "[ERROR] Failed with HTTP $HTTP_CODE"
    exit 1
fi
```

### Task 4: Document Railway Dashboard Configuration Steps

Create step-by-step instructions for configuring the cron job in Railway's dashboard.

**Configuration Steps:**

1. **Access Railway Project:**
   - Navigate to https://railway.app/dashboard
   - Select the FAQBNB project

2. **Create Cron Service:**
   - Click "New" → "Cron Job"
   - Name: `translation-processor`

3. **Configure Schedule:**
   - For low latency: `* * * * *` (every minute, Railway's minimum)
   - For cost savings: `*/5 * * * *` (every 5 minutes)

4. **Configure HTTP Request:**
   - Method: `POST`
   - URL: `https://<your-domain>/api/admin/process-translations`
   - Add Header: `Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
   - Add Header: `Content-Type: application/json`
   - Body: `{"batchSize": 10}`

5. **Configure Environment Variables:**
   - Add `SUPABASE_SERVICE_ROLE_KEY` with the service role key value
   - Reference from main service or add directly

6. **Set Timeout:**
   - Timeout: 60 seconds (to allow batch processing)

7. **Enable Service:**
   - Toggle service to "Active"
   - Verify first invocation in logs

### Task 5: Add Environment Variables Documentation

Update `.env.example` with cron-specific configuration:

**Addition to .env.example:**
```bash
# =============================================================================
# Translation Job Cron Configuration (REQ-357)
# =============================================================================

# URL for the translation processing endpoint (used by external cron scripts)
# Default: https://faqbnb-staging.up.railway.app/api/admin/process-translations
PROCESS_TRANSLATIONS_URL=https://your-domain/api/admin/process-translations

# Batch size for cron invocations (optional, default: 10)
# Higher values process more jobs per invocation but take longer
TRANSLATION_CRON_BATCH_SIZE=10
```

### Task 6: Create Monitoring Documentation

Document how to monitor cron job execution and troubleshoot issues.

**Monitoring Checklist:**
1. Railway Dashboard → Cron Service → Logs
2. Check HTTP response codes (200 = success, 429 = rate limited)
3. Monitor translation job queue depth via `/api/admin/translation-jobs` (REQ-358)
4. Set up alerts for consecutive failures

### Task 7: Document Alternative Scheduling Methods

For scenarios where Railway cron is insufficient:

**Alternative 1: GitHub Actions Scheduled Workflow**
```yaml
# .github/workflows/process-translations.yml
name: Process Translation Jobs
on:
  schedule:
    - cron: '* * * * *'  # Every minute
  workflow_dispatch:  # Manual trigger

jobs:
  process:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Translation Processing
        run: |
          curl -X POST "${{ secrets.PROCESS_TRANSLATIONS_URL }}" \
            -H "Authorization: Bearer ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}" \
            -H "Content-Type: application/json" \
            -d '{"batchSize": 10}'
```

**Alternative 2: External Cron Service (cron-job.org, EasyCron)**
- URL: `POST https://your-domain/api/admin/process-translations`
- Headers: `Authorization: Bearer <service_role_key>`, `Content-Type: application/json`
- Body: `{"batchSize": 10}`
- Schedule: Every 1-5 minutes

**Alternative 3: Vercel Cron (if migrating to Vercel)**
```json
// vercel.json
{
  "crons": [{
    "path": "/api/admin/process-translations",
    "schedule": "* * * * *"
  }]
}
```

---

## Authorized Files and Functions for Modification

### Files to CREATE

| File Path | Purpose |
|-----------|---------|
| `/scripts/process-translations-cron.sh` | Shell script for external cron execution |
| `/docs/cron-configuration-guide.md` | Detailed configuration documentation (optional) |

### Files to MODIFY

| File Path | Changes |
|-----------|---------|
| `/.env.example` | Add cron-specific environment variables |
| `/railway.json` | (Optional) Add cron service reference if using Railway's config-as-code |

### Files to READ ONLY (dependencies)

| File Path | Purpose |
|-----------|---------|
| `/src/app/api/admin/process-translations/route.ts` | Target endpoint (REQ-356) |
| `/src/lib/job-queue/job-processor.ts` | Job processing implementation |

### External Configuration (Railway Dashboard)

| Configuration | Purpose |
|---------------|---------|
| Cron Service | Scheduled job invocation |
| Environment Variables | Service role key, URLs |
| Service Logs | Monitoring and debugging |

---

## Integration Contract

### Endpoint Invocation

The cron job invokes the process-translations endpoint with the following contract:

**Request:**
```http
POST /api/admin/process-translations HTTP/1.1
Host: faqbnb-staging.up.railway.app
Authorization: Bearer <SUPABASE_SERVICE_ROLE_KEY>
Content-Type: application/json

{"batchSize": 10}
```

**Expected Success Response (200):**
```json
{
  "success": true,
  "data": {
    "processedCount": 10,
    "successCount": 9,
    "failureCount": 1,
    "durationMs": 5432,
    "processedJobIds": ["job-1", "job-2", "..."]
  }
}
```

**Expected Rate Limit Response (429):**
```json
{
  "success": false,
  "error": "Rate limit exceeded. Maximum 10 requests per minute.",
  "code": "RATE_LIMITED"
}
```

### Rate Limit Considerations

The process-translations endpoint has a rate limit of 10 requests per minute per user. With service role authentication, all cron invocations share the same identity.

**Recommended Configuration:**
- Schedule: Every 1 minute (maximum sustainable rate)
- Batch Size: 10-20 jobs per invocation
- This processes 10-20 jobs per minute, suitable for most workloads

**High Volume Configuration:**
- Increase batch size to 50-100 to process more jobs within rate limit
- Monitor for timeout issues with larger batches

---

## Acceptance Criteria Checklist

- [ ] Scheduled job configuration is documented in project documentation
- [ ] Configuration specifies job invocation interval (recommended: 30 seconds for low latency, 5 minutes for cost savings)
- [ ] Scheduled job authenticates using service role credentials stored in environment variables
- [ ] Scheduled job invokes the translation job processing API endpoint via HTTP POST request
- [ ] Job includes appropriate authentication headers or API keys for service role access
- [ ] Job passes configured batch size parameter to processing endpoint (recommended: 10-20 jobs per invocation)
- [ ] Scheduled job handles HTTP response codes appropriately (logs success, retries on transient failures, alerts on persistent failures)
- [ ] Configuration supports adjustment of invocation interval without code deployment
- [ ] Alternative scheduling mechanism is documented if primary scheduler becomes unavailable

---

## Error Handling Matrix

| Scenario | Cron Behavior | Logging |
|----------|---------------|---------|
| 200 OK | Success, continue schedule | Log job counts |
| 429 Rate Limited | Success (expected), continue | Log warning |
| 401 Unauthorized | Failure, alert needed | Log error, check service key |
| 500 Server Error | Failure, auto-retry on next schedule | Log error |
| Network Timeout | Failure, auto-retry on next schedule | Log error |
| Endpoint Unreachable | Failure, alert needed | Log error, check deployment |

---

## Testing Notes

### Manual Testing

```bash
# Test cron script locally
export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
export PROCESS_TRANSLATIONS_URL="https://faqbnb-staging.up.railway.app/api/admin/process-translations"
./scripts/process-translations-cron.sh

# Test with custom batch size
export BATCH_SIZE=5
./scripts/process-translations-cron.sh

# Verify cron service is running (Railway)
# Check Railway Dashboard → Cron Service → Logs
# Look for invocations at expected intervals
```

### Verification Steps

1. **Initial Setup Verification:**
   - Create test translation jobs in database
   - Enable cron service
   - Verify jobs are processed within expected interval

2. **Interval Verification:**
   - Check Railway cron service logs
   - Verify invocations occur at configured interval
   - Confirm no duplicate processing

3. **Error Recovery Verification:**
   - Temporarily break endpoint (simulate error)
   - Verify cron continues attempting
   - Restore endpoint, verify recovery

---

## Security Considerations

1. **Service Role Key Protection:**
   - Store service role key only in Railway environment variables
   - Never commit to source control
   - Rotate key periodically

2. **Network Security:**
   - Use HTTPS for all endpoint invocations
   - Railway cron service uses internal network when possible

3. **Rate Limiting:**
   - Endpoint rate limits prevent runaway cron from overwhelming system
   - 10 requests/minute limit provides protection

4. **Audit Trail:**
   - All invocations logged with timestamps
   - Railway provides cron execution history
   - Endpoint logs processing statistics

---

## Estimated Effort

| Task | Estimate |
|------|----------|
| Configure Railway cron service | 15 min |
| Create cron shell script | 20 min |
| Update .env.example | 5 min |
| Document configuration steps | 30 min |
| Document alternative methods | 20 min |
| Testing and verification | 30 min |
| **Total** | **~2 hours** |

---

## Operational Runbook

### Starting the Cron Service

1. Navigate to Railway dashboard
2. Select the `translation-processor` cron service
3. Click "Deploy" to activate

### Stopping the Cron Service

1. Navigate to Railway dashboard
2. Select the `translation-processor` cron service
3. Click "Settings" → Toggle "Active" to off

### Adjusting Interval

1. Navigate to Railway dashboard
2. Select the `translation-processor` cron service
3. Click "Settings" → Modify schedule
4. Save changes (takes effect immediately)

### Adjusting Batch Size

1. Navigate to Railway dashboard
2. Select the `translation-processor` cron service
3. Click "Settings" → Modify request body
4. Change `{"batchSize": 10}` to desired value
5. Save changes

### Troubleshooting

| Issue | Solution |
|-------|----------|
| Jobs not processing | Check cron service is active, verify endpoint URL |
| 401 errors in logs | Verify SUPABASE_SERVICE_ROLE_KEY is set correctly |
| 429 errors frequently | Reduce cron frequency or increase batch size |
| Timeouts | Reduce batch size, check endpoint performance |
| Queue growing despite cron | Increase batch size or cron frequency |

---

## Dependencies

### Required Before Implementation

- [x] REQ-356: Job Processing API Route (endpoint to invoke)
- [x] REQ-243: Translation Job Queue Module (queue infrastructure)
- [x] REQ-244: Job Processor (processing logic)

### Downstream Dependencies

- REQ-358 (Task 5.3): Job Monitoring Endpoint (for operational visibility)
- Epic 4: Guest Experience (consumes translated content)

---

## References

- Implementation Plan: `/docs/prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md` (Phase 5, Task 5.2)
- Request Document: `/docs/gen_requests_epic3.md` (REQ-357)
- Process Translations Endpoint: REQ-356 overview document
- [Railway Cron Jobs Documentation](https://docs.railway.app/reference/cron-jobs)
- [GitHub Actions Scheduled Workflows](https://docs.github.com/en/actions/using-workflows/events-that-trigger-workflows#schedule)
- Staging URL: https://faqbnb-staging.up.railway.app

---

*Implementation overview generated for FAQBNB Localization Epic 3 - Phase 5: Job Processing Trigger Setup (Task 5.2)*
