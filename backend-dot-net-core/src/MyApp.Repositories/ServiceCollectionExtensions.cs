using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using MyApp.Interfaces;
using MyApp.Interfaces.Repositories;

namespace MyApp.Repositories;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddMyAppRepositories(this IServiceCollection services, IConfiguration configuration)
    {
        // Prefer MAIN_DATABASE_URL environment variable (used by the Express app) when present
        var mainDbUrl = configuration["MAIN_DATABASE_URL"] ?? configuration["MainDatabaseUrl"];
        var conn = configuration.GetConnectionString("Default");
        if (string.IsNullOrEmpty(conn) && !string.IsNullOrEmpty(mainDbUrl)) conn = ConvertPostgresUriToConnectionString(mainDbUrl);
        if (string.IsNullOrEmpty(conn)) conn = "Data Source=backend_dev.db";

        // Detect if the configured connection is a Postgres connection (URI or key/value contains Host=)
        var isPostgres = conn.StartsWith("postgres", StringComparison.OrdinalIgnoreCase) || conn.StartsWith("postgresql", StringComparison.OrdinalIgnoreCase) || conn.IndexOf("Host=", StringComparison.OrdinalIgnoreCase) >= 0;
        services.AddDbContext<AppDbContext>(opts =>
        {
            if (isPostgres)
            {
                opts.UseNpgsql(conn, npg => npg.EnableRetryOnFailure());
            }
            else
            {
                opts.UseSqlite(conn);
            }
        });

        services.AddScoped<ILeaseRepository, LeaseRepository>();
        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<ISessionRepository, SessionRepository>();
        services.AddScoped<ISessionJtiRepository, SessionJtiRepository>();
        services.AddScoped<IPropertyRepository, PropertyRepository>();
        // Repositories for files and templates
        services.AddScoped<IFileRepository, FileRepository>();
        services.AddScoped<IReceiptTemplateRepository, ReceiptTemplateRepository>();
        services.AddScoped<IRentPaymentRepository, RentPaymentRepository>();
        services.AddScoped<IRentTransactionRepository, RentTransactionRepository>();
        services.AddScoped<IReceiptRepository, ReceiptRepository>();
        services.AddScoped<ITenantRepository, TenantRepository>();
        services.AddScoped<ITenantDocumentRepository, TenantDocumentRepository>();
        services.AddScoped<IUnitRepository, UnitRepository>();
        services.AddScoped<IUnitTenantRepository, UnitTenantRepository>();
        services.AddScoped<IExpenseRepository, ExpenseRepository>();
        services.AddScoped<IUnitUtilityRepository, UnitUtilityRepository>();
        services.AddScoped<IMeterRepository, MeterRepository>();
        services.AddScoped<IMeterReadingRepository, MeterReadingRepository>();
        // Ensure LeaseRepository is registered (already wired above) - other repositories will be added per-feature

        // Make DB accessible to integration tests via scoped provider
        services.AddScoped<AppDbContext>();

        return services;
    }

    // Convert a postgres URI (postgres://user:pass@host:port/db) into a Npgsql-style connection string
    private static string ConvertPostgresUriToConnectionString(string uri)
    {
        try
        {
            var u = new Uri(uri);
            var userInfo = u.UserInfo.Split(':', 2);
            var username = userInfo.Length > 0 ? userInfo[0] : string.Empty;
            var password = userInfo.Length > 1 ? userInfo[1] : string.Empty;
            var host = u.Host;
            var port = u.Port > 0 ? u.Port.ToString() : "5432";
            var database = u.AbsolutePath?.Trim('/') ?? string.Empty;
            var conn = $"Host={host};Port={port};Username={username};Password={password};Database={database}";
            return conn;
        }
        catch
        {
            // If parsing fails, just return the raw string and let Npgsql attempt to use it
            return uri;
        }
    }
}
