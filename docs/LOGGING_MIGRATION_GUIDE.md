# 🔄 Logging System Migration Guide

This guide helps you migrate existing code to use the new centralized logging system.

---

## 📋 Migration Checklist

### Backend Migration
- [ ] Replace all `console.log/error/warn` with logger
- [ ] Add module-specific loggers to services/controllers
- [ ] Add performance tracking to slow operations
- [ ] Wrap route handlers with error handling
- [ ] Add context to all log messages
- [ ] Test error scenarios

### Frontend Migration
- [ ] Replace all `console.log/error/warn` with logger
- [ ] Add component loggers to React components
- [ ] Migrate API calls to use apiService
- [ ] Wrap app with ErrorBoundary
- [ ] Add context to all log messages
- [ ] Test error scenarios

---

## 🔧 Backend Migration

### Step 1: Replace Console Statements

**Before:**
```typescript
console.log('User created:', user);
console.error('Error creating user:', error);
console.warn('User already exists');
```

**After:**
```typescript
import { createModuleLogger } from '../utils/logger';

const logger = createModuleLogger('UserService');

logger.info('User created', { userId: user.id, email: user.email });
logger.error('Error creating user', error, { email: user.email });
logger.warn('User already exists', { email: user.email });
```

### Step 2: Update Controllers

**Before:**
```typescript
export class PropertyController {
  async getProperty(req: Request, res: Response): Promise<void> {
    try {
      const property = await this.service.getById(req.params.id);
      res.json({ success: true, data: property });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ success: false, message: 'Error' });
    }
  }
}
```

