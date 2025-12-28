# Clean Architecture Guide (minimal)

Principles
- Dependency rule: source code dependencies can only point inwards (Controllers -> Services -> Interfaces -> Models). Interfaces and Models have no dependencies on Services or Repositories.
- Projects:
  - Api: controllers, DTOs, mapping profiles registration, swagger
  - Models: Domain models and DTOs
  - Interfaces: repository and service contracts
  - Services: business logic, depends on Interfaces and Models
  - Repositories: EF Core DbContext and repository implementations, depends on Interfaces and Models
- DI: `IServiceCollection` extension methods in Services and Repositories to register concrete implementations.
- Mapping: use AutoMapper profiles in Services or a dedicated mapping project if needed.
- Validation: FluentValidation validators in Api or Services layer (prefer Api for input validation).
- Tests: Unit tests target Services and Repositories; integration tests run the Api against a test DB.

Project References (example)
- MyApp.Api -> MyApp.Interfaces, MyApp.Models
- MyApp.Services -> MyApp.Interfaces, MyApp.Models
- MyApp.Repositories -> MyApp.Interfaces, MyApp.Models

Notes
- Keep EF Core entities internal to Repositories and expose DTOs from Services.
- Keep controllers thin; prefer `IActionResult` returning DTOs and HTTP codes.
