# Property Management Platform - Frontend

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![ESLint](https://img.shields.io/badge/ESLint-4B32C3?style=for-the-badge&logo=eslint&logoColor=white)](https://eslint.org/)

A modern, industrial-grade React frontend for the Property Management Platform. Built with TypeScript, Vite, and following enterprise-level architectural patterns with layered architecture, global state management, and comprehensive type safety.

```

┌─────────────────┐    ┌─────────────────┐[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)Currently, two official plugins are available:

│   Components    │────│   TypeScript    │

│   (UI Layer)    │    │   Interfaces    │## 🏗️ Architecture Overview

├─────────────────┤    ├─────────────────┤

│     Pages       │────│                 │[![ESLint](https://img.shields.io/badge/ESLint-4B32C3?style=for-the-badge&logo=eslint&logoColor=white)](https://eslint.org/)

├─────────────────┤    └─────────────────┘

│     Hooks       │ ← Business Logic Layer### Industrial-Grade Frontend Architecture

├─────────────────┤           ↑

│    Services     │ ← API Communication Layer- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh

├─────────────────┤    ┌─────────────────┐

│    Contexts     │    │   Constants &   │The frontend follows an **enterprise-level layered architecture** that mirrors backend patterns while adapting to React best practices:

│ (Global State)  │    │    Utilities    │

└─────────────────┘    └─────────────────┘# Asset Management Platform - Frontend

```

```

### Architecture Layers

┌─────────────────┐    ┌─────────────────┐[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)

1. **Components** (`src/components/`): Reusable UI building blocks with TypeScript interfaces

2. **Pages** (`src/pages/`): Route-level components that compose the application│   Components    │────│   TypeScript    │[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

3. **Hooks** (`src/hooks/`): Custom React hooks for business logic and API state management

4. **Services** (`src/services/`): Centralized API communication layer│   (UI Layer)    │    │   Interfaces    │[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)

5. **Contexts** (`src/contexts/`): Global state management with React Context API

6. **Types** (`src/types/`): Comprehensive TypeScript type definitions├─────────────────┤    ├─────────────────┤[![ESLint](https://img.shields.io/badge/ESLint-4B32C3?style=for-the-badge&logo=eslint&logoColor=white)](https://eslint.org/)

7. **Constants** (`src/constants/`): Configuration and validation constants

8. **Utils** (`src/utils/`): Helper functions and utilities│     Pages       │────│                 │



### Key Architectural Principles├─────────────────┤    └─────────────────┘A modern, industrial-grade React frontend for the Asset Management Platform. Built with TypeScript, Vite, and following enterprise-level architectural patterns with layered architecture, global state management, and comprehensive type safety.



- **Type Safety First**: End-to-end TypeScript with strict interfaces│     Hooks       │ ← Business Logic Layer

- **Separation of Concerns**: Clear boundaries between UI, logic, and data

- **Reusability**: Modular components and hooks for maximum code reuse├─────────────────┤           ↑## 🏗️ Architecture Overview

- **Maintainability**: Consistent patterns and enterprise-level organization

- **Scalability**: Architecture that grows with the application│    Services     │ ← API Communication Layer

- **Testability**: Clean interfaces and dependency injection patterns

├─────────────────┤    ┌─────────────────┐### Industrial-Grade Frontend Architecture

## 🚀 Features

│    Contexts     │    │   Constants &   │

- **React 18** with modern hooks and concurrent features

- **TypeScript** for end-to-end type safety│ (Global State)  │    │    Utilities    │The frontend follows an **enterprise-level layered architecture** that mirrors backend patterns while adapting to React best practices:

- **Vite** for lightning-fast development and optimized builds

- **Google OAuth Integration** with Google Identity Services API└─────────────────┘    └─────────────────┘

- **React Context API** for global state management

- **Custom Hooks** for business logic and API state``````

- **Component Library** with reusable UI components

- **API Integration** with centralized error handling┌─────────────────┐    ┌─────────────────┐

- **ESLint** + **Prettier** for code quality and formatting

- **Industrial-grade Architecture** with layered separation of concerns### Architecture Layers│   Components    │────│   TypeScript    │

- **Responsive Design** with mobile-first approach

- **Form Handling** with validation│   (UI Layer)    │    │   Interfaces    │

- **Error Boundaries** for robust error handling

- **Code Splitting** for optimal performance1. **Components** (`src/components/`): Reusable UI building blocks with TypeScript interfaces├─────────────────┤    ├─────────────────┤



## 🛠️ Tech Stack2. **Pages** (`src/pages/`): Route-level components that compose the application│     Pages       │────│                 │



- **React 18** - UI library with hooks and concurrent features3. **Hooks** (`src/hooks/`): Custom React hooks for business logic and API state management├─────────────────┤    └─────────────────┘

- **TypeScript** - Type-safe JavaScript with strict mode

- **Vite** - Build tool and dev server for fast development4. **Services** (`src/services/`): Centralized API communication layer│     Hooks       │ ← Business Logic Layer

- **Google Identity Services** - OAuth authentication

- **Axios** - HTTP client for API communication5. **Contexts** (`src/contexts/`): Global state management with React Context API├─────────────────┤           ↑

- **React Context API** - Global state management

- **ESLint** - Code linting with React-specific rules6. **Types** (`src/types/`): Comprehensive TypeScript type definitions│    Services     │ ← API Communication Layer

- **Prettier** - Code formatting

- **CSS Modules** - Scoped component styling7. **Constants** (`src/constants/`): Configuration and validation constants├─────────────────┤    ┌─────────────────┐



## 📁 Project Structure8. **Utils** (`src/utils/`): Helper functions and utilities│    Contexts     │    │   Constants &   │



```│ (Global State)  │    │    Utilities    │

frontend/

├── public/                    # Static assets### Key Architectural Principles└─────────────────┘    └─────────────────┘

│   ├── favicon.ico

│   └── assets/               # Images, fonts, etc.```

├── src/

│   ├── components/           # Reusable UI components- **Type Safety First**: End-to-end TypeScript with strict interfaces

│   │   ├── auth/            # Authentication components

│   │   │   ├── ProtectedRoute.tsx- **Separation of Concerns**: Clear boundaries between UI, logic, and data### Architecture Layers

│   │   │   ├── PublicRoute.tsx

│   │   │   └── index.ts- **Reusability**: Modular components and hooks for maximum code reuse

│   │   ├── common/          # Generic components

│   │   │   ├── Button.tsx   # Reusable button component- **Maintainability**: Consistent patterns and enterprise-level organization1. **Components** (`src/components/`): Reusable UI building blocks with TypeScript interfaces

│   │   │   ├── Input.tsx    # Form input component

│   │   │   ├── Card.tsx     # Card container component- **Scalability**: Architecture that grows with the application2. **Pages** (`src/pages/`): Route-level components that compose the application

│   │   │   ├── GoogleOAuthButton.tsx # Google OAuth button

│   │   │   └── index.ts     # Component exports- **Testability**: Clean interfaces and dependency injection patterns3. **Hooks** (`src/hooks/`): Custom React hooks for business logic and API state management

│   │   ├── forms/           # Form-specific components

│   │   │   ├── LoginForm.tsx4. **Services** (`src/services/`): Centralized API communication layer

│   │   │   ├── PasswordResetForm.tsx

│   │   │   ├── ProfileForm.tsx## 🚀 Features5. **Contexts** (`src/contexts/`): Global state management with React Context API

│   │   │   ├── RegisterForm.tsx

│   │   │   └── index.ts6. **Types** (`src/types/`): Comprehensive TypeScript type definitions

│   │   └── ui/              # UI-specific components

│   ├── pages/               # Route-level page components- **React 18** with modern hooks and concurrent features7. **Constants** (`src/constants/`): Configuration and validation constants

│   │   └── Dashboard.tsx    # Main dashboard page

│   ├── hooks/               # Custom React hooks- **TypeScript** for end-to-end type safety8. **Utils** (`src/utils/`): Helper functions and utilities

│   │   ├── useApi.ts        # API communication hook

│   │   ├── useAssets.ts     # Asset management hook- **Vite** for lightning-fast development and optimized builds

│   │   ├── useUsers.ts      # User management hook

│   │   └── useGoogleOAuth.ts # Google OAuth hook- **React Context API** for global state management### Key Architectural Principles

│   ├── services/            # API service functions

│   │   ├── apiClient.ts     # Centralized API client- **Custom Hooks** for business logic and API state

│   │   ├── assetService.ts  # Asset API operations

│   │   ├── authService.ts   # Authentication API operations- **Component Library** with reusable UI components- **Type Safety First**: End-to-end TypeScript with strict interfaces

│   │   └── userService.ts   # User API operations

│   ├── contexts/            # React contexts for global state- **API Integration** with centralized error handling- **Separation of Concerns**: Clear boundaries between UI, logic, and data

│   │   ├── AuthContext.tsx        # Authentication state

│   │   ├── ThemeContext.tsx       # Theme management- **ESLint** + **Prettier** for code quality and formatting- **Reusability**: Modular components and hooks for maximum code reuse

│   │   ├── NotificationContext.tsx # Notification system

│   │   └── index.ts         # Context exports- **Industrial-grade Architecture** with layered separation of concerns- **Maintainability**: Consistent patterns and enterprise-level organization

│   ├── types/               # TypeScript type definitions

│   │   ├── asset.ts         # Asset-related types- **Scalability**: Architecture that grows with the application

│   │   ├── user.ts          # User-related types

│   │   ├── api.ts           # API response types## 🛠️ Tech Stack- **Testability**: Clean interfaces and dependency injection patterns- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

│   │   ├── common.ts        # Common/shared types

│   │   └── index.ts         # Type exports

│   ├── constants/           # Configuration constants

│   │   ├── api.ts           # API endpoints and config- **React 18** - UI library with hooks and concurrent features

│   │   ├── validation.ts    # Validation rules

│   │   ├── ui.ts            # UI constants- **TypeScript** - Type-safe JavaScript with strict mode

│   │   └── index.ts         # Constant exports

│   ├── utils/               # Utility functions- **Vite** - Build tool and dev server for fast development## 🚀 Features## React Compiler

│   │   ├── formatters.ts    # Data formatting utilities

│   │   ├── helpers.ts       # General helper functions- **React Context API** - Global state management

│   │   ├── validation.ts    # Validation utilities

│   │   └── index.ts         # Utility exports- **Custom Hooks** - Business logic encapsulation

│   ├── App.tsx              # Main app component with context providers

│   └── main.tsx             # Application entry point- **Axios** - HTTP client for API communication

├── index.html               # HTML template

├── vite.config.ts           # Vite configuration- **ESLint** - Code linting with React-specific rules- **React 18** with modern hooks and concurrent featuresThe React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

├── tsconfig.json            # TypeScript configuration

├── tsconfig.app.json        # App-specific TypeScript config- **Prettier** - Code formatting

├── tsconfig.node.json       # Node-specific TypeScript config

├── eslint.config.ts         # ESLint configuration- **CSS Modules** - Scoped component styling (planned)- **TypeScript** for type safety and better developer experience

└── package.json

```



## 🚀 Quick Start## 📁 Project Structure- **Vite** for lightning-fast development and optimized builds## Expanding the ESLint configuration



### Prerequisites



- Node.js (v18 or higher)```- **Responsive Design** with mobile-first approach

- npm or yarn

frontend/

### Installation

├── public/                    # Static assets- **Component Library** with reusable UI componentsIf you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```bash

# Navigate to frontend directory│   ├── favicon.ico

cd frontend

│   └── assets/               # Images, fonts, etc.- **API Integration** with backend services

# Install dependencies

yarn install├── src/

```

│   ├── components/           # Reusable UI components- **Form Handling** with validation```js

### Development

│   │   ├── common/          # Generic components

```bash

# Start development server
yarn dev

│   │   │   ├── Input.tsx    # Form input component

# Build for production

yarn build│   │   │   ├── Card.tsx     # Card container component- **Code Splitting** for optimal performance  globalIgnores(['dist']),



# Preview production build

yarn preview│   │   │   └── index.ts     # Component exports

```│   │   ├── forms/           # Form-specific components (planned)  {



### Environment Setup│   │   ├── layout/          # Layout components (planned)



Create a `.env.local` file in the frontend directory:│   │   └── ui/              # UI-specific components (planned)## 🛠️ Tech Stack    files: ['**/*.{ts,tsx}'],



```env│   ├── pages/               # Route-level page components

VITE_API_BASE_URL=http://localhost:5000

VITE_APP_TITLE=Asset Management Platform│   │   └── Dashboard.tsx    # Main dashboard page    extends: [

VITE_GOOGLE_CLIENT_ID=your_google_client_id_here

```│   ├── hooks/               # Custom React hooks



## 🔧 Core Architecture Components│   │   ├── useApi.ts        # API communication hook- **React 18** - UI library with hooks      // Other configs...



### API Service Layer│   │   ├── useAssets.ts     # Asset management hook



Centralized API communication with error handling:│   │   └── useUsers.ts      # User management hook- **TypeScript** - Type-safe JavaScript



```typescript│   ├── services/            # API service functions

// src/services/apiClient.ts

import axios, { AxiosInstance, AxiosResponse } from 'axios';│   │   ├── apiClient.ts     # Centralized API client- **Vite** - Build tool and dev server      // Remove tseslint.configs.recommended and replace with this

import type { ApiResponse, RequestConfig } from '../types/api';

│   │   ├── assetService.ts  # Asset API operations

class ApiClient {

  private client: AxiosInstance;│   │   └── userService.ts   # User API operations- **React Router** - Client-side routing (planned)      tseslint.configs.recommendedTypeChecked,



  constructor(baseURL: string) {│   ├── contexts/            # React contexts for global state

    this.client = axios.create({

      baseURL,│   │   ├── AuthContext.tsx        # Authentication state- **Axios** - HTTP client for API calls      // Alternatively, use this for stricter rules

      timeout: 10000,

      headers: {│   │   ├── ThemeContext.tsx       # Theme management

        'Content-Type': 'application/json',

      },│   │   ├── NotificationContext.tsx # Notification system- **ESLint** - Code linting      tseslint.configs.strictTypeChecked,

    });

│   │   └── index.ts         # Context exports

    this.setupInterceptors();

  }│   ├── types/               # TypeScript type definitions- **Prettier** - Code formatting      // Optionally, add this for stylistic rules



  private setupInterceptors() {│   │   ├── asset.ts         # Asset-related types

    // Request interceptor for auth

    this.client.interceptors.request.use((config) => {│   │   ├── user.ts          # User-related types- **CSS Modules** - Scoped styling      tseslint.configs.stylisticTypeChecked,

      const token = localStorage.getItem('auth-token');

      if (token) {│   │   ├── api.ts           # API response types

        config.headers.Authorization = `Bearer ${token}`;

      }│   │   ├── common.ts        # Common/shared types

      return config;

    });│   │   └── index.ts         # Type exports



    // Response interceptor for error handling│   ├── constants/           # Configuration constants## 📁 Project Structure      // Other configs...

    this.client.interceptors.response.use(

      (response) => response,│   │   ├── api.ts           # API endpoints and config

      (error) => {

        if (error.response?.status === 401) {│   │   ├── validation.ts    # Validation rules    ],

          // Handle unauthorized

          localStorage.removeItem('auth-token');│   │   ├── ui.ts            # UI constants

          window.location.href = '/login';

        }│   │   └── index.ts         # Constant exports```    languageOptions: {

        return Promise.reject(error);

      }│   ├── utils/               # Utility functions

    );

  }│   │   ├── formatters.ts    # Data formatting utilitiesfrontend/      parserOptions: {



  async get<T>(url: string, config?: RequestConfig): Promise<ApiResponse<T>> {│   │   ├── helpers.ts       # General helper functions

    const response: AxiosResponse<ApiResponse<T>> = await this.client.get(url, config);

    return response.data;│   │   ├── validation.ts    # Validation utilities├── public/                    # Static assets        project: ['./tsconfig.node.json', './tsconfig.app.json'],

  }

