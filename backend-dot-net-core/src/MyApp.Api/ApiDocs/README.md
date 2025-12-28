This folder contains external per-endpoint documentation used by Swagger.

Naming convention:
- Primary: ApiDocs/{Controller}/{Action}.{httpmethod}.md (description)
- Primary: ApiDocs/{Controller}/{Action}.{httpmethod}.json (structured metadata: responses/examples)

Fallback behavior:
- The operation filter will also accept any file that ends with `.{httpmethod}.md` or `.{httpmethod}.json` in the controller folder and will prefer files that contain the action name or `id` in the filename. This makes it OK to use a more human-friendly filename (e.g., `GetById.GET.md`) even if the controller method is named `Get`.

YAML front matter (new):
- `.md` files may contain YAML front matter at the top between `---` lines. Recognized fields: `summary`, `description`, `tags` (array), and `responses` (same structure as `.json` sidecars). The body after the front matter is used as the long-form description.

Tag-level docs (new):
- `ApiDocs/Tags/{Tag}.md` will be read and attached to the generated OpenAPI document as tag descriptions.

Examples & request bodies (new):
- `.json` sidecars may include `responses` with `examples` (multiple named examples) and `requestBody` with `content` -> media type -> `example` or `examples`.

Examples are simple JSON objects compatible with the operation filter implemented in `MyApp.Api.Swagger.ExternalDocsOperationFilter`. (See `Properties/GetById.GET.json` for an example.)