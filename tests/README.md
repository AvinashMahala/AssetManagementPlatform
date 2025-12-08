# Property Management Platform - Testing

[![Jest](https://img.shields.io/badge/Jest-C21325?style=for-the-badge&logo=jest&logoColor=white)](https://jestjs.io/)
[![Testing Library](https://img.shields.io/badge/Testing%20Library-E33332?style=for-the-badge&logo=testing-library&logoColor=white)](https://testing-library.com/)
[![Playwright](https://img.shields.io/badge/Playwright-45ba4b?style=for-the-badge&logo=playwright&logoColor=white)](https://playwright.dev/)

Comprehensive testing suite for the Property Management Platform. Includes unit tests, integration tests, and end-to-end tests to ensure code quality and prevent regressions.

## 🧪 Testing Strategy

### Testing Pyramid
```
End-to-End Tests (E2E)     ████░░ 20%
Integration Tests         ███████ 30%
Unit Tests               ██████████ 50%
```

### Test Types

1. **Unit Tests** (50%): Test individual functions, components, and classes in isolation
2. **Integration Tests** (30%): Test interactions between components and external services
3. **End-to-End Tests** (20%): Test complete user workflows through the UI

## 🛠️ Testing Stack

### Backend Testing
- **Jest**: Test runner and assertion library
- **Supertest**: HTTP endpoint testing
- **Mock Libraries**: For dependency mocking
- **Test Database**: Isolated PostgreSQL test instance

### Frontend Testing
- **Vitest**: Fast unit testing for React components
- **React Testing Library**: Component testing utilities
- **Jest DOM**: DOM assertions
yarn test:coverage

### End-to-End Testing
- **Playwright**: Cross-browser E2E testing
- **Visual Testing**: Screenshot comparisons
- **Accessibility Testing**: Automated a11y checks

## 🚀 Quick Start

### Prerequisites
- Node.js (v18+)
- Docker (for test database)
- npm workspaces configured

### Installation
```bash
# Install all dependencies
yarn install

# Install test-specific packages if needed
yarn workspace backend add -D jest supertest
yarn workspace frontend add -D vitest @testing-library/react
```

### Running Tests
```bash
# Run all tests across workspaces
yarn test

# Run backend tests only
yarn workspace backend test

# Run frontend tests only
yarn workspace frontend test

# Run with coverage
yarn test:coverage
        run: yarn test:backend:ci
# Run in watch mode
yarn test:watch
```

        run: yarn test:frontend:ci

```
        run: yarn test:e2e:ci
├── unit/                          # Unit tests
│   ├── backend/
│   │   ├── controllers/
│   │   │   ├── assetController.test.ts
│   │   │   └── userController.test.ts
│   │   ├── services/
│   │   │   ├── assetService.test.ts
│   │   │   └── userService.test.ts
│   │   ├── repositories/
│   │   │   ├── assetRepository.test.ts
│   │   │   └── userRepository.test.ts
│   │   ├── utils/
│   │   │   ├── validation.test.ts
│   │   │   └── password.test.ts
│   │   └── middlewares/
│   │       └── auth.test.ts
│   └── frontend/
│       ├── components/
│       │   ├── Button.test.tsx
│       │   ├── AssetForm.test.tsx
│       │   └── AssetList.test.tsx
│       ├── hooks/
│       │   ├── useAssets.test.ts
│       │   └── useApi.test.ts
│       ├── services/
│       │   └── assetService.test.ts
│       └── utils/
│           └── helpers.test.ts
├── integration/                   # Integration tests
│   ├── backend/
│   │   ├── api/
│   │   │   ├── assets.test.ts
│   │   │   └── users.test.ts
│   │   └── database/
│   │       └── migrations.test.ts
│   └── frontend/
│       └── api-integration.test.ts
├── e2e/                          # End-to-end tests
│   ├── playwright/
│   │   ├── assets.spec.ts
│   │   ├── authentication.spec.ts
│   │   └── admin.spec.ts
│   └── visual-regression/
│       └── snapshots/
├── fixtures/                     # Test data
│   ├── assets.json
│   ├── users.json
│   └── database-seeds.sql
├── helpers/                      # Test utilities
│   ├── test-db.ts
│   ├── mock-data.ts
│   └── api-client.ts
└── config/                       # Test configuration
    ├── jest.config.js
    ├── playwright.config.ts
    └── vitest.config.ts
```

## 🔧 Backend Testing

### Unit Tests

#### Service Layer Testing
```typescript
// tests/unit/backend/services/assetService.test.ts
import { AssetService } from '../../../../backend/src/services/AssetService';
import { IAssetRepository } from '../../../../backend/src/interfaces/repositories/IAssetRepository';

describe('AssetService', () => {
  let assetService: AssetService;
  let mockRepository: jest.Mocked<IAssetRepository>;

  beforeEach(() => {
    mockRepository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findByName: jest.fn()
    };
    assetService = new AssetService(mockRepository);
  });

  describe('createAsset', () => {
    it('should create asset successfully', async () => {
      const assetData = {
        name: 'Test Asset',
        description: 'Test Description',
        value: 100.00,
        location: 'Test Location'
      };

      mockRepository.findByName.mockResolvedValue(null);
      mockRepository.create.mockResolvedValue({
        id: 1,
        ...assetData,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      const result = await assetService.createAsset(assetData);

      expect(result.name).toBe(assetData.name);
      expect(result.value).toBe(assetData.value);
      expect(mockRepository.create).toHaveBeenCalledWith(assetData);
    });

    it('should throw error for duplicate name', async () => {
      const assetData = {
        name: 'Existing Asset',
        value: 100.00
      };

      mockRepository.findByName.mockResolvedValue({
        id: 1,
        name: 'Existing Asset',
        value: 100.00,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      await expect(assetService.createAsset(assetData))
        .rejects.toThrow('Asset with this name already exists');
    });

    it('should throw error for negative value', async () => {
      const assetData = {
        name: 'Test Asset',
        value: -100.00
      };

      await expect(assetService.createAsset(assetData))
        .rejects.toThrow('Asset value must be positive');
    });
  });
});
```

#### Controller Testing
```typescript
// tests/unit/backend/controllers/assetController.test.ts
import request from 'supertest';
import express from 'express';
import { AssetController } from '../../../../backend/src/controllers/assetController';
import { AssetService } from '../../../../backend/src/services/AssetService';

describe('AssetController', () => {
  let app: express.Application;
  let assetController: AssetController;
  let mockAssetService: jest.Mocked<AssetService>;

  beforeEach(() => {
    mockAssetService = {
      getAllAssets: jest.fn(),
      getAssetById: jest.fn(),
      createAsset: jest.fn(),
      updateAsset: jest.fn(),
      deleteAsset: jest.fn()
    } as any;

    assetController = new AssetController(mockAssetService);

    app = express();
    app.use(express.json());
    app.get('/assets', (req, res) => assetController.getAssets(req, res));
    app.post('/assets', (req, res) => assetController.createAsset(req, res));
  });

  describe('GET /assets', () => {
    it('should return all assets', async () => {
      const mockAssets = [
        { id: 1, name: 'Asset 1', value: 100 },
        { id: 2, name: 'Asset 2', value: 200 }
      ];

      mockAssetService.getAllAssets.mockResolvedValue(mockAssets);

      const response = await request(app).get('/assets');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockAssets);
    });

    it('should handle service errors', async () => {
      mockAssetService.getAllAssets.mockRejectedValue(new Error('Database error'));

      const response = await request(app).get('/assets');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('Database error');
    });
  });
});
```

### Integration Tests

#### API Integration Testing
```typescript
// tests/integration/backend/api/assets.test.ts
import request from 'supertest';
import { createApp } from '../../../../backend/src/server';
import { TestDatabase } from '../../helpers/test-db';

describe('Assets API Integration', () => {
  let app: express.Application;
  let testDb: TestDatabase;

  beforeAll(async () => {
    testDb = new TestDatabase();
    await testDb.setup();

    // Create app with test database
    app = createApp(testDb.getPool());
  });

  afterAll(async () => {
    await testDb.teardown();
  });

  beforeEach(async () => {
    await testDb.clear();
  });

  describe('POST /api/assets', () => {
    it('should create asset successfully', async () => {
      const assetData = {
        name: 'Integration Test Asset',
        description: 'Created during integration test',
        value: 500.00,
        location: 'Test Lab'
      };

      const response = await request(app)
        .post('/api/assets')
        .send(assetData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(assetData.name);
      expect(response.body.data.value).toBe(assetData.value);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('createdAt');
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/assets')
        .send({ name: 'Test Asset' }) // Missing value
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should prevent duplicate names', async () => {
      const assetData = {
        name: 'Duplicate Asset',
        value: 100.00
      };

      // Create first asset
      await request(app)
        .post('/api/assets')
        .send(assetData)
        .expect(201);

      // Try to create duplicate
      const response = await request(app)
        .post('/api/assets')
        .send(assetData)
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('CONFLICT');
    });
  });

  describe('GET /api/assets', () => {
    beforeEach(async () => {
      // Seed test data
      await testDb.seed([
        { name: 'Asset A', value: 100 },
        { name: 'Asset B', value: 200 },
        { name: 'Asset C', value: 300 }
      ]);
    });

    it('should return paginated results', async () => {
      const response = await request(app)
        .get('/api/assets?page=1&limit=2')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(2);
      expect(response.body.pagination.total).toBe(3);
    });

    it('should support search functionality', async () => {
      const response = await request(app)
        .get('/api/assets?search=Asset A')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].name).toBe('Asset A');
    });
  });
});
```

## 🎨 Frontend Testing

### Component Testing
```typescript
// tests/unit/frontend/components/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../../../../frontend/src/components/common/Button';

describe('Button', () => {
  it('renders children correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('handles click events', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('applies correct CSS classes', () => {
    const { container } = render(
      <Button variant="primary" size="large">Test</Button>
    );

    const button = container.firstChild as HTMLElement;
    expect(button).toHaveClass('button', 'primary', 'large');
  });

  it('shows loading state', () => {
    render(<Button loading>Save</Button>);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('is disabled when loading', () => {
    render(<Button loading>Save</Button>);
    expect(screen.getByText('Loading...')).toBeDisabled();
  });
});
```

### Custom Hook Testing
```typescript
// tests/unit/frontend/hooks/useAssets.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { useAssets } from '../../../../frontend/src/hooks/useAssets';
import { assetService } from '../../../../frontend/src/services/assetService';

// Mock the service
jest.mock('../../../../frontend/src/services/assetService');
const mockAssetService = assetService as jest.Mocked<typeof assetService>;

describe('useAssets', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch assets on mount', async () => {
    const mockAssets = [
      { id: 1, name: 'Asset 1', value: 100 },
      { id: 2, name: 'Asset 2', value: 200 }
    ];

    mockAssetService.getAll.mockResolvedValue(mockAssets);

    const { result } = renderHook(() => useAssets());

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.assets).toEqual(mockAssets);
    expect(result.current.error).toBeNull();
    expect(mockAssetService.getAll).toHaveBeenCalledTimes(1);
  });

  it('should handle errors', async () => {
    const errorMessage = 'Failed to fetch assets';
    mockAssetService.getAll.mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useAssets());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.assets).toEqual([]);
    expect(result.current.error).toBe(errorMessage);
  });

  it('should refetch data', async () => {
    const mockAssets = [{ id: 1, name: 'Asset 1', value: 100 }];
    mockAssetService.getAll.mockResolvedValue(mockAssets);

    const { result } = renderHook(() => useAssets());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Call refetch
    result.current.refetch();

    expect(result.current.loading).toBe(true);
    expect(mockAssetService.getAll).toHaveBeenCalledTimes(2);
  });
});
```

## 🌐 End-to-End Testing

### Playwright Configuration
```typescript
// tests/config/playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: '../e2e/playwright',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',

  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],

  webServer: {
    command: 'yarn dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

### E2E Test Example
```typescript
// tests/e2e/playwright/assets.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Asset Management', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to assets page
    await page.goto('/assets');

    // Wait for page to load
    await page.waitForSelector('[data-testid="assets-list"]');
  });

  test('should display assets list', async ({ page }) => {
    // Check if assets are displayed
    const assetsList = page.locator('[data-testid="asset-item"]');
    await expect(assetsList).toHaveCount(await assetsList.count());
  });

  test('should create new asset', async ({ page }) => {
    // Click create button
    await page.click('[data-testid="create-asset-btn"]');

    // Fill form
    await page.fill('[data-testid="asset-name"]', 'E2E Test Asset');
    await page.fill('[data-testid="asset-description"]', 'Created by E2E test');
    await page.fill('[data-testid="asset-value"]', '999.99');
    await page.fill('[data-testid="asset-location"]', 'Test Lab');

    // Submit form
    await page.click('[data-testid="submit-btn"]');

    // Verify asset was created
    await expect(page.locator('text=E2E Test Asset')).toBeVisible();
  });

  test('should search assets', async ({ page }) => {
    // Type in search box
    await page.fill('[data-testid="search-input"]', 'laptop');

    // Wait for results
    await page.waitForSelector('[data-testid="asset-item"]');

    // Verify filtered results
    const assetNames = await page.locator('[data-testid="asset-name"]').allTextContents();
    assetNames.forEach(name => {
      expect(name.toLowerCase()).toContain('laptop');
    });
  });

  test('should delete asset', async ({ page }) => {
    // Find and click delete button for first asset
    const firstAsset = page.locator('[data-testid="asset-item"]').first();
    const deleteBtn = firstAsset.locator('[data-testid="delete-btn"]');

    // Confirm deletion in dialog
    page.on('dialog', dialog => dialog.accept());

    await deleteBtn.click();

    // Verify asset was removed
    await expect(firstAsset).not.toBeVisible();
  });
});
```

## 📊 Test Coverage

### Coverage Goals
- **Statements**: > 80%
- **Branches**: > 75%
- **Functions**: > 85%
- **Lines**: > 80%

### Coverage Configuration
```javascript
// tests/config/jest.config.js
module.exports = {
  collectCoverageFrom: [
    'backend/src/**/*.{ts,js}',
    'frontend/src/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/dist/**',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThreshold: {
    global: {
      statements: 80,
      branches: 75,
      functions: 85,
      lines: 80,
    },
  },
};
```

### Coverage Report
```bash
# Generate coverage report
yarn test:coverage

# View HTML report
open coverage/lcov-report/index.html
```

## 🔄 CI/CD Integration

### GitHub Actions Workflow
```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: yarn install --frozen-lockfile

      - name: Run backend tests
        run: yarn test:backend:ci
        env:
          MAIN_DATABASE_URL: postgresql://postgres:test@localhost:5432/test

      - name: Run frontend tests
        run: yarn test:frontend:ci

      - name: Run E2E tests
        run: yarn test:e2e:ci

      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

## 🐛 Debugging Tests

### Common Issues

1. **Async Tests**: Always use `async/await` or return promises
2. **Mock Cleanup**: Clear mocks between tests
3. **Database State**: Reset database between tests
4. **Timing Issues**: Use `waitFor` for async operations

### Debugging Tools
```typescript
// Add debug logging
console.log('Debug:', variable);

// Use Jest debug mode
npm test -- --verbose --watch

// Debug specific test
npm test -- --testNamePattern="should create asset"

// Debug with breakpoints
debugger; // Add breakpoint in test
```

## 📈 Test Metrics

### Performance Benchmarks
- Unit tests: < 100ms per test
- Integration tests: < 500ms per test
- E2E tests: < 10s per test

### Quality Gates
- All tests must pass
- Coverage thresholds met
- No flaky tests
- Linting passes

## 🔮 Future Testing Enhancements

- [ ] Visual regression testing
- [ ] Performance testing
- [ ] Load testing
- [ ] Accessibility testing
- [ ] Contract testing
- [ ] Mutation testing
- [ ] Property-based testing

## 📚 Additional Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Playwright Guide](https://playwright.dev/docs/intro)
- [Testing Best Practices](https://kentcdodds.com/blog/common-testing-mistakes)

## 🤝 Contributing

1. Write tests for new features
2. Follow naming conventions
3. Maintain test coverage
4. Update tests when refactoring
5. Run full test suite before committing

---

Built with ❤️ for reliable software delivery