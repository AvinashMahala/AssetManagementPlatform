# Services Blueprint & Standards

This document defines standards and best practices for service-layer development in the `MyApp.Services` project. Follow these rules to ensure consistency, testability, and maintainability across the codebase.

## 1. General Principles

* **Single Responsibility:** Services should contain business logic only. Controllers, validators, and repositories should not contain business algorithms.
* **Public API Documentation:** **All publicly exposed service interfaces and public methods MUST include XML documentation comments (///) describing purpose, parameters, return values and exceptions.** This ensures quality IntelliSense, correct generated API docs, and easier maintenance.
* **Async/Await:** Use asynchronous operations (`Task<T>`, `Task`) for any I/O-bound work.
* **Dependency Injection:** Inject dependencies via constructor (primary constructors or standard DI) and avoid service locator patterns.
* **Idempotency & Reentrancy:** Public methods that mutate state should be designed to tolerate retries where appropriate.

## 2. Naming & Locations

* **Namespace:** `MyApp.Services`
* **Interface naming:** `I{Name}Service` for public interfaces.
* **Implementation naming:** `{Name}Service` for concrete classes.
* **Files:** Keep one top-level service per file when feasible.

## 3. Error Handling & Exceptions

* Throw domain-specific exceptions (e.g., `ServiceException`) from the service layer and let middleware map them to HTTP responses.
* Avoid catching broad `Exception` unless you rethrow or transform it into a meaningful domain exception.

## 4. Testing

* Make services small and focused to allow unit tests to assert behavior in isolation.
* Use fakes or mocks for external dependencies (repositories, caches, third-party HTTP clients).

## 5. Contracts & DTOs

* Service interfaces operate on domain models or small DTOs; mapping from controller Request DTOs to domain entities should be done in the controller or dedicated mapping extensions as appropriate.

## 6. Logging & Observability

* Log at appropriate levels — `Information` for life-cycle events, `Warning` for recoverable issues, `Error` for failures.
* Keep logs structured and include correlation identifiers where available.

## 7. Documentation & Maintenance

* Public APIs must be documented with XML comments; keep them up to date when signatures or semantics change.
* Add unit tests for important business rules and edge cases.

---

This blueprint is intended to complement `ControllerBlueprint.md` and other project guidelines. If you want, I can add a CI check that enforces presence of XML documentation on public members (e.g., Roslyn analyzer or editorconfig rule).