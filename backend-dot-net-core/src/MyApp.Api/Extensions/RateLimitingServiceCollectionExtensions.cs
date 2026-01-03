using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using MyApp.Api.Services.RateLimit;

namespace MyApp.Api.Extensions
{
    public static class RateLimitingServiceCollectionExtensions
    {
        public static IServiceCollection AddMyAppRateLimiting(this IServiceCollection services, IConfiguration configuration)
        {
            // Registers an in-memory store by default. In production, Replace with Redis implementation.
            services.AddSingleton<IRateLimitStore, InMemoryRateLimitStore>();
            services.Configure<MyApp.Api.Options.RateLimitingOptions>(configuration.GetSection("RateLimiting"));
            return services;
        }
    }
}