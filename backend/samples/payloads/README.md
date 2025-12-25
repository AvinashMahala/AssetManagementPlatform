# Sample Payloads (feature-wise) ✅

This folder stores example request payloads for API endpoints, organized by feature. Use these to:

- Create tests or API docs
- Help frontend developers understand required request shapes
- Provide examples for manual API testing (Postman, HTTPie, curl)

Conventions:
- Each feature has its own folder (e.g., `finance/receipt/`).
- Filenames follow the pattern `<endpoint>-<action>.json` (e.g., `generate.json`, `create.json`).
- Use `README.md` inside feature folders to document any nuances if necessary.

If you add new endpoints, please add a matching sample payload here and update this README briefly.

Added features:

- finance/receipt (generate, generate-bulk, send-email)
- finance/rent-transactions (create, update)
- finance/expense (create)
- properties/property (create)
- tenants/tenant (create)
- leases (create, update, terminate)
- files (upload metadata example + README with curl example)
- unit-utilities (create, update, toggle, calculate-charges example)
- auth (register, login, refresh-token)
 - meters (create)
 - meter-readings (create)
 - units (create)
 - unit-tenants (assign)
 - receipt-templates (create, template preview/import/duplicate)
 - receipt-templates (create, update, template preview/import/duplicate, property set)
 - receipts (update, update property settings)
 - rent-payments (update)
 - expenses (update)
 - auth users (create, update, profile update)
 - files (update metadata)
 - properties (update, status, receipt-template create/update)
 - units (update, status)
 - unit-tenants (update assignment)
 - meters (update)
 - meter-readings (update)
 - rent-payments (create)
 - bulk operations (rent-collection, payments, receipts, communication, export)

Contributing:
- Add payloads under the feature folder and name files to reflect endpoint/action.
- If the endpoint uses multipart/form-data, include a README describing the curl or httpie usage.

