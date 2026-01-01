-- 20251231_004_add_dashboard_files_templates_admin_permissions.sql
-- Idempotent seed: add Dashboard, Files, Templates and Admin permission categories and permissions;
-- create manager/viewer roles (if roles table exists) and grant permissions.
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
SELECT gen_random_uuid(), 'Dashboard', 'Permissions related to the main dashboards and widgets'
WHERE NOT EXISTS (SELECT 1 FROM permission_categories WHERE name = 'Dashboard');

INSERT INTO permission_categories (id, name, description)
SELECT gen_random_uuid(), 'Files', 'Permissions for file upload, download, metadata and deletion'
WHERE NOT EXISTS (SELECT 1 FROM permission_categories WHERE name = 'Files');

INSERT INTO permission_categories (id, name, description)
SELECT gen_random_uuid(), 'Templates', 'Permissions for receipt and document templates (create/update/import/export)'
WHERE NOT EXISTS (SELECT 1 FROM permission_categories WHERE name = 'Templates');

INSERT INTO permission_categories (id, name, description)
SELECT gen_random_uuid(), 'Admin', 'Administrative permissions (roles, users, and exports)'
WHERE NOT EXISTS (SELECT 1 FROM permission_categories WHERE name = 'Admin');

-- 2) Permissions (idempotent)
-- Dashboard
INSERT INTO permissions (id, name, description, category_id)
SELECT gen_random_uuid(), 'dashboard:dashboard:view', 'View dashboards and widgets', (SELECT id FROM permission_categories WHERE name = 'Dashboard')
WHERE NOT EXISTS (SELECT 1 FROM permissions WHERE name = 'dashboard:dashboard:view');

-- Files
INSERT INTO permissions (id, name, description, category_id)
SELECT gen_random_uuid(), 'files:file:view', 'View files and metadata', (SELECT id FROM permission_categories WHERE name = 'Files')
WHERE NOT EXISTS (SELECT 1 FROM permissions WHERE name = 'files:file:view');

INSERT INTO permissions (id, name, description, category_id)
SELECT gen_random_uuid(), 'files:file:upload', 'Upload files', (SELECT id FROM permission_categories WHERE name = 'Files')
WHERE NOT EXISTS (SELECT 1 FROM permissions WHERE name = 'files:file:upload');

INSERT INTO permissions (id, name, description, category_id)
SELECT gen_random_uuid(), 'files:file:download', 'Download files', (SELECT id FROM permission_categories WHERE name = 'Files')
WHERE NOT EXISTS (SELECT 1 FROM permissions WHERE name = 'files:file:download');

INSERT INTO permissions (id, name, description, category_id)
SELECT gen_random_uuid(), 'files:file:update', 'Update file metadata', (SELECT id FROM permission_categories WHERE name = 'Files')
WHERE NOT EXISTS (SELECT 1 FROM permissions WHERE name = 'files:file:update');

INSERT INTO permissions (id, name, description, category_id)
SELECT gen_random_uuid(), 'files:file:delete', 'Delete files', (SELECT id FROM permission_categories WHERE name = 'Files')
WHERE NOT EXISTS (SELECT 1 FROM permissions WHERE name = 'files:file:delete');

-- Templates (receipt templates)
INSERT INTO permissions (id, name, description, category_id)
SELECT gen_random_uuid(), 'templates:receipttemplate:view', 'View receipt templates', (SELECT id FROM permission_categories WHERE name = 'Templates')
WHERE NOT EXISTS (SELECT 1 FROM permissions WHERE name = 'templates:receipttemplate:view');

INSERT INTO permissions (id, name, description, category_id)
SELECT gen_random_uuid(), 'templates:receipttemplate:create', 'Create receipt templates', (SELECT id FROM permission_categories WHERE name = 'Templates')
WHERE NOT EXISTS (SELECT 1 FROM permissions WHERE name = 'templates:receipttemplate:create');

INSERT INTO permissions (id, name, description, category_id)
SELECT gen_random_uuid(), 'templates:receipttemplate:update', 'Update receipt templates', (SELECT id FROM permission_categories WHERE name = 'Templates')
WHERE NOT EXISTS (SELECT 1 FROM permissions WHERE name = 'templates:receipttemplate:update');

