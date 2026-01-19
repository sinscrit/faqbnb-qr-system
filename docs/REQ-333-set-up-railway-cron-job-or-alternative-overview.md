# REQ-333: Configure Automated Translation Job Processing Trigger - Implementation Overview

**Document Created:** 2026-01-18
**Document Last Modified:** 2026-01-18
**Request Type:** NEW FEATURE
**Size:** M
**Phase:** 5 - Job Processing Trigger Setup
**Task ID:** 5.2
**Epic:** L10N Epic 3 - Dynamic Content Translation

---

## 1. Summary

Establish an automated scheduled trigger mechanism that periodically invokes the translation job processing endpoint (`POST /api/admin/process-translations`) to continuously process queued translation jobs without manual intervention. The system supports configurable intervals for balancing translation latency against infrastructure costs.

---

## 2. Current Behavior

- Translation jobs are queued automatically when content is created or updated
- The translation job processing endpoint exists (REQ-332) but requires manual invocation by administrators
- No automated mechanism exists to continuously process queued jobs
- Queued translation jobs accumulate indefinitely until an administrator manually triggers processing
- Significant delays occur between when content is created and when translations become available to international guests

---

## 3. Expected Behavior

When the automated trigger is configured:

1. **Scheduled Execution**: A cron job executes at regular intervals
2. **Endpoint Invocation**: Makes authenticated POST request to `/api/admin/process-translations`
3. **Configurable Intervals**:
   - **Low-latency mode**: Every 30 seconds (or 1 minute for platforms without second-level granularity)
   - **Cost-optimized mode**: Every 5 minutes
4. **Authentication**: Includes service role key for automated access
5. **Failure Handling**: Transient failures are logged; next scheduled execution provides automatic retry
6. **Logging**: Execution outcomes are accessible for monitoring and troubleshooting

---

## 4. Technical Approach

### 4.1 Scheduling Platform Options

| Platform | Pros | Cons | Granularity |
|----------|------|------|-------------|
| **Railway Cron Jobs** | Native integration, no external service | Limited docs, may need CLI/dashboard config | 1 minute minimum |
| **Vercel Cron** | Built-in for Vercel deployments | Requires Vercel deployment | 1 minute minimum |
| **GitHub Actions** | Version-controlled, free tier available | External service, 5-minute minimum | 5 minute minimum |
| **Upstash QStash** | Serverless, reliable, sub-minute support | External service, additional cost | Seconds |
| **Custom Worker (Railway)** | Full control, native integration | Additional service to maintain | Any interval |

**Recommended Approach**: Railway Cron Job for native integration with existing deployment infrastructure.

### 4.2 Railway Cron Job Configuration

Railway supports cron jobs via the `railway.json` configuration or Railway CLI/dashboard. The configuration approach:

#### Option A: Railway Service with Cron (Recommended)

Create a dedicated cron service in Railway that runs on a schedule:

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "numReplicas": 1,
    "sleepApplication": false,
    "restartPolicyType": "ON_FAILURE",
    "cronSchedule": "*/1 * * * *"
  }
}
```

#### Option B: External Cron Service (Upstash QStash)

For sub-minute scheduling, use Upstash QStash:

```typescript
// QStash endpoint setup
const qstash = new Client({ token: process.env.QSTASH_TOKEN });

await qstash.schedules.create({
  destination: "https://faqbnb-staging.up.railway.app/api/admin/process-translations",
  cron: "*/30 * * * * *", // Every 30 seconds
  headers: {
    "Authorization": `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
    "Content-Type": "application/json"
  },
  body: JSON.stringify({ batchSize: 10 })
});
```

#### Option C: Dedicated Worker Script

Create a standalone worker script that runs continuously:

```typescript
// /scripts/translation-cron-worker.ts
async function runWorker() {
  const INTERVAL_MS = 30000; // 30 seconds

  while (true) {
    try {
      const response = await fetch(
        `${process.env.APP_URL}/api/admin/process-translations`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ batchSize: 10 })
        }
      );

      const result = await response.json();
      console.log(`[${new Date().toISOString()}] Processed: ${result.processedCount}, Success: ${result.successCount}, Failed: ${result.failureCount}`);
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Error: ${error.message}`);
    }

    await new Promise(resolve => setTimeout(resolve, INTERVAL_MS));
  }
}

