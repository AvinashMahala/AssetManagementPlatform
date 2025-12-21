# 🏛️ Complete Backend Architecture Diagram

This diagram illustrates the **Vertical Slice**, **Event-Driven**, **Multi-Tenant (Database-per-Tenant)** architecture.

```text
                                      🌐 CLIENT REQUEST
                               (GET /api/leases, X-Tenant-ID: "org_A")
                                              │
                                              ▼
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                 🚀 BACKEND SERVER                                       │
│                                                                                         │
│  ┌──────────────────────────────┐          ┌─────────────────────────────────────────┐  │
│  │ 🛡️ TENANT MIDDLEWARE         │─────────▶│ 🔌 TENANT CONNECTION MANAGER            │  │
│  │ 1. Intercept Request         │◀─────────│ 1. Check Cache for "org_A" Pool         │  │
│  │ 2. Attach DB Pool to Req     │          │ 2. If missing, query Master DB          │  │
│  └──────────────┬───────────────┘          │ 3. Return Connection Pool               │  │
│                 │                          └────────────────────┬────────────────────┘  │
│                 │ (req.db = Pool_A)                             │                       │
│                 ▼                                               ▼                       │
│  ┌──────────────────────────────┐                  ┌─────────────────────────┐          │
│  │ 🍰 FEATURE: LEASES           │                  │ 👑 MASTER DB            │          │
│  │ (Vertical Slice)             │                  │ Table: tenants          │          │
│  │                              │                  │ id | db_name | db_host  │          │
│  │  ┌────────────────────────┐  │                  └─────────────────────────┘          │
│  │  │ 🗣️ LeaseController     │  │                                                       │
│  │  │ - Parse DTO            │  │                                                       │
│  │  └───────────┬────────────┘  │                                                       │
│  │              ▼               │                                                       │
│  │  ┌────────────────────────┐  │          ┌─────────────────────────────────────────┐  │
│  │  │ 🧠 LeaseService        │  │          │ ⚡ EVENT BUS                            │  │
│  │  │ - Business Logic       │──┼─────────▶│ - Publishes "LeaseCreated"              │  │
│  │  └───────────┬────────────┘  │          └────────────────────┬────────────────────┘  │
│  │              ▼               │                               │                       │
│  │  ┌────────────────────────┐  │                               ▼                       │
│  │  │ 💾 LeaseRepository     │  │          ┌─────────────────────────────────────────┐  │
│  │  │ (extends BaseRepo)     │  │          │ 👂 HANDLERS (Side Effects)              │  │
│  │  │ - Generates SQL        │  │          │ - SendWelcomeEmailHandler               │  │
│  │  └───────────┬────────────┘  │          │ - AuditLogHandler                       │  │
│  └──────────────┼───────────────┘          └─────────────────────────────────────────┘  │
│                 │                                                                       │
│                 │ (Executes SQL on Pool_A)                                              │
│                 ▼                                                                       │
└─────────────────────────────────────────────────────────────────────────────────────────┘
                  │
        ┌─────────┴─────────┐
        ▼                   ▼
┌───────────────┐   ┌───────────────┐
│ 🗄️ TENANT A   │   │ 🗄️ TENANT B   │
│ DATABASE      │   │ DATABASE      │
│ (Leases A)    │   │ (Leases B)    │
└───────────────┘   └───────────────┘
```

## 🔍 Key Components

1.  **The Switchboard (Middleware + Manager):**
    *   Dynamically routes the request to the correct database based on the Tenant ID.
    *   Ensures **Physical Isolation** of data.

2.  **The Vertical Slice (Leases Feature):**
    *   Contains all logic for Leases in one folder.
    *   **Scalable:** Adding a column only requires updating the Type definition. The Repository handles the SQL.

3.  **The Event Bus:**
    *   Decouples the "Core Logic" from "Side Effects".
    *   **Flexible:** Allows adding new behaviors (like notifications) without modifying the Service.

4.  **The Data Layer:**
    *   **Master DB:** Stores configuration (Who is Tenant A?).
    *   **Tenant DBs:** Stores actual business data. Isolated and secure.
