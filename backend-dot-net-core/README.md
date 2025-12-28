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