runWorker();
```

### 4.3 Environment Variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Authentication for cron endpoint |
| `CRON_SECRET` | Optional | Additional security layer for cron validation |
| `APP_URL` | Conditional | Application URL for worker scripts (auto-set by Railway) |
| `TRANSLATION_CRON_INTERVAL` | No | Configurable interval (default: 30s or 60s) |
| `TRANSLATION_BATCH_SIZE` | No | Batch size per execution (default: 10) |

### 4.4 Request Configuration

```http
POST /api/admin/process-translations
Authorization: Bearer <SUPABASE_SERVICE_ROLE_KEY>
Content-Type: application/json

{
  "batchSize": 10
}
```

**Timeout**: 30 seconds maximum per execution to prevent overlapping jobs.

### 4.5 Interval Configurations

| Mode | Interval | Cron Expression | Use Case |
|------|----------|-----------------|----------|
| **Low-latency** | 30 seconds | `*/30 * * * * *` (if supported) | Real-time translation delivery |
| **Standard** | 1 minute | `*/1 * * * *` | Balanced latency/cost |
| **Cost-optimized** | 5 minutes | `*/5 * * * *` | Budget-conscious operation |

---

## 5. Implementation Tasks

### Task 5.1: Document Cron Configuration Options
**Effort:** XS

Create documentation for each scheduling platform option:
- Railway native cron setup instructions
- Alternative platform configuration guides
- Pros/cons comparison for decision-making

### Task 5.2: Configure Railway Cron Job
**Effort:** S

Set up cron job in Railway:
- Update `railway.json` with cron schedule (if supported)
- Configure via Railway dashboard/CLI
- Set appropriate interval (start with 1 minute)
- Add service role key as environment variable

### Task 5.3: Create Worker Script (Alternative)
**File:** `/scripts/translation-cron-worker.ts`
**Effort:** S

Implement standalone worker script:
- Continuous loop with configurable interval
- HTTP request to processing endpoint
- Error handling and logging
- Graceful shutdown support

### Task 5.4: Add Environment Variable Documentation
**Effort:** XS

Update `.env.example` with new variables:
```bash
# Translation Cron Configuration
TRANSLATION_CRON_INTERVAL=60000  # Milliseconds (default: 60s)
TRANSLATION_BATCH_SIZE=10        # Jobs per execution
CRON_SECRET=your-cron-secret     # Optional: Additional security
```

### Task 5.5: Create Deployment Documentation
**File:** `/docs/CRON_SETUP.md`
**Effort:** S

Document complete setup process:
- Railway cron configuration steps
- Environment variable setup
- Switching between low-latency and cost-optimized modes
- Monitoring and troubleshooting guide

### Task 5.6: Implement Cron Endpoint Security Enhancement
**Effort:** S

Optional security enhancement for cron-specific validation:
- Add `X-Cron-Secret` header check
- Implement request source validation
- Log cron execution attempts

### Task 5.7: Configure Alerting for Failures
**Effort:** S

Set up monitoring and alerts:
- Track consecutive failures
- Configure alerting thresholds
- Document escalation procedures

### Task 5.8: Test Cron Job Execution
**Effort:** M

Validate cron job functionality:
- Verify scheduled execution timing
- Confirm authentication works
- Test failure recovery
- Measure job processing latency

---

## 6. Dependencies

### 6.1 Required Dependencies

| Dependency | REQ | Status | Notes |
|------------|-----|--------|-------|
| Job Processing API Route | REQ-332 | Pending | Endpoint that cron will invoke |
| Service Role Authentication | Epic 1 | Exists | Auth mechanism for automated access |

### 6.2 External Dependencies

| Dependency | Purpose | Status |
|------------|---------|--------|
| Railway Platform | Cron job hosting | Available |
| Supabase | Service role key | Configured |

### 6.3 Existing Infrastructure

| Component | Location | Status |
|-----------|----------|--------|
| Railway Configuration | `/railway.json` | Exists (needs update) |
| Deployment Checklist | `/RAILWAY_DEPLOYMENT_CHECKLIST.md` | Exists (needs update) |
| Environment Variables | `.env.example` | Exists (needs update) |
| Service Role Key | Environment | Configured |

---

## 7. Authorized Files and Functions for Modification

### 7.1 Files to Create

| File Path | Purpose |
|-----------|---------|
| `/scripts/translation-cron-worker.ts` | Standalone worker script (Option C) |
| `/docs/CRON_SETUP.md` | Comprehensive cron setup documentation |

### 7.2 Files to Modify

| File Path | Modification | Reason |
|-----------|--------------|--------|
| `/railway.json` | Add cron schedule configuration | Enable Railway native cron |
| `/.env.example` | Add cron-related environment variables | Document required configuration |
| `/RAILWAY_DEPLOYMENT_CHECKLIST.md` | Add cron setup section | Complete deployment documentation |

### 7.3 Configuration Changes

| Configuration | Current | Proposed |
|---------------|---------|----------|
| `railway.json` cronSchedule | Not configured | `*/1 * * * *` (1 minute) |
| Environment Variables | Service role key only | Add TRANSLATION_CRON_INTERVAL, TRANSLATION_BATCH_SIZE |

---

## 8. Railway Configuration Details

### 8.1 Current railway.json

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

### 8.2 Proposed railway.json (Option A - Cron Service)

Note: Railway cron jobs may require a separate service configuration. Check Railway documentation for current cron job support.

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

Railway cron jobs are typically configured via:
1. **Railway Dashboard**: Project Settings > Cron Jobs
2. **Railway CLI**: `railway cron create --schedule "*/1 * * * *" --command "curl -X POST ..."`
3. **Separate Cron Service**: Deploy a dedicated cron worker service

### 8.3 Railway Cron Job Dashboard Configuration

Steps to configure via Railway Dashboard:
1. Navigate to Railway project dashboard
2. Go to Settings > Cron Jobs (if available)
3. Add new cron job:
   - **Schedule**: `*/1 * * * *` (every minute)
   - **Command/URL**: POST to `/api/admin/process-translations`
   - **Headers**: Authorization with service role key
   - **Timeout**: 30 seconds

---

## 9. Alternative Platforms

### 9.1 Upstash QStash (Recommended Alternative)

**Setup Steps:**
1. Create Upstash account at https://upstash.com
2. Create QStash instance
3. Configure scheduled message:

```bash
curl -X POST "https://qstash.upstash.io/v2/schedules" \
  -H "Authorization: Bearer <QSTASH_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "destination": "https://faqbnb-staging.up.railway.app/api/admin/process-translations",
    "cron": "*/1 * * * *",
    "headers": {
      "Authorization": "Bearer <SUPABASE_SERVICE_ROLE_KEY>",
      "Content-Type": "application/json"
    },
    "body": "{\"batchSize\": 10}"
  }'
