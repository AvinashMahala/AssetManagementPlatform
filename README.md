# Property Management Platform

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.2.0-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![UX](https://img.shields.io/badge/UX-Enhanced-blue?style=for-the-badge)](https://github.com/AvinashMahala/AssetManagementPlatform)

A comprehensive Property Management Platform built with modern web technologies. Features a complete React frontend with TypeScript, Node.js/Express backend with layered architecture, PostgreSQL database, Google OAuth authentication, and comprehensive API documentation for managing rental properties, tenants, leases, and rent payments. Includes enhanced user experience with loading states, dual creation workflows, and tabbed form interfaces.

## 🚀 Free Hosting Deployment

Deploy your Asset Management Platform using **GitHub's free services**!

### 🎯 What's Free
- **Frontend**: GitHub Pages (unlimited bandwidth, custom domains)
- **Backend**: Free tiers from Render/Railway/Fly.io
- **Database**: PostgreSQL included with backend hosting
- **CI/CD**: GitHub Actions (unlimited for public repos)

### 🚀 Quick Deploy

1. **Enable GitHub Pages**:
   - Go to Settings → Pages
   - Frontend deploys to: `https://yourusername.github.io/repository-name`

3. **Deploy Backend** (choose one free service):
   - 🚀 **Render**: [render.com](https://render.com) - 750 hours/month free
   - 🏃 **Railway**: [railway.app](https://railway.app) - $5/month credit
   - 🪶 **Fly.io**: [fly.io](https://fly.io) - 3 shared CPUs free

### 📋 Setup Steps

 yarn build
2. **Backend**: Connect your repo to chosen hosting service
3. **Database**: Automatic with backend deployment
4. **Environment Variables**: Set in hosting service dashboard
## 🛠️ Quick Setup (Unified)

To run the unified cross-platform setup script which validates tools, installs dependencies, optionally seeds the database, and starts the dev servers:

```bash
# run non-interactively and accept prompts
node scripts/setup.js --yes

# seed the database as part of setup
node scripts/setup.js --seed-db

# skip bringing up docker services
node scripts/setup.js --skip-docker
```

You can still use the platform-specific wrappers:
```bash
# macOS/Linux
bash setup.sh

# Windows
powershell -ExecutionPolicy Bypass -File setup.ps1
```


### 🌐 Live Demo URLs
- **Frontend**: `https://yourusername.github.io/repository-name`
- **Backend**: `https://your-app.onrender.com`
- **API Docs**: `https://your-app.onrender.com/api-docs`

For detailed instructions, see [DEPLOYMENT.md](DEPLOYMENT.md).

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
- **Loading States**: Consistent full-page loading indicators across all navigation pages
- **Dual Creation Workflows**: Quick Add (single-page) and Guided Add (tabbed) options for all entities
- **Tabbed Forms**: Space-optimized multi-step forms with progress tracking and validation
- **Enhanced User Experience**: Immediate visual feedback and intuitive navigation patterns

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

## 🎨 User Experience Features

### Loading States & Performance
- **Full-Page Loading Indicators**: Consistent loading spinners across all navigation pages
- **Immediate Visual Feedback**: Users see loading states when clicking navigation links
- **Descriptive Loading Messages**: Context-aware loading text (e.g., "Loading properties...")
- **Optimized Performance**: Prevents blank page experience during data fetching

### Dual Creation Workflows
- **Quick Add**: Single-page forms for simple, fast data entry
- **Guided Add**: Multi-step tabbed forms with progress tracking for complex data entry
- **Flexible User Choice**: Users can choose workflow based on complexity and preference
- **Consistent Experience**: Same dual-workflow pattern across all entity types

### Tabbed Form Interfaces
- **Space Optimization**: Multi-step forms prevent scrolling and cognitive overload
- **Progress Tracking**: Visual indicators show completion status
- **Validation Per Step**: Real-time validation with clear error messaging
- **Smart Navigation**: Next/Previous buttons with validation checks
- **Data Persistence**: Form state maintained across tab switches

### Enhanced Navigation
- **Dual Action Buttons**: Quick Add and Guided Add options in list pages
- **Descriptive Tooltips**: Clear guidance on workflow differences
- **Consistent Patterns**: Same interaction patterns across all entity types

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
PropertyManagementPlatform/
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
│   │   │   ├── properties/   # Property management pages
│   │   │   │   ├── PropertyListPageEnhanced.tsx
│   │   │   │   ├── PropertyCreatePage.tsx
│   │   │   │   ├── PropertyCreatePageTabbed.tsx
│   │   │   │   └── PropertyEditPageTabbed.tsx
│   │   │   ├── tenants/      # Tenant management pages
│   │   │   │   ├── TenantListPageEnhanced.tsx
│   │   │   │   ├── TenantCreatePage.tsx
│   │   │   │   ├── TenantCreatePageTabbed.tsx
│   │   │   │   └── TenantEditPageTabbed.tsx
│   │   │   ├── units/        # Unit management pages
│   │   │   │   ├── UnitListPageEnhanced.tsx
│   │   │   │   ├── UnitCreatePage.tsx
│   │   │   │   ├── UnitCreatePageTabbed.tsx
│   │   │   │   └── UnitEditPageTabbed.tsx
│   │   │   ├── meters/       # Meter management pages
│   │   │   │   ├── MeterListPage.tsx
│   │   │   │   ├── MeterCreatePage.tsx
│   │   │   │   ├── MeterCreatePageTabbed.tsx
│   │   │   │   └── MeterEditPageTabbed.tsx
│   │   │   ├── leases/       # Lease management pages
│   │   │   │   ├── LeaseListPageEnhanced.tsx
│   │   │   │   ├── LeaseCreatePageTabbed.tsx
│   │   │   │   └── LeaseEditPageTabbed.tsx
│   │   │   ├── payments/     # Payment management pages
│   │   │   │   ├── PaymentListPageEnhanced.tsx
│   │   │   │   ├── PaymentCreatePageTabbed.tsx
│   │   │   │   └── PaymentEditPageTabbed.tsx
│   │   │   ├── expenses/     # Expense management pages
│   │   │   │   ├── ExpenseListPage.tsx
│   │   │   │   ├── ExpenseCreatePageTabbed.tsx
│   │   │   │   └── ExpenseEditPageTabbed.tsx
│   │   │   └── Dashboard.tsx # Main dashboard with property overview
│   │   ├── hooks/            # Custom React hooks
│   │   │   ├── useApi.ts     # API communication hook
│   │   │   ├── useProperties.ts # Property management hook
│   │   │   ├── useUsers.ts   # User management hook
│   │   │   └── useGoogleOAuth.ts # Google OAuth integration hook
│   │   ├── services/         # API service functions
│   │   │   ├── apiClient.ts  # Centralized API client
│   │   │   ├── propertyService.ts # Property API operations
│   │   │   ├── authService.ts # Authentication API operations
│   │   │   └── userService.ts # User API operations
│   │   ├── contexts/         # React contexts for global state
│   │   │   ├── AuthContext.tsx     # Authentication state management
│   │   │   ├── ThemeContext.tsx    # Theme management
│   │   │   ├── NotificationContext.tsx # Notification system
│   │   │   └── index.ts      # Context exports
│   │   ├── types/            # TypeScript type definitions
│   │   │   ├── property.ts   # Property-related types
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
│   │   │   ├── propertyController.ts
│   │   │   ├── tenantController.ts
│   │   │   ├── unitController.ts
│   │   │   ├── leaseController.ts
│   │   │   ├── rentPaymentController.ts
│   │   │   ├── unitTenantController.ts
│   │   │   ├── userController.ts
│   │   │   └── authController.ts
│   │   ├── services/         # Business logic layer
│   │   │   ├── PropertyService.ts
│   │   │   ├── TenantService.ts
│   │   │   ├── UnitService.ts
│   │   │   ├── LeaseService.ts
│   │   │   ├── RentPaymentService.ts
│   │   │   ├── UnitTenantService.ts
│   │   │   ├── UserService.ts
│   │   │   ├── AuthService.ts
│   │   │   └── PasswordResetService.ts
│   │   ├── repositories/     # Data access layer
│   │   │   ├── PropertyRepository.ts
│   │   │   ├── TenantRepository.ts
│   │   │   ├── UnitRepository.ts
│   │   │   ├── LeaseRepository.ts
│   │   │   ├── RentPaymentRepository.ts
│   │   │   ├── UnitTenantRepository.ts
│   │   │   ├── UserRepository.ts
│   │   │   ├── PasswordResetMethodRepository.ts
│   │   │   ├── RecoveryCodeRepository.ts
│   │   │   └── SecurityQuestionRepository.ts
│   │   ├── interfaces/       # TypeScript interfaces for DI
│   │   │   ├── repositories/
│   │   │   └── services/
│   │   ├── models/           # Data transfer objects
│   │   │   ├── Property.ts
│   │   │   ├── Tenant.ts
│   │   │   ├── Unit.ts
│   │   │   ├── Lease.ts
│   │   │   ├── RentPayment.ts
│   │   │   └── User.ts
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
cd PropertyManagementPlatform

# Install dependencies for all workspaces
yarn install
```

## 📌 Requirements (Software / Tools / Packages)

Before running or contributing to the project, the following items are required or strongly recommended. Most of these are explained in detail in `SETUP.md` and the setup scripts (`setup.ps1`, `setup.sh`, `scripts/setup.js`).

1) System software / tools (install these first)
   - Node.js >= 18 (required) — recommended LTS 18 or 20
     - Windows: winget install -e --id OpenJS.NodeJS.LTS or nvm-windows
     - macOS: brew install node OR use nvm: https://github.com/nvm-sh/nvm
     - Linux: apt / dnf OR use nvm
   - Yarn (recommended, optional if you prefer npm). Install via:
     - npm: npm install -g yarn
     - Corepack: corepack enable && corepack prepare yarn@stable --activate
   - Docker & Docker Compose (for DB+services) — required for production / local containers
     - Windows: Docker Desktop (with WSL2) — https://www.docker.com/get-started
     - macOS: Docker Desktop via Homebrew `brew install --cask docker`
     - Linux: `sudo apt install docker docker-compose` or use distro packages
   - Python 3.10+ (optional / required for seeding and Python scripts)
     - Used by `setup_database.py` and seeding scripts. On Windows, use winget or Python.org installer.
   - Git (required) — `git` command line

2) Node / workspace packages (installed by the setup or through yarn install)
   - Project uses Yarn workspaces – prefer `yarn install` at the repo root
   - Recommended local dev dependencies (already included in `frontend` and `backend` package.json):
     - TypeScript, ESLint, Jest, Vite, vitest, tsx, ts-node
     - `concurrently` (dev helper) — requires Node >= 18
     - `pnpm` (optional, may be used internally by certain scripts)
   - If you need them globally (optional): `yarn global add pnpm typescript`

3) Other infra / config you should know about
   - PostgreSQL — can run locally or via Docker Compose (recommended for quick starts)
   - Environment variables: copy `.env.example` to `.env` (root / backend) and configure keys like `MAIN_DATABASE_URL`, `JWT_SECRET`, `GOOGLE_CLIENT_ID`.
   - Google OAuth (optional): `GOOGLE_CLIENT_ID` and Trusted Redirect URLs for working auth
   - Editor/IDE with TypeScript support for best DX (VS Code recommended)

  6) Data seeding (Python-based)
     - The project includes Python-based seeding helpers to create and load seed data.
     - Key scripts:
       - `scripts/smart_seed_excel.py` — generate a simplified Excel file from JSON templates
       - `scripts/seed_to_db.py` — load JSON/Excel seed files into the database
     - Python packages are provided in `scripts/seeding_requirements.txt`. To install and seed manually:
       ```bash
       python3 -m venv .venv
       source .venv/bin/activate  # or `.\.venv\Scripts\activate` on Windows PowerShell
       pip install -U pip
       pip install -r scripts/seeding_requirements.txt
       # Generate Excel (optional)
       python3 scripts/smart_seed_excel.py
      # Run DB seed
      python3 scripts/seed_to_db.py

    Note: The `scripts/pyproject.toml` is provided for modern Python packaging in the `scripts/` folder; you can also install dependencies with:
    ```bash
    python -m pip install -r scripts/seeding_requirements.txt
    # or using the pyproject (build wheel and install):
    python -m pip install build
    python -m build -C scripts
    pip install scripts/dist/*.whl
    ```
       ```

4) Quick install hints & commands (common flows)
   - Quick install (recommended):
     - Use the platform wrapper: `yarn setup` (preferred), or `bash setup.sh` (macOS/Linux) or `powershell -ExecutionPolicy Bypass -File setup.ps1` (Windows)
   - Manually install dependencies without the wrapper:
     ```bash
     # Yarn (recommended)
     yarn install

     # Or, if you prefer npm
     npm install
     npm ci --workspaces --if-present
     ```

5) How to start the dev environment:
   - Preferred (Yarn + Node >= 18):
     ```bash
     yarn dev                # starts frontend/backend and docker via start-dev.js
     yarn workspace frontend dev
     yarn workspace backend dev
     ```
   - The `start-dev.js` and `start-dev.ps1` scripts open windows/terminals for the backend, frontend, and Docker DBs so that you can see logs independently.

See `SETUP.md`, `docs/PREREQUISITES.md` and `setup.sh` / `setup.ps1` for more details and OS-specific guidance, auto-install attempts and prompts.


### One-time Setup (Recommended)

Run the one-time setup script to automatically install missing tools (or prompt you with instructions) and prepare the workspace for development.

Windows (PowerShell):
```powershell
powershell -ExecutionPolicy Bypass -File setup.ps1
# or via yarn
yarn setup:win
```

macOS / Linux:
```bash
bash setup.sh
# or via yarn
yarn setup:unix
```

The script will:
- Check/install Node.js (recommended v18+), Docker Desktop, Python 3 (for DB seeding), Git.
-- Install workspace dependencies (prefer yarn: `yarn install` or `yarn workspaces install`).
- Setup a Python virtual environment and install seeding requirements (scripts/seeding_requirements.txt).
- Copy `.env.example` files into appropriate `.env` files if not present.
- Optionally run the DB seeding pipeline and start development servers.

Note: The setup script uses `winget`/`choco` on Windows and `brew`/`apt` on macOS/Linux when available. If none are present, the script prints manual install instructions.


### 2. Environment Configuration

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your configuration
# Required: MAIN_DATABASE_URL, JWT_SECRET, GOOGLE_CLIENT_ID, etc.
```

### 3. Database Setup

#### Quick Setup (Recommended)

For the fastest setup, use the single-command pipeline:

```bash
# Complete database setup in one command (interactive)
python3 setup_database.py
```

This runs the 3-step pipeline with confirmation before each step:
1. 📊 **Create Excel seed data file** (asks: Continue? y/N)
2. 🗄️ **Seed database with sample data** (asks: Continue? y/N)  
3. ✅ **Verify database integrity** (asks: Continue? y/N)

**Test Credentials:**
- **Admin**: `admin@assetplatform.com` / `admin123`
- **User**: `ramesh_patel@example.com` / `owner123`

#### Manual Setup

```bash
# Start PostgreSQL with Docker Compose
docker-compose up -d postgres

# Or use the full stack
docker-compose up -d
```

#### Database Management Scripts

The project includes comprehensive Python scripts for database management:

```bash
# First-time setup (migration + test data)
./scripts/db_manage.sh setup

# Or run individual commands
./scripts/db_manage.sh migrate    # Convert IDs to UUID
./scripts/db_manage.sh seed       # Add test data
./scripts/db_manage.sh clean      # Remove test data
./scripts/db_manage.sh test       # Test connection
```

#### End-to-End Setup

For complete system setup from scratch, use the end-to-end script:

```bash
# Complete setup (database + services + tests)
./scripts/e2e_setup.sh

# Quick setup (skip build and tests)
./scripts/e2e_setup.sh --skip-build --skip-tests

# Show help
./scripts/e2e_setup.sh --help
```

**What the end-to-end script does:**
1. ✅ Checks system dependencies (Docker, Node.js, Python)
2. ✅ Validates environment configuration
3. ✅ Sets up database infrastructure
4. ✅ Runs UUID migration
5. ✅ Seeds test data
6. ✅ Installs all dependencies
7. ✅ Builds frontend and backend
8. ✅ Starts all services with Docker
9. ✅ Runs health checks
10. ✅ Executes comprehensive API tests

**Test Credentials:**
- **Admin**: `admin@propertyplatform.com` / `admin123`
- **User**: `john.doe@example.com` / `password123`
- **Manager**: `manager@propertyplatform.com` / `manager123`

See `scripts/python/README.md` for detailed database documentation.

### 4. Development

```bash
# Start both frontend and backend in development mode
yarn dev

# Or run workspaces separately
yarn workspace frontend dev
yarn workspace backend dev
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

### Properties API

#### List Properties
```http
GET /api/properties
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-string",
      "name": "Sunset Apartments",
      "description": "Luxury apartment complex",
      "address": "123 Main St, City, State 12345",
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

#### Create Property
```http
POST /api/properties
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Riverside Condos",
  "description": "Modern condominium complex",
  "address": "456 River Rd, City, State 12345"
}
```

#### Update/Delete Properties
```http
PUT /api/properties/:id
DELETE /api/properties/:id
Authorization: Bearer <token>
```

## 🧪 Testing

```bash
# Run all tests
yarn test

# Run backend tests only
yarn workspace backend test

# Run with coverage
yarn test:coverage
```

## 🚢 Deployment

### Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up --build

# Or build manually
npm run build
docker build -t property-management .
docker run -p 5000:5000 property-management
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Server port | `5000` |
| `MAIN_DATABASE_URL` | PostgreSQL connection string | Required |
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
yarn lint
yarn format

# 4. Commit with conventional format
git commit -m "feat: add new property filtering"

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
- [x] **Property Management Pages**: Complete property list, create, and edit views with dual creation workflows
- [x] **Tabbed Property Creation**: Space-optimized 7-tab interface for complex property creation with progress tracking
- [x] **Quick Property Creation**: Streamlined single-form option for simple property additions
- [x] **Unit Management Pages**: Complete unit list, create, and edit views with dual creation workflows
- [x] **Tabbed Unit Creation**: Space-optimized 4-tab interface for comprehensive unit creation with progress tracking
- [x] **Quick Unit Creation**: Streamlined single-form option for simple unit additions
- [x] **Meter Management Pages**: Complete meter list, create, and edit views with dual creation workflows
- [x] **Tabbed Meter Creation**: Space-optimized 3-tab interface for comprehensive meter configuration with progress tracking
- [x] **Quick Meter Creation**: Streamlined single-form option for simple meter additions
- [x] **Tenant Management Pages**: Complete tenant list, create, and edit views with dual creation workflows
- [x] **Tabbed Tenant Creation**: Space-optimized 4-tab interface for comprehensive tenant creation with progress tracking
- [x] **Quick Tenant Creation**: Streamlined single-form option for simple tenant additions
- [x] **Lease Management Pages**: Complete lease list, create, and edit views with dual creation workflows
- [x] **Tabbed Lease Creation**: Space-optimized multi-step interface for comprehensive lease creation
- [x] **Payment Management Pages**: Complete payment list, create, and edit views with dual creation workflows
- [x] **Expense Management Pages**: Complete expense list, create, and edit views with dual creation workflows
- [x] **Loading States**: Consistent full-page loading indicators across all navigation pages (Properties, Tenants, Units, Leases, Payments, Expenses, Meters)
- [x] **Tabbed Edit Forms**: Enhanced editing workflows with tabbed interfaces for all entities
- [x] **Database Management Scripts**: Python scripts for property, unit, meter, and tenant data cleanup and seeding with foreign key handling
- [x] **Type Safety**: End-to-end TypeScript with strict interfaces across all layers
- [x] **Layered Architecture**: Clean separation of concerns mirroring backend patterns
- [x] **Dependency Injection**: Interface-based DI container for maximum testability
- [x] **Database Schema**: Complete PostgreSQL schema with proper relationships
- [x] **Security Implementation**: Password hashing, input validation, CORS, Helmet headers
- [x] **Error Handling**: Comprehensive error handling throughout the application
- [x] **Docker Containerization**: Complete Docker setup for development and deployment

### 🔄 In Progress

- [ ] User profile management interface
- [ ] Advanced search and filtering capabilities
- [ ] Comprehensive test coverage expansion

## 🔍 Current Implementation Analysis

### ✅ **WHAT WE HAVE IMPLEMENTED** (Extensive & Production-Ready)

#### 🏗️ **Architecture & Infrastructure**
- **Frontend**: React 19 + TypeScript + Vite (modern stack)
- **Backend**: Express.js + TypeScript + PostgreSQL (layered architecture)
- **Database**: Multi-database setup (main + files) with Docker
- **Authentication**: JWT + Google OAuth + password reset flows
- **File Management**: Upload/download with storage service
- **Containerization**: Docker + Docker Compose setup
- **Development Tools**: ESLint, Prettier, testing frameworks

#### 📱 **Frontend Features (Comprehensive)**
- **Component Library**: 40+ reusable components (Radix UI + custom)
- **Page Ecosystem**: 50+ pages across all entities with multiple variants
- **State Management**: Context API + custom hooks for all entities
- **UI/UX**: Loading states, tabbed forms, dual workflows, responsive design
- **Authentication**: Google OAuth integration, protected routes
- **Data Visualization**: Recharts integration for analytics
- **PDF Generation**: jsPDF + html2canvas for receipts/documents

#### 🔧 **Backend Features (Enterprise-Grade)**
- **API Layer**: 15+ controllers with full CRUD operations
- **Business Logic**: 20+ services with comprehensive domain logic
- **Data Access**: Repository pattern with PostgreSQL
- **Security**: Helmet, CORS, input validation, bcrypt hashing
- **Documentation**: Swagger/OpenAPI documentation
- **Logging**: Winston with daily rotation
- **File Processing**: PDF generation, template management

#### 📊 **Core Business Features (Fully Implemented)**
- **Property Management**: Full lifecycle (create, edit, list, dashboard)
- **Tenant Management**: Complete tenant profiles and relationships
- **Unit Management**: Property-unit associations and utilities
- **Lease Management**: Contract creation and management
- **Payment Processing**: Rent collection and transaction tracking
- **Expense Tracking**: Cost management and categorization
- **Meter Readings**: Utility monitoring and billing
- **Receipt Generation**: Automated receipt creation and templates
- **Bulk Operations**: Mass data operations and imports
- **Template System**: Customizable document templates

#### 🛠️ **Development & Data Tools**
- **Database Scripts**: 15+ Python scripts for data management
- **Seeding System**: Smart Excel generation and database population
- **Testing Framework**: Vitest + Jest + Testing Library
- **Code Quality**: TypeScript strict mode, ESLint, Prettier
- **Version Control**: Git with comprehensive commit history

### ❌ **WHAT WE NEED TO INTEGRATE** (Critical Gaps)

#### 🚨 **High Priority - Production Readiness**

##### 1. **CI/CD Pipeline**
- **Missing**: GitHub Actions workflows
- **Impact**: No automated testing/deployment
- **Needed**: Build, test, deploy pipelines

##### 2. **Production Docker Setup**
- **Missing**: Production-optimized containers
- **Current**: Development containers only (commented out)
- **Needed**: Multi-stage builds, production configs

##### 3. **Environment Management**
- **Missing**: Production environment variables
- **Current**: Basic .env setup
- **Needed**: Environment-specific configs, secrets management

##### 4. **Monitoring & Observability**
- **Missing**: Application monitoring, error tracking
- **Current**: Basic Winston logging
- **Needed**: APM, error tracking (Sentry), metrics

#### 🔄 **Medium Priority - Advanced Features**

##### 5. **Real-Time Features**
- **Missing**: WebSocket implementation
- **Current**: HTTP-only communication
- **Needed**: Real-time notifications, live updates

##### 6. **API Enhancements**
- **Missing**: Rate limiting, caching, GraphQL
- **Current**: REST API only
- **Needed**: Performance optimization, advanced querying

##### 7. **Advanced Security**
- **Missing**: Multi-factor authentication, session management
- **Current**: Basic JWT auth
- **Needed**: MFA, advanced session controls, audit trails

##### 8. **Reporting & Analytics**
- **Missing**: Advanced dashboards, custom reports
- **Current**: Basic data display
- **Needed**: BI tools integration, automated reporting

#### 📈 **Lower Priority - Enterprise Features**

##### 9. **Multi-Tenancy**
- **Missing**: Organization isolation
- **Current**: Single-tenant architecture
- **Needed**: Multi-org support, data isolation

##### 10. **Integration Ecosystem**
- **Missing**: Third-party integrations
- **Current**: Standalone system
- **Needed**: Payment gateways, accounting software, IoT

##### 11. **Mobile Applications**
- **Missing**: Native mobile apps
- **Current**: Web-only
- **Needed**: React Native/iOS/Android apps

##### 12. **AI/ML Features**
- **Missing**: Intelligent features
- **Current**: Rule-based logic
- **Needed**: Predictive analytics, automated insights

### 📋 **Integration Priority Matrix**

#### 🔥 **CRITICAL (Deploy Blockers)**
1. CI/CD Pipeline
2. Production Docker Setup
3. Environment Management
4. Basic Monitoring

#### ⚡ **HIGH (Business Critical)**
5. Real-time Notifications
6. Advanced Security (MFA)
7. API Rate Limiting
8. Error Tracking

#### 📊 **MEDIUM (Competitive Advantage)**
9. Advanced Reporting
10. Third-party Integrations
11. Workflow Automation
12. Mobile Responsiveness

#### 🚀 **FUTURE (Growth Features)**
13. Multi-tenancy
14. AI/ML Integration
15. Native Mobile Apps
16. Advanced Analytics

### 🎯 **Immediate Action Plan**

#### **Phase 1: Production Readiness (Week 1-2)**
- Implement CI/CD pipeline
- Set up production Docker configuration
- Add environment management
- Basic monitoring and logging

#### **Phase 2: Core Enhancements (Week 3-4)**
- Real-time notifications (WebSocket)
- API rate limiting and caching
- Multi-factor authentication
- Advanced error handling

#### **Phase 3: Business Features (Week 5-8)**
- Advanced reporting dashboard
- Third-party integrations
- Workflow automation
- Mobile optimization

#### **Phase 4: Enterprise Scale (Month 3+)**
- Multi-tenancy architecture
- AI/ML features
- Native mobile applications
- Advanced analytics

### 💡 **Key Insights**

1. **Strength**: The core application is remarkably complete with enterprise-grade architecture
2. **Gap**: Missing production deployment infrastructure
3. **Opportunity**: Strong foundation for rapid feature expansion
4. **Risk**: Without CI/CD and monitoring, production deployment is blocked
5. **Advantage**: Comprehensive business logic allows quick competitive feature implementation

The platform has **80% of enterprise features implemented** but needs **20% infrastructure** to be production-ready. The architecture supports all planned features - it's primarily an integration and deployment challenge.

### 📋 Planned Features

#### Financial & Accounting
- [ ] Automated rent collection and payment reminders
- [ ] Financial reporting and analytics dashboard
- [ ] Tax calculation and automated tax document generation
- [ ] Integration with accounting software (QuickBooks, Xero)
- [ ] Security deposit management and tracking
- [ ] Expense categorization and budget planning

#### Maintenance & Operations
- [ ] Tenant maintenance request portal with photo uploads
- [ ] Work order management and contractor assignment
- [ ] Approved vendor/contractor management system
- [ ] Preventive maintenance scheduling and tracking
- [ ] Property inspection system with digital checklists

#### Communication & Collaboration
- [ ] In-app messaging between landlords and tenants
- [ ] Automated email/SMS notifications for lease events
- [ ] Document sharing with electronic signature capabilities
- [ ] Lease renewal automation and negotiation workflows

#### Analytics & Business Intelligence
- [ ] Real-time occupancy rate tracking and reporting
- [ ] Revenue forecasting and financial projections
- [ ] Tenant retention analysis and improvement strategies
- [ ] Market rate analysis and competitive pricing
- [ ] Property performance dashboards and ROI calculations

#### Integration Capabilities
- [ ] Payment gateway integration (Stripe, PayPal, ACH)
- [ ] Calendar integration (Google Calendar, Outlook)
- [ ] Background check service integrations
- [ ] Property listing site integrations (Zillow, Apartments.com)
- [ ] IoT device integration (smart locks, thermostats)

#### Advanced Property Management
- [ ] Sub-letting and complex lease structure management
- [ ] Automated property inspection scheduling
- [ ] Lease violation tracking and automated notices
- [ ] Property transfer/sale management workflows
- [ ] Multi-property portfolio management dashboard

#### Compliance & Legal
- [ ] Automated lease agreement generation
- [ ] Fair housing compliance tracking and reporting
- [ ] Local regulation compliance management
- [ ] Insurance tracking and renewal management

#### Mobile & Accessibility
- [ ] Native mobile applications (iOS/Android)
- [ ] Offline functionality with data synchronization
- [ ] Voice commands and accessibility features
- [ ] Enhanced WCAG compliance and screen reader support

#### Security & Privacy
- [ ] Biometric authentication (fingerprint, facial recognition)
- [ ] IP whitelisting and geo-fencing
- [ ] Advanced session management and timeouts
- [ ] End-to-end data encryption for sensitive information

#### Marketing & Lead Management
- [ ] Property marketing campaign management
- [ ] Lead tracking and conversion analytics
- [ ] Virtual tour and video integration
- [ ] Showing scheduling and appointment management
- [ ] Referral program and commission tracking
- [ ] Social media integration for property listings

#### Sustainability & Green Features
- [ ] Energy usage tracking and reporting
- [ ] Carbon footprint monitoring
- [ ] Green certification management
- [ ] Utility bill analysis and optimization
- [ ] Sustainability goal setting and tracking
- [ ] Environmental compliance reporting

#### Emergency Management
- [ ] Emergency contact management system
- [ ] Evacuation procedures and floor plans
- [ ] Emergency notification broadcasting
- [ ] Incident reporting and tracking
- [ ] Safety inspection scheduling
- [ ] Emergency preparedness checklists

#### Tenant Experience
- [ ] Comprehensive tenant portal
- [ ] Community bulletin board and announcements
- [ ] Amenity booking system (gym, pool, etc.)
- [ ] Guest registration and parking management
- [ ] Tenant feedback and satisfaction surveys
- [ ] Move-in/move-out digital checklists

#### Data Management & Migration
- [ ] Bulk data import/export capabilities
- [ ] Automated data backup and recovery
- [ ] Legacy system migration tools
- [ ] Data validation and cleansing
- [ ] GDPR compliance and data portability
- [ ] Historical data archiving

#### Advanced Reporting & Dashboards
- [ ] Custom report builder with drag-and-drop
- [ ] Executive dashboards with KPI tracking
- [ ] Comparative property analysis
- [ ] Trend analysis and forecasting
- [ ] Automated report scheduling and delivery
- [ ] Interactive data visualization

#### Workflow Automation
- [ ] Custom workflow builder for business processes
- [ ] Automated approval workflows
- [ ] Rule-based notifications and alerts
- [ ] Document automation and templating
- [ ] Task automation and scheduling
- [ ] Process optimization recommendations

#### Training & Support
- [ ] In-app user training modules
- [ ] Interactive help system and tooltips
- [ ] Video tutorials and documentation
- [ ] Live chat support integration
- [ ] Knowledge base and FAQ system
- [ ] User onboarding and guided tours

#### Multi-tenancy & Scaling
- [ ] Multi-organization support
- [ ] White-label customization options
- [ ] Regional and language customization
- [ ] Scalable architecture for high-volume operations
- [ ] Enterprise-grade security and compliance
- [ ] Custom branding and theming

#### Blockchain & Smart Contracts
- [ ] Smart lease agreements with automated execution
- [ ] Blockchain-based payment tracking and escrow
- [ ] Tokenized property ownership and fractional shares
- [ ] Decentralized identity verification for tenants
- [ ] Immutable audit trails for all transactions
- [ ] Smart contract automation for rent collection

#### AR/VR & Immersive Experiences
- [ ] Virtual reality property tours
- [ ] Augmented reality furniture placement
- [ ] 3D property modeling and visualization
- [ ] Interactive floor plans with measurements
- [ ] Virtual staging for vacant properties
- [ ] Immersive property marketing experiences

#### Voice & Conversational AI
- [ ] Voice-activated property management commands
- [ ] AI chatbot for tenant inquiries and support
- [ ] Voice-based maintenance request reporting
- [ ] Natural language lease document analysis
- [ ] Voice-guided property tours and showings
- [ ] Automated voice notifications and reminders

#### Gamification & Engagement
- [ ] Tenant reward programs and loyalty points
- [ ] Gamified maintenance reporting incentives
- [ ] Community engagement challenges and competitions
- [ ] Property manager performance leaderboards
- [ ] Achievement badges for timely rent payments
- [ ] Interactive tenant onboarding quests

#### Advanced IoT Integration
- [ ] Smart lock integration with mobile access
- [ ] Environmental sensors (temperature, humidity, air quality)
- [ ] Energy management and optimization systems
- [ ] Automated irrigation and landscaping control
- [ ] Security camera integration with AI monitoring
- [ ] Predictive maintenance using sensor data

#### Regulatory & Compliance Automation
- [ ] Automated fair housing law compliance checking
- [ ] Local ordinance and zoning regulation tracking
- [ ] Accessibility compliance monitoring (ADA)
- [ ] Automated reporting for government agencies
- [ ] Insurance requirement verification
- [ ] Background check automation and tracking

#### Partnership & Marketplace Ecosystem
- [ ] Contractor marketplace with vetted professionals
- [ ] Insurance broker integration and quotes
- [ ] Furniture rental and staging partnerships
- [ ] Cleaning service marketplace
- [ ] Moving company integration and booking
- [ ] Legal service connections for lease review

#### Innovation & Future Tech
- [ ] 5G-enabled real-time property monitoring
- [ ] Drone-based property inspections
- [ ] Satellite imagery for property assessment
- [ ] Quantum-secure encryption for sensitive data
- [ ] Neural network-based market predictions
- [ ] Holographic property presentations

#### Advanced AI & Predictive Analytics
- [ ] AI-powered lease optimization suggestions
- [ ] Predictive vacancy risk assessment
- [ ] Automated market rate adjustments
- [ ] Tenant credit risk scoring
- [ ] Natural disaster impact prediction
- [ ] Economic trend analysis for rent pricing

#### Mobile App Features
- [ ] Native iOS and Android applications
- [ ] Offline property viewing and data entry
- [ ] GPS-based property navigation and directions
- [ ] Camera integration for property photos and inspections
- [ ] Push notifications for maintenance updates and payments
- [ ] Biometric authentication (fingerprint, face ID)
- [ ] QR code property check-in/check-out system
- [ ] Voice-to-text for maintenance requests

#### Web Application Features
- [ ] Progressive Web App (PWA) capabilities
- [ ] Browser-based virtual property tours
- [ ] Drag-and-drop file uploads for documents
- [ ] Real-time collaborative document editing
- [ ] Advanced filtering and search capabilities
- [ ] Customizable dashboard widgets
- [ ] Browser extension for quick property lookups
- [ ] WebRTC video calls for virtual showings

#### Desktop Application Features
- [ ] Cross-platform desktop app (Windows, macOS, Linux)
- [ ] Bulk data import/export with Excel integration
- [ ] Advanced reporting with export to PDF/Excel
- [ ] Local database synchronization
- [ ] Keyboard shortcuts and productivity tools
- [ ] Multi-monitor support for complex workflows
- [ ] System tray notifications and quick actions
- [ ] Integration with local file systems and printers

#### API & Integration Features
- [ ] GraphQL API for flexible data queries
- [ ] OAuth 2.0 and OpenID Connect support
- [ ] Rate limiting and API key management
- [ ] Webhook events for real-time integrations
- [ ] API versioning and deprecation policies
- [ ] Third-party app marketplace
- [ ] SDKs for popular programming languages
- [ ] API analytics and usage monitoring

#### Admin Panel Features
- [ ] Multi-tenant user management and permissions
- [ ] System-wide configuration and settings
- [ ] Audit logs and compliance reporting
- [ ] Performance monitoring and analytics
- [ ] Automated backup and disaster recovery
- [ ] User activity tracking and security monitoring
- [ ] Custom branding and white-label options
- [ ] Advanced user role and permission management

#### Tenant Portal Features
- [ ] Self-service rent payments and payment history
- [ ] Maintenance request submission with photo uploads
- [ ] Lease document access and digital signatures
- [ ] Community announcements and event calendar
- [ ] Amenity reservations and booking system
- [ ] Neighbor directory and communication tools
- [ ] Move-in/move-out checklist and walkthrough
- [ ] Personalized dashboard with account overview

#### Property Manager Dashboard
- [ ] Real-time portfolio performance metrics
- [ ] Task management and workflow automation
- [ ] Team collaboration tools and assignments
- [ ] Property inspection scheduling and tracking
- [ ] Financial reporting and budget monitoring
- [ ] Tenant communication hub and history
- [ ] Maintenance workflow and contractor management
- [ ] Occupancy and vacancy analytics

#### Landlord Portal Features
- [ ] Multi-property portfolio overview
- [ ] Investment performance and ROI tracking
- [ ] Automated rent collection and payment processing
- [ ] Property value appreciation tracking
- [ ] Tax document generation and organization
- [ ] Insurance management and claims tracking
- [ ] Property sale and acquisition tools
- [ ] Succession planning and property transfer

#### Maintenance Management App
- [ ] Digital work order creation and assignment
- [ ] Contractor bidding and selection system
- [ ] Parts inventory and procurement tracking
- [ ] Preventive maintenance scheduling
- [ ] Equipment warranty and service tracking
- [ ] Cost estimation and budget approval workflows
- [ ] Quality control checklists and inspections
- [ ] Maintenance history and trend analysis

#### Accounting & Finance Module
- [ ] Automated rent roll generation
- [ ] Expense tracking and categorization
- [ ] Financial statement preparation
- [ ] Tax calculation and reporting automation
- [ ] Budget vs actual variance analysis
- [ ] Cash flow forecasting and management
- [ ] Multi-currency transaction support
- [ ] Integration with accounting software

#### Existing Planned Features
- [ ] Property categories and tagging system
- [ ] File upload for property images and documents
- [ ] Audit logging and activity tracking
- [ ] Role-based access control (RBAC)
- [ ] Real-time notifications with WebSocket
- [ ] Mobile-responsive design optimization
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

*Last updated: November 15, 2025 - Added loading states and enhanced UX workflows*