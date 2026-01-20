# REQ-E03-026: Set Up Railway Cron Job for Translation Processing

**Implementation Breakdown Document**

---

| Field | Value |
|-------|-------|
| **Request ID** | REQ-E03-026 |
| **Title** | Set Up Railway Cron Job (or Alternative) |
| **Type** | NEW FEATURE |
| **Size** | S (Small) |
| **Epic** | Epic 3 - Dynamic Content Translation |
| **Phase** | 5 - Job Processing Trigger Setup |
| **Task ID** | 5.2 |
| **Date Created** | 2026-01-20 |
| **Last Modified** | 2026-01-20 |
| **PRD Reference** | Plan-111-L10N-Epic3-Dynamic-Content-Translation.md |
| **Dependencies** | REQ-E03-025 (Job Processing API Route) |

---

## 1. Summary

Configure automated periodic triggering of translation job processing through a scheduled task that calls the `/api/admin/process-translations` endpoint at regular intervals. This enables continuous background translation processing without manual intervention, ensuring that queued translation jobs are processed within acceptable latency targets (30 seconds for low-latency mode, 5 minutes for cost-optimized mode).

---

## 2. Background & Context

### Current State
- The job processing API endpoint exists (REQ-E03-025) but must be called manually
- No automated mechanism triggers translation job processing
- Jobs remain queued indefinitely unless manually processed via API calls
- Content creators experience significant delays between content creation and multilingual availability

### Why This Change Is Needed
- Translation jobs need continuous processing to maintain acceptable latency
- Manual triggering is impractical for production operations
- Users expect near-instant translation availability after content creation
- Automated processing reduces operational burden on administrators

### Existing Infrastructure
Based on codebase investigation:
1. **Railway Configuration** (`/railway.json`): Project is already configured for Railway deployment with NIXPACKS builder
2. **Deployment Guide** (`/RAILWAY_DEPLOYMENT_CHECKLIST.md`): Comprehensive deployment documentation exists
3. **Job Processor** (`/src/lib/job-queue/job-processor.ts`): Fully functional translation job processor with configurable polling intervals
4. **Environment Variables**: Pattern established for runtime configuration via env vars

### Railway Cron Job Limitations
**IMPORTANT:** Railway cron jobs have a minimum interval of **1 minute**. The 30-second interval mentioned in the PRD is not directly achievable with Railway's cron feature. Options to address this:
1. Use 1-minute Railway cron with increased batch size
2. Implement application-level interval polling (internal scheduler)
3. Use external scheduling service (GitHub Actions, Vercel Cron, etc.) for sub-minute intervals
4. Accept 1-minute minimum as acceptable latency

---

## 3. Technical Requirements

### 3.1 Scheduling Mechanism Options

| Option | Interval Support | Complexity | Cost Impact | Recommended For |
|--------|------------------|------------|-------------|-----------------|
| **Railway Cron** | Minimum 1 minute | Low | Included | Production (default) |
| **Internal Polling** | Any interval | Medium | None (runs in app) | Sub-minute requirements |
| **GitHub Actions** | Minimum 5 minutes | Low | Free tier available | Cost-optimized fallback |
| **Vercel Cron** | Minimum 1 minute | Low | May have limits | Alternative hosting |

### 3.2 Configuration Parameters

| Parameter | Environment Variable | Default | Description |
|-----------|---------------------|---------|-------------|
| Processing Interval | `TRANSLATION_CRON_INTERVAL` | `*/1 * * * *` | Cron expression (Railway default: every minute) |
| Batch Size | `TRANSLATION_BATCH_SIZE` | 10 | Jobs per processing cycle |
| Processing Mode | `TRANSLATION_MODE` | `responsive` | `responsive` (1 min) or `cost_optimized` (5 min) |
| Processing Endpoint | `TRANSLATION_PROCESSING_URL` | `/api/admin/process-translations` | API endpoint path |
| Service Auth Token | `TRANSLATION_SERVICE_TOKEN` | (required) | Authentication for cron requests |

### 3.3 Operational Modes

#### Responsive Mode (Default)
- **Interval:** Every 1 minute (Railway minimum)
- **Batch Size:** 10 jobs per cycle
- **Target Latency:** < 2 minutes from job creation to completion
- **Use Case:** Production environments prioritizing user experience

#### Cost-Optimized Mode
- **Interval:** Every 5 minutes
- **Batch Size:** 50 jobs per cycle
- **Target Latency:** < 6 minutes from job creation to completion
- **Use Case:** Development/staging or cost-sensitive deployments

