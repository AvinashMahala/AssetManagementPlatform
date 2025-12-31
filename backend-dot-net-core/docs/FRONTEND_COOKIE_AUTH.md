# Frontend: Using HttpOnly cookie-based auth with MyApp API

This short note explains how to use the HttpOnly cookie-based session flow implemented in the API.

## Key points
- The API sets two cookies on successful login:
  - `refreshToken` (HttpOnly, long-lived) — used by the server to issue new tokens
  - `accessToken` (HttpOnly, short-lived) — also set so the browser automatically sends the token with requests
- Cookies are HttpOnly and Secure (when using HTTPS), and `SameSite=None` for cross-origin SPA + API during local dev.
- To allow cookies to be sent from the browser to the API, the frontend must include credentials on requests.

## Axios example
```js
import axios from 'axios';

axios.defaults.baseURL = 'https://localhost:5001'; // your API origin
axios.defaults.withCredentials = true; // IMPORTANT: include cookies

// Login
await axios.post('/api/v1/auth/login', { email, password });
// The server will set HttpOnly cookies; no tokens are stored in localStorage/sessionStorage

// On app startup — get profile or attempt a refresh
try {
  // If access token expired, the API will still see cookies and can authenticate
  // If you want to ensure an access token is available, call refresh-token
  await axios.post('/api/v1/auth/refresh-token'); // cookies included automatically
  const res = await axios.get('/api/v1/auth/profile');
  // Use profile in app state
} catch (err) {
  // not authenticated
}
```

## fetch example
```js
await fetch('https://localhost:5001/api/v1/auth/login', {
  method: 'POST',
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});

// On startup
await fetch('https://localhost:5001/api/v1/auth/refresh-token', { method: 'POST', credentials: 'include' });
```

## Notes & security
- Cookies are HttpOnly => inaccessible to JavaScript (reduces XSS risk).
- Incognito/private windows have separate cookie stores and are cleared on close — matches your requirement.
- Make sure your production deployment uses HTTPS and sets `Secure` on cookies.
- If your SPA and API are cross-origin, keep CORS configured with `.AllowCredentials()` and set `SameSite=None`.

---
If you'd like, I can add a short example page in the SPA that demonstrates login → refresh flow automatically on load.