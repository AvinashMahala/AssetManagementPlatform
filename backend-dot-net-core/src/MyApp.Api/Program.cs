using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.OpenApi.Models;
using MyApp.Services;
using MyApp.Repositories;
using MyApp.Api.Swagger;
using Serilog;
using System.IO;
using MyApp.Api.Extensions;
using Prometheus;
using FluentValidation;
using FluentValidation.AspNetCore;
using Microsoft.AspNetCore.Mvc;

var builder = WebApplication.CreateBuilder(args);

// Configure Serilog from configuration and emit JSON logs (enrich with scope values such as CorrelationId)
builder.Host.UseSerilog((ctx, services, loggerConfig) =>
{
    // Ensure logs directory exists (write to logs/backend by default)
    var logPath = Path.Combine(Directory.GetCurrentDirectory(), "logs", "backend");
    try { Directory.CreateDirectory(logPath); } catch { /* ignore if we cannot create */ }

    loggerConfig.ReadFrom.Configuration(ctx.Configuration)
                .Enrich.FromLogContext()
                .WriteTo.Console(new Serilog.Formatting.Json.JsonFormatter());
});

// Register observability (OpenTelemetry tracing & metrics)
builder.Services.AddMyAppObservability(builder.Configuration);

// Map MAIN_DATABASE_URL (used by the Express backend) into ConnectionStrings:Default if present
var mainUrl = builder.Configuration["MAIN_DATABASE_URL"] ?? builder.Configuration["MAIN_DATABASE_URL".ToLower()];
if (!string.IsNullOrEmpty(mainUrl) && string.IsNullOrEmpty(builder.Configuration.GetConnectionString("Default")))
{
    builder.Configuration["ConnectionStrings:Default"] = mainUrl;
}

// Register services and repositories (extension methods implemented in their projects)
builder.Services.AddMyAppRepositories(builder.Configuration);
// Pass configuration so service registrations may choose infrastructure (e.g., RabbitMQ) conditionally
builder.Services.AddMyAppServices(builder.Configuration);

// Configure JWT Authentication
var jwtSection = builder.Configuration.GetSection("Jwt");
var jwtKey = jwtSection.GetValue<string>("Key") ?? "change_this_in_production";
var jwtIssuer = jwtSection.GetValue<string>("Issuer") ?? "MyApp";
var jwtAudience = jwtSection.GetValue<string>("Audience") ?? "MyAppUsers";
// Ensure the same deterministic key derivation is used for both signing and validation.
var keyBytes = MyApp.Services.JwtService.DeriveKeyBytesFromSecret(jwtKey);

builder.Services.AddAuthentication(Microsoft.AspNetCore.Authentication.JwtBearer.JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new Microsoft.IdentityModel.Tokens.TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = jwtIssuer,
            ValidateAudience = true,
            ValidAudience = jwtAudience,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new Microsoft.IdentityModel.Tokens.SymmetricSecurityKey(keyBytes),
            ValidateLifetime = true
        };
    });

builder.Services.AddAuthorization();

// Add validation and use problem details for consistent error responses
builder.Services.AddControllers().AddNewtonsoftJson();

builder.Services.Configure<MyApp.Api.Options.CorrelationIdOptions>(builder.Configuration.GetSection("CorrelationId"));
builder.Services.Configure<MyApp.Api.Options.ExceptionHandlingOptions>(builder.Configuration.GetSection("ExceptionHandling"));
builder.Services.Configure<MyApp.Api.Options.RateLimitingOptions>(builder.Configuration.GetSection("RateLimiting"));// Request logging, security headers and maintenance options
builder.Services.Configure<MyApp.Api.Options.RequestLoggingOptions>(builder.Configuration.GetSection("RequestLogging"));
builder.Services.Configure<MyApp.Api.Options.SecurityHeadersOptions>(builder.Configuration.GetSection("SecurityHeaders"));
builder.Services.Configure<MyApp.Api.Options.MaintenanceOptions>(builder.Configuration.GetSection("Maintenance"));

// Register maintenance service and rate limiting services
builder.Services.AddSingleton<MyApp.Api.Services.Maintenance.IMaintenanceService, MyApp.Api.Services.Maintenance.MaintenanceService>();// Register rate limiting services (in-memory by default; replace with Redis in production)
builder.Services.AddSingleton<MyApp.Api.Services.RateLimit.IRateLimitStore, MyApp.Api.Services.RateLimit.InMemoryRateLimitStore>();

