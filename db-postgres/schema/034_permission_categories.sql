-- Idempotent script to ensure permission_categories exist (safe to run multiple times)
-- Creates the table and index if they don't already exist.

CREATE TABLE IF NOT EXISTS public.permission_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name varchar(200) NOT NULL,
  description varchar(1000)
);

CREATE INDEX IF NOT EXISTS idx_permission_categories_name ON public.permission_categories (name);
