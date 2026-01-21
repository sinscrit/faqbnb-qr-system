# Translation Cron Job Setup Guide

**Last Updated:** 2026-01-21
**Related Request:** REQ-E03-026

This guide covers the setup and configuration of automated translation job processing.

---

## Prerequisites

Before configuring the cron job, ensure:

1. Application is deployed to Railway
2. REQ-E03-025 (Job Processing API) is implemented
3. Environment variables are configured
4. Service token is generated

---

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `TRANSLATION_SERVICE_TOKEN` | Yes | - | Service auth token for cron requests (min 32 chars) |
| `TRANSLATION_MODE` | No | `responsive` | `responsive` (1-min) or `cost_optimized` (5-min) |
| `TRANSLATION_BATCH_SIZE` | No | 10 | Jobs per processing cycle (max 50) |
| `TRANSLATION_CRON_ENABLED` | No | `true` | Enable/disable cron processing |

### Generating Service Token

```bash
# Generate a secure 32-character random token
openssl rand -hex 32
```

**Important:** Store this token securely. Never commit it to version control.

---

## Operational Modes

### Responsive Mode (Recommended for Production)
- **Interval:** Every 1 minute
- **Batch Size:** 10 jobs
- **Target Latency:** < 2 minutes for new content
- **Cost Impact:** Higher API usage (more frequent calls)

### Cost-Optimized Mode (Development/Staging)
- **Interval:** Every 5 minutes
- **Batch Size:** 50 jobs
- **Target Latency:** < 6 minutes for new content
- **Cost Impact:** Lower API usage (fewer calls)

---

## Setup Instructions

### Option A: Railway Cron (Recommended)

Railway cron jobs provide the most reliable scheduling with sub-minute precision.

1. **Navigate to Railway Dashboard**
   - Open your project
   - Go to Project Settings > Cron Jobs

2. **Create New Cron Job**

   | Setting | Responsive Mode | Cost-Optimized Mode |
   |---------|----------------|---------------------|
   | Name | `translation-processor` | `translation-processor` |
   | Schedule | `* * * * *` | `*/5 * * * *` |
   | Method | POST | POST |
   | URL | `https://<your-app>.up.railway.app/api/admin/process-translations` | Same |
   | Timeout | 30 seconds | 60 seconds |

3. **Configure Headers**
   ```
   Authorization: Bearer <TRANSLATION_SERVICE_TOKEN>
   Content-Type: application/json
   ```

4. **Configure Body**
   ```json
   {"batchSize": 10}
   ```
   (Use `50` for cost-optimized mode)

5. **Enable and Verify**
   - Enable the cron job
   - Wait for first execution (check logs)

### Option B: GitHub Actions (Alternative/Backup)

Use GitHub Actions as an alternative when Railway cron is unavailable.

**Limitation:** GitHub Actions has a minimum 5-minute interval.

1. **Ensure Workflow Exists**
   - File: `.github/workflows/translation-cron.yml`
   - Should already be in the repository

2. **Configure GitHub Secrets**
   Navigate to: Repository Settings > Secrets and variables > Actions

   | Secret | Description |
   |--------|-------------|
   | `TRANSLATION_SERVICE_TOKEN` | Staging environment token |
   | `TRANSLATION_SERVICE_TOKEN_PROD` | Production environment token |

3. **Enable GitHub Actions**
   - Go to Actions tab
   - Enable workflows if disabled

4. **Manual Testing**
   - Go to Actions > Translation Job Processing
   - Click "Run workflow"
   - Select environment and batch size
   - Verify successful execution

---

## Verification Steps

### 1. Test Endpoint Manually

```bash
# Set your token
export TOKEN="your-service-token"

# Test staging
curl -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"batchSize": 5}' \
  https://faqbnb-staging.up.railway.app/api/admin/process-translations

# Expected response:
# {
#   "success": true,
#   "data": { ... statistics ... },
#   "message": "Successfully processed N translation jobs"
# }
```

### 2. Check Railway Logs

```bash
# Filter logs for translation processing
railway logs --filter "ProcessTranslations"
```