INSERT INTO permissions (id, name, description, category_id)
SELECT gen_random_uuid(), 'templates:receipttemplate:delete', 'Delete receipt templates', (SELECT id FROM permission_categories WHERE name = 'Templates')
WHERE NOT EXISTS (SELECT 1 FROM permissions WHERE name = 'templates:receipttemplate:delete');

INSERT INTO permissions (id, name, description, category_id)
SELECT gen_random_uuid(), 'templates:receipttemplate:export', 'Export receipt templates', (SELECT id FROM permission_categories WHERE name = 'Templates')
WHERE NOT EXISTS (SELECT 1 FROM permissions WHERE name = 'templates:receipttemplate:export');

INSERT INTO permissions (id, name, description, category_id)
SELECT gen_random_uuid(), 'templates:receipttemplate:import', 'Import receipt templates', (SELECT id FROM permission_categories WHERE name = 'Templates')
WHERE NOT EXISTS (SELECT 1 FROM permissions WHERE name = 'templates:receipttemplate:import');

INSERT INTO permissions (id, name, description, category_id)
SELECT gen_random_uuid(), 'templates:receipttemplate:duplicate', 'Duplicate receipt templates', (SELECT id FROM permission_categories WHERE name = 'Templates')
WHERE NOT EXISTS (SELECT 1 FROM permissions WHERE name = 'templates:receipttemplate:duplicate');

INSERT INTO permissions (id, name, description, category_id)
SELECT gen_random_uuid(), 'templates:receipttemplate:preview', 'Preview receipt templates', (SELECT id FROM permission_categories WHERE name = 'Templates')
WHERE NOT EXISTS (SELECT 1 FROM permissions WHERE name = 'templates:receipttemplate:preview');

-- Admin-related permissions for Roles management
INSERT INTO permissions (id, name, description, category_id)
SELECT gen_random_uuid(), 'admin:roles:view', 'View roles and role details', (SELECT id FROM permission_categories WHERE name = 'Admin')
WHERE NOT EXISTS (SELECT 1 FROM permissions WHERE name = 'admin:roles:view');

INSERT INTO permissions (id, name, description, category_id)
SELECT gen_random_uuid(), 'admin:roles:create', 'Create roles', (SELECT id FROM permission_categories WHERE name = 'Admin')
WHERE NOT EXISTS (SELECT 1 FROM permissions WHERE name = 'admin:roles:create');

INSERT INTO permissions (id, name, description, category_id)
SELECT gen_random_uuid(), 'admin:roles:update', 'Update roles', (SELECT id FROM permission_categories WHERE name = 'Admin')
WHERE NOT EXISTS (SELECT 1 FROM permissions WHERE name = 'admin:roles:update');

INSERT INTO permissions (id, name, description, category_id)
SELECT gen_random_uuid(), 'admin:roles:delete', 'Delete roles', (SELECT id FROM permission_categories WHERE name = 'Admin')
WHERE NOT EXISTS (SELECT 1 FROM permissions WHERE name = 'admin:roles:delete');

INSERT INTO permissions (id, name, description, category_id)
SELECT gen_random_uuid(), 'admin:roles:set_permissions', 'Set role permissions', (SELECT id FROM permission_categories WHERE name = 'Admin')
WHERE NOT EXISTS (SELECT 1 FROM permissions WHERE name = 'admin:roles:set_permissions');

INSERT INTO permissions (id, name, description, category_id)
SELECT gen_random_uuid(), 'admin:roles:assign_user', 'Assign users to roles', (SELECT id FROM permission_categories WHERE name = 'Admin')
WHERE NOT EXISTS (SELECT 1 FROM permissions WHERE name = 'admin:roles:assign_user');

INSERT INTO permissions (id, name, description, category_id)
SELECT gen_random_uuid(), 'admin:roles:search_users', 'Search users for role assignment', (SELECT id FROM permission_categories WHERE name = 'Admin')
WHERE NOT EXISTS (SELECT 1 FROM permissions WHERE name = 'admin:roles:search_users');

