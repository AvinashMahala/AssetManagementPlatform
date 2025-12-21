# 🏗️ Backend Architecture: Event-Driven Vertical Slices

This document outlines the architecture for the Asset Management Platform backend. It is designed for **Scalability**, **Performance**, and **Maintainability**.

## 1. Core Philosophy

1.  **Vertical Slices:** Code is organized by **Feature** (e.g., `leases`, `properties`), not by technical layer (e.g., `controllers`, `services`). This keeps related code together.
2.  **Event-Driven:** Features communicate via **Domain Events** (`LeaseCreated`) rather than direct service calls. This decouples features and allows for easy extension.
3.  **Generic Repositories:** A smart `BaseRepository` handles 80% of CRUD operations automatically, making the system easy to scale (adding columns requires no SQL changes).

---

## 2. Folder Structure

```text
backend/src/
├── server.ts                   # 🚀 Entry Point (Registers features & starts server)
├── app.ts                      # ⚙️ Express App Configuration
│
├── shared/                     # 🧱 THE FOUNDATION (Stable, Generic, Reusable)
│   ├── infrastructure/         # Technical Adapters
│   │   ├── database/           # DB Connection & BaseRepository
│   │   ├── event-bus/          # EventBus (Pub/Sub)
│   │   └── logger/             # Logging Service
│   ├── middleware/             # Shared Middleware (Auth, Error Handling)
│   └── utils/                  # Shared Utilities (Date, Math, Validation)
│
└── features/                   # 🍰 THE VERTICAL SLICES (Business Domains)
    ├── leases/                 # [Example Feature]
    │   ├── api/                # 🗣️ Interface Layer (HTTP)
    │   │   ├── lease.controller.ts # Handles Requests/Responses
    │   │   ├── lease.routes.ts     # Route Definitions
    │   │   └── lease.dto.ts        # Input Validation Schemas
    │   │
    │   ├── core/               # 🧠 Domain Layer (Business Logic)
    │   │   ├── lease.service.ts    # Orchestrates logic & events
    │   │   ├── lease.types.ts      # Domain Models & Interfaces
    │   │   └── lease.events.ts     # Event Definitions
    │   │
    │   ├── data/               # 💾 Data Layer (Persistence)
    │   │   └── lease.repository.ts # Extends BaseRepository (Custom SQL here)
    │   │
    │   ├── handlers/           # 👂 Event Handlers (Side Effects)
    │   │   └── send-welcome-email.handler.ts # Reacts to events
    │   │
    │   └── index.ts            # 🚪 Public API (Exports Module)
    │
    ├── properties/             # [Another Feature]
    ├── auth/                   # [Another Feature]
    └── ...
```

---

## 3. Layer Responsibilities

### 🗣️ API Layer (`/api`)
*   **Responsibility:** Handle HTTP concerns.
*   **Actions:** Parse body/params, validate input (DTOs), call Service, return JSON.
*   **Rules:** No business logic here. Just translation.

### 🧠 Core Layer (`/core`)
*   **Responsibility:** The "Brain" of the feature.
*   **Actions:** Enforce business rules (e.g., "End date > Start date"), coordinate data persistence, emit events.
*   **Rules:** Pure TypeScript. No HTTP dependencies (req/res).

### 💾 Data Layer (`/data`)
*   **Responsibility:** Talk to the Database.
*   **Actions:** CRUD operations (via `BaseRepository`), Complex Queries, Aggregations.
*   **Rules:** Returns Domain Objects (Types), not raw DB rows.

### 👂 Handlers Layer (`/handlers`)
*   **Responsibility:** Handle side-effects and cross-feature logic.
*   **Actions:** Listen for events, send emails, update other features, log audits.
*   **Rules:** Decoupled from the main flow. Failures here shouldn't block the main response.

---

## 4. Common Workflows

### ✅ Adding a New Column (e.g., `is_verified`)
1.  **Database:** Run migration (`ALTER TABLE leases ADD COLUMN is_verified...`).
2.  **Type:** Update `lease.types.ts` (`isVerified?: boolean`).
3.  **Done.** `BaseRepository` automatically handles the INSERT/UPDATE/SELECT.

### ✅ Adding a Complex Query (e.g., "Find Expiring Leases")
1.  **Repository:** Add `findExpiringSoon(days)` method to `LeaseRepository`.
2.  **Implementation:** Write the specific SQL query inside that method.
3.  **Service:** Call `repo.findExpiringSoon(30)`.

### ✅ Adding a New Feature (e.g., "Audit Logging")
1.  **Create Handler:** Create `audit.handler.ts` in the relevant feature (or a new `audit` feature).
2.  **Listen:** Subscribe to `LeaseCreated`, `PropertyUpdated`, etc.
3.  **Implement:** Write the log to the DB.
4.  **Zero Impact:** The original `LeaseService` is untouched.
