# Environment variables used by the frontend

This document lists the environment variables you can configure for the frontend.

## Vite environment variables

- VITE_API_URL - API base URL used by the frontend (e.g. http://localhost:5001)
- VITE_API_TIMEOUT - API request timeout in milliseconds. If not set, defaults to 30000 (30s). Example: `VITE_API_TIMEOUT=30000`
- VITE_DISABLE_AUTH - (true/false) disable auth flow for local development
- VITE_GOOGLE_CLIENT_ID - Google OAuth client ID

Configuration files
- `.env.development` - local development environment values
- `.env.production` - production build values
- `.env.example` - example file checked into repo with suggested defaults