INSERT INTO permissions (id, name, description, category_id)
SELECT gen_random_uuid(), 'admin:roles:export', 'Export roles', (SELECT id FROM permission_categories WHERE name = 'Admin')
WHERE NOT EXISTS (SELECT 1 FROM permissions WHERE name = 'admin:roles:export');

INSERT INTO permissions (id, name, description, category_id)
SELECT gen_random_uuid(), 'admin:roles:remove_user', 'Remove user from role', (SELECT id FROM permission_categories WHERE name = 'Admin')
WHERE NOT EXISTS (SELECT 1 FROM permissions WHERE name = 'admin:roles:remove_user');

-- 3) Create manager roles if roles table exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'roles' AND relkind = 'r') THEN
    INSERT INTO roles (id, name, description)
    SELECT gen_random_uuid(), 'FileManager', 'Manage files (upload, download, metadata, delete)'
    WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = 'FileManager');

    INSERT INTO roles (id, name, description)
    SELECT gen_random_uuid(), 'TemplateManager', 'Manage templates (create, import, export, update)'
    WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = 'TemplateManager');

    INSERT INTO roles (id, name, description)
    SELECT gen_random_uuid(), 'DashboardViewer', 'View dashboards and widgets'
    WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = 'DashboardViewer');
  END IF;
END$$;

-- 4) Grant manager roles the respective permissions (idempotent)
-- FileManager: view, upload, download, update, delete
INSERT INTO role_permissions (role_id, permission_id, allowed)
SELECT r.id, p.id, TRUE
FROM roles r
JOIN permissions p ON p.name IN ('files:file:view','files:file:upload','files:file:download','files:file:update','files:file:delete')
WHERE r.name = 'FileManager'
  AND NOT EXISTS (SELECT 1 FROM role_permissions rp WHERE rp.role_id = r.id AND rp.permission_id = p.id);

-- TemplateManager: view, create, update, delete, import, export, duplicate, preview
INSERT INTO role_permissions (role_id, permission_id, allowed)
SELECT r.id, p.id, TRUE
FROM roles r
JOIN permissions p ON p.name IN ('templates:receipttemplate:view','templates:receipttemplate:create','templates:receipttemplate:update','templates:receipttemplate:delete','templates:receipttemplate:import','templates:receipttemplate:export','templates:receipttemplate:duplicate','templates:receipttemplate:preview')
WHERE r.name = 'TemplateManager'
  AND NOT EXISTS (SELECT 1 FROM role_permissions rp WHERE rp.role_id = r.id AND rp.permission_id = p.id);

-- DashboardViewer: dashboard:view
INSERT INTO role_permissions (role_id, permission_id, allowed)
SELECT r.id, p.id, TRUE
FROM roles r
JOIN permissions p ON p.name = 'dashboard:dashboard:view'
WHERE r.name = 'DashboardViewer'
  AND NOT EXISTS (SELECT 1 FROM role_permissions rp WHERE rp.role_id = r.id AND rp.permission_id = p.id);

-- Optionally grant Admin role all new permissions (if Admin exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM roles WHERE name = 'Admin') THEN
    INSERT INTO role_permissions (role_id, permission_id, allowed)
    SELECT a.id, p.id, TRUE
    FROM roles a
    JOIN permissions p ON p.name LIKE 'dashboard:%' OR p.name LIKE 'files:%' OR p.name LIKE 'templates:%' OR p.name LIKE 'admin:%'
    WHERE a.name = 'Admin'
      AND NOT EXISTS (SELECT 1 FROM role_permissions rp WHERE rp.role_id = a.id AND rp.permission_id = p.id);
  END IF;
END$$;

-- 5) Verification (simple checks)
SELECT 'permissions_added' AS key, count(*) FROM permissions WHERE name LIKE 'dashboard:%' OR name LIKE 'files:%' OR name LIKE 'templates:%' OR name LIKE 'admin:%';

SELECT p.name, pc.name AS category
FROM permissions p
LEFT JOIN permission_categories pc ON p.category_id = pc.id
WHERE p.name LIKE 'dashboard:%' OR p.name LIKE 'files:%' OR p.name LIKE 'templates:%' OR p.name LIKE 'admin:%'
ORDER BY p.name;

COMMIT;

-- End of seed file