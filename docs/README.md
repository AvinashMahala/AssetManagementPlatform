# Property Management Platform - API Documentation

[![Swagger](https://img.shields.io/badge/Swagger-85EA2D?style=for-the-badge&logo=swagger&logoColor=black)](https://swagger.io/)
[![OpenAPI](https://img.shields.io/badge/OpenAPI-3.0.0-blue?style=for-the-badge)](https://www.openapis.org/)

Comprehensive API documentation for the Property Management Platform backend. The API is built with Express.js, TypeScript, and follows RESTful conventions with automatic Swagger documentation.

## 🌐 Live Documentation

**Swagger UI**: http://localhost:5001/api-docs

The interactive API documentation provides:
- Live API testing interface
- Request/response examples
- Schema definitions
- Authentication details

## 📋 API Overview

### Base URL
```
Production:  https://your-domain.com
Development: http://localhost:5001
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
  "message": "Error message",
  "errors": [
    {
      "field": "fieldName",
      "message": "Field-specific error"
    }
  ]
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

### JWT Token Authentication
```bash
# Include in request headers
Authorization: Bearer <jwt-token>
```

### Login Endpoint
```http
POST /api/auth/login
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
      "id": "uuid-string",
      "username": "john.doe",
      "email": "user@example.com",
      "role": "admin"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expiresIn": 3600
    }
  }
}
```

## 🏠 Properties API

### List Properties
Get all properties with optional filtering.

```http
GET /api/properties
```

**Response:**
```json
{
  "success": true,
  "data": {
    "properties": [
      {
        "id": "uuid-string",
        "name": "Sunset Apartments",
        "description": "Modern apartment complex",
        "propertyType": "apartment",
        "status": "available",
        "address": {
          "street": "123 Main St",
          "city": "New York",
          "state": "NY",
          "pincode": "10001"
        },
        "area": 1500,
        "bedrooms": 2,
        "bathrooms": 2,
        "monthlyRent": 2500.00,
        "securityDeposit": 5000.00,
        "createdAt": "2024-01-15T10:30:00Z"
      }
    ]
  }
}
```

### Get Property by ID
```http
GET /api/properties/{id}
```

### Create Property
```http
POST /api/properties
Content-Type: application/json
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "Riverside Villas",
  "description": "Luxury villa complex by the river",
  "propertyType": "house",
  "address": {
    "street": "456 River Road",
    "city": "Austin",
    "state": "TX",
    "pincode": "78701"
  },
  "area": 2500,
  "bedrooms": 4,
  "bathrooms": 3,
  "monthlyRent": 4500.00,
  "securityDeposit": 9000.00,
  "ownerId": "uuid-string"
}
```

## 👥 Users API

### Register User
```http
POST /api/auth/register
Content-Type: application/json
```

**Request Body:**
```json
{
  "username": "john.doe",
  "email": "john.doe@example.com",
  "password": "SecurePass123!",
  "registrationMethod": "email"
}
```

### Login User
```http
POST /api/auth/login
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "john.doe@example.com",
  "password": "SecurePass123!"
}
```

### Get User Profile
```http
GET /api/users/profile
Authorization: Bearer <token>
```

## 🏢 Units API

### List Units
Get all units for a property.

```http
GET /api/units?propertyId={propertyId}
```

### Create Unit
```http
POST /api/units
Content-Type: application/json
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "propertyId": "uuid-string",
  "unitNumber": "A-101",
  "unitType": "apartment",
  "area": 1200,
  "bedrooms": 2,
  "bathrooms": 2,
  "monthlyRent": 2200.00,
  "securityDeposit": 4400.00
}
```

## 👨‍👩‍👧‍👦 Tenants API

### List Tenants
```http
GET /api/tenants
```

### Create Tenant
```http
POST /api/tenants
Content-Type: application/json
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Smith",
  "email": "john.smith@email.com",
  "phone": "+1234567890",
  "dateOfBirth": "1990-05-15",
  "currentAddress": {
    "street": "123 Oak St",
    "city": "Springfield",
    "state": "IL",
    "pincode": "62701"
  }
}
```

## 📋 Leases API

### List All Leases
```http
GET /api/leases
```

### Get Lease by ID
```http
GET /api/leases/{id}
```

### Get Leases by Property
```http
GET /api/leases/property/{propertyId}
```

### Get Leases by Tenant
```http
GET /api/leases/tenant/{tenantId}
```

### Get Active Leases
```http
GET /api/leases/active
```

### Get Expiring Leases
```http
GET /api/leases/expiring?days=30
```

### Create Lease
```http
POST /api/leases
Content-Type: application/json
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "propertyId": "uuid-string",
  "tenantId": "uuid-string",
  "startDate": "2024-01-01T00:00:00Z",
  "endDate": "2025-01-01T00:00:00Z",
  "monthlyRent": 2500.00,
  "securityDeposit": 5000.00,
  "noticePeriodDays": 30,
  "rentDueDay": 1
}
```

### Update Lease
```http
PUT /api/leases/{id}
Content-Type: application/json
Authorization: Bearer <token>
```

### Terminate Lease
```http
POST /api/leases/{id}/terminate
Content-Type: application/json
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "terminationReason": "Tenant moving out"
}
```

### Renew Lease
```http
POST /api/leases/{id}/renew
Content-Type: application/json
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "newEndDate": "2026-01-01T00:00:00Z"
}
```

### Validate Lease Dates
```http
POST /api/leases/validate-dates
Content-Type: application/json
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "startDate": "2024-01-01",
  "endDate": "2025-01-01"
}
```

### Check Property Availability
```http
POST /api/leases/check-availability
Content-Type: application/json
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "propertyId": "uuid-string",
  "startDate": "2024-01-01",
  "endDate": "2025-01-01"
}
```

## 💰 Rent Payments API

### List All Payments
```http
GET /api/rent-payments
```

### Get Payment by ID
```http
GET /api/rent-payments/{id}
```

### Get Payments by Lease
```http
GET /api/rent-payments/lease/{leaseId}
```

### Get Payments by Property
```http
GET /api/rent-payments/property/{propertyId}
```

### Get Payments by Tenant
```http
GET /api/rent-payments/tenant/{tenantId}
```

### Get Pending Payments
```http
GET /api/rent-payments/pending
```

### Get Overdue Payments
```http
GET /api/rent-payments/overdue
```

### Get Payments by Date Range
```http
GET /api/rent-payments/date-range?startDate=2024-01-01&endDate=2024-12-31
```

### Create Payment
```http
POST /api/rent-payments
Content-Type: application/json
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "leaseId": "uuid-string",
  "propertyId": "uuid-string",
  "tenantId": "uuid-string",
  "amount": 2500.00,
  "dueDate": "2024-02-01",
  "rentAmount": 2200.00,
  "maintenanceCharges": 150.00,
  "otherCharges": 150.00,
  "status": "pending",
  "createdBy": "uuid-string"
}
```

### Update Payment
```http
PUT /api/rent-payments/{id}
Content-Type: application/json
Authorization: Bearer <token>
```

### Mark Payment as Paid
```http
POST /api/rent-payments/{id}/mark-paid
Content-Type: application/json
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "paidDate": "2024-02-01T10:00:00Z",
  "paymentMethod": "bank_transfer",
  "transactionId": "TXN123456"
}
```

### Calculate Late Fees
```http
POST /api/rent-payments/calculate-late-fees
Content-Type: application/json
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "amount": 2500.00,
  "dueDate": "2024-02-01",
  "paidDate": "2024-02-05"
}
```

### Generate Monthly Payments
```http
POST /api/rent-payments/generate-monthly
Content-Type: application/json
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "leaseId": "uuid-string",
  "startDate": "2024-01-01",
  "endDate": "2024-12-31"
}
```

### Revenue Reports

#### Get Revenue by Property
```http
GET /api/rent-payments/revenue/property/{propertyId}?startDate=2024-01-01&endDate=2024-12-31
```

#### Get Revenue by Owner
```http
GET /api/rent-payments/revenue/owner/{ownerId}?startDate=2024-01-01&endDate=2024-12-31
```

#### Get Outstanding Payments
```http
GET /api/rent-payments/outstanding
```

#### Get Monthly Revenue Report
```http
GET /api/rent-payments/reports/monthly/2024/1
```

## 📝 Data Models

### Property
```typescript
interface Property {
  id: string;              // UUID
  name: string;
  description?: string;
  propertyType: 'apartment' | 'house' | 'villa' | 'commercial' | 'pg_hostel' | 'co_living' | 'office' | 'shop' | 'warehouse';
  status: 'available' | 'occupied' | 'under_maintenance' | 'vacant';
  address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    landmark?: string;
  };
  area: number;            // sq ft
  bedrooms?: number;
  bathrooms?: number;
  monthlyRent: number;
  securityDeposit: number;
  ownerId: string;         // UUID
  amenities?: string[];
  photos?: string[];
  createdAt: string;
  updatedAt: string;
}
```

### Lease
```typescript
interface Lease {
  id: string;              // UUID
  propertyId: string;      // UUID
  tenantId: string;        // UUID
  startDate: string;
  endDate: string;
  monthlyRent: number;
  securityDeposit: number;
  status: 'draft' | 'active' | 'expired' | 'terminated';
  noticePeriodDays?: number;
  autoRenewal?: boolean;
  maintenanceCharges?: number;
  paymentFrequency?: string;
  rentDueDay?: number;
  electricityCharges?: number;
  waterCharges?: number;
  otherCharges?: number;
  petsAllowed?: boolean;
  smokingAllowed?: boolean;
  sublettingAllowed?: boolean;
  specialConditions?: string;
  signedAt?: string;
  leaseDocumentUrl?: string;
  terminatedAt?: string;
  terminationReason?: string;
  createdAt: string;
  updatedAt: string;
}
```

### RentPayment
```typescript
interface RentPayment {
  id: string;              // UUID
  leaseId: string;         // UUID
  propertyId: string;      // UUID
  tenantId: string;        // UUID
  amount: number;
  dueDate: string;
  paidDate?: string;
  status: 'pending' | 'paid' | 'overdue' | 'partial' | 'failed';
  paymentMethod?: 'cash' | 'bank_transfer' | 'upi' | 'cheque' | 'card' | 'net_banking' | 'paytm' | 'phonepe' | 'amazon_pay' | 'other';
  transactionId?: string;
  paymentReference?: string;
  lateFee?: number;
  penaltyAmount?: number;
  rentAmount: number;
  maintenanceCharges?: number;
  otherCharges?: number;
  notes?: string;
  createdBy: string;       // UUID
  updatedBy?: string;      // UUID
  createdAt: string;
  updatedAt: string;
}
```

### User
```typescript
interface User {
  id: string;              // UUID
  username: string;
  email: string;
  phone?: string;
  role: 'admin' | 'user';
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  profilePicture?: string;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}
```

### Tenant
```typescript
interface Tenant {
  id: string;              // UUID
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  occupation?: string;
  monthlyIncome?: number;
  currentAddress: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
  permanentAddress?: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
  };
  status: 'active' | 'inactive' | 'blacklisted';
  totalRentals?: number;
  currentPropertyId?: string; // UUID
  createdAt: string;
  updatedAt: string;
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
  "message": "Invalid lease data",
  "errors": [
    {
      "field": "startDate",
      "message": "Start date cannot be in the past"
    }
  ]
}
```

**Not Found:**
```json
{
  "success": false,
  "message": "Lease not found"
}
```

## 🔒 Security

### Input Validation
- All inputs are validated using custom validation schemas
- SQL injection prevention with parameterized queries
- XSS protection with input sanitization

### Authentication & Authorization
- JWT tokens for session management
- Password hashing with bcrypt
- CORS configuration for cross-origin requests
- Helmet.js for security headers

### Password Security
- Minimum 6 characters
- Secure password reset with multiple methods:
  - Security questions
  - Recovery codes
  - Admin reset

## 🧪 Testing the API

### Using Swagger UI
1. Start the backend server: `npm run dev`
2. Open http://localhost:5001/api-docs
3. Use the interactive interface to test endpoints

### Using cURL

**Create Property:**
```bash
curl -X POST http://localhost:5001/api/properties \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Property",
    "propertyType": "apartment",
    "address": {
      "street": "123 Test St",
      "city": "Test City",
      "state": "TS",
      "pincode": "12345"
    },
    "area": 1000,
    "monthlyRent": 1500.00,
    "securityDeposit": 3000.00,
    "ownerId": "uuid-string"
  }'
```

**Get Properties:**
```bash
curl http://localhost:5001/api/properties
```

### Using Postman/Insomnia
Import the OpenAPI specification from `/api-docs` endpoint.

## 📊 API Features

### Lease Management
- Full lease lifecycle tracking
- Automatic rent payment generation
- Lease termination and renewal
- Property availability checking
- Date validation and conflict detection

### Payment Processing
- Multiple payment methods support
- Late fee calculations
- Payment status tracking
- Revenue reporting by property/owner
- Outstanding payment monitoring
- Monthly payment generation

### Financial Reporting
- Revenue analytics by property
- Revenue analytics by owner
- Outstanding payments tracking
- Monthly revenue reports
- Payment history and trends

## 🔮 Future Enhancements

### Advanced Features
- `POST /api/leases/{id}/documents` - Upload lease documents
- `GET /api/reports/occupancy` - Occupancy reports
- `POST /api/payments/bulk` - Bulk payment processing
- `GET /api/maintenance` - Maintenance request tracking
- `POST /api/notifications` - Automated notifications

### Integration Features
- Email notifications for payments
- SMS alerts for lease events
- Calendar integration for lease dates
- Document management system
- Payment gateway integration

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