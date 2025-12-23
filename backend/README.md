# Property Management Platform - Backend

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)

The backend API server for the Property Management Platform, built with Node.js, Express, and TypeScript. Features a clean layered architecture with dependency injection for maximum maintainability and testability, including Google OAuth authentication and JWT-based security.

## 🏗️ Architecture Overview

### Modular Architecture Pattern

The backend follows a **Modular Architecture** (also known as Feature-Sliced Design or Vertical Slice Architecture) combined with **Domain-Driven Design (DDD)** principles. Each feature is a self-contained module with its own API, Core (Business Logic), and Data layers.

```
┌─────────────────────────────────────────────────────────┐
│                     Feature Module                      │
│  (e.g., src/features/properties/property)               │
│                                                         │
│  ┌─────────────┐   ┌─────────────┐   ┌─────────────┐    │
│  │     API     │──▶│    Core     │──▶│    Data     │    │
│  │ (Controller)│   │  (Service)  │   │(Repository) │    │
│  └─────────────┘   └─────────────┘   └─────────────┘    │
└─────────────────────────────────────────────────────────┘
           │                 │                 │
           ▼                 ▼                 ▼
┌─────────────────────────────────────────────────────────┐
│                     Shared Kernel                       │
│      (Utils, Middleware, Config, Infrastructure)        │
└─────────────────────────────────────────────────────────┘
```

### Architecture Layers

Inside each feature module, the code is organized into:

1.  **API** (`api/`): HTTP request/response handling, Controllers, and Routes.
2.  **Core** (`core/`): Business logic, Services, Use Cases, Domain Models, and Interfaces.
3.  **Data** (`data/`): Data access, Repositories, and Data Mappers.

### Dependency Injection

- **Interface Segregation**: Each layer has its own interface contracts.
- **Dependency Inversion**: High-level modules don't depend on low-level modules.
- **Singleton Container**: Centralized dependency management (via `server.ts` or DI container).
- **Testability**: Easy mocking for unit tests.

## 🚀 Features

### Authentication & Security
- 🔐 JWT-based authentication with refresh tokens
- 🔑 Configurable authentication (enable/disable via environment)
- 👤 Google OAuth integration
- 🛡️ Role-based access control (Admin/User)
- 📱 Multi-factor authentication options
- 🔄 Password reset via security questions or recovery codes
- ✉️ Email and phone verification
- 📖 See [Authentication Documentation](./docs/AUTHENTICATION.md) for details

- **Google OAuth Integration** with Google Identity Services API
- **JWT Authentication** with secure token management
- **Password Security** with bcrypt hashing and validation
- **Layered Architecture** with dependency injection
- **PostgreSQL Database** with connection pooling
- **Input Validation** with comprehensive Joi schemas
- **Error Handling** with structured error responses
- **CORS Support** for cross-origin requests
- **Security Headers** with Helmet middleware
- **Rate Limiting** protection (planned)
- **Audit Logging** for security events

## 🚀 Quick Start

### Prerequisites

- Node.js (v18+)
- PostgreSQL (or Docker)
- npm or yarn

### Installation

```bash
# Navigate to backend directory
cd backend

# Install dependencies
yarn install

# Copy environment file
cp .env.example .env

# Edit .env with your database connection and Google OAuth credentials
```

### Development

```bash
# Start development server with hot reload
yarn dev

# Build for production
yarn build

# Start production server
yarn start
```

### Database Setup

```bash
# Using Docker (recommended)
docker run --name postgres-dev -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres

# Or install PostgreSQL locally
# Then create database: asset_management
```

## � Authentication

### Google OAuth Integration

The backend supports seamless Google OAuth authentication:

#### Google OAuth Flow
```http
POST /api/auth/google
Content-Type: application/json
```

**Request Body:**
```json
{
  "credential": "google-jwt-token"
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
      "email": "john@example.com",
      "googleId": "google-user-id",
      "avatar": "https://..."
    },
    "token": "jwt-access-token",
    "refreshToken": "jwt-refresh-token"
  }
}
```

