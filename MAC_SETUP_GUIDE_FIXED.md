# QR Item Display System - Mac Setup Guide (Updated)

## 📋 Prerequisites

Before setting up the QR Item Display System on your Mac, ensure you have:

- **macOS 10.15** or later
- **Internet connection** for downloading dependencies
- **Admin privileges** for installing software

## 🚀 Quick Setup (Recommended)

### 1. Download and Extract Project
1. Download the project files to your Mac
2. Extract to a folder (e.g., `~/Downloads/qr-item-system` or `~/Desktop/qr-item-system`)
3. **Important**: The setup script will automatically find your project directory!

### 2. Run Setup Script
You can run the setup script from anywhere - it will find your project automatically:

**Option A: From the project directory**
```bash
cd ~/Downloads/qr-item-system  # or wherever you extracted
chmod +x setupproject.sh
./setupproject.sh
```

**Option B: From anywhere (script will find the project)**
```bash
# Place setupproject.sh anywhere and run it
chmod +x setupproject.sh
./setupproject.sh
```

The script will automatically:
- 🔍 **Find your project directory** (checks Downloads, Desktop, current directory)
- ✅ **Install Homebrew** (if not present)
- ✅ **Install Node.js and npm** (v18+ required)
- ✅ **Install Git**
- ✅ **Install project dependencies**
- ✅ **Create environment configuration**
- ✅ **Restore full functionality** (API routes, admin panel)
- ✅ **Build and verify** the project
- ✅ **Create helper scripts**

### 3. Configure Environment
The script creates `.env.local` automatically. Edit it with your Supabase credentials:
```bash
nano .env.local
```

Update these values:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
```

### 4. Set Up Database
1. Go to [Supabase](https://supabase.com) and create a new project
2. In the SQL Editor, run the scripts from the `database/` folder:
   - First: `schema.sql` (creates tables)
   - Then: `seed-data.sql` (adds sample data)

### 5. Start Development Server
```bash
./start-dev.sh
```

Visit http://localhost:3000 to see your app! 🎉

## 🔍 Smart Directory Detection

The improved setup script automatically searches for your project in:

1. **Current directory** where you run the script
2. **Current directory/qr-item-system**
3. **Current directory/qr-item-display**
4. **~/Downloads/qr-item-system**
5. **~/Downloads/qr-item-display**
6. **~/Desktop/qr-item-system**
7. **~/Desktop/qr-item-display**
8. **Any directory in Downloads with package.json**
9. **Any directory on Desktop with package.json**

The script verifies it found the right project by checking for:
- `package.json`
- `src/app/page.tsx`
- `database/schema.sql`

## 🛠️ What the Script Does

### Automatic Detection & Setup:
```bash
🔍 Looking for project directory...
✅ Found project directory: /Users/you/Downloads/qr-item-system
📍 Changing to project directory...
✅ Confirmed: In correct project directory
✅ Verified: This is the QR Item Display project
```

### Dependency Management:
- Checks and installs Homebrew if needed
- Installs/upgrades Node.js to v18+ if needed
- Installs Git if needed
- Installs all npm dependencies

### Project Configuration:
- Creates `.env.local` with template values
- Restores API routes for full functionality
- Restores dynamic pages (removes static export limitations)
- Configures Next.js for development
- Creates helper scripts (`start-dev.sh`, `build-project.sh`)

### Verification:
- Builds the project to ensure everything works
- Provides clear next steps
- Offers to install Supabase CLI

## 📁 Expected Project Structure

After extraction, your project should look like:
```
qr-item-system/  (or qr-item-display/)
├── src/
│   ├── app/
│   ├── components/
│   ├── lib/
│   └── types/
├── database/
├── package.json
├── setupproject.sh
├── deploy-railway.sh
└── README.md
```

## 🔧 Troubleshooting

### "Could not find the QR Item Display project directory!"

**Solution**: Make sure you have:
1. Downloaded and extracted the project files
2. The extracted folder contains `package.json` and `src/` directory
3. Place the project in one of these locations:
   - `~/Downloads/qr-item-system`
   - `~/Desktop/qr-item-system`
   - Or run the script from inside the project directory

### "Node.js version is older than v18"

The script will automatically upgrade Node.js via Homebrew.

### "Build failed"

Common causes:
1. **Missing dependencies**: Run `npm install` again
2. **Environment variables**: Check `.env.local` is created
3. **Node.js version**: Ensure v18+ is installed

### Permission Issues

```bash
chmod +x setupproject.sh
chmod +x start-dev.sh
chmod +x deploy-railway.sh
```

## 🎯 Success Indicators

You'll know setup worked when you see:
```bash
✅ Build successful!
🎉 QR Item Display System is ready!
📍 Project location: /path/to/your/project
```

And you can run:
```bash
./start-dev.sh
# Opens http://localhost:3000
```

## 📱 Testing Your Setup

After successful setup:

1. **Main App**: http://localhost:3000
2. **Admin Panel**: http://localhost:3000/admin
3. **Sample Item**: http://localhost:3000/item/12345

## 🚀 Next Steps

1. **Configure Supabase** with your database credentials
2. **Add your items** via the admin panel
3. **Generate QR codes** for your item URLs
4. **Deploy to production** using `./deploy-railway.sh`

## 📞 Still Having Issues?

If the script still can't find your project:

1. **Check the extraction**: Ensure you fully extracted the downloaded files
2. **Verify contents**: The folder should contain `package.json`, `src/`, and `database/`
3. **Manual navigation**: `cd` directly to your project folder before running the script
4. **Check permissions**: Make sure you can read the files in the directory

The improved script provides detailed error messages and shows exactly where it's looking for your project files.

**Happy coding!** 🚀

