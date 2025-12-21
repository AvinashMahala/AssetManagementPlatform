# 🚀 Organization Onboarding Process

In the **Database-per-Organization** architecture, onboarding a new organization is a standardized, automated process. It is designed to be a **"One-Click"** operation triggered by an API call or a CLI script.

## 🟢 How Easy Is It?
**Extremely Easy.**
From an operational perspective, it is a single API call:
`POST /api/admin/organizations { "name": "Acme Corp", "plan": "Enterprise" }`

Behind the scenes, the system handles the heavy lifting (Database creation, Schema setup, User provisioning).

---

## ⚙️ The "How": The Automated Workflow

We implement a `OrganizationProvisioningService` that executes these 4 steps automatically:

### Step 1: Register in Master DB
*   **Action:** Insert a new row into the `organizations` table in the Master Database.
*   **Result:** We get a unique `org_id` (e.g., `org_123`).
*   **Data:**
    ```json
    {
      "id": "org_123",
      "name": "Acme Corp",
      "db_name": "org_123_db",
      "status": "PROVISIONING"
    }
    ```

### Step 2: Provision the Database
*   **Action:** The service connects to the Database Server (as a superuser) and runs:
    ```sql
    CREATE DATABASE org_123_db;
    ```
*   **Note:** In a cloud environment (AWS RDS), this might involve calling the AWS API to spin up a new instance if you are doing "Instance-per-Organization", but usually it's just a `CREATE DATABASE` command on the existing cluster.

### Step 3: Hydrate the Schema (Migrations)
*   **Action:** The service runs the standard migration script against the **newly created** database.
*   **Command:** `npm run migrate -- --db=org_123_db`
*   **Result:** The new DB now has empty `leases`, `properties`, `users`, and `tenants` (property renters) tables ready to go.

### Step 4: Seed Initial Data
*   **Action:** Create the initial "Admin User" for that organization.
*   **Result:** The user receives a "Welcome" email with a link to set their password.
*   **Status Update:** Update Master DB status to `ACTIVE`.

---

## 💻 The Code (Conceptual)

```typescript
// src/features/admin/services/OrganizationProvisioningService.ts

export class OrganizationProvisioningService {
  async onboardOrganization(name: string, email: string) {
    // 1. Generate ID
    const orgId = `org_${uuid()}`;
    const dbName = `org_${orgId}_db`;

    // 2. Register in Master
    await masterRepo.create({ id: orgId, name, dbName, status: 'PROVISIONING' });

    // 3. Create DB
    await dbAdmin.createDatabase(dbName);

    // 4. Run Migrations
    await migrationRunner.runLatest(dbName);

    // 5. Create Admin User
    const orgPool = await connectionManager.getOrganizationPool(orgId);
    await orgPool.query('INSERT INTO users (email, role) VALUES ($1, $2)', [email, 'ADMIN']);

    // 6. Activate
    await masterRepo.update(orgId, { status: 'ACTIVE' });
    
    return { orgId, status: 'READY' };
  }
}
```

## 🛡️ Scalability & Safety

*   **Isolation:** If the provisioning fails (e.g., DB creation fails), the Master DB status stays `FAILED`. No half-baked organizations.
*   **Versioning:** Since every organization runs the same migration script, you ensure all orgs are on the same version.
*   **Performance:** Provisioning takes seconds (mostly waiting for `CREATE DATABASE`).
