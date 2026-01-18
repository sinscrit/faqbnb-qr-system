# QR Item Display System - Quick Start Guide (Fixed)

## ⚡ 5-Minute Setup

### 1. Extract Files
Download and extract the project files to any location:
- `~/Downloads/qr-item-system` (recommended)
- `~/Desktop/qr-item-system`
- Or any folder you prefer

### 2. Run Setup Script
The script will automatically find your project directory:

```bash
# Option A: Run from project directory
cd ~/Downloads/qr-item-system
chmod +x setupproject.sh
./setupproject.sh

# Option B: Run from anywhere (script finds project)
chmod +x setupproject.sh
./setupproject.sh
```

### 3. Configure Database
1. Create [Supabase account](https://supabase.com)
2. Create new project
3. Run SQL from `database/schema.sql` and `database/seed-data.sql`
4. Update `.env.local` with your Supabase credentials

### 4. Start Development
```bash
./start-dev.sh
```

Visit: http://localhost:3000 🎉

## 🔍 Smart Setup Features

The improved setup script:
- ✅ **Finds your project automatically** (no need to be in exact directory)
- ✅ **Checks multiple common locations** (Downloads, Desktop, etc.)
- ✅ **Verifies it's the right project** before proceeding
- ✅ **Provides clear error messages** if project not found
- ✅ **Handles all dependencies** automatically

## 🚀 Deploy to Production

### Railway Deployment
```bash
./deploy-railway.sh
```

Follow the prompts to deploy to Railway.

## 📱 Test QR Codes

Try these sample URLs:
- http://localhost:3000/item/12345 (Washing Machine)
- http://localhost:3000/item/tv-001 (Smart TV)
- http://localhost:3000/admin (Admin Panel)

## 🔧 Key Files

- `setupproject.sh` - Smart Mac setup script (finds project automatically)
- `deploy-railway.sh` - Railway deployment
- `start-dev.sh` - Start development server (created by setup)
- `.env.local` - Environment configuration (created by setup)
- `database/` - SQL scripts for Supabase

## 🆘 Troubleshooting

### "Could not find project directory"
- Ensure you extracted the downloaded files completely
- Check that the folder contains `package.json` and `src/` directory
- Try placing the project in `~/Downloads/` or `~/Desktop/`

### "Build failed"
- Run `npm install` again
- Check Node.js version: `node --version` (should be v18+)
- Verify `.env.local` was created

### Permission errors
```bash
chmod +x setupproject.sh
chmod +x start-dev.sh
chmod +x deploy-railway.sh
```

## 📚 Full Documentation

- `MAC_SETUP_GUIDE_FIXED.md` - Complete setup instructions
- `RAILWAY_DEPLOYMENT.md` - Deployment guide
- `README.md` - Project documentation

**The setup script is now much smarter and will find your project automatically!** 🚀

