# 🚀 Logging System Quick Reference

## Backend (Node.js/TypeScript)

### Import
```typescript
import { logger, createModuleLogger, PerformanceLogger } from './utils/logger';
import { AppError } from './middlewares/errorHandler';
```

### Basic Logging
```typescript
logger.debug('Debug message', { key: 'value' });
logger.info('Info message', { key: 'value' });
logger.warn('Warning message', { key: 'value' });
logger.error('Error message', error, { key: 'value' });
logger.http('HTTP message', { key: 'value' });
```

### Module Logger
```typescript
const logger = createModuleLogger('ModuleName');
logger.info('Module-specific log');
```

### Performance Tracking
```typescript
const perfLogger = new PerformanceLogger('operationName', { context: 'data' });
// ... do work
perfLogger.end({ additionalContext: 'data' });
// or
perfLogger.endWithError(error, { context: 'data' });
```

### Error Throwing
```typescript
throw new AppError('Error message', 400, true, 'ERROR_CODE');
```

### Async Handler
```typescript
import { asyncHandler } from '../middlewares/errorHandler';

router.get('/endpoint', asyncHandler(async (req, res) => {
  // Errors automatically caught and logged
}));
```

---

## Frontend (React/TypeScript)

### Import
```typescript
import { logger, createComponentLogger, PerformanceLogger, logApiCall } from '@/utils/logger';
import { apiService } from '@/utils/apiService';
```

### Basic Logging
```typescript
logger.debug('Debug message', { key: 'value' });
logger.info('Info message', { key: 'value' });
logger.warn('Warning message', { key: 'value' });
logger.error('Error message', error, { key: 'value' });
```

### Component Logger
```typescript
const logger = createComponentLogger('ComponentName');
logger.info('Component-specific log');
```

### Performance Tracking
```typescript
const perfLogger = new PerformanceLogger('operationName', { context: 'data' });
// ... do work
perfLogger.end({ additionalContext: 'data' });
```

### API Calls
```typescript
// Using apiService (automatic logging)
const response = await apiService.get('/api/endpoint');

// Manual API logging
const perfLogger = logApiCall('GET', '/api/endpoint');
// ... make request
perfLogger.end({ status: 200 });
```

### Error Boundary
```tsx
import { ErrorBoundary, withErrorBoundary } from '@/components/ErrorBoundary';

// Wrap component
<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>

// Or use HOC
const SafeComponent = withErrorBoundary(YourComponent);
```

### Configuration
```typescript
logger.configure({
  logLevel: LogLevel.DEBUG,
  enableBackendReporting: true,
  backendUrl: 'http://localhost:5001',
});
```

---

## Log Levels

| Level | Backend | Frontend | Use Case |
|-------|---------|----------|----------|
| DEBUG | ✅ | ✅ | Detailed debugging info |
| INFO | ✅ | ✅ | General information |
| WARN | ✅ | ✅ | Warnings |
| ERROR | ✅ | ✅ | Errors and exceptions |
| HTTP | ✅ | ❌ | HTTP requests (backend only) |

---

## File Locations

- **Backend logs**: `/logs/backend/`
- **Frontend logs**: Browser localStorage (key: `app_error_logs`)
- **Documentation**: `/docs/LOGGING_SYSTEM.md`

---

## Common Patterns

### Controller Method
```typescript
const logger = createModuleLogger('Controller');

async method(req: Request, res: Response): Promise<void> {
  const perfLogger = new PerformanceLogger('method', { userId: req.user?.id });
  
  try {
    logger.info('Starting operation', { context });
    const result = await this.service.method();
    logger.info('Operation completed', { result });
    perfLogger.end({ success: true });
    res.json({ success: true, data: result });
  } catch (error) {
    logger.error('Operation failed', error, { context });
    perfLogger.endWithError(error as Error);
    throw new AppError('Operation failed', 500);
  }
}
```

### React Component
```typescript
const logger = createComponentLogger('Component');

function Component() {
  useEffect(() => {
    const perfLogger = new PerformanceLogger('loadData');
    
    async function loadData() {
      try {
        logger.info('Loading data');
        const response = await apiService.get('/api/data');
        
        if (response.success) {
          logger.info('Data loaded', { count: response.data.length });
          perfLogger.end({ count: response.data.length });
        } else {
          logger.error('Load failed', response.error);
          perfLogger.endWithError(new Error(response.error.message));
        }
      } catch (error) {
        logger.error('Exception', error as Error);
        perfLogger.endWithError(error as Error);
      }
    }
    
    loadData();
  }, []);
}
```

---

## CLI Commands

```bash
# View all backend logs
tail -f logs/backend/combined-*.log

# View errors only
tail -f logs/backend/error-*.log

# View with JSON formatting
tail -f logs/backend/combined-*.log | jq

# Search logs
grep "search term" logs/backend/combined-*.log

# Count errors today
grep -c "error" logs/backend/error-$(date +%Y-%m-%d).log
```

---

## Remember

✅ Always use logger (not console.log)  
✅ Add context to logs  
✅ Use performance logging  
✅ Wrap async handlers  
✅ Let errors bubble up  
❌ Never swallow errors  
❌ Don't log sensitive data  
❌ Don't use console.log  

---

**Full Documentation**: See `/docs/LOGGING_SYSTEM.md`
