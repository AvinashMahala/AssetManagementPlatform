Sample controllers demonstrating mapping of Express routes to ASP.NET Core controllers.

`HealthController` - GET /api/health
`LeasesController` - GET /api/leases/{id} and POST /api/leases

Notes:
- Controllers remain thin — business logic is in Services.
- DTOs and validation should be added for each request/response model.
