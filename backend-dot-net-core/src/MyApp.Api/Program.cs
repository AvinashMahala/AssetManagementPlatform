using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.OpenApi.Models;
using MyApp.Services;
using MyApp.Repositories;
using MyApp.Api.Swagger;
using FluentValidation;
using FluentValidation.AspNetCore;
using Microsoft.AspNetCore.Mvc;

var builder = WebApplication.CreateBuilder(args);

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

// API Versioning (URL segment style, default to v1)
builder.Services.AddApiVersioning(options =>
{
    options.AssumeDefaultVersionWhenUnspecified = true;
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
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    // Add JWT Bearer definition so Swagger UI can send the Authorization header
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "JWT Authorization header using the Bearer scheme. Example: \"Bearer {token}\""
    });

    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[] { }
        }
    });

    // Load external per-endpoint docs from ApiDocs (see ApiDocs/README.md)
    options.OperationFilter<ExternalDocsOperationFilter>();
    options.DocumentFilter<TagDocsDocumentFilter>();
    // Lowercase path keys so controller segments appear in lower case in Swagger UI (e.g. /api/v1/auth/login)
    options.DocumentFilter<LowercasePathsDocumentFilter>();

    var xmlFile = System.IO.Path.ChangeExtension(System.Reflection.Assembly.GetExecutingAssembly().Location, ".xml");
    if (System.IO.File.Exists(xmlFile)) options.IncludeXmlComments(xmlFile);

    // Only include endpoints that belong to the swagger document's API version group
    // and whose path contains the version segment (e.g., "v1"). This prevents duplicate
    // unversioned routes from appearing in the versioned docs.
    options.DocInclusionPredicate((docName, apiDesc) =>
    {
        if (apiDesc.GroupName != docName) return false;

        // apiDesc.RelativePath usually looks like: "api/v1/files" or "api/files"
        var relativePath = apiDesc.RelativePath ?? string.Empty;
        // Ensure the path contains the group name (e.g., "v1") as a segment
        if (!relativePath.Contains($"{docName}/") && !relativePath.EndsWith(docName, StringComparison.OrdinalIgnoreCase))
        {
            return false;
        }

        return true;
    });

    // Register a Swagger document for each discovered API version
    var provider = builder.Services.BuildServiceProvider().GetRequiredService<Microsoft.AspNetCore.Mvc.ApiExplorer.IApiVersionDescriptionProvider>();
    foreach (var description in provider.ApiVersionDescriptions)
    {
        options.SwaggerDoc(description.GroupName, new OpenApiInfo { Title = $"MyApp API {description.GroupName}", Version = description.GroupName });
    }
});

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
    app.UseSwagger();

    var provider = app.Services.GetRequiredService<Microsoft.AspNetCore.Mvc.ApiExplorer.IApiVersionDescriptionProvider>();
    app.UseSwaggerUI(c =>
    {
        // Expose a swagger endpoint for each discovered API version
        foreach (var description in provider.ApiVersionDescriptions)
        {
            c.SwaggerEndpoint($"/swagger/{description.GroupName}/swagger.json", $"MyApp API {description.GroupName}");
        }

        // Collapse sections by default
        c.DocExpansion(Swashbuckle.AspNetCore.SwaggerUI.DocExpansion.None);
        // Inject custom JS to add Collapse All / Expand All buttons and force collapse
        c.InjectJavascript("/swagger-ui/swagger-custom.js");
    });
}

// Enable configured CORS policy so browser requests from local dev origins are allowed
app.UseCors("LocalDev");

app.UseAuthentication();
// Conditional auth middleware must run after authentication so it can call AuthenticateAsync if header present
app.UseMiddleware<MyApp.Api.Middleware.ConditionalAuthMiddleware>();
app.UseAuthorization();

app.MapControllers();

app.Run();

// Expose Program class for integration testing
public partial class Program { }
