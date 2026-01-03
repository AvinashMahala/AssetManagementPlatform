-- MOVED: original file: ../034_roles.sql
-- Location: schema/auth/034_roles.sql

-- Add roles table used by RBAC system

CREATE TABLE IF NOT EXISTS roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name varchar(255) NOT NULL UNIQUE,
  description text,
  is_system boolean NOT NULL DEFAULT FALSE,
  tenant_id uuid REFERENCES tenants(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_roles_name ON roles (name);

COMMENT ON TABLE roles IS 'Stores roles used for RBAC';
COMMENT ON COLUMN roles.is_system IS 'True for built-in system roles that should not be removed';