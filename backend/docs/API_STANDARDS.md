# API Development Standards

This document outlines the standards and patterns for developing APIs in the Asset Management Platform backend.

## 1. Configuration

We use a typed configuration system to ensure all environment variables are present and correctly typed.

### Adding a new Environment Variable

1.  Open `src/shared/config/env.ts`.
2.  Add the variable to the `envSchema` Zod object.
3.  Add the variable to the exported `config` object.

```typescript
// src/shared/config/env.ts

const envSchema = z.object({
  // ... existing vars
  NEW_FEATURE_ENABLED: z.string().transform((val) => val === 'true').default('false'),
});

export const config = {
  // ... existing config
  features: {
    newFeature: _env.data.NEW_FEATURE_ENABLED,
  },
};
```

### Usage

Always import `config` instead of using `process.env` directly.

```typescript
import { config } from '@/shared/config/env';

if (config.features.newFeature) {
  // ...
}
```

---

## 2. Input Validation

We use **Zod** for schema validation and a standardized middleware to enforce it.

### Creating a Validation Schema

Create a `.validation.ts` file in your feature's `api` folder.

```typescript
// src/features/my-feature/api/my-feature.validation.ts
import { z } from 'zod';

export const createItemSchema = z.object({
  body: z.object({
    name: z.string().min(3),
    email: z.string().email(),
    quantity: z.number().min(1),
  }),
});
```

### Applying Validation Middleware

Use `validateZodRequest` in your route definitions.

```typescript
// src/features/my-feature/api/my-feature.routes.ts
import { validateZodRequest } from '@/shared/middleware/validationMiddleware';
import { createItemSchema } from './my-feature.validation';

router.post('/', validateZodRequest(createItemSchema), controller.create);
```

**Note**: The middleware automatically handles `ZodError` and returns a standard 400 Bad Request response with a list of errors.

---

## 3. Rate Limiting

We use `express-rate-limit` to protect the API from abuse.

### Global Limiter

A global rate limiter is applied to all routes by default (configured in `.env`).

### Custom Limiters

For sensitive endpoints (like login, password reset, or file uploads), use specific limiters.

```typescript
// src/features/auth/auth/auth.module.ts
import { authLimiter } from '@/shared/middleware/rateLimitMiddleware';

// Apply strict limits (e.g., 5 attempts per 15 mins)
router.post('/login', authLimiter, controller.login);
```

### Creating New Limiters

You can create custom limiters using the factory function:

```typescript
import { createRateLimiter } from '@/shared/middleware/rateLimitMiddleware';

const myLimiter = createRateLimiter(
  60 * 1000, // 1 minute window
  10,        // 10 requests max
  'Too many requests' // Custom message
);

router.get('/resource', myLimiter, controller.getResource);
```

---

## 4. Error Handling

The application uses a centralized error handling mechanism.

- **Validation Errors**: Automatically handled by `validateZodRequest`.
- **Business Logic Errors**: Throw standard `Error` or custom AppErrors (to be implemented).
- **Unexpected Errors**: Caught by the global error handler in `server.ts`.

Always ensure your async controller methods catch errors and pass them to `next(error)` or use a wrapper.
