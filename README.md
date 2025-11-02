# Asset Management Platform

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)

A scalable, enterprise-grade Asset Management Platform built with modern web technologies. Features a complete React frontend with TypeScript, Node.js/Express backend with layered architecture, PostgreSQL database, Google OAuth authentication, and comprehensive API documentation.

## 🚀 Features

- **Full-Stack TypeScript**: End-to-end type safety across frontend and backend
- **Google OAuth Integration**: Seamless authentication with Google Identity Services API
- **JWT Authentication**: Secure token-based authentication with refresh tokens
- **Industrial-Grade Frontend Architecture**: Layered React application with contexts, hooks, and services
- **Layered Architecture**: Clean separation of concerns with Controllers, Services, and Repositories in backend
- **Dependency Injection**: Interface-based DI container for maximum testability and modularity
- **Global State Management**: React Context API for authentication, theming, and notifications
- **Component Library**: Reusable UI components with TypeScript interfaces
- **Custom Hooks**: Business logic encapsulation with React hooks
- **API Integration**: Centralized API client with error handling and TypeScript types
- **Database Integration**: PostgreSQL with connection pooling and prepared statements
- **Security**: Password hashing, input validation, CORS, and Helmet security headers
- **Containerization**: Docker and Docker Compose for easy deployment
- **Development Tools**: ESLint, Prettier, and comprehensive error handling
- **Monorepo Structure**: Organized with npm workspaces for efficient development

## 🏗️ Architecture

### Backend Architecture (Layered Pattern with DI)

```
┌─────────────────┐
│   Controllers   │ ← HTTP Layer (Express routes)
├─────────────────┤
│    Services     │ ← Business Logic Layer
├─────────────────┤
│  Repositories   │ ← Data Access Layer
├─────────────────┤
│    Database     │ ← PostgreSQL with pg library
└─────────────────┘
       ↑
┌─────────────────┐
│ Dependency      │
│   Container     │ ← Singleton DI container
│  (Interfaces)   │
└─────────────────┘
```

### Frontend Architecture (Layered React Pattern)

```
┌─────────────────┐
│   Components    │ ← UI Layer (Reusable components)
├─────────────────┤
│     Pages       │ ← Route-level components
├─────────────────┤
│     Hooks       │ ← Business Logic Layer
├─────────────────┤
│    Services     │ ← API Communication Layer
├─────────────────┤
│    Contexts     │ ← Global State Management
│                 │
│  Types & Utils  │ ← Supporting Infrastructure
└─────────────────┘
```

### Key Architectural Patterns

- **Component Composition**: Reusable UI components with TypeScript props
- **Custom Hooks**: Business logic encapsulation and API state management
- **Context API**: Global state management for auth, theme, and notifications
- **Service Layer**: Centralized API communication with error handling
- **Type Safety**: End-to-end TypeScript with strict interfaces
- **Separation of Concerns**: Clear boundaries between UI, logic, and data layers
- **Dependency Injection**: Interface-based contracts for testability

## 🛠️ Tech Stack

### Frontend
- **React 18** with modern hooks and concurrent features
- **TypeScript** for end-to-end type safety
- **Vite** for lightning-fast development and optimized builds
- **Google Identity Services** for OAuth authentication
- **React Context API** for global state management
- **Custom Hooks** for business logic and API state
- **Component Library** with reusable UI components
- **Axios** for HTTP client communication
- **ESLint** + **Prettier** for code quality and formatting

### Backend
- **Node.js** with Express.js framework
- **TypeScript** for type safety and better DX
- **PostgreSQL** with `pg` library and connection pooling
- **JWT** for authentication tokens
- **bcrypt** for secure password hashing
- **Joi** for comprehensive input validation
- **Google Auth Library** for OAuth verification
- **Helmet** for security headers
- **CORS** for cross-origin resource sharing

### DevOps & Tools
- **Docker** & **Docker Compose** for containerization
- **npm workspaces** for monorepo management
- **GitHub Actions** for CI/CD (planned)

## 📁 Project Structure

