# 🏗️ Multi-Organization Architecture: Database-per-Organization

This document outlines the architecture for the "Database-per-Organization" strategy, ensuring maximum isolation and scalability.

**Terminology Note:**
*   **Organization:** The SaaS Customer (e.g., "Acme Property Mgmt").
*   **Tenant:** A person renting a property (Core Feature).

## 📊 Architecture Diagram

```text
                                      🌐 CLIENT REQUEST
                             (GET /api/leases, X-Organization-ID: "org_A")
                                              │
                                              ▼
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                 🚀 BACKEND SERVER                                       │
│                                                                                         │
│  ┌──────────────────────────────┐          ┌─────────────────────────────────────────┐  │
│  │ 🛡️ ORGANIZATION MIDDLEWARE   │─────────▶│ 🔌 ORGANIZATION CONNECTION MANAGER      │  │
│  │ 1. Intercept Request         │◀─────────│ 1. Check Cache for "org_A" Pool         │  │
│  │ 2. Attach DB Pool to Req     │          │ 2. If missing, query Master DB          │  │
│  └──────────────┬───────────────┘          │ 3. Return Connection Pool               │  │
│                 │                          └────────────────────┬────────────────────┘  │
│                 │ (req.db = Pool_A)                             │                       │
│                 ▼                                               ▼                       │
│  ┌──────────────────────────────┐                  ┌─────────────────────────┐          │
│  │ 🎮 FEATURE CONTROLLER        │                  │ 👑 MASTER DB            │          │
│  │ - Parse DTO                  │                  │ Table: organizations    │          │
│  └──────────────┬───────────────┘                  │ id | db_name | db_host  │          │
│                 ▼                                  └─────────────────────────┘          │
│  ┌──────────────────────────────┐                                                       │
│  │ 💾 REPOSITORY                │                                                       │
│  │ (extends BaseRepo)           │                                                       │
│  │ - Generates SQL              │                                                       │
│  └──────────────┼───────────────┘                                                       │
│                 │                                                                       │
│                 │ (Executes SQL on Pool_A)                                              │
│                 ▼                                                                       │
└─────────────────────────────────────────────────────────────────────────────────────────┘
                  │
        ┌─────────┴─────────┐
        ▼                   ▼
┌───────────────┐   ┌───────────────┐
│ 🗄️ ORG A      │   │ 🗄️ ORG B      │
│ DATABASE      │   │ DATABASE      │
│ (Leases A)    │   │ (Leases B)    │
└───────────────┘   └───────────────┘
```

## 🧩 Component Roles

### 1. 🛡️ Organization Middleware
*   **Role:** The Gatekeeper.
*   **Action:** Intercepts every request. Looks for `X-Organization-ID` header (or subdomain).
*   **Responsibility:** Calls the `OrganizationConnectionManager` to get the correct DB connection and attaches it to the request object (`req.db`).

### 2. 🔌 OrganizationConnectionManager
*   **Role:** The Switchboard Operator.
*   **Action:** Maintains a cache of active DB connection pools.
*   **Logic:**
    *   *Is pool for Org A in cache?* -> Return it.
    *   *No?* -> Connect to **Master DB**, fetch connection string for Org A, create new pool, cache it, return it.

### 3. 👑 Master Database
*   **Role:** The Directory.
*   **Content:**
    *   `organizations` table: `id`, `name`, `db_host`, `db_name`, `db_user`, `db_password`.
    *   Shared data: `subscription_plans`, `global_settings`.

### 4. 🗄️ Organization Databases
*   **Role:** The Vaults.
*   **Content:** Complete schema (`leases`, `properties`, `users`, `tenants`) but **ONLY** for that one organization.
*   **Isolation:** Physically separate. Org A cannot query Org B's data even with a SQL injection vulnerability.

## 🔄 Request Flow Example

1.  **User** from "Acme Corp" logs in. Frontend sends request: `GET /api/leases` with header `X-Organization-ID: acme`.
2.  **Middleware** sees `acme`. Asks `OrganizationConnectionManager` for a pool.
3.  **Manager** checks cache. It's empty.
4.  **Manager** queries **Master DB**: `SELECT * FROM organizations WHERE id = 'acme'`.
5.  **Master DB** returns: `{ db_name: 'db_acme_prod' }`.
6.  **Manager** creates a connection pool to `db_acme_prod`.
7.  **Middleware** attaches this pool to the request.
8.  **Controller** passes this pool to `LeaseRepository`.
9.  **Repository** runs `SELECT * FROM leases`.
10. **Database** `db_acme_prod` returns only Acme's leases.

## ⚖️ Pros & Cons

| Feature | Database-per-Organization | Shared Database (Column) |
| :--- | :--- | :--- |
| **Isolation** | 🔒 **Highest** (Physical separation) | ⚠️ Medium (Logical separation) |
| **Scalability** | 🚀 **Unlimited** (Move heavy orgs to own servers) | 🚧 Limited by single DB size |
| **Backup/Restore** | ✅ Easy (Backup just one org) | ❌ Hard (Must filter rows) |
| **Complexity** | ⚠️ Higher (Managing migrations across 1000 DBs) | ✅ Lower (One schema to manage) |
| **Cost** | 💰 Higher (More resources/instances) | 💰 Lower (Shared resources) |

## 🛠️ Migration Strategy (Schema Updates)

When you add a column (`is_verified`) to the `leases` table, you must run the migration script against **ALL** organization databases.
*   We will build a script: `npm run migrate:all`.
*   It iterates through the Master DB organization list and runs the SQL against each one.
