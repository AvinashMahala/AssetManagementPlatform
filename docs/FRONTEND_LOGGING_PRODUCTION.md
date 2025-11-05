# 🎛️ Frontend Logging - Production Configuration Guide

## 🌟 Overview

The frontend logging system is **development-focused** with intelligent production controls:

- ✅ **Development**: Full logging enabled (console, localStorage, detailed errors)
- ✅ **Production**: Minimal logging, graceful error handling, **user consent required**
- ✅ **User Experience**: No console spam, no unnecessary data collection
- ✅ **Privacy First**: All tracking requires explicit user consent

---

## 🚦 Feature Flags

The system uses feature flags to control logging behavior:

| Feature | Development | Production | Notes |
|---------|-------------|------------|-------|
| Console Logging | ✅ Enabled | ❌ Disabled | No console spam in production |
| LocalStorage | ✅ Enabled | ⚠️ With Consent | Only with user permission |
| Backend Reporting | ❌ Optional | ⚠️ With Consent | Only with user permission |
| Error Boundary UI | ✅ Enabled | ✅ Enabled | Always show graceful errors |

---

## 🔐 User Consent System

### How It Works

1. **First Visit**: User sees consent dialog (production only)
2. **User Choice**: Can enable/disable localStorage and backend reporting
3. **Persistence**: Choice is saved and respected
4. **Transparency**: Clear explanation of what data is collected

### Consent Dialog Features

- ✅ **Non-intrusive**: Appears 2 seconds after page load
- ✅ **Clear explanation**: What data is collected and why
- ✅ **Optional**: User can decline without affecting functionality
- ✅ **Changeable**: User can update preferences anytime
- ✅ **Privacy-focused**: No personal data collection

### What Gets Collected (with consent)

**LocalStorage (optional):**
- Error messages and stack traces
- Component names
- Page URLs
- Timestamps
- Max 100 entries, auto-cleaned

**Backend Reporting (optional):**
- Same as localStorage
- Sent to backend for centralized monitoring
- No personal data, passwords, or sensitive information

### What NEVER Gets Collected

❌ Personal information (name, email, etc.)  
❌ Passwords or credentials  
❌ Payment information  
❌ Private user data  
❌ Cookies or tracking data  
❌ Analytics beyond errors  

---

## 🛠️ Implementation

### 1. Feature Flags Usage

```typescript
import { featureFlags } from '@/utils/featureFlags';

// Check if feature is enabled
if (featureFlags.isConsoleLoggingEnabled()) {
  // Log to console
}

// Update flags programmatically
featureFlags.updateFlags({
  enableConsoleLogging: false,
  enableLocalStorageLogging: true,
});

// Reset to defaults
featureFlags.reset();
```

### 2. Consent Management

```typescript
import { consentManager } from '@/utils/consentManager';

// Check consent status
const hasConsent = consentManager.hasBackendReportingConsent();

// Save consent
consentManager.saveConsent({
  localStorage: true,
  backendReporting: false,
});

// Clear consent (ask again)
consentManager.clearConsent();
```

### 3. Logger Configuration

```typescript
import { logger } from '@/utils/logger';

// Configure logger (respects feature flags)
logger.configure({
  logLevel: LogLevel.INFO,
  enableBackendReporting: true, // Requires consent
  backendUrl: 'https://api.example.com',
});

// Use logger (automatically checks permissions)
logger.error('Something went wrong', error);
```

---

## 🎨 Component Integration

### App.tsx Setup

```tsx
import { ConsentDialog, LoggingDevTools } from '@/components/ConsentDialog';

function App() {
  return (
    <ErrorBoundary>
      {/* Consent dialog - production only */}
      <ConsentDialog />
      
      {/* Dev tools - development only */}
      <LoggingDevTools />
      
      {/* Your app */}
    </ErrorBoundary>
  );
}
```

### Custom Consent Handling

```tsx
import { ConsentDialog } from '@/components/ConsentDialog';

function MyApp() {
  const handleConsentGiven = (consent) => {
    console.log('User consent:', consent);
    // Initialize services based on consent
  };

  return (
    <ConsentDialog onConsentGiven={handleConsentGiven} />
  );
}
```

---

## 🔧 Development Tools

In development mode, you get access to dev tools:

### Access Dev Tools

1. Look for 🛠️ button in bottom-right corner
2. Click to open dev tools panel
3. Toggle feature flags on/off
4. View consent status
5. Clear consent and reload

### Dev Tools Features

- ✅ Toggle all feature flags
- ✅ View current consent status
- ✅ Clear consent and test dialog
- ✅ Reset flags to defaults
- ✅ Quick reload for testing

---

## 📊 Behavior by Environment

### Development Mode

```javascript
// All logging enabled by default
{
  enableConsoleLogging: true,
  enableLocalStorageLogging: true,
  enableBackendReporting: false,
  requireUserConsent: false,
  showErrorBoundaryUI: true
}
```

**What you see:**
- 🎨 Colorful console logs with emojis
- 📦 Detailed error information
- ⏱️ Performance timing
- 🛠️ Dev tools available

### Production Mode