### Traditional Authentication

#### Register User
```http
POST /api/auth/register
Content-Type: application/json
```

**Request Body:**
```json
{
  "username": "john.doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

#### Login User
```http
POST /api/auth/login
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
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
      "email": "john@example.com"
    },
    "token": "jwt-access-token",
    "refreshToken": "jwt-refresh-token"
  }
}
```

#### Logout User
```http
POST /api/auth/logout
```

#### Get User Profile
```http
GET /api/auth/profile
Authorization: Bearer <token>
```

## �📚 API Endpoints

### Base URL
```
http://localhost:5000
```

### Properties API

#### List Properties
```http
GET /api/properties
Authorization: Bearer <token>
```

#### Get Property by ID
```http
GET /api/properties/:id
Authorization: Bearer <token>
```

#### Create Property
```http
POST /api/properties
Authorization: Bearer <token>
Content-Type: application/json
```

#### Update Property
```http
PUT /api/properties/:id
Authorization: Bearer <token>
```

### Tenants API

#### List Tenants
```http
GET /api/tenants
Authorization: Bearer <token>
```

#### Create Tenant
```http
POST /api/tenants
Authorization: Bearer <token>
Content-Type: application/json
```

### Leases API

#### List Leases
```http
GET /api/leases
Authorization: Bearer <token>
```

#### Create Lease
```http
POST /api/leases
Authorization: Bearer <token>
Content-Type: application/json
```

#### Terminate Lease
```http
POST /api/leases/:id/terminate
Authorization: Bearer <token>
```

### Users API

#### Get User Profile
```http
GET /api/users/profile
Authorization: Bearer <token>
```

#### Update User Profile
```http
PUT /api/users/profile
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "username": "john.doe.updated",
  "email": "john.doe@example.com"
}
```

## 🗂️ Project Structure

```
backend/
├── src/
│   ├── features/             # Feature modules (Vertical Slices)
│   │   ├── admin/            # Admin & Bulk Operations
│   │   ├── auth/             # Authentication & User Management
│   │   ├── files/            # File Storage & Management
│   │   ├── finance/          # Financial Operations (Rent, Expenses, Receipts)
│   │   ├── leases/           # Lease Management
│   │   ├── properties/       # Property & Unit Management
│   │   └── tenants/          # Tenant Management
│   ├── shared/               # Shared kernel & cross-cutting concerns
│   │   ├── config/           # Configuration (DB, Swagger)
│   │   ├── constants/        # Global constants
│   │   ├── core/             # Base classes & interfaces
│   │   ├── infrastructure/   # Infrastructure services (EventBus, Notifications)
│   │   ├── middleware/       # Express middleware
│   │   ├── types/            # Shared types
│   │   └── utils/            # Utility functions
│   ├── app.ts                # App setup
│   └── server.ts             # Entry point
├── scripts/                  # Utility scripts
├── tests/                    # Tests
├── package.json
├── tsconfig.json
└── Dockerfile
```

## 🔧 Core Components

### Controllers

Controllers handle HTTP requests and responses. They:
- Parse request parameters and body
- Call appropriate service methods
- Format responses using response utilities
- Handle basic validation

**Example:**
```typescript
// src/features/auth/auth/api/AuthController.ts
export class AuthController {
  constructor(private authService: IAuthService) {}

  async googleAuth(req: Request, res: Response) {
    try {
      const { credential } = req.body;
      const result = await this.authService.authenticateWithGoogle(credential);
      sendSuccess(res, result);
    } catch (error) {
      sendError(res, error);
    }
  }
}
```

### Services

Services contain business logic and domain rules:
- Implement business rules and validations
- Coordinate between multiple repositories
- Handle complex operations
- Maintain domain integrity

**Example:**
```typescript
// src/features/auth/auth/core/AuthService.ts
export class AuthService implements IAuthService {
  constructor(
    private userRepository: IUserRepository,
    private jwtService: IJwtService
  ) {}

