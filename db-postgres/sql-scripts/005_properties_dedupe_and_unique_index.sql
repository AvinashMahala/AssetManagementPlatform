-- 005_properties_dedupe_and_unique_index.sql
-- 1) Run the following SELECT to find existing potential duplicates that match the
--    normalized key: (owner_id, name, property_type, currency, full address components).
--    Review and choose canonical rows to keep before creating the unique index.

-- NOTE: This query uses simple normalization (trim/collapse spaces, lowercasing).
-- It groups rows that are identical after normalization and returns groups with more than 1 member.

WITH normalized AS (
  SELECT
    id,
    owner_id,
    lower(regexp_replace(coalesce(name,''), '\\s+', ' ', 'g')) AS name_norm,
    lower(coalesce(property_type,'')) AS property_type_norm,
    lower(coalesce(currency,'')) AS currency_norm,
    lower(regexp_replace(coalesce(address_street,''), '\\s+', ' ', 'g')) AS street_norm,
    lower(regexp_replace(coalesce(address_city,''), '\\s+', ' ', 'g')) AS city_norm,
    lower(regexp_replace(coalesce(address_state,''), '\\s+', ' ', 'g')) AS state_norm,
    coalesce(address_pincode,'') AS pincode_norm,
    lower(coalesce(address_country,'')) AS country_norm,
    lower(regexp_replace(coalesce(address_landmark,''), '\\s+', ' ', 'g')) AS landmark_norm
  FROM properties
)
SELECT
  name_norm,
  property_type_norm,
  currency_norm,
  street_norm,
  city_norm,
  state_norm,
  pincode_norm,
  country_norm,
  landmark_norm,
  owner_id,
  array_agg(id) AS ids,
  count(*) AS cnt
FROM normalized
GROUP BY 1,2,3,4,5,6,7,8,9,10
HAVING count(*) > 1
ORDER BY cnt DESC;

-- After reviewing and resolving duplicates (merge/delete as appropriate), run the migration
-- to add a unique index. This should be executed CONCURRENTLY on large tables and when
-- duplication has been handled to avoid failing the DDL due to existing duplicates.
--
-- IMPORTANT: Run the duplicate detection query above and clean duplicates before creating
-- the unique index. Creating the index concurrently avoids locking the table for writes.

-- Create unique index using normalized expressions to enforce the dedupe rule:
-- uniqueness key: (owner_id, normalized name, property_type, currency, normalized address components)

CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS idx_properties_unique_owner_name_type_currency_address ON properties (
  owner_id,
  lower(regexp_replace(coalesce(name,''),'\\s+',' ','g')),
  lower(coalesce(property_type,'')),
  lower(coalesce(currency,'')),
  lower(regexp_replace(coalesce(address_street,''),'\\s+',' ','g')),
  lower(regexp_replace(coalesce(address_city,''),'\\s+',' ','g')),
  lower(regexp_replace(coalesce(address_state,''),'\\s+',' ','g')),
  coalesce(address_pincode,''),
  lower(coalesce(address_country,'')),
  lower(regexp_replace(coalesce(address_landmark,''),'\\s+',' ','g'))
);

-- Optionally: create a helper function to normalize strings used in application code and tests.
-- But keeping the SQL expression inline keeps the contract clear and avoids dependence on
-- DB-side functions.