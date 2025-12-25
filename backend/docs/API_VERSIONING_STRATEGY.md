# API Versioning Strategy

**Status**: ✅ Implemented (v1)

## Overview

As the Property Management Platform evolves, maintaining backward compatibility while introducing new features and changes is crucial. This document outlines the strategy for API versioning to ensure a stable and predictable experience for API consumers (frontend, mobile apps, third-party integrations).

## Selected Strategy: URI Path Versioning

We have chosen **URI Path Versioning** (e.g., `/api/v1/resource`) as our primary versioning strategy.

### Why URI Versioning?

1.  **Explicitness**: The version is clearly visible in the URL, making it easy to understand which version is being accessed.
2.  **Cacheability**: Different versions are treated as different resources by caches/proxies.
3.  **Developer Experience**: Easy to test via browser, curl, or Postman without modifying headers.
4.  **Framework Support**: Native support in Express.js via Routers.

## Implementation Plan

### 1. URL Structure

Current:
```
GET /api/properties
```

Proposed (v1):
```
GET /api/v1/properties
```

### 2. Code Organization

#### Phase 1: Global Router (Immediate)
We will introduce a versioned router in `server.ts` that wraps all current feature routes.

```typescript
// server.ts
const v1Router = express.Router();

// Mount features to v1 router
v1Router.use('/properties', PropertyModule.create(...));
v1Router.use('/auth', new AuthModule(...).router);
// ... other modules

// Mount v1 router to app
app.use('/api/v1', v1Router);
```

#### Phase 2: Feature-Level Versioning (Future)
When a specific feature requires breaking changes (e.g., `properties`), we can introduce a v2 implementation alongside v1 within the feature module.

```
src/features/properties/property/
├── api/
│   ├── v1/
│   │   ├── PropertyController.ts
│   │   └── property.routes.ts
│   └── v2/
│       ├── PropertyController.ts
│       └── property.routes.ts
```

### 3. Breaking Changes Policy

A new version (v2, v3) is required when:
- Removing or renaming a path.
- Removing or renaming a response field.
- Changing the data type of a response field.
- Making an optional parameter mandatory.

Non-breaking changes (allowed in v1):
- Adding new endpoints.
- Adding new optional parameters.
- Adding new fields to responses.

## Migration Roadmap

1.  **Refactor `server.ts`**: Group all current routes under a `v1Router`.
2.  **Update Frontend**: Update the base API URL in the frontend configuration to include `/v1`.
3.  **Documentation**: Update Swagger/OpenAPI docs to reflect the `/api/v1` base path.
4.  **Deprecation**: If we maintain `/api` (legacy) for a transition period, add a `Warning` header to responses.

## Example Request

```http
GET /api/v1/properties/123 HTTP/1.1
Host: api.example.com
Authorization: Bearer <token>
```
