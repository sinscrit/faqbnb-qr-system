#!/bin/bash

# QR Item Display System - Mac Setup Script
# This script sets up the project on macOS with all dependencies

set -e  # Exit on any error

echo "🚀 QR Item Display System - Mac Setup"
echo "======================================"

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

# Check if running on macOS
if [[ "$OSTYPE" != "darwin"* ]]; then
    print_error "This script is designed for macOS only!"
    exit 1
fi

print_status "Starting setup process..."

# Function to find project directory
find_project_directory() {
    local current_dir="$(pwd)"
    local search_dirs=("$current_dir" "$current_dir/qr-item-system" "$current_dir/qr-item-display")
    
    # Also check common download locations
    if [[ -d "$HOME/Downloads" ]]; then
        search_dirs+=("$HOME/Downloads/qr-item-system" "$HOME/Downloads/qr-item-display")
        # Look for any directory with package.json in Downloads
        for dir in "$HOME/Downloads"/*; do
            if [[ -d "$dir" && -f "$dir/package.json" ]]; then
                search_dirs+=("$dir")
            fi
        done
    fi
    
    # Check Desktop as well
    if [[ -d "$HOME/Desktop" ]]; then
        search_dirs+=("$HOME/Desktop/qr-item-system" "$HOME/Desktop/qr-item-display")
        for dir in "$HOME/Desktop"/*; do
            if [[ -d "$dir" && -f "$dir/package.json" ]]; then
                search_dirs+=("$dir")
            fi
        done
    fi
    
    print_status "Looking for project directory..."
    for dir in "${search_dirs[@]}"; do
        if [[ -f "$dir/package.json" ]]; then
            # Verify it's our project by checking for specific files
            if [[ -f "$dir/src/app/page.tsx" || -f "$dir/database/schema.sql" ]]; then
                echo "$dir"
                return 0
            fi
        fi
    done
    
    return 1
}

# Try to find the project directory
PROJECT_DIR=""
if [[ -f "package.json" ]]; then
    # We're already in the right directory
    PROJECT_DIR="$(pwd)"
    print_success "Found project in current directory: $PROJECT_DIR"
else
    # Try to find the project directory
    if PROJECT_DIR=$(find_project_directory); then
        print_success "Found project directory: $PROJECT_DIR"
        print_status "Changing to project directory..."
        cd "$PROJECT_DIR"
    else
        print_error "Could not find the QR Item Display project directory!"
        echo ""
        echo "Please ensure you have:"
        echo "1. Downloaded and extracted the project files"
        echo "2. The project contains package.json and src/ directory"
        echo "3. Run this script from the project directory, or"
        echo "4. Place the project in ~/Downloads/ or ~/Desktop/"
        echo ""
        echo "Current directory: $(pwd)"
        echo "Looking for: package.json, src/app/page.tsx, database/schema.sql"
        echo ""
        
        # List potential directories
        echo "Directories checked:"
        echo "- $(pwd)"
        echo "- $(pwd)/qr-item-system"
        echo "- $(pwd)/qr-item-display"
        if [[ -d "$HOME/Downloads" ]]; then
            echo "- $HOME/Downloads/qr-item-*"
        fi
        if [[ -d "$HOME/Desktop" ]]; then
            echo "- $HOME/Desktop/qr-item-*"
        fi
        
        exit 1
    fi
fi

# Check if Homebrew is installed
if ! command -v brew &> /dev/null; then
    print_warning "Homebrew not found. Installing Homebrew..."
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    
    # Add Homebrew to PATH for Apple Silicon Macs
    if [[ $(uname -m) == "arm64" ]]; then
        echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
        eval "$(/opt/homebrew/bin/brew shellenv)"
    fi
else
    print_success "Homebrew is already installed"
fi

# Update Homebrew
print_status "Updating Homebrew..."
brew update

# Install Node.js if not present
if ! command -v node &> /dev/null; then
    print_status "Installing Node.js..."
    brew install node
else
    NODE_VERSION=$(node --version)
    print_success "Node.js is already installed ($NODE_VERSION)"
    
    # Check if Node.js version is recent enough (v18+)
    NODE_MAJOR=$(echo $NODE_VERSION | cut -d'.' -f1 | sed 's/v//')
    if [[ $NODE_MAJOR -lt 18 ]]; then
        print_warning "Node.js version is older than v18. Upgrading..."
        brew upgrade node
    fi
fi

# Install npm if not present (usually comes with Node.js)
if ! command -v npm &> /dev/null; then
    print_error "npm not found. Please install Node.js manually."
    exit 1
else
    NPM_VERSION=$(npm --version)
    print_success "npm is available ($NPM_VERSION)"
fi

# Install Git if not present
if ! command -v git &> /dev/null; then
    print_status "Installing Git..."
    brew install git
else
    GIT_VERSION=$(git --version)
    print_success "Git is already installed ($GIT_VERSION)"
fi

# Verify we're in the correct project directory
if [[ ! -f "package.json" ]]; then
    print_error "Still cannot find package.json. Something went wrong with directory detection."
    print_error "Current directory: $(pwd)"
    exit 1
fi

print_success "Confirmed: In correct project directory ($(pwd))"

# Check if this is the right project by looking for specific files
if [[ ! -d "src" ]]; then
    print_error "This doesn't appear to be the QR Item Display project (no src/ directory found)"
    exit 1
fi

print_success "Verified: This is the QR Item Display project"

# Install project dependencies
print_status "Installing project dependencies..."
npm install

# Create environment file from example
if [[ ! -f ".env.local" ]]; then
    if [[ -f ".env.example" ]]; then
        print_status "Creating .env.local from .env.example..."
        cp .env.example .env.local
        print_warning "Please edit .env.local with your actual environment variables"
    else
        print_status "Creating default .env.local file..."
        cat > .env.local << 'EOF'
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# NextAuth Configuration (if using authentication)
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=http://localhost:3000

# Development
NODE_ENV=development
EOF
        print_warning "Created .env.local - Please update with your actual values"
    fi
else
    print_success ".env.local already exists"
fi

# Restore API routes for full functionality (if they were moved for static export)
if [[ -d "src/app/api-backup" ]]; then
    print_status "Restoring API routes for full functionality..."
    if [[ -d "src/app/api" ]]; then
        rm -rf src/app/api
    fi
    mv src/app/api-backup src/app/api
    print_success "API routes restored"
elif [[ ! -d "src/app/api" ]]; then
    print_warning "No API routes found. You may need to restore them manually for full functionality."
fi

# Restore dynamic pages (if they were replaced for static export)
if [[ -f "src/app/item/[publicId]/page-dynamic.tsx" ]]; then
    print_status "Restoring dynamic item pages..."
    if [[ -f "src/app/item/[publicId]/page.tsx" ]]; then
        mv src/app/item/[publicId]/page.tsx src/app/item/[publicId]/page-static.tsx
    fi
    mv src/app/item/[publicId]/page-dynamic.tsx src/app/item/[publicId]/page.tsx
    print_success "Dynamic item pages restored"
fi

if [[ -f "src/app/admin/page-dynamic.tsx" ]]; then
    print_status "Restoring dynamic admin pages..."
    if [[ -f "src/app/admin/page.tsx" ]]; then
        mv src/app/admin/page.tsx src/app/admin/page-static.tsx
    fi
    mv src/app/admin/page-dynamic.tsx src/app/admin/page.tsx
    print_success "Dynamic admin pages restored"
fi

# Restore admin subdirectories if they exist in backup
if [[ -d "src/app/admin-backup" ]]; then
    print_status "Restoring admin subdirectories..."
    cp -r src/app/admin-backup/* src/app/admin/ 2>/dev/null || true
    rm -rf src/app/admin-backup
    print_success "Admin subdirectories restored"
fi

# Update next.config.js for development (remove static export)
print_status "Configuring Next.js for development..."
cat > next.config.js << 'EOF'
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove static export for development
  // output: 'export',
  images: {
    unoptimized: true
  },
  // Enable server-side features for development
  experimental: {
    serverActions: true,
  }
}

module.exports = nextConfig
EOF

# Build the project to check for errors
print_status "Building project to verify setup..."
npm run build

if [[ $? -eq 0 ]]; then
    print_success "Build successful!"
else
    print_error "Build failed. Please check the errors above."
    exit 1
fi

# Create development scripts
print_status "Creating development helper scripts..."

# Create start script
cat > start-dev.sh << 'EOF'
#!/bin/bash
echo "🚀 Starting QR Item Display System in development mode..."
echo "📱 The app will be available at: http://localhost:3000"
echo "🛠️  Admin panel will be at: http://localhost:3000/admin"
echo ""
npm run dev
EOF
chmod +x start-dev.sh

# Create build script
cat > build-project.sh << 'EOF'
#!/bin/bash
echo "🔨 Building QR Item Display System for production..."
npm run build
if [[ $? -eq 0 ]]; then
    echo "✅ Build successful!"
    echo "🚀 You can now deploy using the deploy-railway.sh script"
else
    echo "❌ Build failed. Please fix the errors above."
    exit 1
fi
EOF
chmod +x build-project.sh

print_success "Setup completed successfully!"
echo ""
echo "🎉 QR Item Display System is ready!"
echo "======================================"
echo ""
echo "📍 Project location: $(pwd)"
echo ""
echo "📝 Next Steps:"
echo "1. Edit .env.local with your Supabase credentials"
echo "2. Set up your Supabase database using the SQL files in database/"
echo "3. Run './start-dev.sh' to start the development server"
echo "4. Visit http://localhost:3000 to see your app"
echo "5. Visit http://localhost:3000/admin for the admin panel"
echo ""
echo "🚀 For deployment:"
echo "1. Run './build-project.sh' to build for production"
echo "2. Run './deploy-railway.sh' to deploy to Railway"
echo ""
echo "📚 Check README.md for detailed documentation"

# Check if Supabase CLI should be installed
read -p "Do you want to install Supabase CLI for database management? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_status "Installing Supabase CLI..."
    brew install supabase/tap/supabase
    print_success "Supabase CLI installed. Run 'supabase --help' for commands."
fi

print_success "🎊 Setup complete! Happy coding!"

