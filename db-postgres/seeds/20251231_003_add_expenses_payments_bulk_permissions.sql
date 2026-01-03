-- 20251231_003_add_expenses_payments_bulk_permissions.sql
-- Idempotent seed: add Expenses, Payments and Bulk Operations permission categories and permissions;
-- create manager/operator roles (if roles table exists) and grant permissions.
-- Safe to re-run. Uses gen_random_uuid() (pgcrypto). If your DB uses uuid_generate_v4(), change accordingly.

BEGIN;

-- Ensure pgcrypto extension is available for gen_random_uuid() (no-op if already present)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pgcrypto') THEN
    BEGIN
      CREATE EXTENSION IF NOT EXISTS pgcrypto;
    EXCEPTION WHEN others THEN
      RAISE NOTICE 'pgcrypto extension not created (may lack privileges).';
    END;
  END IF;
END$$;

-- 1) Permission categories
INSERT INTO permission_categories (id, name, description)
SELECT gen_random_uuid(), 'Expenses', 'Permissions related to expenses'
WHERE NOT EXISTS (SELECT 1 FROM permission_categories WHERE name = 'Expenses');

INSERT INTO permission_categories (id, name, description)
SELECT gen_random_uuid(), 'Payments', 'Permissions related to payments'
WHERE NOT EXISTS (SELECT 1 FROM permission_categories WHERE name = 'Payments');

INSERT INTO permission_categories (id, name, description)
SELECT gen_random_uuid(), 'Bulk Operations', 'Permissions for bulk operations and admin workflows'
WHERE NOT EXISTS (SELECT 1 FROM permission_categories WHERE name = 'Bulk Operations');

-- 2) Permissions (idempotent)
-- Expenses
INSERT INTO permissions (id, name, description, category_id)
SELECT gen_random_uuid(), 'expenses:expense:view',  'View expenses',  (SELECT id FROM permission_categories WHERE name = 'Expenses')
WHERE NOT EXISTS (SELECT 1 FROM permissions WHERE name = 'expenses:expense:view');

INSERT INTO permissions (id, name, description, category_id)
SELECT gen_random_uuid(), 'expenses:expense:create',  'Create expense',  (SELECT id FROM permission_categories WHERE name = 'Expenses')
WHERE NOT EXISTS (SELECT 1 FROM permissions WHERE name = 'expenses:expense:create');

INSERT INTO permissions (id, name, description, category_id)
SELECT gen_random_uuid(), 'expenses:expense:update',  'Update expense',  (SELECT id FROM permission_categories WHERE name = 'Expenses')
WHERE NOT EXISTS (SELECT 1 FROM permissions WHERE name = 'expenses:expense:update');

INSERT INTO permissions (id, name, description, category_id)
SELECT gen_random_uuid(), 'expenses:expense:delete',  'Delete expense',  (SELECT id FROM permission_categories WHERE name = 'Expenses')
WHERE NOT EXISTS (SELECT 1 FROM permissions WHERE name = 'expenses:expense:delete');

-- Payments (rent payments)
INSERT INTO permissions (id, name, description, category_id)
SELECT gen_random_uuid(), 'payments:payment:view',  'View payments',  (SELECT id FROM permission_categories WHERE name = 'Payments')
WHERE NOT EXISTS (SELECT 1 FROM permissions WHERE name = 'payments:payment:view');

INSERT INTO permissions (id, name, description, category_id)
SELECT gen_random_uuid(), 'payments:payment:create',  'Create payment',  (SELECT id FROM permission_categories WHERE name = 'Payments')
WHERE NOT EXISTS (SELECT 1 FROM permissions WHERE name = 'payments:payment:create');

INSERT INTO permissions (id, name, description, category_id)
SELECT gen_random_uuid(), 'payments:payment:update',  'Update payment',  (SELECT id FROM permission_categories WHERE name = 'Payments')
WHERE NOT EXISTS (SELECT 1 FROM permissions WHERE name = 'payments:payment:update');

INSERT INTO permissions (id, name, description, category_id)
SELECT gen_random_uuid(), 'payments:payment:delete',  'Delete payment',  (SELECT id FROM permission_categories WHERE name = 'Payments')
WHERE NOT EXISTS (SELECT 1 FROM permissions WHERE name = 'payments:payment:delete');

-- Bulk operations
INSERT INTO permissions (id, name, description, category_id)
SELECT gen_random_uuid(), 'bulk:rent-collection:execute',  'Execute bulk rent collection',  (SELECT id FROM permission_categories WHERE name = 'Bulk Operations')
WHERE NOT EXISTS (SELECT 1 FROM permissions WHERE name = 'bulk:rent-collection:execute');

INSERT INTO permissions (id, name, description, category_id)
SELECT gen_random_uuid(), 'bulk:payments:execute',  'Execute bulk payments',  (SELECT id FROM permission_categories WHERE name = 'Bulk Operations')
WHERE NOT EXISTS (SELECT 1 FROM permissions WHERE name = 'bulk:payments:execute');