```
AssetManagementPlatform/
├── frontend/                 # React application with industrial-grade architecture
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   │   ├── auth/         # Authentication components
│   │   │   │   ├── ProtectedRoute.tsx
│   │   │   │   ├── PublicRoute.tsx
│   │   │   │   └── index.ts
│   │   │   ├── common/       # Generic components (Button, Input, Card, GoogleOAuthButton)
│   │   │   ├── forms/        # Form components (LoginForm, RegisterForm, etc.)
│   │   │   └── ui/           # UI-specific components
│   │   ├── pages/            # Route-level page components
│   │   │   └── Dashboard.tsx # Main dashboard with asset overview
│   │   ├── hooks/            # Custom React hooks
│   │   │   ├── useApi.ts     # API communication hook
│   │   │   ├── useAssets.ts  # Asset management hook
│   │   │   ├── useUsers.ts   # User management hook
│   │   │   └── useGoogleOAuth.ts # Google OAuth integration hook
│   │   ├── services/         # API service functions
│   │   │   ├── apiClient.ts  # Centralized API client
│   │   │   ├── assetService.ts # Asset API operations
│   │   │   ├── authService.ts # Authentication API operations
│   │   │   └── userService.ts # User API operations
│   │   ├── contexts/         # React contexts for global state
│   │   │   ├── AuthContext.tsx     # Authentication state management
│   │   │   ├── ThemeContext.tsx    # Theme management
│   │   │   ├── NotificationContext.tsx # Notification system
│   │   │   └── index.ts      # Context exports
│   │   ├── types/            # TypeScript type definitions
│   │   │   ├── asset.ts      # Asset-related types
│   │   │   ├── user.ts       # User-related types
│   │   │   ├── api.ts        # API response types
│   │   │   ├── common.ts     # Common/shared types
│   │   │   └── index.ts      # Type exports
│   │   ├── constants/        # Configuration constants
│   │   ├── utils/            # Utility functions
│   │   ├── App.tsx           # Main app component with context providers
│   │   └── main.tsx          # Application entry point
│   ├── public/               # Static assets
│   └── package.json
├── backend/                  # Express API server with layered architecture
│   ├── src/
│   │   ├── controllers/      # HTTP request handlers
│   │   │   ├── assetController.ts
│   │   │   ├── userController.ts
│   │   │   └── authController.ts
│   │   ├── services/         # Business logic layer
│   │   │   ├── AssetService.ts
│   │   │   ├── UserService.ts
│   │   │   ├── AuthService.ts
│   │   │   └── PasswordResetService.ts
│   │   ├── repositories/     # Data access layer
│   │   │   ├── AssetRepository.ts
│   │   │   ├── UserRepository.ts
│   │   │   ├── PasswordResetMethodRepository.ts
│   │   │   ├── RecoveryCodeRepository.ts
│   │   │   └── SecurityQuestionRepository.ts
│   │   ├── interfaces/       # TypeScript interfaces for DI
│   │   │   ├── repositories/
│   │   │   └── services/
│   │   ├── models/           # Data transfer objects
│   │   ├── routes/           # API route definitions
│   │   ├── utils/            # Backend utilities
│   │   ├── constants/        # Configuration constants
│   │   ├── middlewares/      # Express middlewares
│   │   │   ├── authMiddleware.ts
│   │   │   └── validationMiddleware.ts
│   │   └── server.ts         # Application entry point
│   ├── tests/                # Test suites
│   └── package.json
├── docker/                   # Docker configurations
├── docs/                     # API documentation
├── scripts/                  # Build and deployment scripts
├── docker-compose.yml        # Multi-container setup
└── package.json             # Root workspace configuration
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v18 or higher)
- **Docker** and **Docker Compose**
- **Git**

### 1. Clone and Setup

```bash
# Clone the repository
git clone <repository-url>
cd AssetManagementPlatform

# Install dependencies for all workspaces
npm install
```

### 2. Environment Configuration

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your configuration
# Required: DATABASE_URL, JWT_SECRET, GOOGLE_CLIENT_ID, etc.
```

### 3. Database Setup

```bash
# Start PostgreSQL with Docker Compose
docker-compose up -d postgres

# Or use the full stack
docker-compose up -d
```

### 4. Development

```bash
# Start both frontend and backend in development mode
npm run dev

# Or run workspaces separately
npm run dev --workspace=frontend
npm run dev --workspace=backend
```

### 5. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Documentation**: http://localhost:5000/api-docs

## � Authentication

### Google OAuth Integration

The platform supports seamless Google OAuth authentication:

1. **Frontend**: Uses Google Identity Services API for secure authentication
2. **Backend**: Verifies Google JWT tokens and creates/manages user accounts
3. **Database**: Stores Google user data with proper indexing

### Traditional Authentication

- **JWT Tokens**: Secure access and refresh token implementation
- **Password Security**: bcrypt hashing with configurable rounds
- **Session Management**: Secure token storage and validation

## 📚 API Documentation

### Authentication Endpoints

#### Google OAuth
```http
POST /api/auth/google
Content-Type: application/json

{
  "credential": "google-jwt-token"
}
```

#### Traditional Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

#### User Registration
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "john.doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
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

