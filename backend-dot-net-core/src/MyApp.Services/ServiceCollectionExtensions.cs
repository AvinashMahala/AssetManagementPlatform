using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using MyApp.Interfaces;
using MyApp.Repositories;
using MyApp.Core;

namespace MyApp.Services;

/// <summary>
/// Extension methods for registering MyApp services into an <see cref="IServiceCollection"/>.
/// </summary>
public static class ServiceCollectionExtensions
{
    /// <summary>
    /// Registers the service implementations used by the application.
    /// </summary>
    /// <param name="services">The service collection to register services into.</param>
    /// <param name="configuration">Application configuration (used for optional integrations like RabbitMQ).</param>
    /// <returns>The same <see cref="IServiceCollection"/> instance for chaining.</returns>
    public static IServiceCollection AddMyAppServices(this IServiceCollection services, Microsoft.Extensions.Configuration.IConfiguration configuration)
    {
        services.AddScoped<ILeaseService, LeaseService>();
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IJwtService, JwtService>();
        services.AddScoped<IPropertyService, PropertyService>();
        services.AddScoped<IFileStorageService, FileStorageService>();
        services.AddScoped<IFileRepository, FileRepository>();
        services.AddScoped<IReceiptTemplateRepository, ReceiptTemplateRepository>();
        services.AddScoped<IReceiptTemplateService, ReceiptTemplateService>();
        services.AddScoped<IPropertyFileService, PropertyFileService>();
        services.AddScoped<IPropertyReceiptTemplateService, PropertyReceiptTemplateService>();

        // Finance: payments, transactions, receipts
        services.AddScoped<IRentPaymentService, RentPaymentService>();
        services.AddScoped<IRentTransactionService, RentTransactionService>();
        services.AddScoped<IReceiptService, ReceiptService>();

        // Tenant services
        services.AddScoped<ITenantService, TenantService>();
        services.AddScoped<ITenantDocumentService, TenantDocumentService>();
        services.AddScoped<IUnitService, UnitService>();
        services.AddScoped<IUnitTenantService, UnitTenantService>();
        services.AddScoped<IExpenseService, ExpenseService>();
        services.AddScoped<IBulkOperationsService, BulkOperationsService>();
        services.AddScoped<ICommunicationService, CommunicationService>();
        services.AddScoped<IUserAdminService, UserAdminService>();
        services.AddScoped<IUnitUtilityService, UnitUtilityService>();
        services.AddScoped<IMeterService, MeterService>();
        services.AddScoped<IMeterReadingService, MeterReadingService>();

        // New services for utility billing
        services.AddScoped<ITariffService, TariffService>();
        services.AddScoped<IMeterAllocationService, MeterAllocationService>();
        services.AddScoped<IBillingService, BillingService>();


        // Event bus: prefer RabbitMQ when configured, otherwise use in-memory for dev/testing
        var rabbitHost = configuration["RabbitMq:Host"];
        if (!string.IsNullOrEmpty(rabbitHost))
        {
            // Register with a factory so we can gracefully fall back to in-memory on startup failures
            services.AddSingleton<IEventBus>(sp =>
            {
                var config = sp.GetRequiredService<Microsoft.Extensions.Configuration.IConfiguration>();
                var scopes = sp.GetRequiredService<IServiceScopeFactory>();
                var logger = sp.GetRequiredService<Microsoft.Extensions.Logging.ILogger<MyApp.Messaging.RabbitMqEventBus>>();
                try
                {
                    return new MyApp.Messaging.RabbitMqEventBus(config, scopes, logger);
                }
                catch (Exception ex)
                {
                    var log = sp.GetRequiredService<Microsoft.Extensions.Logging.ILogger<InMemoryEventBus>>();
                    log.LogWarning(ex, "RabbitMQ event bus failed to initialize, falling back to InMemoryEventBus");
                    return new InMemoryEventBus();
                }
            });
        }
        else
        {
            services.AddSingleton<IEventBus, InMemoryEventBus>();
        }

        // Auth helper: refresh token hasher (SHA256 + optional pepper)
        services.AddScoped<IRefreshTokenHasher, RefreshTokenHasher>();

        // RBAC admin service (PoC)
        services.AddScoped<IRoleAdminService, RoleAdminService>();

        // Permission categories service
        services.AddScoped<MyApp.Interfaces.Services.IPermissionCategoryService, PermissionCategoryService>();

        return services;
    }
}
