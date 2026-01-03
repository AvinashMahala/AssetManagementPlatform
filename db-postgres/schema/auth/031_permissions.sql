-- MOVED: original file: ../031_permissions.sql
-- Location: schema/auth/031_permissions.sql

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

-- Additional idempotent migration steps included in the original file (not repeated here)