│   │   └── index.ts         # Utility exports

  async post<T>(url: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {

    const response: AxiosResponse<ApiResponse<T>> = await this.client.post(url, data, config);│   ├── lib/                 # Third-party library configurations (planned)│   ├── favicon.ico        tsconfigRootDir: import.meta.dirname,

    return response.data;

  }│   ├── App.tsx              # Main app component with context providers



  // ... other HTTP methods│   └── main.tsx             # Application entry point│   └── assets/               # Images, fonts, etc.      },

}

├── index.html               # HTML template

export const apiClient = new ApiClient(import.meta.env.VITE_API_BASE_URL);

```├── vite.config.ts           # Vite configuration├── src/      // other options...



### Custom Hooks├── tsconfig.json            # TypeScript configuration



Reusable business logic with React hooks:├── tsconfig.app.json        # App-specific TypeScript config│   ├── components/           # Reusable UI components    },



```typescript├── tsconfig.node.json       # Node-specific TypeScript config

// src/hooks/useAssets.ts

import { useState, useEffect } from 'react';├── eslint.config.ts         # ESLint configuration│   │   ├── common/          # Generic components (Button, Input, etc.)  },

import { assetService } from '../services/assetService';

import { useNotifications } from '../contexts';└── package.json

import type { Asset } from '../types/asset';

