# 🎨 Centralized Logging System Documentation

## 📋 Table of Contents
- [Overview](#overview)
- [Architecture](#architecture)
- [Backend Logging](#backend-logging)
- [Frontend Logging](#frontend-logging)
- [Log Files Structure](#log-files-structure)
- [Usage Examples](#usage-examples)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

Our centralized logging system provides:
- ✅ **Beautiful, formatted console output** with colors and emojis
- ✅ **Automatic file rotation** (daily, with 14-day retention)
- ✅ **Separate logs for different levels** (error, warn, info, http, debug)
- ✅ **Request tracking** with unique correlation IDs
- ✅ **Performance monitoring** for all operations
- ✅ **Error stack traces** automatically captured
- ✅ **Metadata enrichment** for better context
- ✅ **Zero lost errors** - every exception is logged!

---

## 🏗️ Architecture

```
logs/
├── backend/
│   ├── combined-YYYY-MM-DD.log      # All logs
│   ├── error-YYYY-MM-DD.log         # Error logs only
│   ├── warn-YYYY-MM-DD.log          # Warning logs
│   ├── info-YYYY-MM-DD.log          # Info logs
│   ├── http-YYYY-MM-DD.log          # HTTP request logs
│   ├── exceptions-YYYY-MM-DD.log    # Uncaught exceptions
│   └── rejections-YYYY-MM-DD.log    # Unhandled promise rejections
└── frontend/
    └── (stored in browser localStorage for critical errors)
```

---

## 🔧 Backend Logging

### Setup

The backend uses **Winston** with daily log rotation:

```typescript
import { logger, createModuleLogger, PerformanceLogger } from './utils/logger';
```

### Log Levels

| Level | Priority | Use Case | Color |
|-------|----------|----------|-------|
| `error` | 0 | Errors and exceptions | 🔴 Red |
| `warn` | 1 | Warnings and potential issues | 🟡 Yellow |
| `info` | 2 | General information | 🟢 Green |
| `http` | 3 | HTTP requests/responses | 🟣 Magenta |
| `debug` | 4 | Detailed debugging info | 🔵 Blue |

### Basic Usage

```typescript
// Global logger
logger.info('User logged in', { userId: '123', email: 'user@example.com' });
logger.error('Database connection failed', error, { database: 'postgres' });

// Module-specific logger
const logger = createModuleLogger('UserService');
logger.info('Creating new user', { email: 'user@example.com' });
logger.error('User creation failed', error);
```

### Performance Logging

```typescript
async function processData() {
  const perfLogger = new PerformanceLogger('processData', {
    recordCount: 1000,
  });

  try {
    // Your code here
    const result = await someAsyncOperation();
    
    perfLogger.end({ processedRecords: result.length });
    return result;
  } catch (error) {
    perfLogger.endWithError(error);
    throw error;
  }
}
```

### Request Context Logging

The system automatically adds request context to all logs made during request handling:

```typescript
// Automatic in middleware
req.requestLogger.info('Processing payment', { amount: 100 });
// Logs: [timestamp] INFO: Processing payment
//   📦 Metadata: {
//     requestId: "uuid",
//     method: "POST",
//     url: "/api/payments",
//     userId: "123",
//     amount: 100
//   }
```

### Controller Example

```typescript
import { createModuleLogger, PerformanceLogger } from '../utils/logger';
import { AppError } from '../middlewares/errorHandler';

const logger = createModuleLogger('PropertyController');

export class PropertyController {
  async getProperty(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const perfLogger = new PerformanceLogger('getProperty', {
      propertyId: id,
      userId: req.user?.id,
    });

    try {
      logger.info('Fetching property', { propertyId: id });
      
      const property = await this.propertyService.getById(id);
      
      if (!property) {
        logger.warn('Property not found', { propertyId: id });
        throw new AppError('Property not found', 404);
      }

      logger.info('Property fetched successfully', { propertyId: id });
      perfLogger.end({ found: true });
      
      res.json({ success: true, data: property });
    } catch (error) {
      if (error instanceof AppError) {
        throw error; // Will be caught by error handler
      }
      
      logger.error('Failed to fetch property', error, { propertyId: id });
      perfLogger.endWithError(error as Error);
      throw new AppError('Failed to fetch property', 500);
    }
  }
}
```

### Error Handling

All errors are automatically caught and logged by the global error handler:

```typescript
// Throw custom errors with proper logging
throw new AppError(
  'Payment amount exceeds limit',
  400,
  true,
  'PAYMENT_LIMIT_EXCEEDED'
);

// Or use async handler wrapper
import { asyncHandler } from '../middlewares/errorHandler';

router.get('/properties', asyncHandler(async (req, res) => {
  // Any error thrown here will be caught and logged
  const properties = await propertyService.getAll();
  res.json({ success: true, data: properties });
}));
```

---

## 🌐 Frontend Logging

### Setup

The frontend uses a custom browser-compatible logger:

```typescript
import { logger, createComponentLogger, PerformanceLogger } from '@/utils/logger';
```

### Configuration

```typescript
// In your main app file
logger.configure({
  logLevel: LogLevel.DEBUG,
  enableBackendReporting: true,
  backendUrl: 'http://localhost:5001',
});
```

### Basic Usage

```typescript
// Global logger
logger.info('User navigated to dashboard');
logger.error('Failed to load data', error, { component: 'Dashboard' });

// Component-specific logger
const logger = createComponentLogger('PropertyList');
logger.info('Loading properties');
logger.error('Failed to load properties', error);
```

### React Component Example

```typescript
import { createComponentLogger, PerformanceLogger } from '@/utils/logger';

const logger = createComponentLogger('PropertyList');

export function PropertyList() {
  useEffect(() => {
    const perfLogger = new PerformanceLogger('loadProperties');
    
    async function loadProperties() {
      try {
        logger.info('Loading properties');
        
        const response = await apiService.get('/api/properties');
        
        if (response.success) {
          logger.info('Properties loaded', { count: response.data.length });
          perfLogger.end({ count: response.data.length });
        } else {
          logger.error('Failed to load properties', response.error);
          perfLogger.endWithError(new Error(response.error.message));
        }
      } catch (error) {
        logger.error('Exception loading properties', error as Error);
        perfLogger.endWithError(error as Error);
      }
    }
    
    loadProperties();
  }, []);

  // Component JSX...
}
```

### API Service with Logging

Use the enhanced API service for automatic request/response logging:

```typescript
import { apiService } from '@/utils/apiService';

// Automatically logs request, response, and performance
const response = await apiService.get('/api/properties');

if (response.success) {
  // Handle success
  console.log(response.data);
} else {
  // Error is already logged
  console.error(response.error);
}
```

### Error Boundary

Wrap your app with the ErrorBoundary to catch React errors:

```tsx
import { ErrorBoundary } from '@/components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <YourApp />
    </ErrorBoundary>
  );
}
```

Or use the HOC:

```tsx
import { withErrorBoundary } from '@/components/ErrorBoundary';

const SafeComponent = withErrorBoundary(MyComponent);
```

### Stored Error Logs

Critical errors are stored in localStorage:

```typescript
// Get stored logs
const logs = logger.getStoredLogs();
console.log(logs);

// Clear stored logs
logger.clearStoredLogs();
```

---

## 📁 Log Files Structure

### Backend Log Files

All backend logs are stored in `logs/backend/` with the following structure:

```
combined-2024-11-04.log      # All logs (JSON format)
error-2024-11-04.log          # Error logs only
warn-2024-11-04.log           # Warning logs
info-2024-11-04.log           # Info logs
http-2024-11-04.log           # HTTP request logs
exceptions-2024-11-04.log     # Uncaught exceptions
rejections-2024-11-04.log     # Unhandled promise rejections
```

**Features:**
- Daily rotation (new file each day)
- Automatic compression (older logs are gzipped)
- 14-day retention (old logs are automatically deleted)
- Maximum file size: 20MB (rotates if exceeded)

### Log Format

**Console Output (Human-readable):**
```
[2024-11-04 14:23:45] 🟢 INFO: User logged in
  📦 Metadata: {
    "userId": "123",
    "email": "user@example.com",
    "ip": "192.168.1.1"
  }
```

**File Output (JSON for parsing):**
```json
{
  "timestamp": "2024-11-04 14:23:45",
  "level": "info",
  "message": "User logged in",
  "userId": "123",
  "email": "user@example.com",
  "ip": "192.168.1.1"
}
```

---

## 💡 Usage Examples

### Example 1: Service Method

```typescript
import { createModuleLogger, PerformanceLogger } from '../utils/logger';

const logger = createModuleLogger('PaymentService');

export class PaymentService {
  async processPayment(paymentData: PaymentData) {
    const perfLogger = new PerformanceLogger('processPayment', {
      amount: paymentData.amount,
      currency: paymentData.currency,
    });

    try {
      logger.info('Processing payment', {
        orderId: paymentData.orderId,
        amount: paymentData.amount,
      });

      // Validate payment
      await this.validatePayment(paymentData);
      logger.debug('Payment validated');

      // Process payment
      const result = await this.gateway.charge(paymentData);
      
      logger.info('Payment processed successfully', {
        transactionId: result.id,
        amount: paymentData.amount,
      });
      
      perfLogger.end({ transactionId: result.id });
      return result;
      
    } catch (error) {
      logger.error('Payment processing failed', error, {
        orderId: paymentData.orderId,
        amount: paymentData.amount,
      });
      
      perfLogger.endWithError(error as Error);
      throw error;
    }
  }
}
```

### Example 2: React Hook

```typescript
import { createComponentLogger } from '@/utils/logger';

const logger = createComponentLogger('usePropertyData');

export function usePropertyData(propertyId: string) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    logger.info('Loading property data', { propertyId });
    
    async function loadData() {
      try {
        const response = await apiService.get(`/api/properties/${propertyId}`);
        
        if (response.success) {
          logger.info('Property data loaded', { propertyId });
          setData(response.data);
        } else {
          logger.error('Failed to load property data', response.error, { propertyId });
          setError(response.error);
        }
      } catch (err) {
        logger.error('Exception loading property data', err as Error, { propertyId });
        setError(err);
      } finally {
        setLoading(false);
      }
    }
    
    loadData();
  }, [propertyId]);

  return { data, loading, error };
}
```

### Example 3: Database Operation

```typescript
import { createModuleLogger, PerformanceLogger } from '../utils/logger';

const logger = createModuleLogger('PropertyRepository');

export class PropertyRepository {
  async create(property: Property) {
    const perfLogger = new PerformanceLogger('createProperty', {
      address: property.address,
    });

    try {
      logger.info('Creating property', { address: property.address });
      
      const result = await this.db.query(
        'INSERT INTO properties (name, address, ...) VALUES ($1, $2, ...)',
        [property.name, property.address, ...]
      );
      
      logger.info('Property created', {
        propertyId: result.rows[0].id,
        address: property.address,
      });
      
      perfLogger.end({ propertyId: result.rows[0].id });
      return result.rows[0];
      
    } catch (error) {
      logger.error('Failed to create property', error, {
        address: property.address,
      });
      
      perfLogger.endWithError(error as Error);
      throw error;
    }
  }
}
```

---

## ✅ Best Practices

### 1. Use Module-Specific Loggers
```typescript
// ✅ Good
const logger = createModuleLogger('UserService');
logger.info('Creating user');

// ❌ Bad
console.log('Creating user');
```

### 2. Add Context to Logs
```typescript
// ✅ Good
logger.info('User created', {
  userId: user.id,
  email: user.email,
  role: user.role,
});

// ❌ Bad
logger.info('User created');
```

### 3. Use Performance Logging
```typescript
// ✅ Good
const perfLogger = new PerformanceLogger('operation');
// ... do work
perfLogger.end();

// ❌ Bad
const start = Date.now();
// ... do work
console.log('Took', Date.now() - start);
```

### 4. Log at Appropriate Levels
- **DEBUG**: Detailed information for debugging
- **INFO**: General information about application flow
- **WARN**: Potential issues that don't prevent operation
- **ERROR**: Errors and exceptions

### 5. Never Swallow Errors
```typescript
// ✅ Good
try {
  await operation();
} catch (error) {
  logger.error('Operation failed', error);
  throw error; // Re-throw or handle
}

// ❌ Bad
try {
  await operation();
} catch (error) {
  // Silent failure
}
```

### 6. Sanitize Sensitive Data
The system automatically redacts passwords, tokens, and API keys, but be mindful:
```typescript
// ✅ Good - password will be redacted
logger.info('User login attempt', { email, password });

// ✅ Better - don't log sensitive data
logger.info('User login attempt', { email });
```

### 7. Use Request Context
```typescript
// ✅ Good - in route handlers
req.requestLogger.info('Processing request');

// ✅ Also good - passes context automatically
logger.info('Processing request', {
  requestId: req.requestId,
});
```

---

## 🔍 Troubleshooting

### View Logs

**Backend (via terminal):**
```bash
# View all logs
tail -f logs/backend/combined-*.log

# View only errors
tail -f logs/backend/error-*.log

# View with pretty formatting
tail -f logs/backend/combined-*.log | jq
```

**Frontend (via browser console):**
```javascript
// View stored error logs
logger.getStoredLogs()

// Clear stored logs
logger.clearStoredLogs()
```

### Common Issues

**1. Logs not appearing**
- Check log level configuration
- Ensure logger is imported correctly
- Verify file permissions in `logs/` directory

**2. Too many logs**
- Reduce log level in production (INFO or WARN)
- Use DEBUG only in development

**3. Log files too large**
- Files automatically rotate at 20MB
- Older logs are compressed and deleted after 14 days

**4. Performance impact**
- Logging is async and shouldn't impact performance
- In production, reduce log verbosity

---

## 🎓 Summary

- ✅ **Always use the logger** instead of console.log
- ✅ **Add context** to make logs meaningful
- ✅ **Use performance logging** for operations
- ✅ **Never lose errors** - they're all logged automatically
- ✅ **Review logs regularly** to catch issues early

The logging system is designed to be:
- 🎨 **Beautiful** - Easy to read and understand
- 🚀 **Fast** - Minimal performance impact
- 🔍 **Searchable** - JSON format for parsing
- 💾 **Persistent** - 14-day retention
- 🛡️ **Safe** - Automatic sensitive data redaction

Happy logging! 🎉