// Configure CORS for local development. Reads CORS_ORIGIN from configuration (comma-separated list)
var corsOrigins = builder.Configuration["CORS_ORIGIN"] ?? "http://localhost:5173";
var corsOriginsArray = corsOrigins.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
builder.Services.AddCors(options =>
{
    options.AddPolicy("LocalDev", policy =>
    {
        policy.WithOrigins(corsOriginsArray)
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials(); // only when you need cookies/auth
    });
});

// API Versioning (URL segment style) - require explicit version segment in URL
builder.Services.AddApiVersioning(options =>
{
    // Do NOT assume a default version when the client omits the version segment.
    // This ensures requests to unversioned paths (e.g., /api/files) do not resolve to v1.
    options.AssumeDefaultVersionWhenUnspecified = false;
    options.DefaultApiVersion = new Microsoft.AspNetCore.Mvc.ApiVersion(1, 0);
    options.ReportApiVersions = true;
    options.ApiVersionReader = new Microsoft.AspNetCore.Mvc.Versioning.UrlSegmentApiVersionReader();
});

// Provides API explorer information for each API version (used by Swagger)
builder.Services.AddVersionedApiExplorer(options =>
{
    // Format: 'v1'
    options.GroupNameFormat = "'v'VVV";
    // Substitute the version in the URL where {version:apiVersion} is used
    options.SubstituteApiVersionInUrl = true;
});

// Register FluentValidation and configure automatic 400 responses to match Express validation behavior
// Register FluentValidation validators
// Add FluentValidation integration (ensure package FluentValidation.AspNetCore is referenced in the project)
builder.Services.AddFluentValidationAutoValidation();
builder.Services.AddValidatorsFromAssemblyContaining<MyApp.Api.Controllers.TenantsController>();
builder.Services.Configure<ApiBehaviorOptions>(options =>
{
    options.InvalidModelStateResponseFactory = context =>
    {
        var errors = context.ModelState
            .Where(kvp => kvp.Value.Errors.Count > 0)
            .Select(kvp => new { field = kvp.Key, errors = kvp.Value.Errors.Select(e => e.ErrorMessage) });
        var payload = new { success = false, errors = errors };
        return new BadRequestObjectResult(payload);
    };
});
// Configure Swagger/OpenAPI using extension method
builder.Services.AddMyAppSwagger();

var app = builder.Build();

// Ensure DB is created in development for quick start
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetService<MyApp.Repositories.AppDbContext>();
    if (db != null)
    {
        db.Database.EnsureCreated();
    }

    // Ensure finance background subscribers are activated at startup so events are handled
    // Resolve the services once to run their constructors (they will register event handlers)
    scope.ServiceProvider.GetService<MyApp.Interfaces.IRentTransactionService>();
    scope.ServiceProvider.GetService<MyApp.Interfaces.IReceiptService>();
}

if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
    app.UseMyAppSwaggerUI();
}

// Enable configured CORS policy so browser requests from local dev origins are allowed
app.UseCors("LocalDev");

// Correlation ID middleware must run early so later logging and error handling includes the id
app.UseMiddleware<MyApp.Api.Middleware.CorrelationIdMiddleware>();

// Security headers should be applied early (after CORS)
app.UseMiddleware<MyApp.Api.Middleware.SecurityHeadersMiddleware>();

// Maintenance mode should be checked before most request processing
app.UseMiddleware<MyApp.Api.Middleware.MaintenanceMiddleware>();

// Request logging - capture start/end around downstream processing
app.UseMiddleware<MyApp.Api.Middleware.RequestLoggingMiddleware>();

// Global exception handling middleware (catches downstream exceptions and returns ProblemDetails)
app.UseMiddleware<MyApp.Api.Middleware.ExceptionHandlingMiddleware>();

// Rate limiting middleware enforces configured policies
app.UseMiddleware<MyApp.Api.Middleware.RateLimitingMiddleware>();

// Expose Prometheus metrics endpoint (prometheus-net) - should be accessible without auth
app.UseHttpMetrics();
app.UseMetricServer();

app.UseAuthentication();
// Conditional auth middleware must run after authentication so it can call AuthenticateAsync if header present
app.UseMiddleware<MyApp.Api.Middleware.ConditionalAuthMiddleware>();
app.UseAuthorization();

app.MapControllers();

app.Run();

// Expose Program class for integration testing
public partial class Program { }
