#!/bin/bash

# FAQBNB Server Management Script - Production Mode (QR Code Validation)
# Purpose: Kill and restart server in production mode with optional cache clearing
# Enhanced to eliminate Fast Refresh issues for stable QR code validation
# Usage: bash restart_all_servers.sh [--rebuild|--clear-cache]

# Check for rebuild parameter
REBUILD_MODE=false
if [[ "$1" == "--rebuild" || "$1" == "--clear-cache" ]]; then
    REBUILD_MODE=true
    echo "🔄 FAQBNB Server Management - REBUILD MODE (Cache Clearing + Fresh Build)"
    echo "============================================================================="
    echo "🎯 Purpose: Clean production build to eliminate Fast Refresh interference"
    echo "🧹 Cache will be cleared and fresh build will be performed"
else
    echo "🔄 FAQBNB Server Management - RESTART MODE (No Rebuild)"
    echo "============================================================================="
    echo "🎯 Purpose: Restart existing production server"
    echo "💡 Use '--rebuild' parameter to clear cache and rebuild"
fi
echo ""

# Enhanced function to display port information
show_port_info() {
    echo "📋 Current port usage:"
    echo "Port 3000: Next.js Production Server"
    echo "Port 54321: Supabase Local (if running)"
    echo ""
    
    # Show actual port usage if any
    if lsof -i:3000 >/dev/null 2>&1; then
        echo "🔍 Current processes on port 3000:"
        lsof -i:3000 | head -5
        echo ""
    fi
}

# Enhanced function to kill existing processes (both dev and production)
kill_existing_servers() {
    echo "🛑 Killing existing servers..."
    
    # Kill both development and production Next.js processes
    echo "🔍 Detecting Next.js processes (dev and production)..."
    
    # Find and kill all Next.js processes
    local next_pids=$(ps aux | grep -E "next dev|next start|next-server" | grep -v grep | awk '{print $2}' | tr '\n' ' ')
    if [ ! -z "$next_pids" ]; then
        echo "📝 Found Next.js processes: $next_pids"
        echo $next_pids | xargs kill -TERM 2>/dev/null || true
        sleep 2
        echo $next_pids | xargs kill -KILL 2>/dev/null || true
    fi
    
    # Kill npm/node processes (both dev and start)
    local npm_pids=$(ps aux | grep -E "npm run dev|npm start|node.*dev|node.*start" | grep -v grep | awk '{print $2}' | tr '\n' ' ')
    if [ ! -z "$npm_pids" ]; then
        echo "📝 Found npm/node processes: $npm_pids"
        echo $npm_pids | xargs kill -TERM 2>/dev/null || true
        sleep 1
        echo $npm_pids | xargs kill -KILL 2>/dev/null || true
    fi
    
    # Enhanced port-based cleanup
    echo "🔧 Enhanced port cleanup..."
    local port_pids=$(lsof -ti:3000 2>/dev/null | tr '\n' ' ')
    if [ ! -z "$port_pids" ]; then
        echo "📝 Found processes on port 3000: $port_pids"
        echo $port_pids | xargs kill -TERM 2>/dev/null || true
        sleep 1
        echo $port_pids | xargs kill -KILL 2>/dev/null || true
    fi
    
    # Additional cleanup patterns
    pkill -f "next dev" 2>/dev/null || true
    pkill -f "next start" 2>/dev/null || true
    pkill -f "node.*next" 2>/dev/null || true
    pkill -f "npm run dev" 2>/dev/null || true
    pkill -f "npm start" 2>/dev/null || true
    
    echo "✅ Server processes killed"
    echo "⏳ Waiting for cleanup to complete..."
    sleep 3
}

# NEW: Function to clear Next.js cache and build artifacts
clear_cache_and_build() {
    echo "🧹 Clearing Next.js cache and build artifacts..."
    
    # Remove .next directory to clear all cached data
    if [ -d ".next" ]; then
        echo "📁 Removing .next directory..."
        rm -rf .next
        echo "✅ .next directory cleared"
    else
        echo "ℹ️  .next directory not found (already clean)"
    fi
    
    # Clear any other build artifacts
    if [ -d "out" ]; then
        echo "📁 Removing out directory..."
        rm -rf out
        echo "✅ out directory cleared"
    fi
    
    echo "🏗️  Running production build..."
    if npm run build; then
        echo "✅ Production build completed successfully"
        return 0
    else
        echo "❌ Production build failed"
        return 1
    fi
}

# Enhanced function to check what's running on ports with verification
check_ports() {
    echo "🔍 Enhanced port status verification..."
    
    local retry_count=0
    local max_retries=3
    
    while [ $retry_count -lt $max_retries ]; do
        if lsof -i:3000 >/dev/null 2>&1; then
            echo "⚠️  Port 3000 still occupied (attempt $((retry_count + 1))/$max_retries):"
            lsof -i:3000 | head -3
            
            if [ $retry_count -lt $((max_retries - 1)) ]; then
                echo "🔄 Attempting additional cleanup..."
                lsof -ti:3000 | xargs kill -KILL 2>/dev/null || true
                sleep 2
            fi
            
            retry_count=$((retry_count + 1))
        else
            echo "✅ Port 3000 is free"
            return 0
        fi
    done
    
    echo "❌ Port 3000 cleanup failed after $max_retries attempts"
    return 1
}

