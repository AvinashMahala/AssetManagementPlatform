Clean Architecture scaffold for Asset Management Platform

Structure:
- src/MyApp.Api  (ASP.NET Core Web API - Controllers)
- src/MyApp.Models (Domain models & DTOs)
- src/MyApp.Interfaces (Service & Repository interfaces)
- src/MyApp.Services (Business logic implementations)
- src/MyApp.Repositories (EF Core DbContext & Repositories)

Next steps:
- Wire up DI in `Program.cs`
- Add EF Core provider and migrations
- Translate Node routes → Controller actions
- Add tests and CI integration

Notes:
- Exception handling is configurable via the `ExceptionHandling` section in appsettings / env vars. In development the code will enable `ExceptionHandling:ShowDetailedErrors` and `ExceptionHandling:ShowExceptionStackTrace` by default (unless explicitly overridden) so clients can see full errors while debugging. In production these remain off by default to avoid leaking sensitive info.
