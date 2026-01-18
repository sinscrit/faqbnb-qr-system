#!/bin/bash

# FAQBNB Server Management Script
# Purpose: Kill and restart all development servers for the project

echo "🔄 FAQBNB Server Management - Restart All Servers"
echo "================================================="

# Function to display port information
show_port_info() {
    echo "📋 Current port usage:"
    echo "Port 3000: Next.js Development Server"
    echo "Port 54321: Supabase Local (if running)"
    echo ""
}

# Function to kill existing processes
kill_existing_servers() {
    echo "🛑 Killing existing servers..."
    
    # Kill Next.js dev server
    echo "Killing Next.js server on port 3000..."
    pkill -f "next dev" 2>/dev/null || true
    pkill -f "node.*next" 2>/dev/null || true
    
    # Kill any other node processes that might be development servers
    pkill -f "npm run dev" 2>/dev/null || true
    
    # Kill processes on port 3000
    lsof -ti:3000 | xargs kill -9 2>/dev/null || true
    
    echo "✅ Server processes killed"
    sleep 2
}

# Function to check what's running on ports
check_ports() {
    echo "🔍 Checking port status..."
    
    if lsof -i:3000 >/dev/null 2>&1; then
        echo "❌ Port 3000 is still occupied:"
        lsof -i:3000
        return 1
    else
        echo "✅ Port 3000 is free"
    fi
    
    return 0
}

# Function to start development server
start_dev_server() {
    echo "🚀 Starting Next.js development server..."
    
    # Start the development server in background
    npm run dev &
    DEV_PID=$!
    
    echo "📝 Development server started with PID: $DEV_PID"
    
    # Wait a moment for server to start
    sleep 3
    
    # Check if server started successfully
    if kill -0 $DEV_PID 2>/dev/null; then
        echo "✅ Next.js server is running on port 3000"
        return 0
    else
        echo "❌ Failed to start Next.js server"
        return 1
    fi
}

# Main execution
main() {
    show_port_info
    kill_existing_servers
    
    if ! check_ports; then
        echo "❌ Ports are still occupied. Cannot start servers."
        exit 1
    fi
    
    if start_dev_server; then
        echo ""
        echo "🎉 All servers restarted successfully!"
        echo "🌐 Next.js App: http://localhost:3000"
        echo "🔧 Admin Panel: http://localhost:3000/admin"
        echo ""
        echo "💡 To stop servers: pkill -f 'next dev'"
    else
        echo "❌ Failed to start development servers"
        exit 1
    fi
}

# Run main function
main 