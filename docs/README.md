# Asset Management Platform - Documentation

[![Node.js](https://img.shields.io/badge/Node.js-18+-green?style=flat-square)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue?style=flat-square)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-61dafb?style=flat-square)](https://reactjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791?style=flat-square)](https://www.postgresql.org/)

> **Last Updated:** November 8, 2025 | **Version:** 1.0.0

Comprehensive documentation for the Asset Management Platform - a full-stack property, tenant, lease, and rent management system with PDF generation, meter readings, and advanced analytics.

---

## 📚 Table of Contents

- [System Overview](#-system-overview)
- [Quick Start](#-quick-start)
- [Architecture](#-architecture)
- [Features](#-features)
- [API Documentation](#-api-documentation)
- [Database Schema](#-database-schema)
- [Logging System](#-logging-system)
- [Testing](#-testing)
- [Deployment](#-deployment)

---

## 🎯 System Overview

### What is This Platform?

A complete property management solution for landlords and property managers to:
- **Manage Properties**: Track multiple properties with units, amenities, and details
- **Handle Tenants**: Store tenant information, documents, and history
- **Process Leases**: Create, renew, and terminate leases with automated workflows
- **Collect Rent**: Generate invoices, track payments, record meter readings
- **Generate Reports**: Financial analytics, occupancy rates, collection metrics
- **Create Documents**: Automated PDF generation for invoices, receipts, and reports

### Technology Stack

**Backend:**
- Node.js 18+ with TypeScript 5.3
- Express.js for REST API
- PostgreSQL 15 for data persistence
- Winston for logging
- PDFKit for document generation
- Swagger/OpenAPI for API documentation

**Frontend:**
- React 18 with TypeScript
- React Router for navigation
- TailwindCSS + Shadcn/ui for styling
- Recharts for analytics
- React Query for data fetching

**DevOps:**
- Docker & Docker Compose
- GitHub Actions for CI/CD
- Environment-based configuration

---

## 🚀 Quick Start

### Prerequisites
```bash
- Node.js 18+ and yarn
- PostgreSQL 15+
- Docker & Docker Compose (optional)
```

### Installation

**1. Clone the repository:**
```bash
git clone https://github.com/AvinashMahala/AssetManagementPlatform.git
cd AssetManagementPlatform
```

**2. Install dependencies:**
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

**3. Setup environment variables:**
```bash
# Backend (.env)
DATABASE_URL=postgresql://user:password@localhost:5432/asset_management
JWT_SECRET=your-secret-key
PORT=5001

# Frontend (.env)
VITE_API_URL=http://localhost:5001
```

**4. Initialize database:**
```bash
cd backend
yarn workspace backend init-db
yarn workspace backend seed:db  # Optional: Load sample data (if scripts exist)
```

**5. Start development servers:**
```bash
# Terminal 1 - Backend
cd backend
yarn dev

# Terminal 2 - Frontend
cd frontend
yarn dev
```

**6. Access the application:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:5001
- API Documentation: http://localhost:5001/api-docs

### Docker Quick Start

```bash
docker-compose up -d
```

---

## 🏗️ Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                          │
│                     React 18 + TypeScript                        │
└────────────────────────┬────────────────────────────────────────┘
                         │ HTTP/REST
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    API GATEWAY (Express)                         │
│                      Port 5001                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Authentication Middleware (JWT)                          │  │
│  │  CORS │ Helmet │ Rate Limiting │ Request Logging          │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────────────┘
                         │
         ┌───────────────┼───────────────┐
         ▼               ▼               ▼
    ┌─────────┐    ┌─────────┐    ┌─────────┐
    │  Auth   │    │Property │    │  Rent   │
    │ Service │    │ Service │    │ Service │
    └────┬────┘    └────┬────┘    └────┬────┘
         │              │              │
         └──────────────┼──────────────┘
                        ▼
              ┌──────────────────┐
              │   Repositories   │
              │  (Data Access)   │
              └────────┬─────────┘
                       │
                       ▼
              ┌──────────────────┐
              │   PostgreSQL     │
              │   Database       │
              └──────────────────┘
```

### Folder Structure

```
AssetManagementPlatform/
├── backend/
│   ├── src/
│   │   ├── config/         # Database, Swagger config
│   │   ├── controllers/    # HTTP request handlers
│   │   ├── services/       # Business logic
│   │   ├── repositories/   # Data access layer
│   │   ├── models/         # TypeScript interfaces
│   │   ├── routes/         # API route definitions
│   │   ├── middlewares/    # Auth, logging, validation
│   │   ├── utils/          # Helper functions
│   │   └── constants/      # Database constants
│   ├── migrations/         # Database migrations
│   ├── logs/              # Winston log files
│   └── public/            # Static files (PDFs)
│       ├── invoices/
│       └── receipts/
├── frontend/
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API clients
│   │   ├── hooks/         # Custom React hooks
│   │   ├── contexts/      # React contexts
│   │   ├── types/         # TypeScript types
│   │   └── utils/         # Helper functions
│   └── public/
├── docs/                  # Documentation
├── scripts/               # Database scripts
└── docker-compose.yml
```

---

## ✨ Features

### 1. Property Management
- Create, update, and delete properties
- Support for multiple property types (apartment, house, villa, commercial, PG/hostel, etc.)
- Address management with street, city, state, pincode
- Amenities tracking (parking, gym, pool, etc.)
- Photo uploads and gallery
- Status tracking (available, occupied, maintenance)
- Total area and floor count

### 2. Unit Management
- Create units within properties
- Unit-specific details (bedrooms, bathrooms, area)
- Rent and security deposit settings
- Occupancy status tracking
- Unit-level amenities
- Meter assignments (electricity, water, gas)

### 3. Tenant Management
- Complete tenant profiles (personal info, contact, addresses)
- Emergency contact information
- Occupation and income details
- Document storage
- Rental history tracking
- Status management (active, inactive, blacklisted)

### 4. Lease Management
- Full lease lifecycle (draft → active → expired/terminated)
- Start/end date tracking with validation
- Monthly rent and deposit configuration
- Notice period settings
- Auto-renewal options
- Payment frequency (monthly, quarterly, yearly)
- Rent due day customization
- Utility charges (electricity, water, maintenance)
- Special conditions and terms
- Lease document uploads
- Termination with reasons
- Lease renewal workflow
- Availability checking
- Expiring lease alerts

### 5. Rent Collection System ⭐

**Property Rent Collection Dashboard:**
- Monthly overview of all units
- Statistics: Total Units, Expected, Collected, Pending
- Collection rate percentage
- Unit-wise status (Not Started, Draft, Pending, Paid, Overdue)
- Quick actions per unit
- Month selector for different periods

**Unit Rent Collection:**
- Step-by-step wizard
- Automatic last month meter reading retrieval
- Real-time meter charge calculations
- Expense line items (maintenance, repairs, cleaning, etc.)
- Previous balance tracking
- Payment calculation with breakdown
- Invoice generation (PDF)
- Receipt generation (PDF)
- Payment recording

**Meter Reading Integration:**
- Support for multiple meter types (electricity, water, gas)
- Previous vs current reading comparison
- Automatic consumption calculation
- Cost per unit and fixed charges
- Total cost calculation
- Photo upload for readings
- Junction table linking readings to transactions

**PDF Generation:**
- Professional invoice templates
- Payment receipt templates
- Property/landlord branding
- Tenant information
- Payment breakdown
- Indian Rupee (₹) formatting
- File storage in `backend/public/`
- Accessible via static URLs

### 6. Payment Tracking
- Multiple payment methods (cash, bank transfer, UPI, cheque, etc.)
- Payment status tracking (pending, paid, overdue, partial, failed)
- Late fee calculations
- Payment history per lease/tenant/property
- Transaction ID and reference storage
- Revenue reports by property/owner
- Outstanding payment tracking
- Monthly revenue reports
- Bulk payment generation

### 7. Analytics & Reporting
- Revenue trends (6-month charts)
- Occupancy rates
- Collection statistics
- Property performance metrics
- Tenant payment history
- Overdue payment alerts
- Monthly summaries
- Financial dashboards

### 8. PDF Document Generation
- Invoice PDFs with property/tenant details
- Payment receipt PDFs
- Customizable templates
- Professional formatting
- Automatic file naming
- Cloud storage ready

### 9. Logging & Monitoring
- Comprehensive backend logging (Winston)
- Frontend error tracking
- Daily log rotation
- Error boundaries in React
- API request/response logging
- Performance monitoring

### 10. Authentication & Security
- JWT-based authentication
- Email/phone verification
- Role-based access control (Admin, User)
- Password hashing (bcrypt)
- Security questions for recovery
- Protected routes
- CORS configuration
- SQL injection prevention
- XSS protection

---

## 📡 API Documentation

### Live API Documentation
**Swagger UI**: http://localhost:5001/api-docs

### Base URL
```
Development: http://localhost:5001
Production:  https://your-domain.com
```

### Authentication
All protected endpoints require JWT token:
```bash
Authorization: Bearer <your-jwt-token>
```

### Response Format

**Success:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional message"
}
```

**Error:**
```json
{
  "success": false,
  "message": "Error description",
  "errors": [...]
}
```

### Key Endpoints

#### Authentication
```
POST   /api/auth/register        # Register new user
POST   /api/auth/login           # Login user
POST   /api/auth/logout          # Logout user
GET    /api/auth/me              # Get current user
```

#### Properties
```
GET    /api/properties           # List all properties
POST   /api/properties           # Create property
GET    /api/properties/:id       # Get property by ID
PUT    /api/properties/:id       # Update property
DELETE /api/properties/:id       # Delete property
```

#### Units
```
GET    /api/units                # List all units
POST   /api/units                # Create unit
GET    /api/units/:id            # Get unit by ID
PUT    /api/units/:id            # Update unit
DELETE /api/units/:id            # Delete unit
GET    /api/units/property/:id   # Get units by property
```

#### Tenants
```
GET    /api/tenants              # List all tenants
POST   /api/tenants              # Create tenant
GET    /api/tenants/:id          # Get tenant by ID
PUT    /api/tenants/:id          # Update tenant
DELETE /api/tenants/:id          # Delete tenant
```

#### Leases
```
GET    /api/leases               # List all leases
POST   /api/leases               # Create lease
GET    /api/leases/:id           # Get lease by ID
PUT    /api/leases/:id           # Update lease
DELETE /api/leases/:id           # Delete lease
GET    /api/leases/active        # Get active leases
GET    /api/leases/expiring      # Get expiring leases
POST   /api/leases/:id/terminate # Terminate lease
POST   /api/leases/:id/renew     # Renew lease
```

#### Rent Transactions ⭐
```
GET    /api/rent-transactions                                  # List transactions
POST   /api/rent-transactions                                  # Create transaction
GET    /api/rent-transactions/:id                              # Get by ID
PUT    /api/rent-transactions/:id                              # Update transaction
DELETE /api/rent-transactions/:id                              # Delete transaction
GET    /api/rent-transactions/unit/:unitId/last-meter-readings # Get last readings
POST   /api/rent-transactions/generate-invoice                 # Generate invoice PDF
POST   /api/rent-transactions/generate-receipt                 # Generate receipt PDF
POST   /api/rent-transactions/:id/record-payment               # Record payment
GET    /api/rent-transactions/property/:id/monthly-summary     # Monthly stats
```

#### Static Files
```
GET    /api/invoices/:filename.pdf    # Download invoice
GET    /api/receipts/:filename.pdf    # Download receipt
```

#### Meters
```
GET    /api/meters                    # List all meters
POST   /api/meters                    # Create meter
GET    /api/meters/:id                # Get meter by ID
PUT    /api/meters/:id                # Update meter
DELETE /api/meters/:id                # Delete meter
GET    /api/meters/unit/:unitId       # Get unit meters
```

---

## 🗄️ Database Schema

### Core Tables

**users**
- Authentication and user management
- Stores username, email, password hash, role
- Email/phone verification flags

**properties**
- Property master data
- Address, type, status, area, amenities
- Owner relationship

**units**
- Individual rental units within properties
- Rent, deposit, bedrooms, bathrooms
- Status tracking

**tenants**
- Tenant personal information
- Contact details, addresses
- Emergency contacts

**leases**
- Lease agreements
- Date ranges, rent, terms
- Status lifecycle

**rent_transactions**
- Rent collection records
- Base rent, expenses, meter charges
- Payment tracking
- Invoice/receipt generation

**rent_transaction_meter_readings** (Junction Table) ⭐
- Links transactions to meter readings
- Stores previous/current readings
- Units consumed and costs
- Enables historical tracking

**meters**
- Utility meter definitions
- Type (electricity, water, gas)
- Cost per unit, fixed charges
- Unit assignment

**meter_readings**
- Historical meter reading records
- Reading values and dates
- Consumption calculations
- Photo uploads

**receipts**
- Payment receipt metadata
- Links to transactions
- PDF generation tracking

**receipt_templates**
- Customizable receipt templates
- Property branding
- Bank details, signatures

### Relationships

```
users (1) ──── (N) properties
properties (1) ──── (N) units
units (1) ──── (N) leases
tenants (1) ──── (N) leases
units (1) ──── (N) meters
meters (1) ──── (N) meter_readings
leases (1) ──── (N) rent_transactions
rent_transactions (1) ──── (N) rent_transaction_meter_readings
meters (1) ──── (N) rent_transaction_meter_readings
meter_readings (0..1) ──── (N) rent_transaction_meter_readings
```

### Database Scripts

```bash
# Initialize database (create tables)
          cd backend && yarn workspace backend init-db

# Seed sample data
          yarn workspace backend seed:db

# Reset database (drop and recreate)
python3 scripts/seed_to_db.py
```

---

## 📊 Logging System

### Backend Logging (Winston)

**Configuration:**
- Daily rotating logs
- 20MB max file size
- Gzip compression
- 14-day retention
- Separate files by log level

**Log Files Location:**
```
logs/backend/
├── combined-YYYY-MM-DD.log    # All logs
├── error-YYYY-MM-DD.log       # Errors only
├── warn-YYYY-MM-DD.log        # Warnings
├── info-YYYY-MM-DD.log        # Info messages
├── http-YYYY-MM-DD.log        # HTTP requests
├── exceptions-YYYY-MM-DD.log  # Uncaught exceptions
└── rejections-YYYY-MM-DD.log  # Unhandled promise rejections
```

**Log Levels:**
```typescript
error: 0   // Critical errors
warn: 1    // Warning messages
info: 2    // Informational messages
http: 3    // HTTP request logs
verbose: 4 // Verbose logging
debug: 5   // Debug information
silly: 6   // Everything
```

**Usage:**
```typescript
import logger from './utils/logger';

logger.error('Error message', { context: 'data' });
logger.warn('Warning message');
logger.info('Info message');
logger.http('HTTP request details');
```

### Frontend Logging

**Console Logging:**
- Colorful formatted output
- Log level filtering
- Component context
- Error stack traces

**LocalStorage:**
- Critical errors only
- Max 100 entries
- JSON format
- Auto cleanup

**Error Boundaries:**
- Component error catching
- Fallback UI rendering
- Error reporting
- Reset functionality

**Global Error Handlers:**
- `window.onerror` for runtime errors
- `unhandledrejection` for promise errors
- Network error tracking
- User consent for reporting

---

## 🧪 Testing

### Backend Testing

**Unit Tests:**
```bash
cd backend
npm run test
```

**Test Coverage:**
```bash
npm run test:coverage
```

**Test Structure:**
```
backend/src/__tests__/
├── controllers/
├── services/
├── repositories/
└── utils/
```

### Frontend Testing

**Component Tests:**
```bash
cd frontend
npm run test
```

**E2E Tests:**
```bash
npm run test:e2e
```

### API Testing

**Using Swagger UI:**
1. Navigate to http://localhost:5001/api-docs
2. Authorize with JWT token
3. Test endpoints interactively

**Using cURL:**
```bash
# Login
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}'

# Get properties
curl http://localhost:5001/api/properties \
  -H "Authorization: Bearer <token>"
```

---

## 🚀 Deployment

### Production Build

**Backend:**
```bash
cd backend
npm run build
npm start
```

**Frontend:**
```bash
          cd frontend
          yarn build
# Serve dist/ folder with nginx or similar
```

### Docker Deployment

**Development:**
```bash
docker-compose up -d
```

**Production:**
```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Environment Variables

**Backend (.env):**
```env
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@host:5432/db
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=24h
PORT=5001
CORS_ORIGIN=https://your-frontend-domain.com
```

**Frontend (.env):**
```env
VITE_API_URL=https://your-backend-domain.com
VITE_APP_NAME=Asset Management Platform
```

### Database Migration

```bash
# Run migrations
cd backend
npm run migrate

# Or use Python script
python3 scripts/seed_to_db.py
```

---

## 📝 Additional Resources

### Related Files
- `INSTRUCTIONS.md` - Development guidelines and coding standards
- `../backend/README.md` - Backend specific documentation
- `../frontend/README.md` - Frontend specific documentation
- `../scripts/README.md` - Database script documentation

### External Documentation
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Express.js Guide](https://expressjs.com/)
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

## 🤝 Support

For questions, issues, or feature requests:
1. Check this documentation first
2. Review the API documentation at `/api-docs`
3. Check error logs in `logs/` directory
4. Create a GitHub issue with details

---

## 📜 License

This project is proprietary software. All rights reserved.

---

**Last Updated:** November 8, 2025
**Maintained by:** Development Team
**Version:** 1.0.0