---

## 4. Implementation Approach

### 4.1 Primary Approach: Railway Cron Job

Railway cron jobs are configured via `railway.json` or the Railway dashboard. Since cron syntax varies by platform, Railway uses standard cron expressions.

#### Configuration via Railway Dashboard (Recommended)
1. Navigate to Railway dashboard > Project Settings > Deploy
2. Add a cron job service or configure cron trigger
3. Set cron expression: `*/1 * * * *` (every minute)
4. Configure HTTP request to processing endpoint

#### Configuration via railway.json Enhancement
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
  },
  "cron": {
    "enabled": true,
    "schedule": "*/1 * * * *",
    "endpoint": "/api/admin/process-translations",
    "timezone": "UTC"
  }
}
```

**Note:** Railway cron configuration may require dashboard setup or additional service configuration. The `railway.json` cron support depends on Railway's current feature set.

### 4.2 Alternative Approach: Application-Level Scheduler

If sub-minute intervals are required or Railway cron is insufficient, implement an internal scheduler:

```typescript
// /src/lib/translation-scheduler/scheduler.ts

export class TranslationScheduler {
  private intervalId: NodeJS.Timeout | null = null;
  private readonly intervalMs: number;
  private readonly batchSize: number;

  constructor() {
    this.intervalMs = parseInt(process.env.TRANSLATION_INTERVAL_MS || '60000', 10);
    this.batchSize = parseInt(process.env.TRANSLATION_BATCH_SIZE || '10', 10);
  }

  start(): void {
    if (this.intervalId) return;

    this.intervalId = setInterval(() => {
      this.triggerProcessing();
    }, this.intervalMs);

    console.log('[TranslationScheduler] Started with interval:', this.intervalMs);
  }

  private async triggerProcessing(): Promise<void> {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL}/api/admin/process-translations`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.TRANSLATION_SERVICE_TOKEN}`,
          },
          body: JSON.stringify({ batchSize: this.batchSize }),
        }
      );

      const result = await response.json();
      console.log('[TranslationScheduler] Processing result:', result);
    } catch (error) {
      console.error('[TranslationScheduler] Processing error:', error);
    }
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}
```

### 4.3 Alternative Approach: GitHub Actions Workflow

For deployments without Railway cron support:

```yaml
# .github/workflows/translation-cron.yml
name: Translation Job Processing

on:
  schedule:
    - cron: '*/5 * * * *'  # Every 5 minutes (GitHub Actions minimum)
  workflow_dispatch:  # Manual trigger

jobs:
  process-translations:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Translation Processing
        run: |
          curl -X POST \
            -H "Content-Type: application/json" \
            -H "Authorization: Bearer ${{ secrets.TRANSLATION_SERVICE_TOKEN }}" \
            -d '{"batchSize": 50}' \
            "${{ secrets.TRANSLATION_API_URL }}/api/admin/process-translations"