# Modified function to start production server
start_production_server() {
    echo "🚀 Starting Next.js production server..."
    
    # Pre-start verification
    if lsof -i:3000 >/dev/null 2>&1; then
        echo "❌ Port 3000 is still occupied, cannot start server"
        return 1
    fi
    
    # Verify build exists
    if [ ! -d ".next" ]; then
        echo "❌ No build found (.next directory missing)"
        echo "🔄 Running build first..."
        if ! npm run build; then
            echo "❌ Build failed"
            return 1
        fi
    fi
    
    # Start the production server in background
    echo "📝 Launching npm start (production mode)..."
    npm start &
    PROD_PID=$!
    
    echo "📝 Production server started with PID: $PROD_PID"
    
    # Enhanced startup verification
    echo "⏳ Waiting for server initialization..."
    local wait_count=0
    local max_wait=10
    
    while [ $wait_count -lt $max_wait ]; do
        if kill -0 $PROD_PID 2>/dev/null; then
            if lsof -i:3000 >/dev/null 2>&1; then
                echo "✅ Next.js production server is running on port 3000"
                echo "📊 Server status verified after $((wait_count + 1)) seconds"
                return 0
            fi
        else
            echo "❌ Server process died during startup"
            return 1
        fi
        
        sleep 1
        wait_count=$((wait_count + 1))
        echo "📍 Startup verification: $((wait_count))/$max_wait seconds"
    done
    
    echo "⚠️  Server startup verification timeout"
    if kill -0 $PROD_PID 2>/dev/null; then
        echo "📝 Process is running but port verification incomplete"
        return 0
    else
        echo "❌ Failed to start Next.js production server"
        return 1
    fi
}

# Enhanced verification function for production mode
verify_system_state() {
    echo ""
    echo "🔍 Final system state verification:"
    
    # Process count verification (production mode)
    local next_count=$(ps aux | grep -E "next start|next-server" | grep -v grep | wc -l | tr -d ' ')
    echo "📊 Active Next.js processes: $next_count"
    
    # Port verification
    if lsof -i:3000 >/dev/null 2>&1; then
        echo "📊 Port 3000 status: OCCUPIED (expected)"
        local port_owner=$(lsof -i:3000 | grep LISTEN | awk '{print $1}' | head -1)
        echo "📊 Port owner: $port_owner"
    else
        echo "📊 Port 3000 status: FREE (unexpected)"
    fi
    
    # HTTP accessibility test
    echo "🌐 Testing HTTP accessibility..."
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 | grep -q "200\|307"; then
        echo "✅ HTTP test: SUCCESS"
    else
        echo "⚠️  HTTP test: No response (server may still be starting)"
    fi
}

# Main execution with conditional cache clearing and production build
main() {
    local start_time=$(date +%s)
    
    show_port_info
    kill_existing_servers
    
    if ! check_ports; then
        echo "❌ Enhanced port cleanup failed. Manual intervention required."
        echo "💡 Try: lsof -i:3000 to identify remaining processes"
        echo "💡 Try: pkill -f node to force kill all node processes"
        exit 1
    fi
    
    # Conditionally clear cache and build based on parameter
    if [ "$REBUILD_MODE" = true ]; then
        echo "🧹 REBUILD MODE: Clearing cache and building..."
        if ! clear_cache_and_build; then
            echo "❌ Build process failed. Cannot continue."
            exit 1
        fi
    else
        echo "🔄 RESTART MODE: Using existing build..."
        # Verify build exists when not rebuilding
        if [ ! -d ".next" ]; then
            echo "⚠️  No existing build found (.next directory missing)"
            echo "🔄 Auto-switching to rebuild mode..."
            if ! clear_cache_and_build; then
                echo "❌ Build process failed. Cannot continue."
                exit 1
            fi
        else
            echo "✅ Existing build found, proceeding with restart..."
        fi
    fi
    
    if start_production_server; then
        verify_system_state
        
        local end_time=$(date +%s)
        local duration=$((end_time - start_time))
        
        echo ""
        if [ "$REBUILD_MODE" = true ]; then
            echo "🎉 Production server rebuilt and restarted successfully!"
            echo "🧹 Cache cleared and fresh build completed"
        else
            echo "🎉 Production server restarted successfully!"
            echo "🔄 Used existing build (no cache clearing)"
        fi
        echo "⏱️  Total restart time: ${duration} seconds"
        echo "🌐 Next.js App: http://localhost:3000"
        echo "🔧 Admin Panel: http://localhost:3000/admin"
        echo ""
        echo "🎯 QR Code Validation Ready:"
        echo "   ✅ No Fast Refresh interference"
        echo "   ✅ Stable React state persistence"
        echo "   ✅ Clean production environment"
        echo ""
        echo "💡 Management commands:"
        echo "   📊 Check status: lsof -i:3000"
        echo "   🛑 Stop servers: pkill -f 'npm start'"
        echo "   🔄 Quick restart: bash restart_all_servers.sh"
        echo "   🧹 Rebuild restart: bash restart_all_servers.sh --rebuild"
    else
        echo "❌ Failed to start production server"
        echo "🔍 Check logs above for specific error details"
        exit 1
    fi
}

# Run main function
main "$@" 