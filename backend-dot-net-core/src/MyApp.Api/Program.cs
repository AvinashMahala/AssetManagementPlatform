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

    var xmlFile = System.IO.Path.ChangeExtension(System.Reflection.Assembly.GetExecutingAssembly().Location, ".xml");
    if (System.IO.File.Exists(xmlFile)) options.IncludeXmlComments(xmlFile);
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
    app.UseSwaggerUI();
}

app.UseAuthentication();
// Conditional auth middleware must run after authentication so it can call AuthenticateAsync if header present
app.UseMiddleware<MyApp.Api.Middleware.ConditionalAuthMiddleware>();
app.UseAuthorization();

app.MapControllers();

app.Run();

// Expose Program class for integration testing
public partial class Program { }