```│   │   ├── layout/          # Layout components (Header, Sidebar, etc.)])

export const useAssets = () => {

  const [assets, setAssets] = useState<Asset[]>([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);## 🚀 Quick Start│   │   └── forms/           # Form components```

  const { showError } = useNotifications();



  const fetchAssets = async () => {

    try {### Prerequisites│   ├── pages/               # Page components

      setLoading(true);

      const response = await assetService.getAll();

      if (response.success) {

        setAssets(Array.isArray(response.data) ? response.data : []);- Node.js (v18 or higher)│   │   ├── Dashboard.tsxYou can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

        setError(null);

      } else {- npm or yarn

        setError(response.error?.message || 'Failed to fetch assets');

        showError('Failed to load assets');│   │   ├── Assets.tsx

      }

    } catch (err) {### Installation

      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch assets';

      setError(errorMessage);│   │   ├── AssetDetail.tsx```js

      showError(errorMessage);

    } finally {```bash

      setLoading(false);

    }# Navigate to frontend directory│   │   └── Users.tsx// eslint.config.js

  };

cd frontend

  useEffect(() => {

    fetchAssets();│   ├── hooks/               # Custom React hooksimport reactX from 'eslint-plugin-react-x'

  }, []);

# Install dependencies

  return {

    assets,npm install│   │   ├── useAssets.tsimport reactDom from 'eslint-plugin-react-dom'

    loading,

    error,```

    refetch: fetchAssets,

  };│   │   ├── useUsers.ts

};

```### Development



### React Contexts│   │   └── useApi.tsexport default defineConfig([



Global state management with Context API:```bash



```typescript# Start development server│   ├── services/            # API service functions  globalIgnores(['dist']),

// src/contexts/AuthContext.tsx

import React, { createContext, useContext, useState, useEffect } from 'react';npm run dev

import type { ReactNode } from 'react';

import type { User, UserLoginInput } from '../types/user';│   │   ├── api.ts           # Base API configuration  {

import { userService } from '../services/userService';

# Build for production

interface AuthContextType {

  user: User | null;npm run build│   │   ├── assetService.ts    files: ['**/*.{ts,tsx}'],

  isAuthenticated: boolean;

  loading: boolean;

  login: (credentials: UserLoginInput) => Promise<boolean>;

  logout: () => void;# Preview production build│   │   └── userService.ts    extends: [

  checkAuth: () => Promise<void>;

}npm run preview



const AuthContext = createContext<AuthContextType | undefined>(undefined);```│   ├── utils/               # Utility functions      // Other configs...



interface AuthProviderProps {

  children: ReactNode;

}### Environment Setup│   │   ├── constants.ts      // Enable lint rules for React



export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {

  const [user, setUser] = useState<User | null>(null);

  const [isAuthenticated, setIsAuthenticated] = useState(false);Create a `.env.local` file in the frontend directory:│   │   ├── helpers.ts      reactX.configs['recommended-typescript'],

  const [loading, setLoading] = useState(true);



  useEffect(() => {

    checkAuth();```env│   │   └── validation.ts      // Enable lint rules for React DOM

  }, []);

