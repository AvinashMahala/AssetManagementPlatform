#!/bin/bash

# GitHub Pages + Free Backend Deployment Test Script
# This script helps test the frontend deployment setup locally

set -e

echo "🚀 Testing GitHub Pages + Free Backend Deployment..."

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Build frontend locally
echo "📦 Building frontend for GitHub Pages..."
cd frontend

# Install dependencies
npm ci

# Build with demo backend URL
export VITE_API_URL="https://your-backend-service.onrender.com/api"
npm run build

echo "✅ Frontend built successfully!"
echo "� Build output in: frontend/dist/"

# Check if build was successful
if [ -d "dist" ] && [ -f "dist/index.html" ]; then
    echo "✅ Build artifacts created successfully"
else
    echo "❌ Build failed - no dist directory found"
    exit 1
fi

cd ..

echo ""
echo "🎉 Frontend build test complete!"
echo ""
echo "📋 Next Steps for Full Deployment:"
echo ""
echo "1. 🌐 GitHub Pages Setup:"
echo "   - Go to Repository Settings → Pages"
echo "   - Set source to 'GitHub Actions'"
echo "   - Push to main branch to trigger deployment"
echo ""
echo "2. 🚀 Backend Deployment (choose one):"
echo "   - Render: https://render.com (750 hours/month free)"
echo "   - Railway: https://railway.app ($5/month credit)"
echo "   - Fly.io: https://fly.io (3 shared CPUs free)"
echo ""
echo "3. � Backend Setup:"
echo "   - Connect your GitHub repository"
echo "   - Set environment variables (see DEPLOYMENT.md)"
echo "   - Deploy the backend service"
echo ""
echo "4. 🔗 Connect Frontend to Backend:"
echo "   - Update VITE_API_URL in GitHub Actions workflow"
echo "   - Re-deploy frontend with correct backend URL"
echo ""
echo "5. 🗄️ Database Setup:"
echo "   - Run initialization scripts after backend deployment"
echo "   - Use the database connection provided by your hosting service"
echo ""
echo "📚 For detailed instructions, see: DEPLOYMENT.md"