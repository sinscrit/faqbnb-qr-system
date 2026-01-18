# 🚂 Railway Deployment Guide

## Quick Deploy to Railway

### 1. Prerequisites
- Railway account: https://railway.app
- Your Supabase project is set up and running

### 2. Deploy Steps

1. **Install Railway CLI** (if not already installed):
   ```bash
   npm install -g @railway/cli
   ```

2. **Login to Railway**:
   ```bash
   railway login
   ```

3. **Deploy the project**:
   ```bash
   railway up
   ```

4. **Set Environment Variables** in Railway dashboard:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://tqodcyulcnkbkmteobxs.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRxb2RjeXVsY25rYmttdGVvYnhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTExODU3ODUsImV4cCI6MjA2Njc2MTc4NX0.9Ph7kgGfIkB0kR1VS2EOsJ6qQf3Zn7Z1M5GUUPquBMA
   SUPABASE_SERVICE_ROLE_KEY=<get from supabase dashboard>
   NEXTAUTH_SECRET=<generate random 32+ char string>
   NEXTAUTH_URL=<your railway app url>
   NODE_ENV=production
   ```

5. **Get Service Role Key**:
   - Go to https://supabase.com/dashboard/project/tqodcyulcnkbkmteobxs/settings/api
   - Copy the "service_role" key
   - Add it as `SUPABASE_SERVICE_ROLE_KEY` in Railway

### 3. Database Setup
The database is already configured and contains sample data:
- 5 sample items (washing machine, TV, coffee maker, thermostat, dishwasher)
- 16 associated links with tutorials and manuals

### 4. Test Your Deployment
Once deployed, test these URLs:
- `/` - Home page
- `/item/12345` - Samsung Washing Machine
- `/item/tv-001` - Samsung TV
- `/item/coffee-maker` - Keurig Coffee Maker

### 5. Ready for QR Codes
Your deployed URLs can now be used in QR codes:
- `https://your-app.railway.app/item/12345`
- `https://your-app.railway.app/item/tv-001`
- etc.

## Troubleshooting

- **Build errors**: Check Railway logs in dashboard
- **Database connection**: Verify Supabase keys are correct
- **Environment variables**: Ensure all required vars are set

## Commands
```bash
# View logs
railway logs

# Check status
railway status

# Redeploy
railway up
``` 