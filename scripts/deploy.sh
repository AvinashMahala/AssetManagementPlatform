#!/bin/bash

# Deployment script

set -e

echo "Deploying to production..."

# Example: Push to Docker registry
# docker tag asset-frontend:latest registry.com/asset-frontend:latest
# docker push registry.com/asset-frontend:latest
# Similarly for backend

# Then deploy to server, e.g., using docker-compose or Kubernetes

echo "Deployment complete."