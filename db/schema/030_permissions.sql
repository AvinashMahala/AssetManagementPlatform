-- 030_permissions.sql
-- Tables for permissions and categories (RBAC)

CREATE TABLE IF NOT EXISTS permission_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name varchar(200) NOT NULL,
  description varchar(1000)
);

CREATE TABLE IF NOT EXISTS permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name varchar(255) NOT NULL UNIQUE,
  description varchar(1024),
  category_id uuid REFERENCES permission_categories(id)
);

CREATE TABLE IF NOT EXISTS role_permissions (
  role_id uuid NOT NULL,
  permission_id uuid NOT NULL,
  allowed boolean NOT NULL DEFAULT TRUE,
  PRIMARY KEY (role_id, permission_id),
  FOREIGN KEY (permission_id) REFERENCES permissions(id)
  -- note: role_id references roles(id) if roles table exists in your schema
);

CREATE INDEX IF NOT EXISTS idx_permissions_name ON permissions (name);
CREATE INDEX IF NOT EXISTS idx_permission_categories_name ON permission_categories (name);





-- Idempotent ALTER script for existing permissions + role_permissions
-- Run on Postgres (psql). Back up DB first.

-- Ensure permission_categories exists (no-op if present)
CREATE TABLE IF NOT EXISTS permission_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name varchar(200) NOT NULL,
  description varchar(1000)
);

CREATE INDEX IF NOT EXISTS idx_permission_categories_name ON permission_categories (name);

-- ---- permissions table ----
-- Add missing columns (no-ops if columns exist)
ALTER TABLE permissions ADD COLUMN IF NOT EXISTS id uuid;
ALTER TABLE permissions ADD COLUMN IF NOT EXISTS name varchar(255);
ALTER TABLE permissions ADD COLUMN IF NOT EXISTS description varchar(1024);
ALTER TABLE permissions ADD COLUMN IF NOT EXISTS category_id uuid;

-- Populate missing id values (safe for existing rows)
UPDATE permissions SET id = gen_random_uuid() WHERE id IS NULL;

-- Ensure id has a default for new rows
ALTER TABLE permissions ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Make sure every permission has a name; generate unique placeholder names where missing
UPDATE permissions
SET name = 'perm-' || substr(gen_random_uuid()::text, 1, 8)
WHERE name IS NULL OR trim(name) = '';

-- Ensure name fits expected length
ALTER TABLE permissions ALTER COLUMN name TYPE varchar(255);

-- Enforce NOT NULL on name (only after populating)
ALTER TABLE permissions ALTER COLUMN name SET NOT NULL;

-- Unique index on name
CREATE UNIQUE INDEX IF NOT EXISTS idx_permissions_name ON permissions (name);

-- Create description column index/other adjustments (if needed)
-- (description kept as optional text/varchar)

-- Add or ensure foreign key from permissions.category_id -> permission_categories.id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema
    WHERE tc.constraint_type = 'FOREIGN KEY'
      AND tc.table_name = 'permissions'
      AND kcu.column_name = 'category_id'
  ) THEN
    -- Only add the fk if the column exists (it should from above)
    BEGIN
      ALTER TABLE permissions
        ADD CONSTRAINT permissions_category_id_fkey FOREIGN KEY (category_id) REFERENCES permission_categories(id);
    EXCEPTION WHEN others THEN
      -- swallow (possible if FK already exists under different name)
      RAISE NOTICE 'Could not add FK permissions_category_id_fkey (may already exist or naming differs)';
    END;
  END IF;
END$$;

-- ---- role_permissions table ----
-- Add missing columns (no-ops if exist)
ALTER TABLE role_permissions ADD COLUMN IF NOT EXISTS role_id uuid;
ALTER TABLE role_permissions ADD COLUMN IF NOT EXISTS permission_id uuid;
ALTER TABLE role_permissions ADD COLUMN IF NOT EXISTS allowed boolean DEFAULT TRUE;

-- Populate NULLs for the allowed flag
UPDATE role_permissions SET allowed = TRUE WHERE allowed IS NULL;

-- Add composite primary key on (role_id, permission_id) if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'role_permissions'::regclass AND contype = 'p'
  ) THEN
    ALTER TABLE role_permissions ADD CONSTRAINT role_permissions_pkey PRIMARY KEY (role_id, permission_id);
  END IF;
END$$;

-- Add foreign key: permission_id -> permissions(id)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema
    WHERE tc.constraint_type = 'FOREIGN KEY'
      AND tc.table_name = 'role_permissions'
      AND kcu.column_name = 'permission_id'
  ) THEN
    BEGIN
      ALTER TABLE role_permissions
        ADD CONSTRAINT role_permissions_permission_id_fkey FOREIGN KEY (permission_id) REFERENCES permissions(id);
    EXCEPTION WHEN others THEN
      RAISE NOTICE 'Could not add FK role_permissions_permission_id_fkey (may already exist or naming differs)';
    END;
  END IF;
END$$;

-- Optionally add FK for role_id -> roles(id) if roles table exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'roles' AND relkind = 'r') THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_name = 'role_permissions'
        AND kcu.column_name = 'role_id'
    ) THEN
      BEGIN
        ALTER TABLE role_permissions ADD CONSTRAINT role_permissions_role_id_fkey FOREIGN KEY (role_id) REFERENCES roles(id);
      EXCEPTION WHEN others THEN
        RAISE NOTICE 'Could not add FK role_permissions_role_id_fkey (may already exist or naming differs)';
      END;
    END IF;
  END IF;
END$$;

-- Helpful index for lookups
CREATE INDEX IF NOT EXISTS idx_role_permissions_permission_id ON role_permissions (permission_id);

-- Final sanity checks
SELECT
  (SELECT count(*) FROM permissions) AS permissions_count,
  (SELECT count(*) FROM role_permissions) AS role_permissions_count;