VITE_API_BASE_URL=http://localhost:5000

  const checkAuth = async () => {

    try {VITE_APP_TITLE=Asset Management Platform│   ├── types/               # TypeScript type definitions      reactDom.configs.recommended,

      userService.initializeAuth();

      if (userService.isAuthenticated()) {```

        const response = await userService.getProfile();

        if (response.success) {│   │   ├── asset.ts    ],

          setUser(response.data!);

          setIsAuthenticated(true);## 🔧 Core Architecture Components

        } else {

          userService.logout();│   │   ├── user.ts    languageOptions: {

          setIsAuthenticated(false);

          setUser(null);### API Service Layer

        }

      } else {│   │   └── api.ts      parserOptions: {

        setIsAuthenticated(false);

        setUser(null);Centralized API communication with error handling:

      }

    } catch (error) {│   ├── contexts/            # React contexts (planned)        project: ['./tsconfig.node.json', './tsconfig.app.json'],

      setIsAuthenticated(false);

      setUser(null);```typescript

    } finally {

      setLoading(false);// src/services/apiClient.ts│   │   ├── AuthContext.tsx        tsconfigRootDir: import.meta.dirname,

    }

  };import axios, { AxiosInstance, AxiosResponse } from 'axios';



  const login = async (credentials: UserLoginInput): Promise<boolean> => {import type { ApiResponse, RequestConfig } from '../types/api';│   │   └── ThemeContext.tsx      },

    try {

      const response = await userService.login(credentials);

      if (response.success) {

        setUser(response.data!.user);class ApiClient {│   ├── App.tsx              # Main app component      // other options...

        setIsAuthenticated(true);

        return true;  private client: AxiosInstance;

      }

      return false;│   ├── main.tsx             # Application entry point    },

    } catch (error) {

      return false;  constructor(baseURL: string) {

    }

  };    this.client = axios.create({│   └── index.css            # Global styles  },



  const logout = () => {      baseURL,

    userService.logout();

    setUser(null);      timeout: 10000,├── index.html               # HTML template])

    setIsAuthenticated(false);

  };      headers: {



  const value: AuthContextType = {        'Content-Type': 'application/json',├── vite.config.ts           # Vite configuration```

    user,

    isAuthenticated,      },

    loading,

    login,    });├── tsconfig.json            # TypeScript configuration

    logout,

    checkAuth,├── tsconfig.app.json        # App-specific TypeScript config

  };

    this.setupInterceptors();├── tsconfig.node.json       # Node-specific TypeScript config

  return (

    <AuthContext.Provider value={value}>  }├── eslint.config.ts         # ESLint configuration

      {children}

    </AuthContext.Provider>└── package.json

  );

};  private setupInterceptors() {```



export const useAuthContext = (): AuthContextType => {    // Request interceptor for auth

  const context = useContext(AuthContext);

  if (context === undefined) {    this.client.interceptors.request.use((config) => {## 🚀 Quick Start

    throw new Error('useAuthContext must be used within an AuthProvider');

  }      const token = localStorage.getItem('auth-token');

  return context;

};      if (token) {### Prerequisites

```

        config.headers.Authorization = `Bearer ${token}`;

### Google OAuth Integration

      }- Node.js (v18 or higher)

Seamless authentication with Google Identity Services:

      return config;- npm or yarn

