API Docs Blueprint — Folder structure and conventions

Purpose
-------
This blueprint describes the canonical layout, authoring rules, migration steps, and verification checklist to externalize operation-level Swagger docs into `ApiDocs/` so documentation can be adopted consistently across features.

Top-level layout (canonical)
----------------------------
```
ApiDocs/
  ├─ Tags/                    (per-tag long-form docs, one file per tag: `{Tag}.md`)
  ├─ {Controller}/            (feature/area — e.g., `Properties`, `Leases`)
  │   ├─ {EndpointFolder}/    (one folder per endpoint; required naming: `HTTPMETHOD.normalized-route`, e.g., `GET.properties`, `GET.properties.{id}`, `PUT.properties.{id}.template`). Normalization rules: remove `api/` prefix; convert slashes `/` to dots `.`; strip route constraints inside braces (e.g., `{id:guid}` -> `{id}`); collapse duplicate dots.
  │   │   ├─ description.md    (primary human-readable doc; MAY contain YAML front-matter)
  │   │   ├─ request.json      (optional: request body example / content object)
  │   │   ├─ responses/        (one file per numeric HTTP status code; file names MUST be numeric: `200.json`, `404.json`)
  │   │   │   ├─ 200.json
  │   │   │   └─ 404.json
  │   │   └─ examples/         (optional: extra named examples for larger payloads)
  │   └─ README.md            (controller-specific notes)
  └─ README.md                (global rules and migration guidance)
```

