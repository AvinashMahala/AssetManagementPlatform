# ReceiptTemplates

Templates used to render receipts and previewed content for emails and PDF generation.
<!-- 
- **Controller:** `ReceiptTemplatesController`
- **Authentication:** Public
- **Endpoints included:**
  - `GET /api/receipttemplates` — list templates
  - `GET /api/receipttemplates/{id}` — get template
  - `POST /api/receipttemplates` — create template
  - `POST /api/receipttemplates/preview` — render a preview (text/html)
  - `GET /api/receipttemplates/templates/{id}/export` — export template
  - `POST /api/receipttemplates/templates/import` — import template
  - `POST /api/receipttemplates/templates/{id}/duplicate` — duplicate template
  - `GET /api/receipttemplates/templates/placeholders/available` — list placeholders
  - `PUT /api/receipttemplates/{id}` — update template
  - `DELETE /api/receipttemplates/{id}` — delete template

Notes:
- Preview returns `text/html`; sample data replacement is case-insensitive.
- Keep sample templates concise; move large examples to `examples/` if needed.

---

Try preview examples in Swagger UI to validate placeholder substitutions. -->
