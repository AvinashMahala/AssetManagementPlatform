# GitHub Pages + Free Backend Deployment Guide

This guide explains how to deploy the Asset Management Platform using **GitHub Pages** (free) for the frontend and **free backend hosting services** for the API and database.

## 🎯 Free Hosting Strategy

- **Frontend**: GitHub Pages (completely free, unlimited bandwidth)
- **Backend**: Free tier from Render/Railway/Fly.io
- **Database**: PostgreSQL included with backend hosting services

## 🚀 Quick Deploy

### Step 1: Enable GitHub Pages

1. Go to your repository **Settings** → **Pages**
2. Set **Source** to "GitHub Actions"
3. The workflow will automatically deploy your frontend

### Step 2: Set up GitHub Secrets (Optional for demo)

For full functionality, add these secrets in **Settings** → **Secrets and variables** → **Actions**:

```
JWT_SECRET=your_jwt_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here
GOOGLE_CLIENT_ID=your_google_oauth_client_id
```

### Step 3: Deploy Frontend

The frontend deploys automatically on every push to `main`/`master`, or manually:

1. Go to **Actions** tab
2. Select **Deploy to GitHub Pages** workflow
3. Click **Run workflow**
4. Optionally specify your backend URL

### Step 4: Deploy Backend

Choose one of these **free backend hosting services**:

#### 🚀 Option A: Render (Recommended)

1. Sign up at [render.com](https://render.com)
2. Connect your GitHub repository
3. Create a new **Web Service**
4. Set build settings:
   - **Environment**: Docker
   - **Dockerfile Path**: `./backend/Dockerfile`
5. Add environment variables:
   ```
   NODE_ENV=production
   MAIN_DATABASE_URL=<provided-by-render>
   JWT_SECRET=<your-secret>
   JWT_REFRESH_SECRET=<your-secret>
   JWT_ACCESS_TOKEN_EXPIRY=15m
   JWT_REFRESH_TOKEN_EXPIRY=7d
   JWT_ACCESS_TOKEN_EXPIRY_REMEMBER=1h
   JWT_REFRESH_TOKEN_EXPIRY_REMEMBER=30d
   GOOGLE_CLIENT_ID=<your-client-id>
   ```
6. Deploy!

#### 🏃 Option B: Railway

1. Sign up at [railway.app](https://railway.app)
2. Connect your GitHub repository
3. Railway will auto-detect your project
4. Add environment variables (same as above)
5. Deploy!

#### 🪶 Option C: Fly.io

1. Sign up at [fly.io](https://fly.io)
2. Install Fly CLI: `curl -L https://fly.io/install.sh | sh`
3. Run: `fly launch` in your project root
4. Configure with your `backend/Dockerfile`
5. Set secrets: `fly secrets set JWT_SECRET=your-secret`
6. Deploy: `fly deploy`

## 📋 Environment Variables

### Required for Backend

```bash
# Database (provided by hosting service)
MAIN_DATABASE_URL=postgresql://...

# Authentication
JWT_SECRET=your_jwt_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here
JWT_ACCESS_TOKEN_EXPIRY=15m
JWT_REFRESH_TOKEN_EXPIRY=7d
JWT_ACCESS_TOKEN_EXPIRY_REMEMBER=1h
JWT_REFRESH_TOKEN_EXPIRY_REMEMBER=30d

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id_here

# Environment
NODE_ENV=production
```

### Frontend Configuration

The frontend automatically gets the backend URL via the `VITE_API_URL` environment variable during build.

## 🗄️ Database Setup

Most free hosting services provide PostgreSQL databases. For initial data setup:

1. **After backend deployment**, connect to your database
2. **Run the initialization scripts**:
   ```bash
   # Install dependencies
   yarn install

   # Initialize database schema
   cd scripts
   yarn workspace backend init-db

   # Seed with sample data
   python3 simple_db_seed.py
   ```

## 🌐 URLs After Deployment

- **Frontend**: `https://yourusername.github.io/repository-name`
- **Backend**: `https://your-app-name.onrender.com` (or similar)
- **API Docs**: `https://your-app-name.onrender.com/api-docs`

## 🔄 Updating Deployment

### Frontend Updates
- Automatic on push to `main`/`master`
- Or manual trigger with new backend URL

### Backend Updates
- Automatic if connected to GitHub
- Or manual deploy via hosting service dashboard

## 🧪 Testing Deployment

### Local Testing
```bash
# Test the deployment setup locally
./test-deployment.sh
```

### Health Checks
- **Frontend**: Visit your GitHub Pages URL
- **Backend**: Check `https://your-backend-url/api/health`
- **API Docs**: Visit `https://your-backend-url/api-docs`

## 🆓 Free Tier Limits

### GitHub Pages
- ✅ Unlimited bandwidth
- ✅ Custom domains supported
- ✅ HTTPS included

### Backend Services (approximate free limits)
- **Render**: 750 hours/month, auto-sleep
- **Railway**: $5/month credit, then pay-as-you-go
- **Fly.io**: 3 shared CPUs, 256MB RAM free

## 🔧 Troubleshooting

### Frontend Issues
- Check GitHub Pages deployment status in Actions tab
- Verify `VITE_API_URL` is set correctly
- Check browser console for CORS errors

### Backend Issues
- Check hosting service logs
- Verify environment variables are set
- Test database connection

### CORS Issues
- Ensure backend allows your GitHub Pages domain
- Check CORS configuration in `server.ts`

## 💡 Pro Tips

1. **Custom Domain**: Add a custom domain to GitHub Pages for a professional look
2. **Monitoring**: Set up uptime monitoring for your free services
3. **Backup**: Regularly backup your database data
4. **Scaling**: Monitor usage and upgrade plans as needed

## 🎉 You're Done!

Your Asset Management Platform is now live using free hosting! 🎊

- Frontend: GitHub Pages (free)
- Backend: Render/Railway/Fly.io (free tier)
- Database: Included with backend hosting

Enjoy your deployed application! 🚀