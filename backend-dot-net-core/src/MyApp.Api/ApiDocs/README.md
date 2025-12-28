This folder contains external per-endpoint documentation used by Swagger.

**API versioning:** The API uses URL segment versioning. Current stable version is **v1**; endpoints are available under `/api/v1/...`. Older non-versioned `/api/...` routes are kept as a fallback for compatibility.

Naming convention (recommended):
- Per-endpoint folder: ApiDocs/Controllers/{Controller}/{EndpointFolder}/ (e.g., `ApiDocs/Controllers/Properties/Get.GET/`) — put all files related to that endpoint inside the folder: `description.md`, `request.json`, `responses/<status>.json`, etc.
- **Canonical layout only**: ApiDocs must use per-endpoint folders: ApiDocs/Controllers/{Controller}/{EndpointFolder}/ (e.g., `ApiDocs/Controllers/Properties/Get.GET/`) containing `description.md`, `request.json`, and `responses/<status>.json`.

Fallback behavior:
- **No backward compatibility**: legacy single-file sidecars such as `Action.METHOD.json` or controller-level `Action.METHOD.md` are **not** supported. Please follow the `ApiDocs/BLUEPRINT.md` conventions and use the migration script to upgrade legacy files.

See `ApiDocs/BLUEPRINT.md` for a full blueprint and migration steps.

YAML front matter (new):
- `.md` files may contain YAML front matter at the top between `---` lines. Recognized fields: `summary`, `description`, `tags` (array), and `responses` (same structure as `.json` sidecars). The body after the front matter is used as the long-form description.

Tag-level docs (new):
- `ApiDocs/Tags/{Tag}.md` will be read and attached to the generated OpenAPI document as tag descriptions.

Examples & request bodies (new):
- `.json` sidecars may include `responses` with `examples` (multiple named examples) and `requestBody` with `content` -> media type -> `example` or `examples`.

Examples are simple JSON objects compatible with the operation filter implemented in `MyApp.Api.Swagger.ExternalDocsOperationFilter`. (See `Properties/GetById.GET.json` for an example.)