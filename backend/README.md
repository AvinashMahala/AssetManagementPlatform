# Asset Management Platform - Backend

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)

The backend API server for the Asset Management Platform, built with Node.js, Express, and TypeScript. Features a clean layered architecture with dependency injection for maximum maintainability and testability, including Google OAuth authentication and JWT-based security.

## 🏗️ Architecture Overview

### Layered Architecture Pattern

The backend follows a **Layered Architecture** pattern with **Dependency Injection**:

```
┌─────────────────┐    ┌─────────────────┐
│   Controllers   │────│   Interfaces    │
│                 │    │  (Contracts)    │
├─────────────────┤    ├─────────────────┤
│    Services     │────│                 │
├─────────────────┤    └─────────────────┘
│  Repositories   │           ↑
├─────────────────┤    ┌─────────────────┐
│    Database     │    │ Dependency      │
│  (PostgreSQL)   │    │   Container     │
└─────────────────┘    │  (Singleton)    │
                       └─────────────────┘
```

### Architecture Layers

1. **Controllers** (`src/controllers/`): HTTP request/response handling
2. **Services** (`src/services/`): Business logic and domain rules
3. **Repositories** (`src/repositories/`): Data access and persistence
4. **Models** (`src/models/`): Data transfer objects and interfaces
5. **Interfaces** (`src/interfaces/`): Contract definitions for DI
6. **Utils** (`src/utils/`): Shared utilities and helpers
7. **Constants** (`src/constants/`): Configuration and constants
8. **Middlewares** (`src/middlewares/`): Express middleware functions

### Dependency Injection

- **Interface Segregation**: Each layer has its own interface contracts
- **Dependency Inversion**: High-level modules don't depend on low-level modules
- **Singleton Container**: Centralized dependency management
- **Testability**: Easy mocking for unit tests

## 🚀 Features

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
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your database connection and Google OAuth credentials
```

### Development

```bash
# Start development server with hot reload
npm run dev

# Build for production
npm run build

# Start production server
npm start
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

### Assets API

#### List Assets
```http
GET /api/assets
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Laptop Dell XPS 13",
      "description": "Developer laptop",
      "value": 1500.00,
      "location": "Office A",
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1
  }
}
```

#### Get Asset by ID
```http
GET /api/assets/:id
Authorization: Bearer <token>
```

#### Create Asset
```http
POST /api/assets
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Server Rack",
  "description": "Data center equipment",
  "value": 5000.00,
  "location": "Server Room B"
}
```

#### Update Asset
```http
PUT /api/assets/:id
Authorization: Bearer <token>
Content-Type: application/json
```

#### Delete Asset
```http
DELETE /api/assets/:id
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
│   ├── controllers/          # HTTP request handlers
│   │   ├── assetController.ts
│   │   ├── userController.ts
│   │   └── authController.ts
│   ├── services/             # Business logic layer
│   │   ├── AssetService.ts
│   │   ├── UserService.ts
│   │   ├── AuthService.ts
│   │   └── PasswordResetService.ts
│   ├── repositories/         # Data access layer
│   │   ├── AssetRepository.ts
│   │   ├── UserRepository.ts
│   │   ├── PasswordResetMethodRepository.ts
│   │   ├── RecoveryCodeRepository.ts
│   │   └── SecurityQuestionRepository.ts
│   ├── interfaces/           # TypeScript interfaces
│   │   ├── repositories/
│   │   │   ├── IAssetRepository.ts
│   │   │   ├── IUserRepository.ts
│   │   │   └── IAuthRepository.ts
│   │   └── services/
│   │       ├── IAssetService.ts
│   │       ├── IUserService.ts
│   │       └── IAuthService.ts
│   ├── models/               # DTOs and interfaces
│   │   ├── Asset.ts
│   │   ├── User.ts
│   │   └── Auth.ts
│   ├── routes/               # API route definitions
│   │   ├── assetRoutes.ts
│   │   ├── userRoutes.ts
│   │   └── authRoutes.ts
│   ├── utils/                # Shared utilities
│   │   ├── DependencyContainer.ts
│   │   ├── error.ts
│   │   ├── password.ts
│   │   ├── response.ts
│   │   ├── validation.ts
│   │   └── email.ts
│   ├── constants/            # Configuration constants
│   │   ├── database.ts
│   │   ├── http.ts
│   │   └── validation.ts
│   ├── middlewares/          # Express middlewares
│   │   ├── authMiddleware.ts
│   │   └── validationMiddleware.ts
│   └── server.ts             # Application entry point
├── tests/                    # Test files
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
export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      throw new UnauthorizedError('No token provided');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    req.user = decoded;
    next();
  } catch (error) {
    next(new UnauthorizedError('Invalid token'));
  }
};
```

### Dependency Container

Centralized dependency management using singleton pattern:

```typescript
export class DependencyContainer {
  private static instance: DependencyContainer;
  private pool: Pool;

  static initialize(pool: Pool): DependencyContainer {
    if (!DependencyContainer.instance) {
      DependencyContainer.instance = new DependencyContainer(pool);
    }
    return DependencyContainer.instance;
  }

  get authService(): IAuthService {
    return new AuthService(this.userRepository, this.jwtService);
  }

  get userService(): IUserService {
    return new UserService(this.userRepository);
  }

  get assetService(): IAssetService {
    return new AssetService(this.assetRepository);
  }
}
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
npm test

# Run with coverage
npm run test:coverage

# Run specific test file
npm test -- authService.test.ts
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
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255),
  google_id VARCHAR(255) UNIQUE,
  avatar TEXT,
  email_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Assets Table

```sql
CREATE TABLE assets (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  value DECIMAL(10,2) NOT NULL CHECK (value > 0),
  location VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Password Reset Methods Table

```sql
CREATE TABLE password_reset_methods (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  method_type VARCHAR(20) NOT NULL, -- 'email', 'sms', 'security_questions'
  identifier VARCHAR(255), -- email, phone, or question set
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🔄 Development Workflow

### Adding New Features

1. **Define Interface Contracts** (if needed)
2. **Implement Repository** layer
3. **Implement Service** layer with business logic
4. **Create Controller** for HTTP handling
5. **Add Routes** and validation
6. **Update Dependency Container**
7. **Write Tests** for all layers
8. **Update Documentation**

### Code Style

- **TypeScript Strict Mode**: Enabled for maximum type safety
- **ESLint**: Configured for code quality
- **Prettier**: Automatic formatting
- **Conventional Commits**: Semantic commit messages

## 🚀 Deployment

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 5000
CMD ["npm", "start"]
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Server port | `5000` |
| `DATABASE_URL` | PostgreSQL connection | Required |
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
- [ ] API versioning strategy
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