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
using MyApp.Api;

var builder = WebApplication.CreateBuilder(args);

// Configure Serilog from configuration and emit JSON logs (enrich with scope values such as CorrelationId)
builder.Host.UseSerilog((ctx, services, loggerConfig) => LoggingExtensions.ConfigureJsonSerilog(ctx, services, loggerConfig));

// Register observability (OpenTelemetry tracing & metrics)
builder.Services.AddMyAppObservability(builder.Configuration);

// Map MAIN_DATABASE_URL (used by the Express backend) into ConnectionStrings:Default if present
builder.Configuration.MapMainDatabaseUrl();

// Register services and repositories (extension methods implemented in their projects)
builder.Services.AddMyAppRepositories(builder.Configuration);
// Pass configuration so service registrations may choose infrastructure (e.g., RabbitMQ) conditionally
builder.Services.AddMyAppServices(builder.Configuration);

// Configure JWT Authentication
builder.Services.AddMyAppJwtAuthentication(builder.Configuration);

// Add validation and use problem details for consistent error responses
builder.Services.AddControllers().AddNewtonsoftJson();

builder.Services.Configure<MyApp.Api.Options.CorrelationIdOptions>(builder.Configuration.GetSection("CorrelationId"));
builder.Services.Configure<MyApp.Api.Options.ExceptionHandlingOptions>(builder.Configuration.GetSection("ExceptionHandling"));

// Enable detailed errors & stack traces in development by default unless explicitly configured via settings or env vars
if (builder.Environment.IsDevelopment())
{
    var section = builder.Configuration.GetSection("ExceptionHandling");
    // If ShowDetailedErrors not explicitly set, enable it for dev (but allow explicit override)
    var explicitSetting = section.GetValue<bool?>("ShowDetailedErrors");
    if (!explicitSetting.HasValue)
    {
        builder.Configuration["ExceptionHandling:ShowDetailedErrors"] = "true";
    }
    var explicitStack = section.GetValue<bool?>("ShowExceptionStackTrace");
    if (!explicitStack.HasValue)
    {
        builder.Configuration["ExceptionHandling:ShowExceptionStackTrace"] = "true";
    }
}
builder.Services.Configure<MyApp.Api.Options.RateLimitingOptions>(builder.Configuration.GetSection("RateLimiting"));// Request logging, security headers and maintenance options
// Ensure a conservative default for the refresh endpoint if not configured explicitly
builder.Services.AddMyAppRateLimitingDefaults();
builder.Services.Configure<MyApp.Api.Options.RequestLoggingOptions>(builder.Configuration.GetSection("RequestLogging"));
builder.Services.Configure<MyApp.Api.Options.SecurityHeadersOptions>(builder.Configuration.GetSection("SecurityHeaders"));
builder.Services.Configure<MyApp.Api.Options.MaintenanceOptions>(builder.Configuration.GetSection("Maintenance"));

// Register maintenance service and rate limiting services
builder.Services.AddSingleton<MyApp.Api.Services.Maintenance.IMaintenanceService, MyApp.Api.Services.Maintenance.MaintenanceService>();// Register rate limiting services (in-memory by default; replace with Redis in production)
builder.Services.AddSingleton<MyApp.Api.Services.RateLimit.IRateLimitStore, MyApp.Api.Services.RateLimit.InMemoryRateLimitStore>();
// Failure tracker used to detect rapid failure spikes (e.g., refresh endpoint abuse)
builder.Services.AddSingleton<MyApp.Api.Security.FailureTracker>();

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
builder.Services.AddMyAppFluentValidation();
// Configure Swagger/OpenAPI using extension method
builder.Services.AddMyAppSwagger();

var app = builder.Build();

// Ensure DB is created in development for quick start and activate background subscribers
app.InitializeDatabaseAndBackgroundSubscribers();

if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
    app.UseMyAppSwaggerUI();
}

// Configure request pipeline (middleware, metrics, auth, endpoints)
app.UseMyAppPipeline();

app.Run();

// Program setup helpers moved to `ProgramSetup.cs` to improve readability while preserving behavior.
// Expose Program class for integration testing
public partial class Program { }