#### Create Asset
```http
POST /api/assets
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Server Rack",
  "description": "Data center equipment",
  "value": 5000.00,
  "location": "Server Room B"
}
```

#### Update/Delete Assets
```http
PUT /api/assets/:id
DELETE /api/assets/:id
Authorization: Bearer <token>
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run backend tests only
npm test --workspace=backend

# Run with coverage
npm run test:coverage
```

## 🚢 Deployment

### Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up --build

# Or build manually
npm run build
docker build -t asset-management .
docker run -p 5000:5000 asset-management
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Server port | `5000` |
| `DATABASE_URL` | PostgreSQL connection string | Required |
| `JWT_SECRET` | JWT signing secret | Required |
| `JWT_EXPIRE` | JWT expiration time | `1h` |
| `REFRESH_TOKEN_EXPIRE` | Refresh token expiration | `7d` |
| `BCRYPT_ROUNDS` | Password hashing rounds | `12` |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | Required |

## 🔧 Development Guidelines

### Code Style
- **TypeScript Only**: All code must use TypeScript
- **ESLint**: Follow configured linting rules
- **Prettier**: Automatic code formatting
- **Conventional Commits**: Use semantic commit messages

### Architecture Rules
- **Controllers**: Handle HTTP requests/responses only
- **Services**: Contain business logic and domain rules
- **Repositories**: Handle data persistence and queries
- **Interfaces**: Define contracts for dependency injection
- **Models**: Data transfer objects and validation schemas

### Security Best Practices
- Input validation on all endpoints with Joi
- Password hashing with bcrypt (12 rounds)
- JWT tokens with proper expiration
- CORS configuration for cross-origin requests
- Helmet security headers
- SQL injection prevention with parameterized queries

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Workflow

```bash
# 1. Create feature branch
git checkout -b feature/new-feature

# 2. Make changes and run tests
npm test

# 3. Lint and format code
npm run lint
npm run format

# 4. Commit with conventional format
git commit -m "feat: add new asset filtering"

# 5. Push and create PR
git push origin feature/new-feature
```

## 📈 Current Status

### ✅ Completed Features

- [x] **Google OAuth Integration**: Complete authentication flow with Google Identity Services
- [x] **JWT Authentication**: Secure token-based authentication with refresh tokens
- [x] **Industrial-Grade Frontend Architecture**: Complete layered React application with TypeScript
- [x] **React Context API Implementation**: Global state management for auth, theme, and notifications
- [x] **Component Library**: Reusable UI components (Button, Input, Card, GoogleOAuthButton) with TypeScript interfaces
- [x] **Custom Hooks**: Business logic encapsulation for API state management and OAuth
- [x] **API Integration Layer**: Centralized API client with error handling and TypeScript types
- [x] **Dashboard Page**: Asset overview with statistics and user information
- [x] **Type Safety**: End-to-end TypeScript with strict interfaces across all layers
- [x] **Layered Architecture**: Clean separation of concerns mirroring backend patterns
- [x] **Dependency Injection**: Interface-based DI container for maximum testability
- [x] **Database Schema**: Complete PostgreSQL schema with proper relationships
- [x] **Security Implementation**: Password hashing, input validation, CORS, Helmet headers
- [x] **Error Handling**: Comprehensive error handling throughout the application
- [x] **Docker Containerization**: Complete Docker setup for development and deployment

### 🔄 In Progress

- [ ] React Router integration for client-side routing
- [ ] Asset management pages (list, create, edit, detail views)
- [ ] User profile management interface
- [ ] Advanced search and filtering capabilities

### 📋 Planned Features

- [ ] Asset categories and tagging system
- [ ] File upload for asset images and documents
- [ ] Audit logging and activity tracking
- [ ] Role-based access control (RBAC)
- [ ] Real-time notifications with WebSocket
- [ ] Mobile-responsive design optimization
- [ ] Comprehensive test coverage (unit, integration, e2e)
- [ ] CI/CD pipeline with GitHub Actions
- [ ] Performance monitoring and analytics
- [ ] Progressive Web App (PWA) features
- [ ] Internationalization (i18n) support
- [ ] Component library documentation with Storybook
- [ ] API rate limiting and caching
- [ ] Multi-factor authentication (MFA)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Avinash Mahala** - *Initial work* - [GitHub](https://github.com/AvinashMahala)

## 🙏 Acknowledgments

- Express.js team for the excellent web framework
- PostgreSQL community for the robust database
- React team for the powerful frontend library
- Google Identity Services for OAuth integration
- Docker community for containerization tools
- TypeScript team for the type safety system

---

Built with ❤️ using React, TypeScript, Node.js, Express, and PostgreSQL