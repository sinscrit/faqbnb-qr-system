#!/bin/bash

# FAQBNB Server Management Script - Enhanced Version
# Purpose: Kill and restart all development servers for the project
# Enhanced with better process detection, port cleanup, and verification

echo "🔄 FAQBNB Server Management - Restart All Servers (Enhanced)"
echo "============================================================="

# Enhanced function to display port information
show_port_info() {
    echo "📋 Current port usage:"
    echo "Port 3000: Next.js Development Server"
    echo "Port 54321: Supabase Local (if running)"
    echo ""
    
    # Show actual port usage if any
    if lsof -i:3000 >/dev/null 2>&1; then
        echo "🔍 Current processes on port 3000:"
        lsof -i:3000 | head -5
        echo ""
    fi
}

# Enhanced function to kill existing processes with better detection
kill_existing_servers() {
    echo "🛑 Killing existing servers..."
    
    # Enhanced Node.js process detection
    echo "🔍 Detecting Node.js development processes..."
    
    # Find and kill Next.js processes more specifically
    local next_pids=$(ps aux | grep -i "next dev\|next-server" | grep -v grep | awk '{print $2}' | tr '\n' ' ')
    if [ ! -z "$next_pids" ]; then
        echo "📝 Found Next.js processes: $next_pids"
        echo $next_pids | xargs kill -TERM 2>/dev/null || true
        sleep 2
        echo $next_pids | xargs kill -KILL 2>/dev/null || true
    fi
    
    # Kill npm/node development processes
    local dev_pids=$(ps aux | grep -E "npm run dev|node.*dev" | grep -v grep | awk '{print $2}' | tr '\n' ' ')
    if [ ! -z "$dev_pids" ]; then
        echo "📝 Found npm/node dev processes: $dev_pids"
        echo $dev_pids | xargs kill -TERM 2>/dev/null || true
        sleep 1
        echo $dev_pids | xargs kill -KILL 2>/dev/null || true
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
    pkill -f "node.*next" 2>/dev/null || true
    pkill -f "npm run dev" 2>/dev/null || true
    
    echo "✅ Server processes killed"
    echo "⏳ Waiting for cleanup to complete..."
    sleep 3
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

# Enhanced function to start development server with better verification
start_dev_server() {
    echo "🚀 Starting Next.js development server..."
    
    # Pre-start verification
    if lsof -i:3000 >/dev/null 2>&1; then
        echo "❌ Port 3000 is still occupied, cannot start server"
        return 1
    fi
    
    # Start the development server in background
    echo "📝 Launching npm run dev..."
    npm run dev &
    DEV_PID=$!
    
    echo "📝 Development server started with PID: $DEV_PID"
    
    # Enhanced startup verification
    echo "⏳ Waiting for server initialization..."
    local wait_count=0
    local max_wait=10
    
    while [ $wait_count -lt $max_wait ]; do
        if kill -0 $DEV_PID 2>/dev/null; then
            if lsof -i:3000 >/dev/null 2>&1; then
                echo "✅ Next.js server is running on port 3000"
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
    if kill -0 $DEV_PID 2>/dev/null; then
        echo "📝 Process is running but port verification incomplete"
        return 0
    else
        echo "❌ Failed to start Next.js server"
        return 1
    fi
}

# Enhanced verification function
verify_system_state() {
    echo ""
    echo "🔍 Final system state verification:"
    
    # Process count verification
    local next_count=$(ps aux | grep -E "next dev|next-server" | grep -v grep | wc -l | tr -d ' ')
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

# Main execution with enhanced error handling
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
    
    if start_dev_server; then
        verify_system_state
        
        local end_time=$(date +%s)
        local duration=$((end_time - start_time))
        
        echo ""
        echo "🎉 All servers restarted successfully!"
        echo "⏱️  Total restart time: ${duration} seconds"
        echo "🌐 Next.js App: http://localhost:3000"
        echo "🔧 Admin Panel: http://localhost:3000/admin"
        echo ""
        echo "💡 Management commands:"
        echo "   📊 Check status: lsof -i:3000"
        echo "   🛑 Stop servers: pkill -f 'next dev'"
        echo "   🔄 Restart again: bash restart_all_servers.sh"
    else
        echo "❌ Failed to start development servers"
        echo "🔍 Check logs above for specific error details"
        exit 1
    fi
}

# Run main function
main "$@" 