```javascript
// Minimal logging, consent required
{
  enableConsoleLogging: false,
  enableLocalStorageLogging: false,
  enableBackendReporting: false,
  requireUserConsent: true,
  showErrorBoundaryUI: true
}
```

**What users see:**
- 🔇 No console logs (clean)
- 💬 Consent dialog (once)
- 🛡️ Graceful error UI
- 🚀 Fast, no logging overhead

---

## 🎯 Best Practices

### Do's ✅

```typescript
// ✅ Use logger in development
if (import.meta.env.DEV) {
  logger.debug('Debugging info');
}

// ✅ Log critical errors (respects consent)
logger.error('Payment failed', error);

// ✅ Add context for troubleshooting
logger.error('API call failed', error, {
  endpoint: '/api/data',
  userId: user.id,
});

// ✅ Check consent before custom logging
if (consentManager.hasBackendReportingConsent()) {
  sendErrorReport(error);
}
```

### Don'ts ❌

```typescript
// ❌ Don't spam console in production
logger.info('User clicked button'); // Too verbose

// ❌ Don't bypass consent system
fetch('/api/logs', { /* ... */ }); // Use logger instead

// ❌ Don't log sensitive data
logger.error('Login failed', { password: '...' }); // NO!

// ❌ Don't log everything
logger.debug('Component rendered'); // Too noisy
```

---

## 🧪 Testing

### Test Consent Dialog

1. Clear local storage
2. Reload page in production mode
3. Wait 2 seconds
4. Consent dialog should appear

```javascript
// In browser console
localStorage.removeItem('logging_consent');
location.reload();
```

### Test Feature Flags

```javascript
// In browser console (dev mode)
__featureFlags.updateFlags({
  enableConsoleLogging: true
});

// Check current flags
console.log(__featureFlags.getFlags());
```

### Test Different Scenarios

```javascript
// Simulate production mode
__featureFlags.enableProductionMode();

// Simulate development mode
__featureFlags.enableDevelopmentMode();

// Clear everything and start fresh
__consentManager.clearConsent();
__featureFlags.reset();
location.reload();
```

---

## 🚀 Deployment Checklist

### Before Deploying

- [ ] Verify `NODE_ENV=production` is set
- [ ] Test consent dialog appears
- [ ] Verify no console logs in production
- [ ] Check error boundary works
- [ ] Test backend reporting (with consent)
- [ ] Verify localStorage respects consent
- [ ] Test "decline" flow works properly

### Configuration

```env
# .env.production
VITE_API_URL=https://api.yourdomain.com
NODE_ENV=production
```

### Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

---

## 🔍 Troubleshooting

### "Consent dialog not showing"

**Possible causes:**
1. Already gave consent (check localStorage)
2. Development mode (no consent required)
3. Feature flag disabled

**Solution:**
```javascript
localStorage.removeItem('logging_consent');
location.reload();
```

### "Logs not appearing in console"

**Development:**
- Check feature flags: `__featureFlags.getFlags()`
- Enable: `__featureFlags.updateFlags({ enableConsoleLogging: true })`

**Production:**
- This is expected! No console logs in production for better UX

### "Backend reporting not working"

**Check:**
1. User gave consent: `__consentManager.hasBackendReportingConsent()`
2. Feature flag enabled: `__featureFlags.isBackendReportingEnabled()`
3. Backend URL configured: Check logger configuration
4. Network requests: Check browser network tab

---

## 📈 Analytics & Monitoring

### View Stored Errors (Development)

```javascript
// In browser console
logger.getStoredLogs();
```

### Clear Stored Errors

```javascript
// In browser console
logger.clearStoredLogs();
```

### Export Errors for Analysis

```javascript
// In browser console
const errors = logger.getStoredLogs();
console.log(JSON.stringify(errors, null, 2));
// Copy from console
```

---

## 🎓 Summary

| Aspect | Development | Production |
|--------|-------------|------------|
| Console Logs | ✅ Full details | ❌ Disabled |
| LocalStorage | ✅ Auto-enabled | ⚠️ User consent |
| Backend Reports | 🔧 Optional | ⚠️ User consent |
| Error Boundary | ✅ Dev UI | ✅ Production UI |
| User Consent | ❌ Not required | ✅ Required |
| Dev Tools | ✅ Available | ❌ Hidden |

**Key Principle**: Great developer experience in development, respect user privacy in production!

---

## 🆘 Quick Commands

```javascript
// Development shortcuts (in console)

// View feature flags
__featureFlags.getFlags()

// Enable all logging
__featureFlags.enableDevelopmentMode()

// Disable all logging
__featureFlags.enableProductionMode()

// Check consent
__consentManager.getConsent()

// Clear consent
__consentManager.clearConsent()

// View stored errors
logger.getStoredLogs()

// Clear stored errors
logger.clearStoredLogs()
```

---

For complete documentation, see:
- **Full System**: `/docs/LOGGING_SYSTEM.md`
- **Quick Reference**: `/docs/LOGGING_QUICK_REFERENCE.md`
- **Architecture**: `/docs/LOGGING_ARCHITECTURE.md`
