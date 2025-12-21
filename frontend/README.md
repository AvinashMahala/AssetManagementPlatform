# Asset Management Platform Frontend

A comprehensive React-based web application for managing properties, tenants, leases, payments, and related operations in a property management business.

## Table of Contents

- [What is the App](#what-is-the-app)
- [App Flow](#app-flow)
- [Page Lifecycle](#page-lifecycle)
- [Overall Architecture](#overall-architecture)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Development](#development)
- [Building and Deployment](#building-and-deployment)

## What is the App

The Asset Management Platform is a full-featured property management system designed to streamline operations for property managers and landlords. It provides tools for:

- **Property Management**: Track and manage multiple properties and units
- **Tenant Management**: Handle tenant information, leases, and communications
- **Financial Operations**: Process rent collection, payments, expenses, and generate reports
- **Document Management**: Store and organize property-related files and templates
- **Meter Reading**: Track utility meter readings and consumption
- **Bulk Operations**: Perform mass updates and operations across multiple entities

## App Flow

1. **Authentication**: Users log in via email/password or Google OAuth
2. **Dashboard**: Overview of key metrics, recent activities, and quick access to main features
3. **Navigation**: Users access different modules through the main navigation menu
4. **Module Operations**: Within each module (properties, tenants, leases, etc.), users can:
   - View lists of entities
   - Create new records
   - Edit existing records
   - Delete records (with confirmation)
   - Search and filter data
   - Export data to PDF/CSV
5. **Data Persistence**: All changes are saved to the backend API
6. **Notifications**: Users receive feedback through toast notifications and dialogs

## Page Lifecycle

Each page in the application follows a standard React component lifecycle:

1. **Route Matching**: React Router matches the URL to a route configuration
2. **Authentication Check**: ProtectedRoute component verifies user authentication and permissions
3. **Component Loading**: Lazy-loaded components are imported and rendered
4. **Data Fetching**: useApi hooks fetch data from the backend API
5. **State Management**: Context providers manage global state (auth, theme, notifications)
6. **Rendering**: Component renders with loading states, error boundaries, and data
7. **User Interaction**: Event handlers update local state and trigger API calls
8. **Cleanup**: Components unmount and clean up subscriptions/effects

## Overall Architecture

The application follows a modular, component-based architecture built on React with TypeScript.

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    User Interface Layer                     │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                 React Components                     │    │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐  │    │
│  │  │  Pages  │  │   UI    │  │  Forms  │  │ Modules │  │    │
│  │  │         │  │Components│  │         │  │         │  │    │
│  │  └─────────┘  └─────────┘  └─────────┘  └─────────┘  │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────┐
│                 Application Logic Layer                     │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐          │
│  │ Context │  │  Hooks  │  │Services │  │  Utils  │          │
│  │Providers│  │         │  │         │  │         │          │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘          │
└─────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────┐
│                   Data & Infrastructure Layer               │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐          │
│  │   API   │  │  Types  │  │ Config  │  │ Constants│         │
│  │ Client  │  │         │  │         │  │          │         │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘          │
└─────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────┐
│                     External Dependencies                   │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐          │
│  │ Backend │  │  Auth   │  │  File   │  │  Third  │          │
│  │   API   │  │ Service │  │ Storage │  │ Party   │          │
│  └─────────┘  └─────────┘  └─────────┘  │  APIs   │          │
│                                         └─────────┘          │
└─────────────────────────────────────────────────────────────┘
```

### Component Hierarchy

```
App (Root Component)
├── ErrorBoundary
├── Router
│   ├── ThemeProvider
│   │   ├── NotificationProvider
│   │   │   ├── AuthProvider
│   │   │   │   ├── ConsentDialog
│   │   │   │   ├── DevTools
│   │   │   │   ├── Toast
│   │   │   │   └── Routes
│   │   │   │       ├── PublicRoute (Login/Register)
│   │   │   │       └── ProtectedRoute (Dashboard, Modules)
│   │   │   └── ...
│   │   └── ...
│   └── ...
└── ...
```

### Data Flow Architecture

```
User Action → Component Event → Custom Hook → Service API Call → Backend
      ↓              ↓              ↓              ↓              ↓
   Re-render    State Update   Data Fetching   HTTP Request   Database
      ↑              ↑              ↑              ↑              ↑
   UI Update ← Context Update ← Hook Response ← API Response ← Backend Response
```

## Tech Stack

- **Frontend Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **Routing**: React Router DOM v7
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: Radix UI primitives
- **State Management**: React Context + local component state
- **API Client**: Custom fetch-based API client
- **Charts**: Recharts for data visualization
- **PDF Generation**: jsPDF and html2canvas
- **Date Handling**: date-fns
- **Icons**: Lucide React
- **Testing**: Vitest + React Testing Library
- **Linting**: ESLint
- **Containerization**: Docker with multi-stage builds

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Backend API server running

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/AvinashMahala/AssetManagementPlatform.git
   cd AssetManagementPlatform/frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.development
   # Edit .env.development with your API URL and other settings
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:5173`.

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run test` - Run tests
- `npm run lint` - Run ESLint

### Code Organization

- Follow the established folder structure
- Use TypeScript for all new code
- Implement proper error handling and loading states
- Write tests for new features
- Follow React best practices and hooks patterns

## Building and Deployment

### Docker Build

```bash
docker build -t asset-management-frontend .
docker run -p 80:80 asset-management-frontend
```

### Production Deployment

1. Build the application:
   ```bash
   npm run build
   ```

2. Serve the `dist` folder with any static file server (nginx, Apache, etc.)

3. Configure environment variables for production in `.env.production`

### Environment Variables

See `docs/ENVIRONMENT.md` for complete list of environment variables.
