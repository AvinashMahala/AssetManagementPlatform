# Multi-stage Dockerfile for building and serving the Asset Management Platform frontend
# This Dockerfile uses a two-stage build process: build stage for compilation and nginx stage for serving

# Build stage: Compile the React application
FROM node:18-alpine as build

# Set working directory inside the container
WORKDIR /app

# Copy package files first for better caching of dependencies
# copy package.json and yarn.lock (if present)
COPY package.json yarn.lock* ./

# Install dependencies using yarn if yarn.lock exists, otherwise use npm
RUN if [ -f yarn.lock ]; then yarn install --frozen-lockfile; else npm install; fi

# Copy the rest of the application source code
COPY . .

# Build the application using yarn or npm
RUN if [ -f yarn.lock ]; then yarn build; else npm run build; fi

# Production stage: Serve the built application using nginx
FROM nginx:alpine

# Copy built files from the build stage to nginx's default serving directory
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 80 for the web server
EXPOSE 80

# Start nginx in the foreground (required for Docker containers)
CMD ["nginx", "-g", "daemon off;"]