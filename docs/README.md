# Asset Management Platform - API Documentation

[![Swagger](https://img.shields.io/badge/Swagger-85EA2D?style=for-the-badge&logo=swagger&logoColor=black)](https://swagger.io/)
[![OpenAPI](https://img.shields.io/badge/OpenAPI-3.0.0-blue?style=for-the-badge)](https://www.openapis.org/)

Comprehensive API documentation for the Asset Management Platform backend. The API is built with Express.js, TypeScript, and follows RESTful conventions with automatic Swagger documentation.

## 🌐 Live Documentation

**Swagger UI**: http://localhost:5000/api-docs

The interactive API documentation provides:
- Live API testing interface
- Request/response examples
- Schema definitions
- Authentication details

## 📋 API Overview

### Base URL
```
Production:  https://your-domain.com
Development: http://localhost:5000
```

### Response Format
All API responses follow a consistent format:

**Success Response:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional success message"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": { ... }
  }
}
```

### Common HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `422` - Unprocessable Entity
- `500` - Internal Server Error

## 🔐 Authentication

### JWT Token Authentication (Planned)
```bash
# Include in request headers
Authorization: Bearer <jwt-token>
```

### Login Endpoint
```http
POST /api/users/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "username": "john.doe",
      "email": "user@example.com"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

## 📊 Assets API

### List Assets
Get all assets with optional filtering and pagination.

```http
GET /api/assets?page=1&limit=10&search=laptop
```

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10, max: 100)
- `search` (string): Search in name and description
- `sortBy` (string): Sort field (name, value, createdAt)
- `sortOrder` (string): Sort order (asc, desc)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "MacBook Pro 16\"",
      "description": "Developer laptop",
      "value": 2499.99,
      "location": "Office A",
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1
  }
}
```

### Get Asset by ID
```http
GET /api/assets/1
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "MacBook Pro 16\"",
    "description": "Developer laptop",
    "value": 2499.99,
    "location": "Office A",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

### Create Asset
```http
POST /api/assets
Content-Type: application/json
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "Dell XPS 13",
  "description": "Ultrabook for development",
  "value": 1299.99,
  "location": "Remote Office"
}
```

**Validation Rules:**
- `name`: Required, 1-100 characters, unique
- `description`: Optional, max 500 characters
- `value`: Required, positive number
- `location`: Optional, max 100 characters

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": 2,
    "name": "Dell XPS 13",
    "description": "Ultrabook for development",
    "value": 1299.99,
    "location": "Remote Office",
    "createdAt": "2024-01-15T11:00:00Z",
    "updatedAt": "2024-01-15T11:00:00Z"
  }
}
```

### Update Asset
```http
PUT /api/assets/1
Content-Type: application/json
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "MacBook Pro 16\" (Updated)",
  "description": "Senior developer laptop",
  "value": 2399.99,
  "location": "Office B"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "MacBook Pro 16\" (Updated)",
    "description": "Senior developer laptop",
    "value": 2399.99,
    "location": "Office B",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T12:00:00Z"
  }
}
```

### Delete Asset
```http
DELETE /api/assets/1
Authorization: Bearer <token>
```

**Response (204):**
```json
{
  "success": true,
  "message": "Asset deleted successfully"
}
```

## 👥 Users API

### Register User
```http
POST /api/users/register
Content-Type: application/json
```

**Request Body:**
```json
{
  "username": "john.doe",
  "email": "john.doe@example.com",
  "password": "SecurePass123!"
}
```

**Validation Rules:**
- `username`: Required, 3-50 characters, alphanumeric + underscore/hyphen
- `email`: Required, valid email format, unique
- `password`: Required, min 8 characters, must contain uppercase, lowercase, number

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "username": "john.doe",
    "email": "john.doe@example.com",
    "createdAt": "2024-01-15T10:00:00Z"
  },
  "message": "User registered successfully"
}
```

### Login User
```http
POST /api/users/login
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "john.doe@example.com",
  "password": "SecurePass123!"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "username": "john.doe",
      "email": "john.doe@example.com"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Get User Profile (Planned)
```http
GET /api/users/profile
Authorization: Bearer <token>
```

## 🏥 Health Check

### System Health
```http
GET /health
```

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2024-01-15T10:00:00Z",
    "uptime": 3600,
    "database": "connected"
  }
}
```