```

---

## 5. Authorized Files and Functions for Modification

### 5.1 Files to Create (Railway Cron Approach)

| File Path | Purpose |
|-----------|---------|
| `/docs/deployment/TRANSLATION_CRON_SETUP.md` | Documentation for cron configuration |

### 5.2 Files to Modify

| File Path | Changes |
|-----------|---------|
| `/railway.json` | Add cron configuration (if Railway supports via config) |
| `/RAILWAY_DEPLOYMENT_CHECKLIST.md` | Add cron setup verification steps |

### 5.3 Files to Create (Application Scheduler Approach)

| File Path | Purpose |
|-----------|---------|
| `/src/lib/translation-scheduler/index.ts` | Scheduler module exports |
| `/src/lib/translation-scheduler/scheduler.ts` | TranslationScheduler class |
| `/src/app/api/internal/start-scheduler/route.ts` | Optional: API to start scheduler |

### 5.4 Files to Create (GitHub Actions Approach)

| File Path | Purpose |
|-----------|---------|
| `/.github/workflows/translation-cron.yml` | GitHub Actions workflow for scheduled processing |

### 5.5 Environment Variables to Document

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `TRANSLATION_SERVICE_TOKEN` | Yes | - | Service role auth token for cron requests |
| `TRANSLATION_MODE` | No | `responsive` | `responsive` or `cost_optimized` |
| `TRANSLATION_BATCH_SIZE` | No | 10 | Jobs per processing cycle |
| `TRANSLATION_CRON_INTERVAL` | No | `*/1 * * * *` | Cron expression |
| `TRANSLATION_INTERVAL_MS` | No | 60000 | Interval for app-level scheduler |

---

## 6. Implementation Tasks

### Task 1: Create Service Authentication Token

Create a dedicated service token for cron job authentication:

1. Generate a secure random token (32+ characters)
2. Add to Railway environment variables as `TRANSLATION_SERVICE_TOKEN`
3. Update auth validation to accept service token alongside admin auth

**Acceptance Criteria:**
- [ ] Service token generated and stored securely
- [ ] Token added to Railway environment variables
- [ ] Process-translations endpoint accepts service token authentication

### Task 2: Configure Railway Cron Job

**Option A: Via Railway Dashboard**
1. Navigate to Railway project settings
2. Create new cron job service or configure trigger
3. Set schedule: `*/1 * * * *` (every minute)
4. Configure HTTP POST to `{APP_URL}/api/admin/process-translations`
5. Add Authorization header with service token

**Option B: Via railway.json (if supported)**
1. Update `railway.json` with cron configuration
2. Commit and deploy to activate cron

**Acceptance Criteria:**
- [ ] Cron job configured in Railway
- [ ] Schedule set to 1-minute intervals (or 5-minute for cost mode)
- [ ] Request includes proper authentication
- [ ] Request body includes batchSize parameter

### Task 3: Create Deployment Documentation

Create `/docs/deployment/TRANSLATION_CRON_SETUP.md` with:

1. Prerequisites (process-translations endpoint deployed)
2. Environment variable configuration
3. Railway cron setup instructions (dashboard steps)
4. Alternative setup instructions (GitHub Actions, internal scheduler)
5. Verification steps
6. Troubleshooting guide
7. Mode selection guidance (responsive vs cost-optimized)

**Acceptance Criteria:**
- [ ] Documentation covers all configuration options
- [ ] Step-by-step instructions for Railway dashboard setup
- [ ] Alternative approaches documented
- [ ] Troubleshooting section included

### Task 4: Update Deployment Checklist

Add translation cron setup to `/RAILWAY_DEPLOYMENT_CHECKLIST.md`:

```markdown
### Translation Cron Job Setup
- [ ] `TRANSLATION_SERVICE_TOKEN` environment variable set
- [ ] Cron job configured (via dashboard or railway.json)
- [ ] Schedule verified (1 minute for responsive, 5 minutes for cost mode)
- [ ] Initial processing test successful
- [ ] Cron logs accessible in Railway dashboard
```

**Acceptance Criteria:**
- [ ] Deployment checklist updated with cron verification steps
- [ ] Service token setup included
- [ ] Mode selection documented

### Task 5: Implement Service Token Authentication (if needed)

If the process-translations endpoint doesn't already support service token auth, update:

```typescript
// In /src/app/api/admin/process-translations/route.ts

// Add service token validation alongside admin auth
const serviceToken = request.headers.get('x-service-token');
if (serviceToken === process.env.TRANSLATION_SERVICE_TOKEN) {
  // Allow service role access
  // Proceed with processing
} else {
  // Fall back to standard admin auth
  const authResult = await validateAdminAuth(request);
  // ...
}
```

**Acceptance Criteria:**
- [ ] Service token accepted via `x-service-token` header or `Authorization: Bearer`
- [ ] Token validation is timing-safe to prevent timing attacks
- [ ] Unauthorized requests still rejected properly

### Task 6: Verify Cron Job Execution

After deployment, verify the cron job is working:

1. Check Railway dashboard for cron execution logs
2. Query translation_jobs table for recently processed jobs
3. Verify processing statistics via job monitoring endpoint (if available)
4. Confirm job completion latency meets target

**Acceptance Criteria:**
- [ ] Cron executes at configured interval
- [ ] Processing endpoint responds successfully
- [ ] Jobs are being processed and completed
- [ ] Logs are accessible for monitoring

---

## 7. Configuration Recommendations

### For Production (Responsive Mode)

```bash
# Railway Environment Variables
TRANSLATION_SERVICE_TOKEN=<secure-32-char-token>
TRANSLATION_MODE=responsive
TRANSLATION_BATCH_SIZE=10

# Cron: */1 * * * * (every minute via Railway dashboard)
```

### For Development/Staging (Cost-Optimized Mode)

```bash
# Railway Environment Variables
TRANSLATION_SERVICE_TOKEN=<secure-32-char-token>
TRANSLATION_MODE=cost_optimized
TRANSLATION_BATCH_SIZE=50