```

**Environment Variables for QStash:**
```bash
QSTASH_TOKEN=your-qstash-token
QSTASH_CURRENT_SIGNING_KEY=your-signing-key
QSTASH_NEXT_SIGNING_KEY=your-next-signing-key
```

### 9.2 GitHub Actions Scheduled Workflow

**File:** `.github/workflows/translation-cron.yml`

```yaml
name: Translation Job Processing Cron

on:
  schedule:
    - cron: '*/5 * * * *'  # Every 5 minutes (minimum for GitHub Actions)
  workflow_dispatch:  # Allow manual trigger

jobs:
  process-translations:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Translation Processing
        run: |
          curl -X POST "${{ secrets.APP_URL }}/api/admin/process-translations" \
            -H "Authorization: Bearer ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}" \
            -H "Content-Type: application/json" \
            -d '{"batchSize": 10}' \
            --max-time 30
```

**GitHub Secrets Required:**
- `APP_URL`: Application URL (e.g., `https://faqbnb-staging.up.railway.app`)
- `SUPABASE_SERVICE_ROLE_KEY`: Service role key for authentication

---

## 10. Security Considerations

1. **Authentication**: Service role key provides admin-level access
2. **Key Rotation**: Plan for periodic service role key rotation
3. **Request Validation**: Optional CRON_SECRET header for additional security
4. **Rate Limiting**: Processing endpoint already has rate limiting (10 req/min)
5. **Timeout**: 30-second timeout prevents hung executions
6. **Overlap Prevention**: Short execution window prevents concurrent crons
7. **Audit Logging**: All cron executions logged for monitoring