```typescript

// src/hooks/useGoogleOAuth.ts    });

import { useState } from 'react';

import { useAuthContext } from '../contexts/AuthContext';### Installation

import { authService } from '../services/authService';

    // Response interceptor for error handling

declare global {

  interface Window {    this.client.interceptors.response.use(```bash

    google: any;

  }      (response) => response,# Navigate to frontend directory

}

      (error) => {cd frontend

export const useGoogleOAuth = () => {

  const [loading, setLoading] = useState(false);        if (error.response?.status === 401) {

  const { login } = useAuthContext();

          // Handle unauthorized# Install dependencies

  const initializeGoogleAuth = () => {

    if (window.google) {          localStorage.removeItem('auth-token');npm install

      window.google.accounts.id.initialize({

        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,          window.location.href = '/login';```

        callback: handleGoogleResponse,

      });        }

    }

  };        return Promise.reject(error);### Development



  const handleGoogleResponse = async (response: any) => {      }

    try {

      setLoading(true);    );```bash

      const result = await authService.googleAuth(response.credential);

      if (result.success) {  }# Start development server

        // AuthContext will handle the user state update

        window.location.href = '/dashboard';npm run dev

      }

    } catch (error) {  async get<T>(url: string, config?: RequestConfig): Promise<ApiResponse<T>> {

      console.error('Google OAuth error:', error);

    } finally {    const response: AxiosResponse<ApiResponse<T>> = await this.client.get(url, config);# Build for production

      setLoading(false);

    }    return response.data;yarn build

  };

  }

  const renderGoogleButton = (elementId: string) => {

    if (window.google) {# Preview production build

      window.google.accounts.id.renderButton(

        document.getElementById(elementId),  async post<T>(url: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {yarn preview

        {

          theme: 'outline',    const response: AxiosResponse<ApiResponse<T>> = await this.client.post(url, data, config);```

          size: 'large',

          type: 'standard',    return response.data;

        }

      );  }### Environment Setup

    }

  };



  return {  // ... other HTTP methodsCreate a `.env.local` file in the frontend directory:

    loading,

    initializeGoogleAuth,}

    renderGoogleButton,

  };```env

};

```export const apiClient = new ApiClient(import.meta.env.VITE_API_BASE_URL);VITE_API_BASE_URL=http://localhost:5000



## 🎨 Styling```VITE_APP_TITLE=Asset Management Platform



### CSS Modules```



Scoped styling with CSS Modules:### Custom Hooks



```css## 🏗️ Architecture

/* src/components/common/Button.module.css */

.button {Reusable business logic with React hooks:

  display: inline-flex;

  align-items: center;### Component Architecture

  justify-content: center;

  border: none;```typescript

  border-radius: 4px;

  font-weight: 500;// src/hooks/useAssets.tsThe frontend follows a **component-based architecture** with clear separation of concerns:

  cursor: pointer;

  transition: all 0.2s ease;import { useState, useEffect } from 'react';

}

import { assetService } from '../services/assetService';1. **Pages** - Route-level components that compose the UI

.primary {

  background-color: #007bff;import { useNotifications } from '../contexts';2. **Components** - Reusable UI building blocks

  color: white;

}import type { Asset } from '../types/asset';3. **Hooks** - Custom logic and state management



.primary:hover {4. **Services** - API communication layer

  background-color: #0056b3;

}export const useAssets = () => {5. **Utils** - Helper functions and constants



.secondary {  const [assets, setAssets] = useState<Asset[]>([]);

  background-color: #6c757d;

  color: white;  const [loading, setLoading] = useState(true);### State Management Strategy

}

  const [error, setError] = useState<string | null>(null);

.secondary:hover {

  background-color: #545b62;  const { showError } = useNotifications();- **Local State**: React `useState` for component-specific state

}

```- **Server State**: React Query (planned) for server state management



### Global Styles  const fetchAssets = async () => {- **Global State**: Context API for app-wide state (auth, theme, etc.)



Base styles and CSS custom properties:    try {- **Form State**: Controlled components with validation



```css      setLoading(true);

/* src/index.css */

:root {      const response = await assetService.getAll();## 🔧 Core Components

  --primary-color: #007bff;

  --secondary-color: #6c757d;      if (response.success) {

  --success-color: #28a745;

  --danger-color: #dc3545;        setAssets(response.data || []);### API Service Layer

  --warning-color: #ffc107;

  --font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;        setError(null);

  --border-radius: 4px;

  --box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);      } else {Centralized API communication with error handling:

}

        setError(response.error?.message || 'Failed to fetch assets');

* {

  box-sizing: border-box;        showError('Failed to load assets');```typescript

  margin: 0;

  padding: 0;      }// src/services/api.ts

}

    } catch (err) {import axios from 'axios';

body {

  font-family: var(--font-family);      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch assets';

  line-height: 1.6;

  color: #333;      setError(errorMessage);const api = axios.create({

  background-color: #f8f9fa;

}      showError(errorMessage);  baseURL: import.meta.env.VITE_API_BASE_URL,



button {    } finally {  timeout: 10000,

  font-family: inherit;

}      setLoading(false);});

```

    }

## 📱 Responsive Design

  };// Request interceptor for auth headers

Mobile-first responsive design with CSS Grid and Flexbox:

api.interceptors.request.use((config) => {

```css

/* Mobile-first approach */  useEffect(() => {  const token = localStorage.getItem('token');

.container {

  display: grid;    fetchAssets();  if (token) {

  grid-template-columns: 1fr;

  gap: 1rem;  }, []);    config.headers.Authorization = `Bearer ${token}`;

  padding: 1rem;

}  }



/* Tablet */  return {  return config;

@media (min-width: 768px) {

  .container {    assets,});

    grid-template-columns: repeat(2, 1fr);

    padding: 2rem;    loading,

  }

}    error,// Response interceptor for error handling



/* Desktop */    refetch: fetchAssets,api.interceptors.response.use(

@media (min-width: 1024px) {

  .container {  };  (response) => response,

    grid-template-columns: repeat(3, 1fr);

    max-width: 1200px;};  (error) => {

    margin: 0 auto;

  }```    if (error.response?.status === 401) {

}

```      // Handle unauthorized



## 🧪 Testing### React Contexts      localStorage.removeItem('token');



### Unit Tests      window.location.href = '/login';



```bashGlobal state management with Context API:    }

# Run unit tests

npm test    return Promise.reject(error);



# Run with coverage```typescript  }

npm run test:coverage

// src/contexts/AuthContext.tsx);

# Run tests in watch mode

npm run test:watchimport React, { createContext, useContext, useState, useEffect } from 'react';

```

import type { ReactNode } from 'react';export default api;

### Test Structure

import type { User, UserLoginInput } from '../types/user';```

```

src/import { userService } from '../services/userService';

├── __tests__/

│   ├── components/### Custom Hooks

│   │   ├── Button.test.tsx

│   │   └── Card.test.tsxinterface AuthContextType {

│   ├── hooks/

│   │   ├── useAssets.test.ts  user: User | null;Reusable logic with React hooks:

│   │   └── useApi.test.ts

│   ├── services/  isAuthenticated: boolean;

│   │   ├── assetService.test.ts

│   │   │   └── userService.test.ts  loading: boolean;```typescript

│   ├── contexts/

│   │   └── AuthContext.test.tsx  login: (credentials: UserLoginInput) => Promise<boolean>;// src/hooks/useAssets.ts

│   └── utils/

│       └── helpers.test.ts  logout: () => void;import { useState, useEffect } from 'react';

```

  checkAuth: () => Promise<void>;import { assetService } from '../services/assetService';

### Component Testing Example

}import { Asset } from '../types/asset';

```typescript

// src/__tests__/components/Button.test.tsx

import { render, screen, fireEvent } from '@testing-library/react';

import { Button } from '../../components/common/Button';const AuthContext = createContext<AuthContextType | undefined>(undefined);export const useAssets = () => {



describe('Button', () => {  const [assets, setAssets] = useState<Asset[]>([]);

  it('renders children correctly', () => {

    render(<Button>Click me</Button>);interface AuthProviderProps {  const [loading, setLoading] = useState(true);

    expect(screen.getByText('Click me')).toBeInTheDocument();

  });  children: ReactNode;  const [error, setError] = useState<string | null>(null);



  it('handles click events', () => {}

    const handleClick = jest.fn();

    render(<Button onClick={handleClick}>Click me</Button>);  const fetchAssets = async () => {

    fireEvent.click(screen.getByText('Click me'));

    expect(handleClick).toHaveBeenCalledTimes(1);export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {    try {

  });

  const [user, setUser] = useState<User | null>(null);      setLoading(true);

  it('shows loading state', () => {

    render(<Button loading>Loading...</Button>);  const [isAuthenticated, setIsAuthenticated] = useState(false);      const data = await assetService.getAll();

    expect(screen.getByText('Loading...')).toBeInTheDocument();

  });  const [loading, setLoading] = useState(true);      setAssets(data);



  it('applies correct variant classes', () => {      setError(null);

    render(<Button variant="danger">Danger</Button>);

    const button = screen.getByText('Danger');  useEffect(() => {    } catch (err) {

    expect(button).toHaveClass('bg-red-600');

  });    checkAuth();      setError(err instanceof Error ? err.message : 'Failed to fetch assets');

});

```  }, []);    } finally {



## 🚀 Deployment      setLoading(false);



### Build Configuration  const checkAuth = async () => {    }



```typescript    try {  };

// vite.config.ts

import { defineConfig } from 'vite';      userService.initializeAuth();

import react from '@vitejs/plugin-react';

  useEffect(() => {

export default defineConfig({

  plugins: [react()],      if (userService.isAuthenticated()) {    fetchAssets();

  build: {

    outDir: 'dist',        const response = await userService.getProfile();  }, []);

    sourcemap: true,

    rollupOptions: {        if (response.success) {

      output: {

        manualChunks: {          setUser(response.data!);  return {

          vendor: ['react', 'react-dom'],

          router: ['react-router-dom'],          setIsAuthenticated(true);    assets,

          ui: ['axios', 'date-fns'],

        },        } else {    loading,

      },

    },          userService.logout();    error,

  },

  server: {          setIsAuthenticated(false);    refetch: fetchAssets,

    port: 3000,

    proxy: {          setUser(null);  };

      '/api': {

        target: 'http://localhost:5000',        }};

        changeOrigin: true,

      },      } else {```

    },

  },        setIsAuthenticated(false);

});

```        setUser(null);### Component Structure



### Production Build      }



```bash    } catch (error) {Clean, maintainable components:

# Create optimized production build

npm run build      setIsAuthenticated(false);



# Preview the build locally      setUser(null);```typescript

npm run preview

```    } finally {// src/components/common/Button.tsx



The `dist/` folder contains the production-ready files.      setLoading(false);import React from 'react';



## 🔧 Development Guidelines    }import styles from './Button.module.css';



### Code Style  };



- **TypeScript Strict Mode**: Enabled for maximum type safetyinterface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {

- **ESLint Rules**: Follow configured linting rules

- **Prettier**: Automatic code formatting  const login = async (credentials: UserLoginInput): Promise<boolean> => {  variant?: 'primary' | 'secondary' | 'danger';

- **Component Naming**: PascalCase for components

- **File Naming**: camelCase for utilities, PascalCase for components    try {  size?: 'small' | 'medium' | 'large';

- **Hook Naming**: camelCase with 'use' prefix

      const response = await userService.login(credentials);  loading?: boolean;

### Best Practices

      if (response.success) {}

1. **Component Composition**: Prefer composition over inheritance

2. **Custom Hooks**: Extract reusable logic into custom hooks        setUser(response.data!.user);

3. **Type Safety**: Use TypeScript interfaces for all data structures

4. **Error Boundaries**: Wrap components that might throw errors        setIsAuthenticated(true);export const Button: React.FC<ButtonProps> = ({

5. **Performance**: Use React.memo, useMemo, and useCallback appropriately

6. **Accessibility**: Include ARIA labels and semantic HTML        return true;  variant = 'primary',

7. **Context Usage**: Use contexts for global state, hooks for business logic

      }  size = 'medium',

### Architecture Rules

      return false;  loading = false,

- **Components**: Pure UI components, no business logic

- **Hooks**: Business logic and API state management    } catch (error) {  children,

- **Services**: API communication and data transformation

- **Contexts**: Global application state      return false;  className,

- **Types**: Centralized type definitions

- **Constants**: Configuration and validation rules    }  disabled,

- **Utils**: Pure utility functions

  };  ...props

## 🔮 Future Enhancements

}) => {

- [ ] React Router for client-side routing

- [ ] React Query for advanced server state management  const logout = () => {  const buttonClasses = [

- [ ] Form validation with react-hook-form

- [ ] Internationalization (i18n)    userService.logout();    styles.button,

- [ ] Progressive Web App (PWA) features

- [ ] Component library documentation with Storybook    setUser(null);    styles[variant],

- [ ] End-to-end testing with Playwright

- [ ] Performance monitoring and analytics    setIsAuthenticated(false);    styles[size],

- [ ] Error tracking and reporting

- [ ] Advanced theming system  };    loading && styles.loading,

- [ ] Offline support with service workers

    className,

## 📚 Additional Resources

  const value: AuthContextType = {  ].filter(Boolean).join(' ');

- [React Documentation](https://react.dev/)

- [TypeScript Handbook](https://www.typescriptlang.org/docs/)    user,

- [Vite Guide](https://vitejs.dev/guide/)

- [React Context API](https://react.dev/reference/react/useContext)    isAuthenticated,  return (

- [Custom Hooks](https://react.dev/learn/reusing-logic-with-custom-hooks)

- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)    loading,    <button

- [CSS Modules](https://github.com/css-modules/css-modules)

- [Google Identity Services](https://developers.google.com/identity/gsi/web)    login,      className={buttonClasses}



## 🤝 Contributing    logout,      disabled={disabled || loading}



1. Follow the layered architecture patterns    checkAuth,      {...props}

2. Implement comprehensive TypeScript interfaces

3. Write unit tests for all new components and hooks  };    >

4. Use the established component library for UI elements

5. Follow the established styling and naming conventions      {loading ? 'Loading...' : children}

6. Ensure all code passes ESLLint and TypeScript checks

  return (    </button>

---

    <AuthContext.Provider value={value}>  );

Built with ❤️ using React, TypeScript, and Vite
      {children}};

    </AuthContext.Provider>```

  );

};## 🎨 Styling



export const useAuthContext = (): AuthContextType => {### CSS Modules

  const context = useContext(AuthContext);

  if (context === undefined) {Scoped styling with CSS Modules:

    throw new Error('useAuthContext must be used within an AuthProvider');

  }```css

  return context;/* src/components/common/Button.module.css */

};.button {

```  display: inline-flex;

  align-items: center;

### Component Library  justify-content: center;

  border: none;

Reusable UI components with TypeScript interfaces:  border-radius: 4px;

  font-weight: 500;

```typescript  cursor: pointer;

// src/components/common/Button.tsx  transition: all 0.2s ease;

import React from 'react';}

import type { BaseComponentProps } from '../../types/common';

.primary {

interface ButtonProps extends BaseComponentProps, React.ButtonHTMLAttributes<HTMLButtonElement> {  background-color: #007bff;

  variant?: 'primary' | 'secondary' | 'danger';  color: white;

  size?: 'small' | 'medium' | 'large';}

  loading?: boolean;

}.primary:hover {

  background-color: #0056b3;

export const Button: React.FC<ButtonProps> = ({}

  variant = 'primary',

  size = 'medium',.secondary {

  loading = false,  background-color: #6c757d;

  children,  color: white;

  className,}

  disabled,

  style,.secondary:hover {

  ...props  background-color: #545b62;

}) => {}

  const buttonClasses = [```

    'inline-flex items-center justify-center',

    'border border-transparent rounded-md font-medium',### Global Styles

    'focus:outline-none focus:ring-2 focus:ring-offset-2',

    'transition-colors duration-200',Base styles and CSS custom properties:

    {

      'px-3 py-2 text-sm': size === 'small',```css

      'px-4 py-2 text-base': size === 'medium',/* src/index.css */

      'px-6 py-3 text-lg': size === 'large',:root {

    },  --primary-color: #007bff;

    {  --secondary-color: #6c757d;

      'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500': variant === 'primary',  --success-color: #28a745;

      'bg-gray-600 hover:bg-gray-700 text-white focus:ring-gray-500': variant === 'secondary',  --danger-color: #dc3545;

      'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500': variant === 'danger',  --warning-color: #ffc107;

    },  --font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

    loading && 'opacity-50 cursor-not-allowed',  --border-radius: 4px;

    className,  --box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  ].filter(Boolean).join(' ');}



  return (* {

    <button  box-sizing: border-box;

      className={buttonClasses}  margin: 0;

      disabled={disabled || loading}  padding: 0;

      style={style}}

      {...props}

    >body {

      {loading ? 'Loading...' : children}  font-family: var(--font-family);

    </button>  line-height: 1.6;

  );  color: #333;

};  background-color: #f8f9fa;

```}



## 🧪 Testingbutton {

  font-family: inherit;

### Unit Tests}

```

```bash

# Run unit tests## 📱 Responsive Design

yarn test

Mobile-first responsive design with CSS Grid and Flexbox:

# Run with coverage

npm run test:coverage```css

/* Mobile-first approach */

# Run tests in watch mode.container {

npm run test:watch  display: grid;

```  grid-template-columns: 1fr;

  gap: 1rem;

### Test Structure  padding: 1rem;

}

```

src//* Tablet */

├── __tests__/@media (min-width: 768px) {

│   ├── components/  .container {

│   │   ├── Button.test.tsx    grid-template-columns: repeat(2, 1fr);

│   │   └── Card.test.tsx    padding: 2rem;

│   ├── hooks/  }

│   │   ├── useAssets.test.ts}

│   │   └── useApi.test.ts

│   ├── services//* Desktop */

│   │   ├── assetService.test.ts@media (min-width: 1024px) {

│   │   └── userService.test.ts  .container {

│   ├── contexts/    grid-template-columns: repeat(3, 1fr);

│   │   └── AuthContext.test.tsx    max-width: 1200px;

│   └── utils/    margin: 0 auto;

│       └── helpers.test.ts  }

```}

```

### Component Testing Example

## 🧪 Testing

```typescript

// src/__tests__/components/Button.test.tsx### Unit Tests

import { render, screen, fireEvent } from '@testing-library/react';

import { Button } from '../../components/common/Button';```bash

# Run unit tests

describe('Button', () => {npm test

  it('renders children correctly', () => {

    render(<Button>Click me</Button>);# Run with coverage

    expect(screen.getByText('Click me')).toBeInTheDocument();npm run test:coverage

  });

# Run tests in watch mode

  it('handles click events', () => {npm run test:watch

    const handleClick = jest.fn();```

    render(<Button onClick={handleClick}>Click me</Button>);

### Test Structure

    fireEvent.click(screen.getByText('Click me'));

    expect(handleClick).toHaveBeenCalledTimes(1);```

  });src/

├── __tests__/

  it('shows loading state', () => {│   ├── components/

    render(<Button loading>Loading...</Button>);│   │   ├── Button.test.tsx

    expect(screen.getByText('Loading...')).toBeInTheDocument();│   │   └── AssetForm.test.tsx

  });│   ├── hooks/

│   │   ├── useAssets.test.ts

  it('applies correct variant classes', () => {│   │   └── useApi.test.ts

    render(<Button variant="danger">Danger</Button>);│   ├── services/

    const button = screen.getByText('Danger');│   │   ├── assetService.test.ts

    expect(button).toHaveClass('bg-red-600');│   │   └── userService.test.ts

  });│   └── utils/

});│       └── helpers.test.ts

``````



## 🚀 Deployment### Component Testing Example



### Build Configuration```typescript

// src/__tests__/components/Button.test.tsx

```typescriptimport { render, screen, fireEvent } from '@testing-library/react';

// vite.config.tsimport { Button } from '../../components/common/Button';

import { defineConfig } from 'vite';

import react from '@vitejs/plugin-react';describe('Button', () => {

  it('renders children correctly', () => {

export default defineConfig({    render(<Button>Click me</Button>);

  plugins: [react()],    expect(screen.getByText('Click me')).toBeInTheDocument();

  build: {  });

    outDir: 'dist',

    sourcemap: true,  it('handles click events', () => {

    rollupOptions: {    const handleClick = jest.fn();

      output: {    render(<Button onClick={handleClick}>Click me</Button>);

        manualChunks: {

          vendor: ['react', 'react-dom'],    fireEvent.click(screen.getByText('Click me'));

          router: ['react-router-dom'],    expect(handleClick).toHaveBeenCalledTimes(1);

          ui: ['axios', 'date-fns'],  });

        },

      },  it('shows loading state', () => {

    },    render(<Button loading>Loading...</Button>);

  },    expect(screen.getByText('Loading...')).toBeInTheDocument();

  server: {  });

    port: 3000,});

    proxy: {```

      '/api': {

        target: 'http://localhost:5000',## 🚀 Deployment

        changeOrigin: true,

      },### Build Configuration

    },

  },```typescript

});// vite.config.ts

```import { defineConfig } from 'vite';

import react from '@vitejs/plugin-react';

### Production Build

export default defineConfig({

```bash  plugins: [react()],

# Create optimized production build  build: {

npm run build    outDir: 'dist',

    sourcemap: true,

# Preview the build locally    rollupOptions: {

npm run preview      output: {

        manualChunks: {

# The dist/ folder contains the production-ready files          vendor: ['react', 'react-dom'],

```          router: ['react-router-dom'],

          ui: ['axios', 'date-fns'],

## 🔧 Development Guidelines        },

      },

### Code Style    },

  },

- **TypeScript Strict Mode**: Enabled for maximum type safety  server: {

- **ESLint Rules**: Follow configured linting rules    port: 3000,

- **Prettier**: Automatic code formatting    proxy: {

- **Component Naming**: PascalCase for components      '/api': {

- **File Naming**: camelCase for utilities, PascalCase for components        target: 'http://localhost:5000',

- **Hook Naming**: camelCase with 'use' prefix        changeOrigin: true,

      },

### Best Practices    },

  },

1. **Component Composition**: Prefer composition over inheritance});

2. **Custom Hooks**: Extract reusable logic into custom hooks```

3. **Type Safety**: Use TypeScript interfaces for all data structures

4. **Error Boundaries**: Wrap components that might throw errors### Production Build

5. **Performance**: Use React.memo, useMemo, and useCallback appropriately

6. **Accessibility**: Include ARIA labels and semantic HTML```bash

7. **Context Usage**: Use contexts for global state, hooks for business logic# Create optimized production build

npm run build

### Architecture Rules

# Preview the build locally

- **Components**: Pure UI components, no business logicnpm run preview

- **Hooks**: Business logic and API state management

- **Services**: API communication and data transformation# The dist/ folder contains the production-ready files

- **Contexts**: Global application state```

- **Types**: Centralized type definitions

- **Constants**: Configuration and validation rules## 🔧 Development Guidelines

- **Utils**: Pure utility functions

### Code Style

## 🔮 Future Enhancements

- **TypeScript Strict Mode**: Enabled for type safety

- [ ] React Router for client-side routing- **ESLint Rules**: Follow configured linting rules

- [ ] React Query for advanced server state management- **Prettier**: Automatic code formatting

- [ ] Form validation with react-hook-form- **Component Naming**: PascalCase for components

- [ ] Internationalization (i18n)- **File Naming**: camelCase for utilities, PascalCase for components

- [ ] Progressive Web App (PWA) features

- [ ] Component library documentation with Storybook### Best Practices

- [ ] End-to-end testing with Playwright

- [ ] Performance monitoring and analytics1. **Component Composition**: Prefer composition over inheritance

- [ ] Error tracking and reporting2. **Custom Hooks**: Extract reusable logic into custom hooks

- [ ] Advanced theming system3. **Type Safety**: Use TypeScript interfaces for all data structures

- [ ] Offline support with service workers4. **Error Boundaries**: Wrap components that might throw errors

5. **Performance**: Use React.memo, useMemo, and useCallback appropriately

## 📚 Additional Resources6. **Accessibility**: Include ARIA labels and semantic HTML



- [React Documentation](https://react.dev/)### Performance Optimization

- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

- [Vite Guide](https://vitejs.dev/guide/)- **Code Splitting**: Lazy load routes and heavy components

- [React Context API](https://react.dev/reference/react/useContext)- **Image Optimization**: Use appropriate image formats and sizes

- [Custom Hooks](https://react.dev/learn/reusing-logic-with-custom-hooks)- **Bundle Analysis**: Monitor bundle size with build tools

- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)- **Memoization**: Prevent unnecessary re-renders



## 🤝 Contributing## 🔮 Future Enhancements



1. Follow the layered architecture patterns- [ ] React Router for client-side routing

2. Implement comprehensive TypeScript interfaces- [ ] React Query for server state management

3. Write unit tests for all new components and hooks- [ ] Authentication flow with JWT

4. Use the established component library for UI elements- [ ] Theme provider for dark/light mode

5. Follow the established styling and naming conventions- [ ] Internationalization (i18n)

6. Ensure all code passes ESLint and TypeScript checks- [ ] Progressive Web App (PWA) features

- [ ] Component library documentation

---- [ ] End-to-end testing with Playwright

- [ ] Performance monitoring

Built with ❤️ using React, TypeScript, and Vite- [ ] Error tracking and reporting

## 📚 Additional Resources

- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Guide](https://vitejs.dev/guide/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [CSS Modules](https://github.com/css-modules/css-modules)

## 🤝 Contributing

1. Follow the component architecture patterns
2. Write comprehensive tests for new components
3. Use TypeScript for all new code
4. Follow the established styling conventions
5. Ensure responsive design for all components

---

Built with ❤️ using React, TypeScript, and Vite