  async authenticateWithGoogle(credential: string): Promise<AuthResult> {
    // Verify Google token
    const googleUser = await this.verifyGoogleToken(credential);

    // Find or create user
    let user = await this.userRepository.findByGoogleId(googleUser.sub);
    if (!user) {
      user = await this.userRepository.createFromGoogle(googleUser);
    }

    // Generate tokens
    const tokens = await this.jwtService.generateTokens(user);
    return { user, ...tokens };
  }
}
```

### Repositories

Repositories handle data persistence:
- Abstract database operations
- Implement data access patterns
- Handle database-specific logic
- Provide clean data interfaces

**Example:**
```typescript
// src/features/auth/user/data/UserRepository.ts
export class UserRepository implements IUserRepository {
  constructor(private pool: Pool) {}

  async findByGoogleId(googleId: string): Promise<User | null> {
    const query = 'SELECT * FROM users WHERE google_id = $1';
    const result = await this.pool.query(query, [googleId]);
    return result.rows[0] ? this.mapToUser(result.rows[0]) : null;
  }

  async createFromGoogle(googleUser: GoogleUser): Promise<User> {
    const query = `
      INSERT INTO users (username, email, google_id, avatar, email_verified)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const values = [
      googleUser.email.split('@')[0], // username from email
      googleUser.email,
      googleUser.sub,
      googleUser.picture,
      googleUser.email_verified
    ];
    const result = await this.pool.query(query, values);
    return this.mapToUser(result.rows[0]);
  }
}
```

### Authentication Middleware

JWT-based authentication middleware:

```typescript
// src/shared/middleware/authMiddleware.ts
export const authMiddleware = (userService: IUserService) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Access token required' });
      }
      // ... verification logic
      next();
    } catch (error) {
      return res.status(401).json({ message: 'Invalid token' });
    }
  };
};
```

### Dependency Injection

Dependencies are wired up in `server.ts` (Composition Root):

```typescript
// server.ts
// Repositories
const userRepository = new UserRepository(mainPool);
const propertyRepository = new PropertyRepository(mainPool);

// Services
const userService = new UserService(userRepository);
const authService = new AuthService(userRepository, jwtService);

// Controllers
const authController = new AuthController(authService);
```

## 🛡️ Security & Validation

### Input Validation

Using Joi for comprehensive validation:

```typescript
export const authValidation = {
  googleAuth: Joi.object({
    credential: Joi.string().required()
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required()
  }),

  register: Joi.object({
    username: Joi.string().min(3).max(50).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required()
  })
};
```

### Password Security

- bcrypt hashing with configurable rounds
- Secure password validation
- No plain text password storage

### JWT Security

- HS256 algorithm for token signing
- Configurable token expiration
- Refresh token rotation
- Secure token storage patterns

### Database Security

- Parameterized queries to prevent SQL injection
- Connection pooling for performance
- Environment-based configuration

## 🧪 Testing

### Unit Tests

```bash
# Run unit tests
yarn test

# Run with coverage
npm run test:coverage

# Run specific test file
yarn test -- authService.test.ts
```

### Test Structure

```
tests/
├── unit/
│   ├── controllers/
│   │   ├── authController.test.ts
│   │   └── assetController.test.ts
│   ├── services/
│   │   ├── authService.test.ts
│   │   └── assetService.test.ts
│   └── repositories/
│       ├── userRepository.test.ts
│       └── assetRepository.test.ts
├── integration/
│   └── auth.integration.test.ts
└── e2e/
    └── api.e2e.test.ts
```

### Mocking with DI

The dependency injection pattern makes testing easy:

```typescript
describe('AuthService', () => {
  let authService: AuthService;
  let mockUserRepository: jest.Mocked<IUserRepository>;
  let mockJwtService: jest.Mocked<IJwtService>;

  beforeEach(() => {
    mockUserRepository = {
      findByGoogleId: jest.fn(),
      createFromGoogle: jest.fn(),
      findById: jest.fn()
    };

    mockJwtService = {
      generateTokens: jest.fn(),
      verifyToken: jest.fn()
    };

    authService = new AuthService(mockUserRepository, mockJwtService);
  });

  it('should authenticate with Google successfully', async () => {
    // Test implementation
  });
});
```

## 📊 Database Schema

### Users Table

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'user',
  google_id VARCHAR(255) UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Tenants Table

```sql
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  current_address_street VARCHAR(255) NOT NULL,
  current_address_city VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Rent Payments Table

```sql
CREATE TABLE rent_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lease_id UUID NOT NULL REFERENCES leases(id),
  property_id UUID NOT NULL REFERENCES properties(id),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  amount NUMERIC(10, 2) NOT NULL,
  due_date DATE NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🔄 Development Workflow

### Adding New Features

1. **Create Feature Module**: Create a new folder in `src/features/` (e.g., `src/features/my-feature`).
2. **Define Structure**: Create `api`, `core`, and `data` folders.
3. **Define Interface Contracts**: In `core/interfaces`.
4. **Implement Repository**: In `data/repository`.
5. **Implement Service**: In `core/services`.
6. **Create Controller**: In `api/`.
7. **Add Routes**: In `api/`.
8. **Update Composition Root**: Register new services and controllers in `server.ts`.
9. **Write Tests**: For all layers.
10. **Update Documentation**.

### Code Style

- **TypeScript Strict Mode**: Enabled for maximum type safety
- **ESLint**: Configured for code quality
- **Prettier**: Automatic formatting
- **Conventional Commits**: Semantic commit messages

### API Versioning

The project follows a **URI Path Versioning** strategy (e.g., `/api/v1/properties`).
- All new features should be implemented under the current version.
- Breaking changes require a new version.
- See [API Versioning Strategy](./docs/API_VERSIONING_STRATEGY.md) for full details.

## 🚀 Deployment

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
# copy package.json and yarn.lock (if present)
COPY package.json yarn.lock* ./
RUN if [ -f yarn.lock ]; then yarn install --frozen-lockfile --production=true; else npm ci --only=production; fi
COPY . .
RUN if [ -f yarn.lock ]; then yarn build; else npm run build; fi
EXPOSE 5000
CMD if [ -f yarn.lock ]; then yarn start; else npm start; fi
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Server port | `5000` |
| `MAIN_DATABASE_URL` | PostgreSQL connection | Required |
| `JWT_SECRET` | JWT signing secret | Required |
| `JWT_EXPIRE` | JWT expiration time | `1h` |
| `REFRESH_TOKEN_EXPIRE` | Refresh token expiration | `7d` |
| `BCRYPT_ROUNDS` | Password hash rounds | `12` |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | Required |

## 📈 Performance

### Optimizations

- **Connection Pooling**: PostgreSQL connection pool
- **Prepared Statements**: Parameterized queries
- **Lazy Loading**: DI container lazy initialization
- **Caching**: Planned for future implementation
- **Compression**: Gzip middleware enabled

### Monitoring

- **Health Checks**: `/health` endpoint
- **Error Logging**: Structured error responses
- **Performance Metrics**: Response time tracking (planned)

## 🔮 Future Enhancements

- [ ] JWT refresh token rotation
- [ ] Role-based access control (RBAC)
- [ ] API rate limiting
- [ ] Request caching (Redis)
- [ ] Audit logging
- [ ] GraphQL API support
- [ ] Real-time notifications (WebSocket)
- [x] API versioning strategy (See [Strategy Doc](./docs/API_VERSIONING_STRATEGY.md))
- [ ] Performance monitoring
- [ ] Database migrations
- [ ] Multi-factor authentication (MFA)

## 📚 Additional Resources

- [Express.js Documentation](https://expressjs.com/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [JWT.io](https://jwt.io/)
- [Google Identity Services](https://developers.google.com/identity/gsi/web)
- [Dependency Injection Pattern](https://martinfowler.com/articles/injection.html)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)

## 🤝 Contributing

1. Follow the layered architecture pattern
2. Implement interfaces for new contracts
3. Write comprehensive tests
4. Update documentation
5. Follow TypeScript best practices

---

Built with ❤️ using Node.js, Express, and TypeScript