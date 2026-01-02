-- Find potential duplicate units by normalized key: property_id, normalized(unit_number), floor, normalized(unit_type), normalized(name)
-- Run the SELECT first and cleanup duplicates before creating the unique index.

SELECT property_id,
       lower(trim(unit_number)) AS unit_number_norm,
       floor,
       lower(coalesce(unit_type, '')) AS unit_type_norm,
       lower(trim(coalesce(name, ''))) AS name_norm,
       count(*) as cnt,
       array_agg(id) as ids
FROM units
GROUP BY property_id, lower(trim(unit_number)), floor, lower(coalesce(unit_type, '')), lower(trim(coalesce(name, '')))
HAVING count(*) > 1
ORDER BY cnt DESC;

-- Once duplicates are resolved, create a unique index to enforce uniqueness at DB level.
-- Note: Ensure duplicates cleaned up before running; this uses CONCURRENTLY to avoid locking.

-- CREATE UNIQUE INDEX CONCURRENTLY idx_units_unique_normalized_key ON units (
--   (property_id),
--   (lower(trim(unit_number))),
--   (floor),
--   (lower(coalesce(unit_type, ''))),
--   (lower(trim(coalesce(name, ''))))
-- );
