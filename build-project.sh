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
