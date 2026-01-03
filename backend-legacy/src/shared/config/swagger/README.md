# Swagger docs (OpenAPI)

This folder contains OpenAPI/JSDoc fragments used by `swagger-jsdoc` to generate
`public/openapi.json`.

Guidelines
 - Prefer one file per operation (path + verb) under `paths/` (example: `index.post.ts`, `id.get.ts`, `files.fileId.download.get.ts`).
 - Keep operations unique (do not declare the same path+method twice). Duplicate definitions will break generation.
 - Use `components/schemas.ts` and central `tags.ts` for shared schemas and tag definitions.

How to add an endpoint
 1. Add the controller and route as usual (under `src/features/...`).
 2. Add an `@openapi` JSDoc fragment under this folder using the file-per-op convention.
 3. Regenerate the spec: `npm --prefix backend run generate-swagger` or run `npm --prefix backend run dev:with-swagger` in dev.
 4. Validate: `npm --prefix backend run validate-swagger`.
 5. (Optional) Ensure documentation counts match controllers: `npm --prefix backend run validate-endpoints`.

CI / Build Integration
 - Add `npm --prefix backend run check-docs` to CI pipeline. This runs generation, validates the OpenAPI JSON, and runs the endpoints validation script which checks for a mismatch between detected router operations and the documented operations.

Notes
 - The endpoint validator is a heuristic that counts `router.get/post/put/patch/delete` occurrences across `src/features/**/api/**` files and compares to the sum of operations in the generated OpenAPI spec. It is intended to catch regressions when controllers change but docs are not updated. If your routes are constructed dynamically, supplement the script with additional checks.

Commands & CI
 - **Generate spec**: `npm --prefix backend run generate-swagger` — Generates `public/openapi.json` from the JSDoc fragments in this folder.
 - **Validate spec**: `npm --prefix backend run validate-swagger` — Validates `public/openapi.json` using `@apidevtools/swagger-cli`.
 - **Watch & regen**: `npm --prefix backend run generate-swagger:watch` — Watches `src/shared/config/swagger/apis/**/*.ts` and regenerates the JSON on change.
 - **Dev helper**: `npm --prefix backend run dev:with-swagger` — Runs dev server and the watcher concurrently so the Swagger UI reflects edits without restarting the server.
 - **Docs vs code check**: `npm --prefix backend run validate-endpoints` — Heuristic check that compares documented operations in `public/openapi.json` with detected router operations in `src/features/**/api/**` files. Useful to detect when controllers are changed but docs are not.
 - **CI-ready check**: `npm --prefix backend run check-docs` — Runs generate + validate + endpoint check. Add this to CI to enforce doc consistency.

CI recommendation
 - Add `npm --prefix backend run check-docs` as a pipeline step (e.g., GitHub Actions). If this fails, the change likely added/removed routes without updating docs — fix by adding or updating the appropriate `@openapi` fragment files.

Troubleshooting
 - Duplicate path+method definitions across files will break generation. If generation fails with YAML/key errors, search for the duplicated path/verb (swagger-jsdoc error message will usually include the source file).
 - If `validate-endpoints` flags a mismatch and you have dynamic route registration, either update the script to account for your pattern or add an explicit check in CI that inspects runtime router stacks.
