# Project Structure and Guidelines (Updated for Express + TypeScript)

This README documents the project's architectural pattern and folder structure. It helps developers (or agents) consistently add new features, refactor existing ones, and integrate them into the Express application.

The architecture follows a **feature-based layered pattern** inspired by Clean Architecture and Domain-Driven Design (DDD), tailored for **Express with TypeScript** (no NestJS).

Key goals:
- Organize code by business domains/features.
- Separate concerns via four layers: `api` (presentation), `core` (application), `domain`, `infrastructure`.
- Enable easy addition of new features.
- Keep route registration explicit and modular.
- Support scalability, testability, and maintainability.

## Table of Contents
- [Overall Structure](#overall-structure)
- [Feature Organization Rules](#feature-organization-rules)
- [Layered Structure per Feature/Subfeature](#layered-structure-per-featuresubfeature)
- [Placement of Common Artifacts](#placement-of-common-artifacts)
- [Shared Folder](#shared-folder)
- [Handling Shared Models](#handling-shared-models)
- [Services vs. Use-Cases](#services-vs-use-cases)
- [Route Registration & Express Integration](#route-registration--express-integration)
- [Adding a New Feature or Subfeature](#adding-a-new-feature-or-subfeature)
- [Refactoring Guidelines](#refactoring-guidelines)
- [Best Practices](#best-practices)

## Overall Structure
```
src/
├── features/
│   ├── auth/                     # Example flat feature (single capability)
│   │   ├── auth.routes.ts        # Entry point for Express
│   │   ├── api/
│   │   ├── core/
│   │   ├── domain/
│   │   └── infrastructure/
│   ├── finance/                  # Example parent feature with multiple subfeatures
│   │   ├── expense/
│   │   │   ├── expense.routes.ts
│   │   │   ├── api/
│   │   │   ├── core/
│   │   │   ├── domain/
│   │   │   └── infrastructure/
│   │   ├── receipt/
│   │   │   └── ... (same structure)
│   │   └── finance.routes.ts     # Optional aggregator for parent routes
│   └── properties/
│       └── ... 
├── shared/
│   ├── config/
│   ├── constants/
│   ├── infrastructure/          # Global DB, event-bus, etc.
│   ├── middleware/
│   ├── types/
│   ├── utils/
│   └── domain/                   # Shared models & enums
├── server.ts                     # or app.ts – main entry point
└── README.md
```

## Feature Organization Rules
- **Parent features** (e.g., `finance/`, `properties/`) act as bounded contexts.
- **Subfeatures** are nested when a parent has **multiple related capabilities** (≥2–3).
  - Example: `finance/expense/`, `finance/receipt/`, `properties/property/`.
- **Flat features** when only **one capability** exists.
  - Example: `auth/`, `files/`.
- **Every leaf** (actual business capability) follows the identical layered structure + a `*.routes.ts` file.

## Layered Structure per Feature/Subfeature
Every feature/subfeature uses this **exact** layout:

```
<name>/                           # e.g., auth/ or finance/expense/
├── <name>.routes.ts              # Express route registration (entry point)
├── api/                          # Presentation layer
│   ├── __tests__/
│   ├── dtos/                     # Request/response DTOs
│   ├── validations/              # Validation logic/middleware
│   ├── mappers/                  # DTO ↔ core input
│   ├── errors/                   # Optional: HTTP-specific errors
│   └── <name>.controller.ts      # Controller class with registerRoutes(router)
├── core/                         # Application layer
│   ├── __tests__/
│   ├── constants/                # Feature-specific enums/values
│   ├── errors/                   # Business/use-case errors
│   ├── interfaces/               # Repository/external contracts
│   ├── mappers/                  # Core ↔ domain (if needed)
│   ├── services/                 # Supporting services
│   ├── types/                    # TS types
│   └── use-cases/                # Primary orchestrators
├── domain/                       # Pure domain (no framework deps)
│   ├── <name>.model.ts           # or .entity.ts – main domain model
│   └── errors/                   # Domain invariant errors
└── infrastructure/               # External concerns
    ├── __tests__/
    ├── mappers/                  # Domain ↔ persistence
    ├── queries/                  # Complex queries
    ├── repository/               # Concrete repository impls
    └── schema/                   # DB schemas (Prisma, TypeORM, etc.)
```

## Placement of Common Artifacts
| Artifact          | Location                              | Notes |
|-------------------|---------------------------------------|-------|
| DTOs             | `api/dtos/`                           | |
| Validations      | `api/validations/`                    | |
| Controller       | `api/<name>.controller.ts`            | Must have `registerRoutes(router: Router)` |
| Use-Cases        | `core/use-cases/`                     | Primary business flows |
| Services         | `core/services/`                      | Supporting/reusable logic |
| Interfaces       | `core/interfaces/`                    | Dependency inversion |
| Domain Model     | `domain/<name>.model.ts`              | |
| Repository Impl  | `infrastructure/repository/`          | |
| Tests            | `__tests__/` in relevant layer        | |

## Shared Folder
Cross-cutting concerns only:
- `shared/config/`
- `shared/constants/`
- `shared/infrastructure/` (global DB connection, event bus, notifications)
- `shared/middleware/` (auth, logging, etc.)
- `shared/types/`
- `shared/utils/`
- `shared/domain/` → **Shared models** (Property, Unit, Tenant, etc.)

Import shared items with absolute paths (e.g., `@app/shared/domain/models/property.model`).

## Handling Shared Models
- If a model is used by ≥2 features → move to `shared/domain/models/` (single source of truth).
- Alternative: Place in owning feature and import directly (avoid relative paths).
- Never duplicate.

## Services vs. Use-Cases
- **Use-Cases** (`core/use-cases/`): Fine-grained, represent one user intent (e.g., `CreateExpenseUseCase`). Preferred for complex flows.
- **Services** (`core/services/`): Coarser, reusable helpers or simple CRUD.
- Default to use-cases; inject directly into controllers when possible.

## Route Registration & Express Integration
Each feature/subfeature exposes routes via `<name>.routes.ts`:

```ts
// Example: features/finance/expense/expense.routes.ts
import { Router } from 'express';
import { ExpenseController } from './api/expense.controller';
import { CreateExpenseUseCase } from './core/use-cases/create-expense.use-case';
import { ExpenseRepository } from './infrastructure/repository/expense.repository';

export function registerExpenseRoutes(parentRouter: Router): void {
  const router = Router();

  // Manual DI
  const repository = new ExpenseRepository();
  const createUseCase = new CreateExpenseUseCase(repository);
  const controller = new ExpenseController(createUseCase);

  controller.registerRoutes(router);

  parentRouter.use('/expense', router);
}
```

Parent features may have an aggregator:

```ts
// features/finance/finance.routes.ts
export function registerFinanceRoutes(parentRouter: Router): void {
  const financeRouter = Router();
  registerExpenseRoutes(financeRouter);
  registerReceiptRoutes(financeRouter);
  // ...
  parentRouter.use('/finance', financeRouter);
}
```

In `server.ts`:
```ts
const apiRouter = Router();
registerAuthRoutes(apiRouter);
registerFinanceRoutes(apiRouter);
// ...
app.use('/api', apiRouter);
```

## Adding a New Feature or Subfeature
1. Decide: nest under parent if related and ≥2 subfeatures exist; otherwise flat.
2. Copy an existing feature/subfeature as template.
3. Implement layers + `<name>.routes.ts`.
4. Create controller with `registerRoutes(router)`.
5. Wire dependencies manually in `*.routes.ts`.
6. Register in `server.ts` or parent aggregator.
7. Add tests.

## Refactoring Guidelines
- Match this structure exactly — no variations.
- Migrate one feature at a time.
- Move shared models to `shared/domain/` when cross-feature usage appears.
- Keep dependency flow: api → core → domain → infrastructure.

## Best Practices
- Use explicit mapper names (e.g., `dto-to-usecase-input.mapper.ts`).
- Co-locate tests.
- Throw layer-appropriate errors.
- Use middleware from `shared/middleware/` globally.
- Document routes with comments or Swagger (if added later).

Follow existing examples (e.g., `sampleFeatureA/subFeatureA/`). This pattern scales reliably as features grow.

Last updated: December 2025