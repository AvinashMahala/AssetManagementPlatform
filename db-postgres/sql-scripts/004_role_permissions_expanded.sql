-- v_role_permissions_expanded.sql
-- Purpose: Provide a comprehensive, developer-friendly view of roles and their permissions.
-- Improvements: snake_case column names, include id columns, use LEFT JOINs to show roles without permissions,
-- and add a companion aggregated view for quick UI lookups. Optional materialized view is included commented below.

create or replace view v_role_permissions_expanded as
select 
    r."name" "Role_Name",
    r."description" "Role_Description",
    pc."name" "Permission_Category",
    pc."description" "Permission_Category_Description",
    p."name" "Permission_Name",
    p."description" "Permission_Description"
from roles r 
join role_permissions rp on r.id = rp.role_id
join permissions p on rp.permission_id = p.id
join permission_categories pc on p.category_id = pc.id;

-- Aggregated view: permissions per role as a comma-separated list (useful for UI or reports)
CREATE OR REPLACE VIEW public.v_role_permissions_list AS
SELECT
    r.id                                AS role_id,
    r.name                              AS role_name,
    r.description                       AS role_description,
    COALESCE(string_agg(DISTINCT p.name, ', ' ORDER BY p.name), '') AS permission_names,
    COALESCE(string_agg(DISTINCT pc.name, ', ' ORDER BY pc.name), '') AS permission_category_names,
    COUNT(DISTINCT p.id)                AS permission_count
FROM public.roles r
LEFT JOIN public.role_permissions rp ON r.id = rp.role_id
LEFT JOIN public.permissions p ON p.id = rp.permission_id
LEFT JOIN public.permission_categories pc ON p.category_id = pc.id
GROUP BY r.id, r.name, r.description;

-- Optional: Materialized view for performance (uncomment to create and refresh on a schedule)
-- CREATE MATERIALIZED VIEW public.mv_role_permissions_list AS
-- SELECT
--     r.id                                AS role_id,
--     r.name                              AS role_name,
--     r.description                       AS role_description,
--     COALESCE(string_agg(DISTINCT p.name, ', ' ORDER BY p.name), '') AS permission_names,
--     COALESCE(string_agg(DISTINCT pc.name, ', ' ORDER BY pc.name), '') AS permission_category_names,
--     COUNT(DISTINCT p.id)                AS permission_count
-- FROM public.roles r
-- LEFT JOIN public.role_permissions rp ON r.id = rp.role_id
-- LEFT JOIN public.permissions p ON p.id = rp.permission_id
-- LEFT JOIN public.permission_categories pc ON p.category_id = pc.id
-- GROUP BY r.id, r.name, r.description;
-- To refresh: REFRESH MATERIALIZED VIEW public.mv_role_permissions_list;

-- Notes:
--  - Using LEFT JOINs intentionally includes roles with no assigned permissions.
--  - Use `v_role_permissions_expanded` for row-level details and `v_role_permissions_list` for aggregated displays.
--  - Column names follow lower_snake_case for consistency with the rest of the schema.
