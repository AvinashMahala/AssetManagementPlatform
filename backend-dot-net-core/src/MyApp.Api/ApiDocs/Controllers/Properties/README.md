This folder contains per-endpoint docs for the *Properties* tag.

Files follow the `Action.HTTPMETHOD.md` and `.json` pattern. Use YAML front-matter in `.md` files for `summary`, `description`, `tags` and `responses`. Use `.json` sidecars to provide structured `responses` and `requestBody` examples that will appear in Swagger UI.

Guidance:
- Provide at least one `200`/`201` example to help consumers.
- Add `requestBody` examples for POST/PUT and PATCH where useful.
- Keep examples small and realistic (use GUIDs and plausible names/addresses).

Existing files in this folder include examples for list/get/create/update/delete and template operations.