**After:**
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
      
      const property = await this.service.getById(id);
      
      if (!property) {
        logger.warn('Property not found', { propertyId: id });
        throw new AppError('Property not found', 404);
      }

      logger.info('Property fetched', { propertyId: id });
      perfLogger.end({ found: true });
      
      res.json({ success: true, data: property });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      
      logger.error('Failed to fetch property', error, { propertyId: id });
      perfLogger.endWithError(error as Error);
      throw new AppError('Failed to fetch property', 500);
    }
  }
}
```

### Step 3: Update Services

**Before:**
```typescript
export class UserService {
  async createUser(data: UserData) {
    try {
      console.log('Creating user:', data.email);
      const user = await this.repository.create(data);
      console.log('User created:', user.id);
      return user;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }
}
```

**After:**
```typescript
import { createModuleLogger, PerformanceLogger } from '../utils/logger';

const logger = createModuleLogger('UserService');

export class UserService {
  async createUser(data: UserData) {
    const perfLogger = new PerformanceLogger('createUser', {
      email: data.email,
    });

    try {
      logger.info('Creating user', { email: data.email, role: data.role });
      
      const user = await this.repository.create(data);
      
      logger.info('User created successfully', {
        userId: user.id,
        email: user.email,
      });
      perfLogger.end({ userId: user.id });
      
      return user;
    } catch (error) {
      logger.error('Failed to create user', error, {
        email: data.email,
      });
      perfLogger.endWithError(error as Error);
      throw error;
    }
  }
}
```

### Step 4: Update Routes

**Before:**
```typescript
router.get('/properties/:id', async (req, res) => {
  try {
    const property = await propertyService.getById(req.params.id);
    res.json({ success: true, data: property });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error' });
  }
});
```

**After:**
```typescript
import { asyncHandler } from '../middlewares/errorHandler';

router.get('/properties/:id', asyncHandler(async (req, res) => {
  // Error handling is automatic - no try/catch needed
  const property = await propertyService.getById(req.params.id);
  res.json({ success: true, data: property });
}));
```

---

## 🌐 Frontend Migration

### Step 1: Replace Console Statements

**Before:**
```typescript
console.log('Component mounted');
console.error('Error loading data:', error);
console.warn('No data available');
```

**After:**
```typescript
import { createComponentLogger } from '@/utils/logger';

const logger = createComponentLogger('ComponentName');

logger.info('Component mounted');
logger.error('Error loading data', error);
logger.warn('No data available');
```

### Step 2: Update React Components

**Before:**
```typescript
export function PropertyList() {
  const [properties, setProperties] = useState([]);

  useEffect(() => {
    console.log('Loading properties');
    
    fetch('/api/properties')
      .then(res => res.json())
      .then(data => {
        console.log('Properties loaded:', data.length);
        setProperties(data);
      })
      .catch(error => {
        console.error('Error loading properties:', error);
      });
  }, []);

  return <div>...</div>;
}
```

**After:**
```typescript
import { createComponentLogger, PerformanceLogger } from '@/utils/logger';
import { apiService } from '@/utils/apiService';

const logger = createComponentLogger('PropertyList');

export function PropertyList() {
  const [properties, setProperties] = useState([]);

  useEffect(() => {
    const perfLogger = new PerformanceLogger('loadProperties');
    
    async function loadProperties() {
      try {
        logger.info('Loading properties');
        
        const response = await apiService.get('/api/properties');
        
        if (response.success) {
          logger.info('Properties loaded', { count: response.data.length });
          perfLogger.end({ count: response.data.length });
          setProperties(response.data);
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

  return <div>...</div>;
}
```

### Step 3: Update API Calls

**Before:**
```typescript
const response = await fetch('/api/properties', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data),
});
const result = await response.json();
```

**After:**
```typescript
import { apiService } from '@/utils/apiService';

// Automatic request/response logging
const response = await apiService.post('/api/properties', data);

if (response.success) {
  // Handle success
  const result = response.data;
} else {
  // Error already logged
  console.error(response.error);
}
```

### Step 4: Add Error Boundary

**Before:**
```tsx
function App() {
  return (
    <Router>
      <YourApp />
    </Router>
  );
}
```

**After:**
```tsx
import { ErrorBoundary } from '@/components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <YourApp />
      </Router>
    </ErrorBoundary>
  );
}
```

---

## 🔍 Find and Replace Patterns

### Backend

Use these patterns to find code that needs updating:

```bash
# Find console.log statements
grep -rn "console\.log" backend/src/

# Find console.error statements
grep -rn "console\.error" backend/src/

# Find console.warn statements
grep -rn "console\.warn" backend/src/

# Find try-catch without proper error handling
grep -rn "catch (e" backend/src/
```

### Frontend

```bash
# Find console statements
grep -rn "console\." frontend/src/

# Find fetch calls (should use apiService)
grep -rn "fetch(" frontend/src/

# Find axios calls (if used)
grep -rn "axios\." frontend/src/
```

---

## 📊 Progress Tracking

Use this checklist to track migration progress:

### Backend Files

```
□ server.ts
□ controllers/
  □ propertyController.ts
  □ userController.ts
  □ tenantController.ts
  □ leaseController.ts
  □ ReceiptController.ts
  □ [other controllers]
□ services/
  □ PropertyService.ts
  □ UserService.ts
  □ [other services]
□ repositories/
  □ PropertyRepository.ts
  □ UserRepository.ts
  □ [other repositories]
□ routes/
  □ propertyRoutes.ts
  □ authRoutes.ts
  □ [other routes]
□ utils/
  □ [utility files]
```

### Frontend Files

```
□ App.tsx
□ pages/
  □ properties/
    □ PropertyListPageEnhanced.tsx
    □ PropertyDetailPage.tsx
    □ [other property pages]
  □ auth/
    □ LoginPage.tsx
    □ [other auth pages]
  □ [other page directories]
□ components/
  □ [all components]
□ services/
  □ [service files - migrate to apiService]
□ hooks/
  □ [custom hooks]
```

---

## 🧪 Testing After Migration

### Backend Tests

1. **Start the server**
```bash
cd backend
npm run dev
```

2. **Check console output**
   - Should see colorful, formatted logs
   - No `console.log` statements

3. **Check log files**
```bash
tail -f logs/backend/combined-*.log
```

4. **Test error scenarios**
   - Trigger an error
   - Verify it appears in console and error log file
   - Check stack trace is included

5. **Test performance logging**
   - Make API requests
   - Verify timing information in logs

### Frontend Tests

1. **Start the frontend**
```bash
cd frontend
npm run dev
```

2. **Open browser console**
   - Should see colorful, formatted logs
   - No raw `console.log` statements

3. **Check stored errors**
```javascript
// In browser console
logger.getStoredLogs()
```

4. **Test error boundary**
   - Trigger a component error
   - Verify fallback UI appears
   - Check error is logged

5. **Test API logging**
   - Make API calls
   - Verify requests/responses are logged
   - Check performance timing

---

## 🎯 Quick Wins

### Files to Update First (High Impact)

**Backend:**
1. `server.ts` - Already updated ✅
2. Main controllers (Property, User, Tenant)
3. Authentication routes
4. Database connection/pool

**Frontend:**
1. `App.tsx` - Already updated ✅
2. Main layout components
3. API service wrapper
4. Auth context

---

## 🚨 Common Pitfalls

### ❌ Don't Do This

```typescript
// ❌ Logging in loops without throttling
for (const item of items) {
  logger.info('Processing item', { item });
}

// ❌ Logging sensitive data directly
logger.info('User password', { password: user.password });

// ❌ Swallowing errors
try {
  await operation();
} catch (error) {
  // Silent failure - nothing logged
}

// ❌ Not adding context
logger.error('Error occurred', error);
```

### ✅ Do This Instead

```typescript
// ✅ Log summary, not individual items
logger.info('Processing items', { count: items.length });
for (const item of items) {
  // Process without logging each
}

// ✅ Don't log sensitive data
logger.info('User authenticated', { userId: user.id });

// ✅ Always log errors
try {
  await operation();
} catch (error) {
  logger.error('Operation failed', error, { context: 'important data' });
  throw error; // Re-throw or handle
}

// ✅ Always add context
logger.error('Failed to process payment', error, {
  userId: user.id,
  amount: payment.amount,
  orderId: order.id,
});
```

---

## 📝 Migration Script Template

Create a simple script to help with migration:

```typescript
// scripts/migrate-logging.ts
import fs from 'fs';
import path from 'path';

const replacements = [
  {
    from: /console\.log\((.*?)\)/g,
    to: 'logger.info($1)',
  },
  {
    from: /console\.error\((.*?)\)/g,
    to: 'logger.error($1)',
  },
  {
    from: /console\.warn\((.*?)\)/g,
    to: 'logger.warn($1)',
  },
];

// Add logic to process files and apply replacements
// Note: Manual review is still recommended!
```

---

## ✅ Completion Criteria

You've successfully migrated when:

- [ ] No `console.log/error/warn` statements in code
- [ ] All errors are caught and logged
- [ ] Performance tracking is added to slow operations
- [ ] Log files are being created and rotated
- [ ] Tests pass
- [ ] Error scenarios are properly handled
- [ ] Team is trained on new logging system

---

## 🎓 Training Your Team

Share these resources with your team:

1. **Quick Reference**: `/docs/LOGGING_QUICK_REFERENCE.md`
2. **Full Documentation**: `/docs/LOGGING_SYSTEM.md`
3. **Architecture**: `/docs/LOGGING_ARCHITECTURE.md`
4. **This Guide**: `/docs/LOGGING_MIGRATION_GUIDE.md`

---

## 🎉 You're Done!

Once migration is complete:
- ✅ All errors are logged
- ✅ Beautiful console output
- ✅ Persistent log files
- ✅ Easy debugging
- ✅ Production-ready monitoring

**Happy logging!** 🚀
