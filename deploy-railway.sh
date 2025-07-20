#!/bin/bash

# QR Item Display System - Railway Deployment Script
# This script deploys the project to Railway with all necessary configurations

set -e  # Exit on any error

echo "🚂 QR Item Display System - Railway Deployment"
echo "=============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the project directory
if [[ ! -f "package.json" ]]; then
    print_error "package.json not found. Please run this script from the project root directory."
    exit 1
fi

print_success "Found package.json - in correct directory"

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    print_warning "Railway CLI not found. Installing Railway CLI..."
    
    # Install Railway CLI
    if command -v npm &> /dev/null; then
        npm install -g @railway/cli
    elif command -v brew &> /dev/null; then
        brew install railway
    else
        print_error "Please install npm or Homebrew first, then run this script again."
        exit 1
    fi
    
    print_success "Railway CLI installed successfully"
else
    print_success "Railway CLI is already installed"
fi

# Create Railway configuration files
print_status "Creating Railway configuration files..."

# Create railway.json for deployment configuration
cat > railway.json << 'EOF'
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
EOF

# Create nixpacks.toml for build configuration
cat > nixpacks.toml << 'EOF'
[phases.build]
cmds = ["npm ci", "npm run build"]

[phases.start]
cmd = "npm start"

[variables]
NODE_ENV = "production"
EOF

# Create Dockerfile as backup deployment method
cat > Dockerfile << 'EOF'
# Use the official Node.js 18 image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Expose port
EXPOSE 3000

# Set environment to production
ENV NODE_ENV=production

# Start the application
CMD ["npm", "start"]
EOF

# Create .dockerignore
cat > .dockerignore << 'EOF'
node_modules
.next
.git
.gitignore
README.md
Dockerfile
.dockerignore
npm-debug.log
.nyc_output
.env.local
.env.*.local
EOF

# Update package.json scripts for Railway
print_status "Updating package.json for Railway deployment..."

# Create a temporary package.json with Railway-specific scripts
node -e "
const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));

// Add Railway-specific scripts
pkg.scripts = pkg.scripts || {};
pkg.scripts.start = 'next start';
pkg.scripts.build = 'next build';
pkg.scripts.railway = 'npm run build && npm run start';

// Add engines specification
pkg.engines = {
  node: '>=18.0.0',
  npm: '>=8.0.0'
};

fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
console.log('✅ Updated package.json for Railway');
"

# Create production environment template
print_status "Creating production environment configuration..."
cat > .env.railway << 'EOF'
# Railway Production Environment Variables
# These will be set in Railway dashboard

# Supabase Configuration (REQUIRED)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# NextAuth Configuration (REQUIRED)
NEXTAUTH_SECRET=your-production-secret-key-min-32-chars
NEXTAUTH_URL=https://your-railway-app.railway.app

# Production Settings
NODE_ENV=production
PORT=3000

# Optional: Analytics and Monitoring
# NEXT_PUBLIC_ANALYTICS_ID=your-analytics-id
# SENTRY_DSN=your-sentry-dsn
EOF

# Create Railway deployment guide
cat > RAILWAY_DEPLOYMENT.md << 'EOF'
# Railway Deployment Guide

## Prerequisites

1. **Railway Account**: Sign up at https://railway.app
2. **Supabase Project**: Set up your database at https://supabase.com
3. **Environment Variables**: Have your Supabase credentials ready

## Deployment Steps

### 1. Login to Railway
```bash
railway login
```

### 2. Create New Project
```bash
railway new
```
Choose a project name (e.g., "qr-item-display")

### 3. Deploy the Application
```bash
railway up
```

### 4. Set Environment Variables
Go to your Railway dashboard and set these variables:

