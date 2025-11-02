#!/bin/bash

# Build script for production deployment

set -e

echo "Building frontend..."
cd frontend
npm install
npm run build

echo "Building backend..."
cd ../backend
npm install
npm run build  # If added later

echo "Building Docker images..."
cd ..
docker-compose build

echo "Build complete. Ready for deployment."