INSERT INTO permissions (id, name, description, category_id)
SELECT gen_random_uuid(), 'bulk:receipts:execute',  'Execute bulk receipts generation',  (SELECT id FROM permission_categories WHERE name = 'Bulk Operations')
WHERE NOT EXISTS (SELECT 1 FROM permissions WHERE name = 'bulk:receipts:execute');

INSERT INTO permissions (id, name, description, category_id)
SELECT gen_random_uuid(), 'bulk:communication:execute',  'Execute bulk communication',  (SELECT id FROM permission_categories WHERE name = 'Bulk Operations')
WHERE NOT EXISTS (SELECT 1 FROM permissions WHERE name = 'bulk:communication:execute');

INSERT INTO permissions (id, name, description, category_id)
SELECT gen_random_uuid(), 'bulk:export:execute',  'Execute bulk export',  (SELECT id FROM permission_categories WHERE name = 'Bulk Operations')
WHERE NOT EXISTS (SELECT 1 FROM permissions WHERE name = 'bulk:export:execute');

INSERT INTO permissions (id, name, description, category_id)
SELECT gen_random_uuid(), 'bulk:validate-receipts:view',  'Validate receipts storage',  (SELECT id FROM permission_categories WHERE name = 'Bulk Operations')
WHERE NOT EXISTS (SELECT 1 FROM permissions WHERE name = 'bulk:validate-receipts:view');

-- Generic bulk operations permission (guards the dashboard)
INSERT INTO permissions (id, name, description, category_id)
SELECT gen_random_uuid(), 'bulk:operations:execute', 'Execute bulk operations (dashboard access)', (SELECT id FROM permission_categories WHERE name = 'Bulk Operations')
WHERE NOT EXISTS (SELECT 1 FROM permissions WHERE name = 'bulk:operations:execute');

-- 3) Create manager/operator roles if roles table exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'roles' AND relkind = 'r') THEN
    INSERT INTO roles (id, name, description)
    SELECT gen_random_uuid(), 'ExpenseManager', 'Manage expenses'
    WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = 'ExpenseManager');

    INSERT INTO roles (id, name, description)
    SELECT gen_random_uuid(), 'PaymentManager', 'Manage payments'
    WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = 'PaymentManager');

    INSERT INTO roles (id, name, description)
    SELECT gen_random_uuid(), 'BulkOperator', 'Perform bulk operations'
    WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = 'BulkOperator');
  END IF;
END$$;

-- 4) Grant manager roles the respective permissions (idempotent)
-- ExpenseManager: view, create, update, delete
INSERT INTO role_permissions (role_id, permission_id, allowed)
SELECT r.id, p.id, TRUE
FROM roles r
JOIN permissions p ON p.name IN ('expenses:expense:view','expenses:expense:create','expenses:expense:update','expenses:expense:delete')
WHERE r.name = 'ExpenseManager'
  AND NOT EXISTS (SELECT 1 FROM role_permissions rp WHERE rp.role_id = r.id AND rp.permission_id = p.id);

-- PaymentManager: view, create, update, delete
INSERT INTO role_permissions (role_id, permission_id, allowed)
SELECT r.id, p.id, TRUE
FROM roles r
JOIN permissions p ON p.name IN ('payments:payment:view','payments:payment:create','payments:payment:update','payments:payment:delete')
WHERE r.name = 'PaymentManager'
  AND NOT EXISTS (SELECT 1 FROM role_permissions rp WHERE rp.role_id = r.id AND rp.permission_id = p.id);

-- BulkOperator: grant execute permissions for bulk operations
INSERT INTO role_permissions (role_id, permission_id, allowed)
SELECT r.id, p.id, TRUE
FROM roles r
JOIN permissions p ON p.name IN ('bulk:rent-collection:execute','bulk:payments:execute','bulk:receipts:execute','bulk:communication:execute','bulk:export:execute','bulk:validate-receipts:view','bulk:operations:execute')
WHERE r.name = 'BulkOperator'
  AND NOT EXISTS (SELECT 1 FROM role_permissions rp WHERE rp.role_id = r.id AND rp.permission_id = p.id);

-- Optionally grant Admin role all new permissions (if Admin exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM roles WHERE name = 'Admin') THEN
    INSERT INTO role_permissions (role_id, permission_id, allowed)
    SELECT a.id, p.id, TRUE
    FROM roles a
    JOIN permissions p ON p.name LIKE 'expenses:%' OR p.name LIKE 'payments:%' OR p.name LIKE 'bulk:%'
    WHERE a.name = 'Admin'
      AND NOT EXISTS (SELECT 1 FROM role_permissions rp WHERE rp.role_id = a.id AND rp.permission_id = p.id);
  END IF;
END$$;

-- 5) Verification (simple checks)
SELECT 'permissions_added' AS key, count(*) FROM permissions WHERE name LIKE 'expenses:%' OR name LIKE 'payments:%' OR name LIKE 'bulk:%';

SELECT p.name, pc.name AS category
FROM permissions p
LEFT JOIN permission_categories pc ON p.category_id = pc.id
WHERE p.name LIKE 'expenses:%' OR p.name LIKE 'payments:%' OR p.name LIKE 'bulk:%'
ORDER BY p.name;

COMMIT;

-- End of seed file
