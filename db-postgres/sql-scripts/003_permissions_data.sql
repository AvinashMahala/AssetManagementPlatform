-- 1) Create categories if missing
INSERT INTO permission_categories (id, name, description)
SELECT gen_random_uuid(), 'Units', 'Permissions related to units'
WHERE NOT EXISTS (SELECT 1 FROM permission_categories WHERE name = 'Units');

INSERT INTO permission_categories (id, name, description)
SELECT gen_random_uuid(), 'Meters', 'Permissions related to meters'
WHERE NOT EXISTS (SELECT 1 FROM permission_categories WHERE name = 'Meters');

-- 2) Insert permissions (idempotent)
INSERT INTO permissions (id, name, description, category_id)
SELECT gen_random_uuid(), 'units:unit:view',  'View units',  (SELECT id FROM permission_categories WHERE name = 'Units')
WHERE NOT EXISTS (SELECT 1 FROM permissions WHERE name = 'units:unit:view');

INSERT INTO permissions (id, name, description, category_id)
SELECT gen_random_uuid(), 'units:unit:create',  'Create unit',  (SELECT id FROM permission_categories WHERE name = 'Units')
WHERE NOT EXISTS (SELECT 1 FROM permissions WHERE name = 'units:unit:create');

INSERT INTO permissions (id, name, description, category_id)
SELECT gen_random_uuid(), 'units:unit:update',  'Update unit',  (SELECT id FROM permission_categories WHERE name = 'Units')
WHERE NOT EXISTS (SELECT 1 FROM permissions WHERE name = 'units:unit:update');

INSERT INTO permissions (id, name, description, category_id)
SELECT gen_random_uuid(), 'units:unit:delete',  'Delete unit',  (SELECT id FROM permission_categories WHERE name = 'Units')
WHERE NOT EXISTS (SELECT 1 FROM permissions WHERE name = 'units:unit:delete');

INSERT INTO permissions (id, name, description, category_id)
SELECT gen_random_uuid(), 'meters:meter:view',  'View meters',  (SELECT id FROM permission_categories WHERE name = 'Meters')
WHERE NOT EXISTS (SELECT 1 FROM permissions WHERE name = 'meters:meter:view');

INSERT INTO permissions (id, name, description, category_id)
SELECT gen_random_uuid(), 'meters:meter:create',  'Create meter',  (SELECT id FROM permission_categories WHERE name = 'Meters')
WHERE NOT EXISTS (SELECT 1 FROM permissions WHERE name = 'meters:meter:create');

INSERT INTO permissions (id, name, description, category_id)
SELECT gen_random_uuid(), 'meters:meter:update',  'Update meter',  (SELECT id FROM permission_categories WHERE name = 'Meters')
WHERE NOT EXISTS (SELECT 1 FROM permissions WHERE name = 'meters:meter:update');

INSERT INTO permissions (id, name, description, category_id)
SELECT gen_random_uuid(), 'meters:meter:delete',  'Delete meter',  (SELECT id FROM permission_categories WHERE name = 'Meters')
WHERE NOT EXISTS (SELECT 1 FROM permissions WHERE name = 'meters:meter:delete');

-- 3) Create manager roles if roles table exists and missing (idempotent)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'roles' AND relkind = 'r') THEN
    INSERT INTO roles (id, name, description, is_system)
    SELECT gen_random_uuid(), 'UnitManager', 'Manage units', false
    WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = 'UnitManager');

    INSERT INTO roles (id, name, description, is_system)
    SELECT gen_random_uuid(), 'MeterManager', 'Manage meters', false
    WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = 'MeterManager');
  END IF;
END$$;

-- 4) Grant manager roles the respective permissions (idempotent)
-- UnitManager grants
INSERT INTO role_permissions (role_id, permission_id, allowed)
SELECT r.id, p.id, TRUE
FROM roles r
JOIN permissions p ON p.name IN ('units:unit:view','units:unit:create','units:unit:update')
WHERE r.name = 'UnitManager'
  AND NOT EXISTS (SELECT 1 FROM role_permissions rp WHERE rp.role_id = r.id AND rp.permission_id = p.id);

-- MeterManager grants
INSERT INTO role_permissions (role_id, permission_id, allowed)
SELECT r.id, p.id, TRUE
FROM roles r
JOIN permissions p ON p.name IN ('meters:meter:view','meters:meter:create','meters:meter:update')
WHERE r.name = 'MeterManager'
  AND NOT EXISTS (SELECT 1 FROM role_permissions rp WHERE rp.role_id = r.id AND rp.permission_id = p.id);

-- 5) Quick verification counts
SELECT 'permissions' AS what, count(*) FROM permissions WHERE name LIKE 'units:%' OR name LIKE 'meters:%';
SELECT p.name, pc.name AS category
FROM permissions p
LEFT JOIN permission_categories pc ON p.category_id = pc.id
WHERE p.name LIKE 'units:%' OR p.name LIKE 'meters:%';