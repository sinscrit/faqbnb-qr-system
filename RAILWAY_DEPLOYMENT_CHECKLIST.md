# Railway Deployment Checklist ✅

## Pre-Deployment Verification

### ✅ Configuration Files Ready
- [x] `railway.json` - Railway deployment configuration (NIXPACKS builder)
- [x] `nixpacks.toml` - Build configuration with Node.js 22
- [x] `Dockerfile` - Alternative deployment method (Node.js 22)
- [x] `package.json` - Contains proper engines specification (Node >=22.0.0)
- [x] `next.config.js` - Production-ready with Railway domain support

### ✅ Build Verification
- [x] Production build tested successfully (`npm run build`)
- [x] No critical errors (warnings are acceptable)
- [x] All dependencies properly resolved

### ✅ Environment Configuration
The following environment variables need to be set in Railway dashboard:

#### Required Variables:
```bash
# Supabase Configuration (REQUIRED)
NEXT_PUBLIC_SUPABASE_URL=https://tqodcyulcnkbkmteobxs.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRxb2RjeXVsY25rYmttdGVvYnhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTExODU3ODUsImV4cCI6MjA2Njc2MTc4NX0.9Ph7kgGfIkB0kR1VS2EOsJ6qQf3Zn7Z1M5GUUPquBMA
SUPABASE_SERVICE_ROLE_KEY=[Get from Supabase Dashboard]

# Application Settings
NODE_ENV=production
PORT=3000
```

#### Optional Variables:
```bash
# Custom QR Domain
NEXT_PUBLIC_QR_DOMAIN_OVERRIDE=https://your-railway-app.railway.app

# Railway automatically sets this
RAILWAY_PUBLIC_DOMAIN=your-app.railway.app
```

## Deployment Steps

### 1. Install Railway CLI
```bash
npm install -g @railway/cli
```

### 2. Login to Railway
```bash
railway login
```

### 3. Deploy
```bash
railway up
```

### 4. Set Environment Variables
1. Go to Railway dashboard
2. Select your project
3. Go to Variables tab
4. Add all required environment variables

### 5. Get Supabase Service Role Key
1. Visit: https://supabase.com/dashboard/project/tqodcyulcnkbkmteobxs/settings/api
2. Copy the "service_role" key
3. Add as `SUPABASE_SERVICE_ROLE_KEY` in Railway

### 6. Verify Deployment
Test these endpoints after deployment:
- `/` - Landing page
- `/item/12345` - Sample item page
- `/admin` - Admin interface
- `/register` - Registration page

## Configuration Details

### Railway Configuration (`railway.json`)
- Using NIXPACKS builder for optimal performance
- Single replica with restart on failure
- No sleep mode for production availability

### Build Configuration (`nixpacks.toml`)
- Node.js 22.x for latest features and performance
- Optimized npm ci for production builds
- Production environment variables

### Next.js Configuration
- Production optimized settings
- ESLint and TypeScript errors ignored for Railway compatibility
- PDFKit properly configured for server-side rendering
- Dynamic Railway domain support via environment variables

## Post-Deployment

### ✅ Verify Functionality
- [ ] Landing page loads correctly
- [ ] QR code scanning works
- [ ] Admin interface accessible
- [ ] Database connection working
- [ ] User registration flow functional

### ✅ Performance Checks
- [ ] Page load times acceptable
- [ ] No console errors in production
- [ ] Images and assets loading properly
- [ ] API endpoints responding correctly

## Troubleshooting

### Common Issues:
1. **Build Failures**: Check Node.js version compatibility
2. **Runtime Errors**: Verify environment variables
3. **Database Issues**: Check Supabase connection strings
4. **Domain Issues**: Ensure RAILWAY_PUBLIC_DOMAIN is set

### Useful Commands:
```bash
# View deployment logs
railway logs

# Check project status
railway status

# Redeploy
railway up

# Open app in browser
railway open
```

## Translation Cron Job Setup (REQ-E03-026)

### Environment Variables
- [ ] `TRANSLATION_SERVICE_TOKEN` set in Railway environment (generate with `openssl rand -hex 32`)
- [ ] `TRANSLATION_MODE` set appropriately (`responsive` for production, `cost_optimized` for staging)
- [ ] `TRANSLATION_BATCH_SIZE` configured for selected mode (10 for responsive, 50 for cost-optimized)

### Cron Configuration
- [ ] Cron job created in Railway dashboard (or GitHub Actions enabled as alternative)
- [ ] Schedule verified (`* * * * *` for responsive, `*/5 * * * *` for cost-optimized)
- [ ] Authorization header configured with service token: `Authorization: Bearer <TOKEN>`
- [ ] Content-Type header set: `Content-Type: application/json`
- [ ] Request body includes correct batch size: `{"batchSize": 10}` (or 50)

### Verification
- [ ] Manual test of `/api/admin/process-translations` endpoint successful
- [ ] First cron execution visible in Railway logs
- [ ] Jobs being processed (check `translation_jobs` table)
- [ ] Processing statistics reasonable (no high failure rates)

### Monitoring
- [ ] Cron execution logs accessible via `railway logs --filter "ProcessTranslations"`
- [ ] Alert configured for cron failures (optional but recommended)

**Full setup guide:** [docs/deployment/TRANSLATION_CRON_SETUP.md](docs/deployment/TRANSLATION_CRON_SETUP.md)

---

## Ready for Production

This project is now fully configured and ready for Railway deployment with:
- Modern Node.js 22 runtime
- Optimized build configuration
- Production-ready Next.js setup
- Comprehensive error handling
- Dynamic domain support
- Database integration ready
- Translation cron job automation (REQ-E03-026)

Deploy with confidence!

