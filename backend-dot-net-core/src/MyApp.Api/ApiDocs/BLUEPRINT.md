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
  │   ├─ {EndpointFolder}/    (one folder per endpoint; recommended naming: `Action.HTTPMETHOD`, e.g., `GetById.GET`)
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
- Endpoint folder naming: `Action.HTTPMETHOD` (e.g., `Create.POST`, `Update.PUT`). This disambiguates same path/different-method scenarios.
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

Migration checklist (for a controller)
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
- [ ] All migrated files for controller are present under `ApiDocs/{Controller}` with `description.md`, `request.json` (if applicable), `responses/*.json` (as needed)
- [ ] The number of endpoint folders under `ApiDocs/{Controller}` matches the number of public controller actions (remove duplicate or orphaned folders such as legacy `GetById.GET` or extraneous method variants like `UpdateStatus.POST`).
- [ ] `description.md` contains an **Endpoint:** line
- [ ] Unit tests added/updated and passing
- [ ] Manual verification of `/swagger` completed and screenshots if needed
- [ ] `.bak` and legacy files removed (or documented if kept temporarily)
- [ ] Update `ApiDocs/README.md` if special cases or exceptions were made

Contact
-------
If you need help migrating an additional controller or you'd like me to run the API and perform the UI verification, tell me which controller to migrate next and I’ll proceed.