# Authentication Configuration

## Overview

The Asset Management Platform supports configurable authentication that can be enabled or disabled based on environment variables. This is particularly useful during development and testing.

## Environment Variables

### `DISABLE_AUTH`

Controls whether authentication is required for API endpoints.

- **Values**: `true` or `false`
- **Default**: `false` (authentication enabled)
- **Recommended for Development**: `true`
- **Recommended for Production**: `false`

### Development User Configuration

When `DISABLE_AUTH=true`, the following environment variables configure the default user:

- **`DEV_USER_ID`**: User ID to use (default: `dev-user-id`)
- **`DEV_USER_EMAIL`**: User email to use (default: `dev@example.com`)
- **`DEV_USER_ROLE`**: User role (default: `admin`, options: `admin`, `user`)

## Usage

### Development Mode (Auth Disabled)

```bash
# In your .env file
NODE_ENV=development
DISABLE_AUTH=true
DEV_USER_ID=f40a33a6-8f4c-4a1d-bd26-857920024739
DEV_USER_EMAIL=admin@example.com
DEV_USER_ROLE=admin
```

With this configuration:
- All API endpoints are accessible without authentication tokens
- Requests are automatically attributed to the dev user
- No JWT token validation is performed

### Production Mode (Auth Enabled)

```bash
# In your .env file
NODE_ENV=production
DISABLE_AUTH=false
JWT_SECRET=your-strong-secret-key
JWT_EXPIRES_IN=7d
```

With this configuration:
- All protected endpoints require valid JWT tokens
- Tokens must be included in the `Authorization` header: `Bearer <token>`
- Invalid or missing tokens return 401 Unauthorized

## Implementation Details

### Middleware: `devAuthBypass`

Located in `src/middlewares/authMiddleware.ts`, this middleware:

1. **Checks `DISABLE_AUTH` environment variable**
   - If `true`: Bypasses authentication and sets `req.user` from dev configuration
   - If `false`: Proceeds to token validation

2. **Fallback for Development**
   - If `NODE_ENV=development` and auth is enabled, logs a warning but still bypasses auth
   - This prevents developers from being locked out during local development

3. **Production Behavior**
   - If in production with auth enabled, requires valid JWT token
   - Returns 401 if token is missing or invalid

### Route Protection

All routes use the `devAuthBypass` middleware:

```typescript
router.get('/properties', devAuthBypass, controller.getAll);
```

## Security Considerations

⚠️ **Warning**: Never deploy to production with `DISABLE_AUTH=true`!

### Best Practices

1. **Development**:
   - Use `DISABLE_AUTH=true` for faster iteration
   - Use real user IDs from seeded data for `DEV_USER_ID`

2. **Testing**:
   - Test with both auth enabled and disabled
   - Verify token validation logic works correctly

3. **Production**:
   - Always set `DISABLE_AUTH=false`
   - Use strong `JWT_SECRET` (at least 32 characters)
   - Consider shorter `JWT_EXPIRES_IN` for sensitive operations
   - Rotate JWT secrets periodically

4. **CI/CD**:
   - Use different `.env` files for each environment
   - Never commit `.env` files to version control
   - Use secrets management for production credentials

## Switching Between Modes

### Enable Authentication

```bash
# Update .env
DISABLE_AUTH=false

# Restart server
npm run dev
```

### Disable Authentication

```bash
# Update .env
DISABLE_AUTH=true

# Restart server
npm run dev
```

## Troubleshooting

### Issue: 401 Unauthorized in Development

**Solution**: Check your `.env` file:
```bash
DISABLE_AUTH=true
NODE_ENV=development
```

### Issue: Authentication not working in production

**Solution**: Verify production environment variables:
```bash
DISABLE_AUTH=false
JWT_SECRET=<your-production-secret>
NODE_ENV=production
```

### Issue: Dev user not being set

**Solution**: Check console for warnings and verify:
```bash
DEV_USER_ID=<valid-user-id>
DEV_USER_EMAIL=<email>
DEV_USER_ROLE=admin
```

## Future Enhancements

Potential improvements to the authentication system:

- [ ] Role-based access control (RBAC) middleware
- [ ] API key authentication for service-to-service calls
- [ ] OAuth2/OIDC integration
- [ ] Refresh token rotation
- [ ] Multi-factor authentication (MFA)
- [ ] Session management and revocation