---

## 11. Monitoring and Alerting

### 11.1 Metrics to Track

| Metric | Description | Threshold |
|--------|-------------|-----------|
| `cron_execution_count` | Total cron executions | - |
| `cron_success_rate` | Percentage of successful executions | > 95% |
| `cron_duration_ms` | Execution duration | < 30000ms |
| `jobs_processed_per_execution` | Jobs processed per cron run | > 0 if queue has jobs |
| `consecutive_failures` | Consecutive failed executions | < 3 |

### 11.2 Alerting Rules

| Condition | Severity | Action |
|-----------|----------|--------|
| 3+ consecutive failures | High | Notify team, investigate |
| Execution duration > 25s | Warning | Review batch size |
| No executions in 10 minutes | Critical | Check cron configuration |
| 0 jobs processed when queue has jobs | Warning | Check processor logic |

### 11.3 Log Format

```
[2026-01-18T12:00:00.000Z] CRON Translation processing started
[2026-01-18T12:00:01.234Z] CRON Processed: 10, Success: 9, Failed: 1, Duration: 1234ms
[2026-01-18T12:00:01.234Z] CRON Translation processing completed
```

---

## 12. Testing Strategy

### 12.1 Manual Testing

1. **Direct Endpoint Test**: Manually call `/api/admin/process-translations` with service role key
2. **Cron Simulation**: Use Railway CLI or dashboard to manually trigger cron
3. **Failure Scenarios**: Test with invalid credentials, network errors

### 12.2 Integration Testing

1. Create content items that queue translation jobs
2. Verify cron triggers processing
3. Confirm translations appear in database
4. Validate timing (within configured interval + processing time)

### 12.3 Load Testing

1. Queue 100+ translation jobs
2. Run cron continuously
3. Measure queue drain rate
4. Verify no memory leaks or resource exhaustion

---

## 13. Rollback Plan

If cron job causes issues:

1. **Immediate**: Disable cron via Railway dashboard
2. **Investigation**: Check logs for error patterns
3. **Fix**: Address root cause (auth, endpoint, timeout)
4. **Re-enable**: Gradually re-enable with monitoring

---

## 14. Acceptance Criteria Mapping

