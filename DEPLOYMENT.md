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
# Optional hardening: server-side pepper used to hash refresh tokens. Rotating this will invalidate existing refresh tokens.
Auth:RefreshTokenPepper=<a-random-secret>
# Gate whether the server returns the refresh token in the JSON response body (dev/testing only)
Auth:ExposeRefreshTokenInBody=true  # set to false in production

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

### Auth cookie & CORS checklist (important for cookie-based refresh)
- Ensure the frontend origin(s) are present in `CORS_ORIGIN` (see `backend/server.ts`).
- Use HTTPS in production and set `CookieOptions.Secure = true` (the backend currently sets `Secure = Request.IsHttps`).
- Use `SameSite=None` only for cross-site flows and when serving over HTTPS; prefer `Lax` or `Strict` when possible.
- Set a proper cookie `Domain` if your frontend and backend share a parent domain (e.g., `.example.com`).
- Ensure browser client code uses `fetch`/XHR with `credentials: 'include'` (the frontend `apiClient` and Swagger custom JS already set this in dev).
- Verify preflight requests succeed (OPTIONS) and that `Access-Control-Allow-Credentials` is enabled.

### Auth:RefreshTokenPepper (operational note)
- The server supports an optional `Auth:RefreshTokenPepper` configuration value used by `RefreshTokenHasher` to harden stored refresh token hashes.
- If set, the pepper must be kept secret (like other secrets). Rotating the pepper will invalidate existing refresh tokens and force re-authentication for users.
- Recommended: set a pepper in production and rotate carefully with a grace window; document the rotation process in your runbook.

### Testing cookie-based refresh in Swagger UI
- Swagger UI is configured to send credentials via `swagger-custom.js` (sets `req.credentials = 'include'`).
- To test cookie-based refresh with Swagger:
  1. POST `/api/v1/auth/login` with credentials; backend sets `refreshToken` as an HttpOnly cookie.
  2. Keep the browser session; call POST `/api/v1/auth/refresh-token` without providing a body — the server will read the cookie and issue new tokens.
  3. If you need the server to return the refresh token in the JSON body (for tooling), enable `Auth:ExposeRefreshTokenInBody=true` in development only; do not enable in production unless you understand the security implications.

### Rate-limiting & Alerts (recommended)
- Recommended per-route policy for refresh endpoint (example): `POST:/api/v1/auth/refresh-token` — Limit=10, WindowSeconds=60, BurstCapacity=2, ApplyTo=IP
- Example Prometheus alert rules (add to your Prometheus recording/alert rules):

```yaml
- alert: AuthRefreshHighFailureRate
  expr: increase(auth_refresh_failed_total[5m]) > 20
  for: 2m
  labels:
    severity: warning
  annotations:
    summary: "High refresh failure rate detected"
    description: "{{ $labels.instance }}: {{ $value }} failures in the last 5 minutes"

- alert: AuthRefreshAnomalySpike
  expr: increase(auth_refresh_anomaly_total[5m]) > 0
  for: 1m
  labels:
    severity: critical
  annotations:
    summary: "Anomalous refresh activity detected"
    description: "Refresh failure anomaly triggered - investigate possible abuse or credential stuffing"

- alert: AuthRefreshRateLimitedSpikes
  expr: increase(auth_refresh_rate_limited_total[5m]) > 50
  for: 2m
  labels:
    severity: warning
  annotations:
    summary: "Refresh endpoint rate-limit spike"
    description: "The refresh endpoint is being rate limited frequently; review traffic patterns and CSRF/cookie usage"
```

- Grafana: add a dashboard panel showing `rate(auth_refresh_failed_total[5m])`, `increase(auth_refresh_rate_limited_total[5m])`, and `increase(refresh_token_reuse_total[5m])` to monitor trends.
- Prometheus scrape example (add to prometheus.yml):

```yaml
scrape_configs:
  - job_name: 'myapp-backend'
    static_configs:
      - targets: ['your-backend-host:5001']
    metrics_path: '/metrics'
```

- Runbook: on alert, block offending IP(s), revoke affected sessions, check logs for reuse events and rotate secrets if necessary.


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