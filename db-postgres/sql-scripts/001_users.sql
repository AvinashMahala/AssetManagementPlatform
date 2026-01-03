-- Improved users queries and helpers
-- Goals:
-- 1) Provide a safe, public-facing view that excludes secrets
-- 2) Provide an admin-facing view for audit / admin UIs (still excludes raw passwords)
-- 3) Provide reusable helper queries and pagination examples
-- 4) Document recommended indexes and masking examples

-- ============================================================
-- Public view: SAFE FOR UNPRIVILEGED CONSUMERS (no secrets/tokens)
-- ============================================================
CREATE OR REPLACE VIEW public.users_public AS
SELECT
    id,
    username,
    email,
    "name"         AS full_name,
    profile_picture,
    is_email_verified,
    is_phone_verified,
    last_login,
    created_at,
    updated_at
FROM public.users;

-- ============================================================
-- Admin view: for use in admin dashboards / support tools
-- Note: still exclude raw password and sensitive tokens unless absolutely required
-- ============================================================
CREATE OR REPLACE VIEW public.users_admin AS
SELECT
    id,
    username,
    email,
    phone,
    "role",
    google_id,
    "name",
    profile_picture,
    is_email_verified,
    email_verification_expires,
    is_phone_verified,
    last_login,
    created_at,
    updated_at,
    refresh_token_expiry
FROM public.users;

-- ============================================================
-- Helper: paginated query using keyset (recommended) and LIMIT/OFFSET example
-- Keyset pagination (faster & more reliable for large tables):
--   Choose a cursor such as `created_at` + `id` to disambiguate identical timestamps
-- Usage example: SELECT * FROM public.users_public WHERE (created_at, id) < ($cursor_created_at, $cursor_id) ORDER BY created_at DESC, id DESC LIMIT 20;
--
-- Simple LIMIT/OFFSET (easy, but may be slower / cause duplicates if rows change):
--   SELECT * FROM public.users_public ORDER BY created_at DESC LIMIT :limit OFFSET :offset;
-- ============================================================

-- Example SQL function returning paginated public users using LIMIT/OFFSET
CREATE OR REPLACE FUNCTION public.get_users_public_page(p_limit integer DEFAULT 50, p_offset integer DEFAULT 0)
RETURNS TABLE(
    id uuid,
    username text,
    email text,
    full_name text,
    profile_picture text,
    is_email_verified boolean,
    is_phone_verified boolean,
    last_login timestamp with time zone,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
) AS $$
    SELECT id, username, email, "name" AS full_name, profile_picture, is_email_verified, is_phone_verified, last_login, created_at, updated_at
    FROM public.users
    ORDER BY created_at DESC, id DESC
    LIMIT p_limit OFFSET p_offset;
$$ LANGUAGE sql STABLE;

-- ============================================================
-- Utility: get user by id (public fields)
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_user_public_by_id(p_id uuid)
RETURNS TABLE(
    id uuid,
    username text,
    email text,
    full_name text,
    profile_picture text,
    is_email_verified boolean,
    is_phone_verified boolean,
    last_login timestamp with time zone,
    created_at timestamp with time zone
) AS $$
    SELECT id, username, email, "name" AS full_name, profile_picture, is_email_verified, is_phone_verified, last_login, created_at
    FROM public.users
    WHERE id = p_id;
$$ LANGUAGE sql STABLE;

-- ============================================================
-- Masking example: mask phone numbers for display
-- ============================================================
-- SELECT id, username, email, regexp_replace(phone, E'(.{2})(.*)(.{2})', '\\1****\\3') AS phone_masked FROM public.users;

-- ============================================================
-- Recommended indexes (execute only if not already present):
-- CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS users_email_lower_idx ON public.users ((lower(email)));
-- CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS users_username_lower_idx ON public.users ((lower(username)));
-- CREATE INDEX CONCURRENTLY IF NOT EXISTS users_created_at_idx ON public.users (created_at DESC);
-- CREATE INDEX CONCURRENTLY IF NOT EXISTS users_last_login_idx ON public.users (last_login DESC);
-- ============================================================

-- Notes / Best practices:
-- * NEVER return raw password hashes or authentication tokens to untrusted consumers.
-- * Use views or functions like the ones above to centralize which fields are considered "public" vs "sensitive".
-- * Use application-layer authorization checks before calling admin-level queries/functions.
-- * Prefer keyset pagination for high-scale datasets.
-- ============================================================