**Required Variables:**
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key
- `NEXTAUTH_SECRET`: Random 32+ character string
- `NEXTAUTH_URL`: Your Railway app URL (e.g., https://your-app.railway.app)

**Optional Variables:**
- `NODE_ENV`: production
- `PORT`: 3000

### 5. Set Up Database
1. Go to your Supabase dashboard
2. Run the SQL scripts from the `database/` folder:
   - `schema.sql` (creates tables)
   - `seed-data.sql` (adds sample data)

### 6. Configure Domain (Optional)
1. In Railway dashboard, go to Settings > Domains
2. Add your custom domain
3. Update `NEXTAUTH_URL` environment variable

## Monitoring

- **Logs**: `railway logs`
- **Status**: `railway status`
- **Dashboard**: https://railway.app/dashboard

## Troubleshooting

### Build Failures
- Check Node.js version compatibility
- Verify all dependencies are in package.json
- Check build logs in Railway dashboard

### Runtime Errors
- Verify environment variables are set correctly
- Check Supabase connection
- Review application logs

### Database Issues
- Ensure Supabase tables are created
- Check RLS (Row Level Security) policies
- Verify API keys have correct permissions

## Commands Reference

```bash
# Deploy updates
railway up

# View logs
railway logs

# Open in browser
railway open

# Check status
railway status

# Set environment variable
railway variables set KEY=value

# Connect to database (if using Railway DB)
railway connect
```
EOF

# Build the project to ensure it's ready for deployment
print_status "Building project for production..."
npm run build

if [[ $? -ne 0 ]]; then
    print_error "Build failed. Please fix the errors before deploying."
    exit 1
fi

print_success "Build successful!"

# Check if user wants to deploy now
echo ""
print_status "Railway configuration files created successfully!"
echo ""
echo "📁 Created files:"
echo "  - railway.json (Railway configuration)"
echo "  - nixpacks.toml (Build configuration)"
echo "  - Dockerfile (Alternative deployment method)"
echo "  - .env.railway (Environment variables template)"
echo "  - RAILWAY_DEPLOYMENT.md (Detailed deployment guide)"
echo ""

read -p "Do you want to deploy to Railway now? (y/n): " -n 1 -r
echo

if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_status "Starting Railway deployment..."
    
    # Check if user is logged in to Railway
    if ! railway whoami &> /dev/null; then
        print_status "Please log in to Railway..."
        railway login
    fi
    
    print_success "Logged in to Railway"
    
    # Check if project exists
    if ! railway status &> /dev/null; then
        print_status "Creating new Railway project..."
        railway new
    fi
    
    print_status "Deploying to Railway..."
    railway up
    
    if [[ $? -eq 0 ]]; then
        print_success "Deployment successful!"
        echo ""
        echo "🎉 Your QR Item Display System is now deployed!"
        echo ""
        echo "📝 Next Steps:"
        echo "1. Go to your Railway dashboard: https://railway.app/dashboard"
        echo "2. Set up environment variables (see .env.railway for template)"
        echo "3. Set up your Supabase database using the SQL files"
        echo "4. Test your deployed application"
        echo ""
        
        # Try to get the deployment URL
        if command -v railway &> /dev/null; then
            RAILWAY_URL=$(railway status 2>/dev/null | grep -o 'https://[^[:space:]]*' | head -1)
            if [[ -n "$RAILWAY_URL" ]]; then
                echo "🌐 Your app URL: $RAILWAY_URL"
                echo ""
                read -p "Open your deployed app in browser? (y/n): " -n 1 -r
                echo
                if [[ $REPLY =~ ^[Yy]$ ]]; then
                    open "$RAILWAY_URL" 2>/dev/null || echo "Please visit: $RAILWAY_URL"
                fi
            fi
        fi
    else
        print_error "Deployment failed. Check the errors above and try again."
        echo ""
        echo "💡 Troubleshooting tips:"
        echo "1. Make sure you're logged in: railway login"
        echo "2. Check your project status: railway status"
        echo "3. View deployment logs: railway logs"
        echo "4. See RAILWAY_DEPLOYMENT.md for detailed guide"
    fi
else
    echo ""
    print_success "Configuration files created successfully!"
    echo ""
    echo "📚 To deploy later:"
    echo "1. Run 'railway login' to authenticate"
    echo "2. Run 'railway new' to create a project"
    echo "3. Run 'railway up' to deploy"
    echo "4. Follow RAILWAY_DEPLOYMENT.md for detailed instructions"
    echo ""
    echo "🔧 Don't forget to:"
    echo "1. Set environment variables in Railway dashboard"
    echo "2. Set up your Supabase database"
    echo "3. Configure your custom domain (optional)"
fi

print_success "🚂 Railway deployment script completed!"