Look for entries like:
```
[ProcessTranslations] Processing requested via service token
[ProcessTranslations] Processing completed { authMethod: 'service-token', ... }
```

### 3. Verify Job Processing

Query the database to confirm jobs are being processed:

```sql
-- Recently completed jobs
SELECT status, COUNT(*)
FROM translation_jobs
WHERE updated_at > NOW() - INTERVAL '10 minutes'
GROUP BY status;

-- Queue depth (pending jobs)
SELECT COUNT(*) as pending
FROM translation_jobs
WHERE status = 'queued';

-- No stale jobs
SELECT COUNT(*) as stale
FROM translation_jobs
WHERE status = 'processing'
AND started_at < NOW() - INTERVAL '5 minutes';
```

---

## Troubleshooting

### Cron Not Executing

1. **Verify cron is enabled** in Railway dashboard
2. **Check schedule syntax** (use crontab.guru to validate)
3. **Ensure app is not sleeping** (`sleepApplication: false` in railway.json)
4. **Check Railway status page** for platform issues

### Authentication Failures (403)

1. **Verify token matches** in both Railway env and cron config
2. **Check token length** (minimum 32 characters)
3. **Ensure no whitespace** in token (copy/paste issues)
4. **Test manually** with curl to isolate the issue

### Processing Timeouts

1. **Reduce batch size** (try 5 instead of 10)
2. **Check translation service** (Claude/OpenAI) availability
3. **Review individual job errors** in logs
4. **Increase timeout** in cron configuration

### Jobs Not Being Processed

1. **Verify endpoint URL** is correct
2. **Check for rate limiting** from translation provider
3. **Review stale job cleanup logs**
4. **Confirm jobs exist** in `translation_jobs` table with status 'queued'

### Queue Building Up

If pending jobs keep increasing:

1. **Increase batch size** (up to 50)
2. **Reduce cron interval** if possible
3. **Check for job processing failures**
4. **Review translation provider quota/limits**

---

## Monitoring Recommendations

### Key Metrics to Track

| Metric | Normal | Warning | Critical |
|--------|--------|---------|----------|
| Queue Depth | < 20 | 20-50 | > 50 |
| Failure Rate | < 5% | 5-10% | > 10% |
| Processing Time | < 20s | 20-40s | > 40s |
| Cron Success Rate | > 99% | 95-99% | < 95% |

### Suggested Alerts

1. **Queue Depth Alert:** Trigger when pending jobs > 50
2. **Failure Rate Alert:** Trigger when > 10% failures in 15 minutes
3. **Cron Failure Alert:** Trigger after 3 consecutive failed executions
4. **Latency Alert:** Trigger when processing time > 45 seconds

---

## Security Notes

1. **Token Rotation:** Rotate service token every 90 days
2. **Minimal Permissions:** Token only allows job processing, not admin access
3. **Audit Logging:** All invocations logged with auth method and timestamp
4. **No Version Control:** Never commit service tokens to repository
5. **Timing-Safe Comparison:** Token validation prevents timing attacks

---

## Configuration Reference

### `/src/lib/config/translation-config.ts`

```typescript
import { getTranslationConfig } from '@/lib/config/translation-config';

const config = getTranslationConfig();
// {
//   mode: 'responsive',
//   batchSize: 10,
//   cronEnabled: true,
//   serviceToken: 'xxx...',
//   hasServiceToken: true
// }
```

### API Endpoint

- **URL:** `POST /api/admin/process-translations`
- **Auth:** Service token (Bearer) or Admin session
- **Body:** `{ "batchSize": number }` (optional, default 10, max 50)
- **Response:** Statistics with processed count, success/failure breakdown

---

## Related Documentation

- [Job Processing API (REQ-E03-025)](../REQ-E03-025-create-job-processing-api-route-detailed.md)
- [Translation Service Configuration](../../.env.example)
- [Railway Cron Documentation](https://docs.railway.app/reference/cron-jobs)
- [GitHub Actions Schedule](https://docs.github.com/en/actions/using-workflows/events-that-trigger-workflows#schedule)

---

*Document created: 2026-01-21*
*Part of FAQBNB Localization Epic 3 - Dynamic Content Translation*