Canonical rules
---------------
- Loader behavior: the `ExternalDocsOperationFilter` reads only the canonical endpoint folder layout above. Legacy single-file sidecars are deprecated and are NOT relied upon by the filter.
- Endpoint folder naming: `HTTPMETHOD.normalized-route` (e.g., `POST.properties`, `GET.properties.{id}`, `PUT.properties.{id}.template`). Normalization removes route constraints (e.g., `{id:guid}` -> `{id}`) and replaces slashes with dots. This ensures deterministic, route-centric folder names and disambiguates same path/different-method scenarios.
- Controller folder mapping: Use the controller class name (without the `Controller` suffix) as the top-level `ApiDocs/{Controller}` folder. **Do not** place docs for a distinct controller under another controller's folder even if their routes overlap. Example: `PropertyFilesController` → `ApiDocs/PropertyFiles` (do **not** put property-file endpoints under `ApiDocs/Properties`). This keeps controller ownership explicit and avoids accidental mixing of unrelated controller docs.
- `description.md`:
  - MAY include YAML front-matter block between `---` lines. Supported front-matter keys:
    - `summary` (string)
    - `description` (markdown or multi-line string)
    - `tags` (array of tag names)
    - `responses` (optional object mapping status -> metadata; helpful for short overrides)
    - `examples` (optional map of named example payloads for human reference)
  - After the front-matter body, include a concise **Endpoint:** line for humans, e.g., `**Endpoint:** `GET /api/properties`.
  - Keep the body focused on behavior, validation rules, and usage examples.
- `request.json`:
  - Should contain either a pure example value (the most common case, for `application/json`) or a `requestBody`-like shape with `content` (if you need to supply content-type or multiple examples).
  - Examples:
    - Simple example (preferred): `{ "name": "Example" }`
    - Full content object (when necessary): `{ "content": { "application/json": { "example": { ... } } } }`

Examples behavior (loader)
--------------------------
- Selection of default example:
  - If `content.<media>.examples` is present, the loader will select which named example to display by default using this order: prefer a `default` key; otherwise pick the first example key encountered. If a `example` property exists directly under `content.<media>`, it will be used as the displayed default example.
- What the loader sets:
  - The chosen example is set to `OpenApiMediaType.Example` and also mirrored to `OpenApiMediaType.Schema.Example` to maximize compatibility with Swagger UI.
  - Any existing media `schema` (for example a `$ref`) is preserved when the example is attached so schema references are not lost.
  - The chosen example (and schema.example) is propagated to other JSON-like content types (e.g., `application/json-patch+json`, `text/json`, `application/*+json`) so the UI shows an example regardless of the selected media type.
  - Named examples are preserved as `x-example-{name}` extensions on the media object for backward compatibility and possible custom UI handling.
  - When an example is attached, `operation.RequestBody.Required` is set to `true` to improve UI visibility of the example.

Author guidance:
- To control which example is shown by default, either add a `default` key under `examples` or set `example` directly under `content.<media>`.
- Keep examples representative and small; move very large examples to `examples/` and reference them from the `responses` or `request` files.
- `responses/<status>.json`:
  - MUST be the full response object for that status code as expected by the operation filter.
  - Minimal recommended shape for JSON responses:
    {
      "description": "OK",
      "content": {
        "application/json": {
          "examples": {
            "default": { "value": { ... } }
          }
        }
      }
    }
  - Use numeric file names (no prefix or suffix) so the loader can map status codes directly.
- Tag docs: place long-form tag docs under `ApiDocs/Tags/{Tag}.md`. The `TagDocsDocumentFilter` will attach the tag doc and strip the leading H1/H2 if it matches the tag name to avoid duplicated headers in UI.

Tag doc format (recommended)
----------------------------
Provide a concise, consistent tag doc for each controller under `ApiDocs/Tags/{Tag}.md`. A recommended structure helps reviewers and keeps UI rendering predictable:

- **H1** with the Tag name (e.g., `# PropertyFiles`)
- **Short description** (one paragraph)
- **Controller:** `ControllerName` (e.g., `PropertyFilesController`)
- **Authentication:** short note (e.g., `Bearer token required` or `Public`)
- **Endpoints included:** bullet list of paths and one-line descriptions (e.g., `POST /api/properties/{propertyId}/files` — upload)
- **Notes:** best practices, important caveats, and guidance for authors (e.g., avoid PII in examples, use `multipart/form-data` schema for uploads, move large examples to `examples/`)
- A final `---` separator and a short line encouraging use of Swagger UI examples for testing

Example tag doc content:

```
# PropertyFiles

Property file endpoints for uploading, listing, downloading, and managing property-scoped files.

- **Controller:** `PropertyFilesController`
- **Authentication:** Bearer token required (endpoints are typically protected)
- **Endpoints included:**
  - `POST /api/properties/{propertyId}/files` — upload (multipart/form-data)
  - `GET /api/properties/{propertyId}/files` — list metadata
  - `GET /api/properties/{propertyId}/files/{fileId}/download` — download binary
  - `PUT /api/properties/{propertyId}/files/{fileId}` — update metadata (JSON body with `fileName`)
  - `DELETE /api/properties/{propertyId}/files/{fileId}` — delete file

Notes:
- Uploads use `multipart/form-data` and must include a `file` part. Keep examples small and avoid embedding binary in JSON examples; use a `multipart/form-data` `request.json` with a `binary` schema example instead.
- These docs live under `ApiDocs/PropertyFiles` (controller-based folder). Do not add file-controller docs into `ApiDocs/Properties` — use a dedicated controller folder to avoid confusion.

---

Use the operation examples in Swagger UI to test upload and download flows.
```

Front-matter merging and precedence
-----------------------------------
- The loader will apply front-matter metadata (summary/tags/short `responses`) and then merge/overwrite with any `responses/<status>.json` files found in the endpoint folder. Explicit `responses/<status>.json` files take precedence for that status code.
- Use front-matter `responses` only for brief overrides (e.g., short descriptions); keep large example payloads in `responses/<status>.json`.

Authoring guidelines
--------------------
- Keep `description.md` readable and focused — think of it as the ‘how-to’ for the endpoint.
- Add an explicit **Endpoint:** line to every `description.md` (human readable; useful when editing docs).
- Prefer small, representative examples rather than huge payloads. If an example is large, place under `examples/` and reference it in the responses file (or store as `application/json` example entry).
- For multiple named examples (e.g., success, validationError), place them under `responses/<status>.json` in `content.application/json.examples` with descriptive keys.
- For non-JSON content-types, put fully formed `content` objects in `request.json` or `responses/<status>.json` with the correct content-type keys.
- Avoid storing sensitive or PII data in sample payloads.

New feature authoring (fresh implementation — no migration)
-----------------------------------------------------------
- For new features or endpoints, **do not run the migration script**; create docs as a fresh implementation under `ApiDocs/{Controller}` using the `HTTPMETHOD.normalized-route` folder naming convention (e.g., `POST.properties`, `GET.properties.{id}`).
- Create a folder `ApiDocs/{Controller}/{HTTPMETHOD.normalized-route}` and add `description.md` (with front-matter and a `**Endpoint:**` line), `request.json` (if applicable), `responses/*.json`, and `parameters.json` (or `parameters/*`) following the canonical rules in this blueprint.
- Verify locally (build + `/swagger`) and include the new folder(s) in your PR; do not migrate legacy docs as part of a new feature unless explicitly approved by the team.
- If you are intentionally converting legacy docs for an existing endpoint (not a new feature), use the migration script and follow the migration checklist below.

Migration checklist (for legacy controllers only)
--------------------------------------
1. Inspect existing ApiDocs for the controller and identify legacy sidecars (e.g., `Action.POST.json`, `Action.md` files).
2. Run the migration helper:
   - From project root: `powershell .\scripts\migrate-api-docs-to-folders.ps1 -Controller Properties` (adjust controller name)
   - The script will create endpoint folders, move/rename md files to `description.md`, and split combined JSON into `request.json` and `responses/<status>.json`.
3. Review the created `description.md`, `request.json`, and `responses/*.json` files. Add or edit front-matter as needed.
3.a If the endpoint accepts path/query/header/cookie parameters (especially path `id` params), add `parameters.json` (or a `parameters` folder with `{in}.{name}.json` files) containing per-parameter `example` or `examples` and optional `sets` for named parameter combinations.
4. Remove or consolidate large example payloads into `examples/` if necessary.
5. Verify that each endpoint `description.md` includes an **Endpoint:** line.
6. Commit the migration changes on a branch (keep `.bak` files until verification is complete).
7. Run unit tests (see next section) and then run the API locally to visually verify Swagger UI.
8. After verification, remove `.bak` backups and legacy files, then finalize the commit and open a PR.

Verification steps (manual and automated)
-----------------------------------------
Manual verification:
- Start the API: `dotnet run --project src/MyApp.Api/MyApp.Api.csproj`.
- Open `/swagger` and verify for the controller:
  - `description.md` content appears in the operation (summary/description)
  - `request.json` attaches as `operation.RequestBody` and examples are visible in the UI
  - Parameter examples: `parameters.json` (or `parameters/*`) set per-parameter `example` values in the operation, named parameter examples are present as `x-example-{name}` extensions, and `x-parameter-sets` is present on operations when `sets` are provided.
  - `responses/<status>.json` populate `operation.Responses` and show examples
  - Tag docs render under their tag and do not duplicate the tag header
  - Operations are collapsed by default and Collapse/Expand All buttons are present in the UI (see `wwwroot/swagger-ui/swagger-custom.js`)
- Optionally fetch `/swagger/v1/swagger.json` and inspect the operation entries for expected `requestBody`, `responses`, `examples`.

Automated tests (recommended)
-----------------------------
- Add unit tests for `ExternalDocsOperationFilter` that assert:
  - Front-matter `summary` and `description` are applied to the operation
  - `request.json` adds `operation.RequestBody` with example content
  - `request.json` behavior: when `content.<media>.examples` is present the loader selects the default example (prefers `default` or first key), sets `OpenApiMediaType.Example`, mirrors it to `Schema.Example`, preserves existing media `schema` (e.g., `$ref`), propagates the example to other JSON-like content types, and sets `operation.RequestBody.Required = true` when an example is attached
  - `responses/<status>.json` create `operation.Responses[status]` with examples
  - Named examples in `responses/<status>.json` are converted to `OpenApiExample` entries
  - Backward-compatibility: `x-example-{name}` extensions are preserved on media objects (assert presence if examples provided)
  - Parameter parsing: `parameters.json` and `parameters/*` correctly set `OpenApiParameter.Example`, create missing parameters (with `Required = true` for `path`), preserve named parameter examples as `x-example-{name}` on the parameter, and add `x-parameter-sets` operation extension when `sets` are present.
- Add tests for `TagDocsDocumentFilter` to assert leading H1/H2 lines are stripped when they match the tag name.
- Add an integration test that starts a minimal app with Swagger enabled and asserts `/swagger/v1/swagger.json` contains the expected example fields for a sample endpoint.

Edge cases & notes
------------------
- Same path, different HTTP methods: ensure unique endpoint folder names (Action.HTTPMETHOD) so method-based mapping remains deterministic.
- Non-JSON response content types: include them explicitly inside `responses/<status>.json` with the appropriate `content` key.
- Multiple examples per response: use `content.application/json.examples` with descriptive keys.
- If you want to embed docs as assembly resources for special deployments, add a note in `README.md` and coordinate with `ExternalDocsOperationFilter` to support resource loading (current implementation supports this via optional embedding).
- Do NOT rely on legacy single-file sidecars; they are deprecated and the loader reads canonical folders only.

PR checklist (before merge)
---------------------------
- [ ] For **new features**, docs were added as fresh `ApiDocs/{Controller}/{HTTPMETHOD.normalized-route}` folders (do NOT run the migration script for new features).
- [ ] All migrated files for controller are present under `ApiDocs/{Controller}` with `description.md`, `request.json` (if applicable), `responses/*.json` (as needed)
- [ ] The number of endpoint folders under `ApiDocs/{Controller}` matches the number of public controller actions (remove duplicate or orphaned folders such as legacy `GetById.GET` or extraneous method variants like `UpdateStatus.POST`).
- [ ] `description.md` contains an **Endpoint:** line
- [ ] If migration was performed, a migration manifest is present and reviewed (see generated `migration-manifest-*.json`).
- [ ] Unit tests added/updated and passing
- [ ] Manual verification of `/swagger` completed and screenshots if needed
- [ ] `.bak` and legacy files removed (or documented if kept temporarily)
- [ ] Update `ApiDocs/README.md` if special cases or exceptions were made

AI Agent Integration — automated authoring guidance
---------------------------------------------------
Purpose
- Provide a clear, machine-actionable procedure so an AI agent can create or update `ApiDocs/{Controller}` for a given controller using this blueprint as the source of truth.

Inputs the agent will be provided
- Controller file path (e.g., `src/MyApp.Api/Controllers/PropertiesController.cs`) and the controller source text.
- The path to this blueprint (`ApiDocs/BLUEPRINT.md`).
- Optional: the existing `ApiDocs/{Controller}` folder path and a mode flag (`create` | `update` | `migrate`). Default mode for new work should be `create` or `update`; `migrate` must only be performed after explicit user confirmation.

Agent procedure (high-level)
1. Parse controller
   - Extract class-level route template, public action methods, HTTP method attributes (HttpGet/HttpPost/etc.), action-level route templates, parameter lists (path/query/body), and likely response semantics (from method names, attributes, or return types where possible).
2. Compute canonical mapping
   - For each action compute `HTTPMETHOD.normalized-route` using the normalization rules in this blueprint (remove `api/` prefix, replace `/` with `.`, strip route constraints `{id:guid}` -> `{id}`, collapse duplicate dots).
   - Detect collisions and ambiguous routes; report them instead of guessing.
3. Plan changes (dry-run)
   - Decide for each action: create new folder (`create`), update existing canonical folder (`update`), or include in migration plan (`migrate`).
   - Produce a dry-run mapping table and present it to the user for review before making changes.
4. Generate content
   - `description.md`: create front-matter (`summary`, `description`, `tags`) and an `**Endpoint:**` line. Include human-friendly usage notes derived from parameter names/types.
   - `request.json`: synthesize a minimal representative example for body parameters (use safe placeholder values, avoid PII).
   - `responses/<status>.json`: create minimal response objects with examples (e.g., `200.json`, `204.json`) and small `content.application/json.examples.default.value` where appropriate.
   - `parameters.json` (or `parameters/{in}.{name}.json`): provide per-parameter `example` values and optional `sets` for common combinations.
   - `examples/` (optional): store large example payloads only when necessary.
5. Validate (dry-run verification)
   - Ensure `description.md` has `**Endpoint:**`, examples are present and small, and folder counts align with public actions.
   - Optionally run unit tests or static validation (if present) and attempt to start the API (after ensuring no running process holds file locks) to fetch `/swagger/v1/swagger.json` and validate operation entries. Save swagger.json as an artifact for review.
6. Apply changes
   - After user approval, write files and create commits with a clear message, and if migrating write a migration manifest `migration-manifest-*.json`.
7. Report back
   - Provide the proposed mapping, list of created/updated files, diffs (or the commit/PR link), validation results, any assumptions/ambiguities, and the location of the verification artifacts (e.g., captured `swagger.json`).
Agent Implementation Guidance — Checklist & Templates
----------------------------------------------------
Add the following guidance to help an automated agent produce consistent, review-ready ApiDocs for a new controller or endpoint.

Checklist (dry-run output expected before writing files)
- Provide a mapping table: for each public action include Method, Route, Computed folder name (HTTPMETHOD.normalized-route), Proposed files (description.md, request.json, responses/*.json, parameters.json or parameters/*), and a short rationale.
- Flag ambiguities: missing attributes, overloaded methods, mixed routing conventions, or unclear response shapes.
- Provide example file contents (small representative examples) for each proposed file and a short note on any assumptions.
- If mode is `migrate`, include a `migration-manifest-*.json` listing moved files and their original locations.

File templates and conventions
- `description.md` front-matter (YAML) keys the agent should populate:
  - `summary` (short, one-line)
  - `description` (longer form, MAY include examples and validation notes)
  - `tags` (array with the controller/tag)
  - `responses` (optional brief overrides; large examples go in `responses/*.json`)

  Example description.md content:
  ```markdown
  ---
  summary: Get a property by id
  description: |
    Returns the property with the supplied `id`.
    Includes basic details such as `name`, `address` and `status`.
  tags: [Properties]
  ---

  **Endpoint:** `GET /api/properties/{id}`

  Returns `200` with the property object. If not found returns `404`.
  ```

- `request.json` acceptable shapes (agent should prefer the simplest form):
  - Simple example object (preferred):
    ```json
    { "example": { "name": "Example" } }
    ```
  - Full content object (when necessary):
    ```json
    { "content": { "application/json": { "example": { ... } } } }
    ```
  - If request is required, ensure the generated `request.json` will cause the linter to mark `requestBody.Required = true` in the UI by providing `example` content.

- `responses/<status>.json` minimal recommended structure:
  ```json
  {
    "description": "OK",
    "content": {
      "application/json": {
        "examples": {
          "default": { "value": { "id": "00000000-0000-0000-0000-000000000000" } }
        }
      }
    }
  }
  ```

- `parameters.json` vs `parameters/`:
  - For simple path/query/header parameters, `parameters.json` may contain per-parameter defs (top-level) where each parameter includes `in`, `example` and optional `required`.
  - If `sets` are required (named parameter combos), place them in `parameters/sets.json` and keep per-parameter files under `parameters/` when helpful (the linter prefers `parameters` folder for `sets`).

Behavior and heuristics
- Detect path parameters by parsing the route `{...}` and ensure `parameters.json` (or `parameters/{in}.{name}.json`) is created with `in: "path"` and an example GUID.
- For methods returning `204`, create a `responses/204.json` with an empty example (`{}`) under `application/json` to avoid UI confusion.
- Prefer small, representative examples and avoid PII. Use GUID placeholders and short strings.
- If a method has an `[Authorize]` attribute or other security metadata, include `tags` and rely on `TagDocsDocumentFilter` to show tag-level auth notes; do not add security requirements in individual docs unless explicitly needed.

Idempotency and safety
- Do not overwrite existing files unless the `Apply` flag is set. The dry-run should clearly list files to be created vs files that would be modified.
- Keep `.bak` or migration manifests when migrating legacy sidecars and remove only after manual verification.

What to ask the user (when ambiguous)
- Which mode do you want: `create`, `update`, or `migrate`?
- If route ambiguity exists (same path & method variations), confirm which action to document.
- If response schemas are unclear, provide example objects or point to DTO classes to reference.

Acceptance criteria (agent-generated PRs)
- Folders use `HTTPMETHOD.normalized-route` naming and contain `description.md` with an `**Endpoint:**` line.
- `request.json` and `responses/*.json` include small, representative examples that appear in `/swagger/v1/swagger.json` as operation request/response examples.
- `parameters.json` present for path/query parameters with example values; `sets` included where applicable.
- If a migration was performed, a `migration-manifest-*.json` is present and included in the commit.
- Unit tests (or manual verification instructions) included or updated when necessary.
Constraints & Do-Not
- **Do not** delete legacy files or perform a `migrate` phase unless the user explicitly instructs with an `Apply` flag. Default to non-destructive `create` or `update` modes.
- Avoid using real PII or production data in examples; use safe placeholders only.
- Preserve idempotency: repeated runs should not produce unexpected changes and should report no-op when nothing needs updating.
- Ask for clarification when routes/HTTP methods are ambiguous or missing annotations rather than guessing.

Agent prompt template (example)
- "Controller: `src/MyApp.Api/Controllers/PropertiesController.cs` \nBlueprint: `src/MyApp.Api/ApiDocs/BLUEPRINT.md` \nMode: `create` \nDryRun: true \nPlease generate the proposed endpoint mapping and sample `description.md` for each endpoint."

Acceptance criteria for agent-created PRs
- Folders use `HTTPMETHOD.normalized-route` naming and contain `description.md` with an `**Endpoint:**` line.
- `request.json` and `responses/*.json` include small, representative examples that appear in `/swagger/v1/swagger.json` as operation request/response examples.
- `parameters.json` present for path/query parameters with example values and optional `sets` where applicable.
- If a migration was performed, a `migration-manifest-*.json` is present and included in the commit.
- Tests and verification steps are documented and verification artifacts (e.g., `swagger.json`) are attached or referenced in the PR.

Examples — mapping and sample generated files
---------------------------------------------
Below are concise examples to show how controller routes map to endpoint folders, and a small sample `description.md` + supporting files an agent should generate for a given endpoint.

Route → folder mapping (examples)
- `GET /api/properties`               → `GET.properties`
- `POST /api/properties`              → `POST.properties`
- `GET /api/properties/{id}`          → `GET.properties.{id}`
- `PUT /api/properties/{id}`          → `PUT.properties.{id}`
- `PATCH /api/properties/{id}/status` → `PATCH.properties.{id}.status`
- `GET /api/properties/{id}/template` → `GET.properties.{id}.template`

Sample generated `description.md` (agent output example)
````markdown
---
summary: Get a property by id
description: |
  Returns the property with the supplied `id`.
  Includes basic details such as `name`, `address` and `status`.
  Use `?include=units` to include unit summary in the result.
tags: [Properties]
---

**Endpoint:** `GET /api/properties/{id}`

Returns `200` with the property object. If the `id` is not found, returns `404`.
````

Sample generated `request.json` (if a body is required)
```json
{
  "status": "active"
}
```

Sample generated `responses/200.json`
```json
{
  "description": "OK",
  "content": {
    "application/json": {
      "examples": {
        "default": { "value": { "id": "00000000-0000-0000-0000-000000000000", "name": "Example Property", "status": "active" } }
      }
    }
  }
}
```

Sample generated `parameters.json` (for path `id`)
```json
{
  "id": { "in": "path", "example": "00000000-0000-0000-0000-000000000000" }
}
```

Notes for agents generating examples
- Prefer small, representative examples; use GUID placeholders or simple strings for IDs and avoid PII.
- Keep `responses/*` examples minimal and add large payloads to `examples/` if needed.
- Confirm `description.md` includes `**Endpoint:**` and that generated folder name follows `HTTPMETHOD.normalized-route` normalization rules.

Contact
-------
If you need help migrating an additional controller or you'd like me to run the API and perform the UI verification, tell me which controller to migrate next and I’ll proceed.

Linter — `validate-api-docs.ps1`
--------------------------------
- A PowerShell validator script is provided at `backend-dot-net-core/scripts/validate-api-docs.ps1`.
- Run via npm: `npm run validate:apidocs` (or use the PowerShell call directly):

  powershell -NoProfile -NonInteractive -File backend-dot-net-core/scripts/validate-api-docs.ps1 -ApiDocsRoot 'backend-dot-net-core/src/MyApp.Api/ApiDocs'

- Flags:
  - `-Fix`: attempt to auto-insert missing `**Endpoint:**` lines and missing front-matter `tags` (when controller name can be inferred) when folder names clearly indicate HTTP method and route.
  - `-Json`: emit JSON output suitable for CI consumption.

Additional linter checks performed:
- Ensures `description.md` includes YAML front-matter and a non-empty `tags` entry (auto-inserted with the controller name when `-Fix` is used).
- Ensures `responses/` exists and contains numeric status files (`200.json`, `204.json`, etc.). If present, validates that at least one of the expected status codes for the HTTP method is provided (e.g., `GET` expects `200` or `404`, `POST` expects `201` or `200`, `PUT/PATCH` expect `200`/`204`, `DELETE` expects `204`/`200`). When using `-Fix`, the validator may auto-create a minimal `responses/{status}.json` file for the first expected status code.
- Warns when a route contains path parameters but `parameters.json` or `parameters/` is missing.
- Ensures `description.md` front-matter includes `summary` (auto-inserted from the body when `-Fix` is used).
- For `POST/PUT/PATCH` endpoints, warns if `request.json` is missing (auto-creates a minimal `request.json` when `-Fix` is used).
- Verifies each `responses/*.json` is valid JSON and contains an `application/json` example; when `-Fix` is used, a minimal example is inserted.

- Exit codes:
  - `0` — no issues found
  - `1` — issues found (printed to stdout)
  - `2` — error (e.g., ApiDocs root not found)

Please run the linter as part of your PR flow to ensure new `ApiDocs` folders conform to this blueprint.