| Acceptance Criteria | Implementation Task | Status |
|---------------------|---------------------|--------|
| Cron job configuration established | Task 5.2 | Pending |
| Execute every 30 seconds (or 1 minute) for low-latency | Task 5.2 | Pending |
| Cost-optimized configuration documented (5 minutes) | Task 5.1, 5.5 | Pending |
| POST request to process-translations endpoint | Task 5.2 | Pending |
| Authorization header with service role key | Task 5.2 | Pending |
| Request body includes batchSize parameter | Task 5.2 | Pending |
| 30-second timeout configured | Task 5.2 | Pending |
| Execution logs accessible | Task 5.7 | Pending |
| Transient failures logged, don't halt future executions | Task 5.2 | Pending |
| Configuration documented | Task 5.5 | Pending |
| Environment variables for credentials | Task 5.4 | Pending |
| Prevent overlapping executions | Task 5.2 | Pending |
| Resilient to platform restarts | Task 5.2 | Pending |
| Instructions for switching intervals | Task 5.5 | Pending |
| Version-controlled/documented configuration | Task 5.5 | Pending |
| Testing procedures documented | Task 5.5 | Pending |
| Alternative platforms documented | Task 5.1 | Pending |
| Alerting for repeated failures | Task 5.7 | Pending |

---

## 15. Example Configurations

### 15.1 Low-Latency Mode (1 minute)

```bash
# Environment Variables
TRANSLATION_CRON_INTERVAL=60000
TRANSLATION_BATCH_SIZE=10

# Railway Cron Expression
*/1 * * * *
```

### 15.2 Cost-Optimized Mode (5 minutes)

```bash
# Environment Variables
TRANSLATION_CRON_INTERVAL=300000
TRANSLATION_BATCH_SIZE=20  # Process more per execution

# Railway Cron Expression
*/5 * * * *
```

### 15.3 Complete .env.example Addition

```bash
# =============================================================================
# Translation Cron Configuration
# =============================================================================

# Cron job interval in milliseconds (for worker script)
# Options: 30000 (30s), 60000 (1min), 300000 (5min)
TRANSLATION_CRON_INTERVAL=60000

# Number of translation jobs to process per cron execution
# Higher values = more throughput but longer execution time
TRANSLATION_BATCH_SIZE=10

# Optional: Additional security for cron endpoint validation
# Generate with: openssl rand -hex 32
# CRON_SECRET=your-cron-secret-here

# Required: Service role key for cron authentication
# Get from Supabase Dashboard > Settings > API
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

---

## 16. References

- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md` (Phase 5, Task 5.2)
- **Request Document:** `/docs/gen_requests_epic3.md` (REQ-333)
- **Processing Endpoint:** REQ-332 (`/api/admin/process-translations`)
- **Railway Deployment:** `/RAILWAY_DEPLOYMENT_CHECKLIST.md`
- **Railway Configuration:** `/railway.json`
- **Railway Cron Docs:** https://docs.railway.app/reference/cron-jobs
- **Upstash QStash Docs:** https://upstash.com/docs/qstash

---

## 17. Open Questions

1. **Railway Cron Support**: Does the current Railway plan support cron jobs? If not, should we use an alternative?
   - *Action:* Check Railway dashboard/docs for cron job availability

2. **Sub-Minute Scheduling**: Is 30-second scheduling required, or is 1-minute sufficient?
   - *Recommendation:* Start with 1-minute, evaluate latency needs

3. **Dedicated Service**: Should the cron worker be a separate Railway service?
   - *Recommendation:* Start with native cron if available, use dedicated service if needed

4. **Cost Analysis**: What is the expected cost impact of different interval configurations?
   - *Recommendation:* Document cost estimates for each mode

5. **Monitoring Platform**: Should we integrate with an external monitoring service (DataDog, PagerDuty)?
   - *Recommendation:* Start with Railway logs, add external monitoring based on need

---

## 18. Decision Log

| Decision | Choice | Rationale | Date |
|----------|--------|-----------|------|
| Primary Platform | Railway Cron | Native integration with existing deployment | 2026-01-18 |
| Fallback Platform | Upstash QStash | Reliable, supports sub-minute scheduling | 2026-01-18 |
| Default Interval | 1 minute | Balance between latency and cost | 2026-01-18 |
| Default Batch Size | 10 | Matches processing endpoint default | 2026-01-18 |
| Authentication | Service Role Key | Already configured, provides required access | 2026-01-18 |
