-- 20251231_002_add_tenants_leases_permissions.sql
-- Idempotent seed: add Tenants and Leases permission categories, permissions,
-- create TenantManager/LeaseManager roles (if roles table exists), and grant perms.
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
SELECT gen_random_uuid(), 'Tenants', 'Permissions related to tenants'
WHERE NOT EXISTS (SELECT 1 FROM permission_categories WHERE name = 'Tenants');

INSERT INTO permission_categories (id, name, description)
SELECT gen_random_uuid(), 'Leases', 'Permissions related to leases'
WHERE NOT EXISTS (SELECT 1 FROM permission_categories WHERE name = 'Leases');

-- 2) Permissions (idempotent)
INSERT INTO permissions (id, name, description, category_id)
SELECT gen_random_uuid(), 'tenants:tenant:view',  'View tenants',  (SELECT id FROM permission_categories WHERE name = 'Tenants')
WHERE NOT EXISTS (SELECT 1 FROM permissions WHERE name = 'tenants:tenant:view');

INSERT INTO permissions (id, name, description, category_id)
SELECT gen_random_uuid(), 'tenants:tenant:create',  'Create tenant',  (SELECT id FROM permission_categories WHERE name = 'Tenants')
WHERE NOT EXISTS (SELECT 1 FROM permissions WHERE name = 'tenants:tenant:create');

INSERT INTO permissions (id, name, description, category_id)
SELECT gen_random_uuid(), 'tenants:tenant:update',  'Update tenant',  (SELECT id FROM permission_categories WHERE name = 'Tenants')
WHERE NOT EXISTS (SELECT 1 FROM permissions WHERE name = 'tenants:tenant:update');

INSERT INTO permissions (id, name, description, category_id)
SELECT gen_random_uuid(), 'tenants:tenant:delete',  'Delete tenant',  (SELECT id FROM permission_categories WHERE name = 'Tenants')
WHERE NOT EXISTS (SELECT 1 FROM permissions WHERE name = 'tenants:tenant:delete');

INSERT INTO permissions (id, name, description, category_id)
SELECT gen_random_uuid(), 'leases:lease:view',  'View leases',  (SELECT id FROM permission_categories WHERE name = 'Leases')
WHERE NOT EXISTS (SELECT 1 FROM permissions WHERE name = 'leases:lease:view');

INSERT INTO permissions (id, name, description, category_id)
SELECT gen_random_uuid(), 'leases:lease:create',  'Create lease',  (SELECT id FROM permission_categories WHERE name = 'Leases')
WHERE NOT EXISTS (SELECT 1 FROM permissions WHERE name = 'leases:lease:create');

INSERT INTO permissions (id, name, description, category_id)
SELECT gen_random_uuid(), 'leases:lease:update',  'Update lease',  (SELECT id FROM permission_categories WHERE name = 'Leases')
WHERE NOT EXISTS (SELECT 1 FROM permissions WHERE name = 'leases:lease:update');

INSERT INTO permissions (id, name, description, category_id)
SELECT gen_random_uuid(), 'leases:lease:delete',  'Delete lease',  (SELECT id FROM permission_categories WHERE name = 'Leases')
WHERE NOT EXISTS (SELECT 1 FROM permissions WHERE name = 'leases:lease:delete');

-- 3) Create manager roles if roles table exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'roles' AND relkind = 'r') THEN
    INSERT INTO roles (id, name, description)
    SELECT gen_random_uuid(), 'TenantManager', 'Manage tenants'
    WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = 'TenantManager');

    INSERT INTO roles (id, name, description)
    SELECT gen_random_uuid(), 'LeaseManager', 'Manage leases'
    WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = 'LeaseManager');
  END IF;
END$$;

-- 4) Grant manager roles the respective permissions (idempotent)
-- TenantManager: view, create, update, delete
INSERT INTO role_permissions (role_id, permission_id, allowed)
SELECT r.id, p.id, TRUE
FROM roles r
JOIN permissions p ON p.name IN ('tenants:tenant:view','tenants:tenant:create','tenants:tenant:update','tenants:tenant:delete')
WHERE r.name = 'TenantManager'
  AND NOT EXISTS (SELECT 1 FROM role_permissions rp WHERE rp.role_id = r.id AND rp.permission_id = p.id);

-- LeaseManager: view, create, update
INSERT INTO role_permissions (role_id, permission_id, allowed)
SELECT r.id, p.id, TRUE
FROM roles r
JOIN permissions p ON p.name IN ('leases:lease:view','leases:lease:create','leases:lease:update')
WHERE r.name = 'LeaseManager'
  AND NOT EXISTS (SELECT 1 FROM role_permissions rp WHERE rp.role_id = r.id AND rp.permission_id = p.id);

-- Optionally grant Admin role all new permissions (if Admin exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM roles WHERE name = 'Admin') THEN
    INSERT INTO role_permissions (role_id, permission_id, allowed)
    SELECT a.id, p.id, TRUE
    FROM roles a
    JOIN permissions p ON p.name LIKE 'tenants:%' OR p.name LIKE 'leases:%'
    WHERE a.name = 'Admin'
      AND NOT EXISTS (SELECT 1 FROM role_permissions rp WHERE rp.role_id = a.id AND rp.permission_id = p.id);
  END IF;
END$$;

-- 5) Verification (simple checks)
SELECT 'permissions_added' AS key, count(*) FROM permissions WHERE name LIKE 'tenants:%' OR name LIKE 'leases:%';

SELECT p.name, pc.name AS category
FROM permissions p
LEFT JOIN permission_categories pc ON p.category_id = pc.id
WHERE p.name LIKE 'tenants:%' OR p.name LIKE 'leases:%'
ORDER BY p.name;

COMMIT;

-- End of seed file
