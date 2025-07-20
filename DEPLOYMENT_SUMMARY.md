# QR Item Display System - Complete Setup Package

## 📦 What's Included

This package contains everything needed to set up and deploy the QR Item Display System on Mac and Railway:

### 🛠️ Setup Scripts
- **`setupproject.sh`** - Automated Mac setup script
- **`deploy-railway.sh`** - Railway deployment script
- **`start-dev.sh`** - Development server launcher (created by setup)
- **`build-project.sh`** - Production build script (created by setup)

### 📚 Documentation
- **`QUICK_START.md`** - 5-minute setup guide
- **`MAC_SETUP_GUIDE.md`** - Complete Mac setup instructions
- **`RAILWAY_DEPLOYMENT.md`** - Railway deployment guide (created by deploy script)
- **`README.md`** - Full project documentation
- **`DEPLOYMENT.md`** - General deployment guide

### ⚙️ Configuration Files
- **`.env.example`** - Environment variables template
- **`.env.railway`** - Railway environment template (created by deploy script)
- **`railway.json`** - Railway configuration (created by deploy script)
- **`nixpacks.toml`** - Build configuration (created by deploy script)
- **`Dockerfile`** - Docker configuration (created by deploy script)

### 🗄️ Database
- **`database/schema.sql`** - Database table creation
- **`database/seed-data.sql`** - Sample data insertion
- **`database/README.md`** - Database setup instructions

## 🚀 Quick Setup Instructions

### For Mac Users:

1. **Extract the project files** to a folder on your Mac
2. **Open Terminal** and navigate to the project folder
3. **Run the setup script:**
   ```bash
   chmod +x setupproject.sh
   ./setupproject.sh
   ```
4. **Configure your database** (Supabase)
5. **Start development:**
   ```bash
   ./start-dev.sh
   ```

### For Railway Deployment:

1. **Build the project:**
   ```bash
   ./build-project.sh
   ```
2. **Deploy to Railway:**
   ```bash
   ./deploy-railway.sh
   ```

## 🎯 What Each Script Does

### setupproject.sh
- ✅ Installs Homebrew (if needed)
- ✅ Installs Node.js and npm
- ✅ Installs project dependencies
- ✅ Creates environment configuration
- ✅ Restores full functionality (API routes, dynamic pages)
- ✅ Builds and verifies the project
- ✅ Creates helper scripts for development
- ✅ Optionally installs Supabase CLI

### deploy-railway.sh
- ✅ Installs Railway CLI (if needed)
- ✅ Creates Railway configuration files
- ✅ Sets up Docker configuration
- ✅ Updates package.json for production
- ✅ Creates environment variable templates
- ✅ Builds project for production
- ✅ Deploys to Railway (optional)
- ✅ Creates deployment documentation

## 🔧 Prerequisites

### Mac Requirements:
- macOS 10.15 or later
- Internet connection
- Admin privileges

### External Services:
- **Supabase account** (free tier available)
- **Railway account** (free tier available)

## 📱 Features Included

### End User Features:
- QR code scanning for instant item access
- Mobile-optimized interface
- Rich media support (PDFs, videos, images, links)
- Fast loading with responsive design
- No login required for viewing items

### Admin Features:
- Complete admin panel for item management
- CRUD operations for items and resources
- Drag-and-drop resource ordering
- Search and filtering capabilities
- Professional management interface

### Technical Features:
- Next.js 14 with App Router
- TypeScript for type safety
- Tailwind CSS for styling
- Supabase for database
- Railway for deployment
- Static generation support
- SEO optimization

## 🌐 Live Demo

The system is also deployed as a static demo at:
**https://mmoraesw.manus.space**

This demonstrates the full functionality with sample data.

## 📞 Support & Troubleshooting

### Common Issues:
1. **Permission errors**: Run `chmod +x *.sh` to make scripts executable
2. **Node.js version**: Ensure Node.js 18+ is installed
3. **Database connection**: Verify Supabase credentials in `.env.local`
4. **Build failures**: Clear cache with `rm -rf node_modules .next && npm install`

### Getting Help:
1. Check the relevant documentation file
2. Review error messages in terminal
3. Verify all prerequisites are met
4. Ensure environment variables are configured correctly

## 🎉 Success Criteria

After successful setup, you should have:
- ✅ Development server running at http://localhost:3000
- ✅ Admin panel accessible at http://localhost:3000/admin
- ✅ Sample items viewable (e.g., http://localhost:3000/item/12345)
- ✅ Database connected with sample data
- ✅ All scripts working correctly
- ✅ Ready for Railway deployment

## 🚀 Next Steps

1. **Customize the branding** and content
2. **Add your own items** via the admin panel
3. **Generate QR codes** for your item URLs
4. **Deploy to production** using Railway
5. **Set up a custom domain** (optional)

**Your QR Item Display System is ready to use!** 🎊