# Cron: */5 * * * * (every 5 minutes via Railway dashboard)
```

---

## 8. Monitoring & Observability

### Recommended Monitoring

1. **Cron Execution Monitoring**
   - Railway dashboard shows cron execution history
   - Set up alerts for failed executions

2. **Processing Statistics**
   - Use job monitoring endpoint (REQ-E03-025 response) to track:
     - Jobs processed per cycle
     - Success/failure rates
     - Average processing time

3. **Translation Latency**
   - Monitor time from job creation to completion
   - Alert if latency exceeds targets (2 min for responsive, 6 min for cost mode)

4. **Queue Depth**
   - Monitor pending jobs count via translation status APIs
   - Alert if queue grows faster than processing capacity

---

## 9. Acceptance Criteria Checklist

From REQ-E03-026:

- [ ] Cron job or scheduled task is configured to run at regular intervals
- [ ] Default schedule is set to execute every 1 minute (Railway minimum; PRD mentions 30 seconds which isn't achievable with Railway cron)
- [ ] Schedule interval is configurable via environment variable
- [ ] Alternative 5-minute schedule is documented for cost-optimized deployments
- [ ] Scheduled task makes authenticated HTTP POST request to job processing endpoint
- [ ] Request includes service role authentication token from environment variable
- [ ] Request specifies batch size parameter (10 for 1-minute intervals, 50 for 5-minute intervals)
- [ ] Batch size is configurable via environment variable with sensible defaults per schedule
- [ ] Scheduled task logs successful execution with processing statistics
- [ ] Scheduled task logs errors when processing endpoint returns error status
- [ ] Failed executions do not prevent subsequent scheduled runs
- [ ] Railway cron job configuration is documented in deployment documentation
- [ ] Alternative scheduling approaches (GitHub Actions, internal scheduler) are documented
- [ ] Environment variable documentation describes all configuration options
- [ ] Documentation includes setup instructions for Railway-specific configuration
- [ ] Documentation includes setup instructions for alternative scheduling services
- [ ] Deployment guide specifies how to verify cron job is running correctly
- [ ] Deployment guide includes troubleshooting steps for common scheduling issues
- [ ] Cron job execution can be monitored through platform-specific logs or dashboards
- [ ] Authentication token for scheduled processing is distinct from user authentication
- [ ] Authentication token has minimal required permissions (job processing only)

---

## 10. Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Railway cron minimum 1-minute vs PRD 30-second requirement | High | Medium | Document limitation, offer internal scheduler alternative |
| Service token exposure | Low | High | Use Railway secrets, never commit to repo |
| Cron job timeout | Medium | Medium | Processing endpoint has timeout handling, batch sizes tuned |
| Concurrent cron executions | Low | Low | Job locking prevents duplicate processing |
| Railway cron feature changes | Low | Medium | Document alternatives, abstract configuration |

---

## 11. Alternative Scheduling Quick Reference

### If Railway Cron Unavailable

**Internal Scheduler (Recommended for Sub-Minute)**
1. Create `/src/lib/translation-scheduler/` module
2. Initialize scheduler in app startup
3. Uses existing job processor infrastructure

**GitHub Actions (Free Tier Option)**
1. Create `.github/workflows/translation-cron.yml`
2. Minimum 5-minute interval
3. Uses HTTP trigger to processing endpoint

**Vercel Cron (If Migrating Platforms)**
1. Configure in `vercel.json`
2. Minimum 1-minute interval
3. Uses Edge Functions

---

## 12. Dependencies

### Upstream Dependencies (Must Be Completed First)

| Dependency | Status | Notes |
|------------|--------|-------|
| REQ-E03-025 | Required | Job processing API endpoint must exist and be deployed |
| Railway deployment | Required | Application must be deployed to Railway |
| Translation job queue | Required | Epic 1 job queue infrastructure |

### Downstream Dependencies (Enabled By This)

| Dependent | Impact |
|-----------|--------|
| Automated translation processing | Jobs processed without manual intervention |
| Translation latency SLA | Predictable completion times achievable |
| Production operations | Reduced operational overhead |

---

## 13. References

- **Request Document:** `/docs/gen_requests_epic3.md` - REQ-E03-026
- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md` - Phase 5, Task 5.2
- **Railway Documentation:** [Railway Cron Jobs](https://docs.railway.app/reference/cron-jobs)
- **Existing Configuration:** `/railway.json`, `/RAILWAY_DEPLOYMENT_CHECKLIST.md`
- **Processing Endpoint:** REQ-E03-025 overview document

---

*Document generated: 2026-01-20*
*Last modified: 2026-01-20*