## 📝 Data Models

### Asset
```typescript
interface Asset {
  id: number;
  name: string;           // 1-100 characters
  description?: string;   // Max 500 characters
  value: number;          // Positive decimal
  location?: string;      // Max 100 characters
  createdAt: Date;
  updatedAt: Date;
}

interface AssetInput {
  name: string;
  description?: string;
  value: number;
  location?: string;
}
```

### User
```typescript
interface User {
  id: number;
  username: string;       // 3-50 characters
  email: string;          // Valid email, unique
  passwordHash: string;   // Hashed password
  createdAt: Date;
  updatedAt: Date;
}

interface UserInput {
  username: string;
  email: string;
  password: string;
}

interface UserResponse {
  id: number;
  username: string;
  email: string;
  createdAt: Date;
}
```

## ⚠️ Error Handling

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | Input validation failed |
| `UNAUTHORIZED` | 401 | Authentication required |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `CONFLICT` | 409 | Resource already exists |
| `UNPROCESSABLE_ENTITY` | 422 | Business logic violation |
| `INTERNAL_ERROR` | 500 | Server error |

### Error Response Examples

**Validation Error:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "name": "Name is required",
      "value": "Value must be positive"
    }
  }
}
```

**Not Found:**
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Asset with ID 999 not found"
  }
}
```

**Conflict:**
```json
{
  "success": false,
  "error": {
    "code": "CONFLICT",
    "message": "Asset with this name already exists"
  }
}
```

## 🔒 Security

### Input Validation
- All inputs are validated using Joi schemas
- SQL injection prevention with parameterized queries
- XSS protection with input sanitization

### Authentication & Authorization
- JWT tokens for session management
- Password hashing with bcrypt (12 rounds)
- CORS configuration for cross-origin requests
- Helmet.js for security headers

### Rate Limiting (Planned)
- API rate limiting to prevent abuse
- Different limits for authenticated vs anonymous users

## 📊 API Rate Limits

| Endpoint | Limit | Window |
|----------|-------|--------|
| All endpoints | 1000 requests | 15 minutes |
| Auth endpoints | 10 requests | 15 minutes |

## 🧪 Testing the API

### Using Swagger UI
1. Start the backend server: `npm run dev`
2. Open http://localhost:5000/api-docs
3. Use the interactive interface to test endpoints

### Using cURL

**Create Asset:**
```bash
curl -X POST http://localhost:5000/api/assets \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Asset",
    "description": "Testing API",
    "value": 100.00,
    "location": "Test Lab"
  }'
```

**Get Assets:**
```bash
curl http://localhost:5000/api/assets
```

### Using Postman/Insomnia
Import the OpenAPI specification from `/api-docs` endpoint.

## 🔄 API Versioning

The API uses URL versioning (planned for future versions):
```
/api/v1/assets
/api/v2/assets
```

## 📈 Performance

### Response Times
- Average: < 100ms for simple queries
- 95th percentile: < 500ms for complex operations
- Database queries optimized with indexes

### Caching (Planned)
- Redis caching for frequently accessed data
- CDN for static assets
- Database query result caching

## 🔮 Future Endpoints

### Advanced Asset Management
- `GET /api/assets/search` - Advanced search with filters
- `POST /api/assets/bulk` - Bulk operations
- `GET /api/assets/categories` - Asset categories
- `POST /api/assets/{id}/transfer` - Asset transfer tracking

### Reporting
- `GET /api/reports/assets` - Asset reports
- `GET /api/reports/depreciation` - Depreciation reports
- `GET /api/reports/audit` - Audit logs

### File Management
- `POST /api/assets/{id}/images` - Upload asset images
- `GET /api/assets/{id}/documents` - Asset documents

## 📚 Related Documentation

- [Backend Architecture](../backend/README.md)
- [Database Schema](../backend/README.md#database-schema)
- [Testing Guide](../tests/README.md)
- [Deployment Guide](../README.md#deployment)

## 🤝 Support

For API support or questions:
- Check the Swagger documentation first
- Review error messages for guidance
- Create an issue for bugs or feature requests

---

**Last Updated:** November 2025
**API Version:** 1.0.0