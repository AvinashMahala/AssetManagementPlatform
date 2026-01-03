using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
namespace MyApp.Api.Extensions
{
    public static class ObservabilityServiceCollectionExtensions
    {
        public static IServiceCollection AddMyAppObservability(this IServiceCollection services, IConfiguration configuration)
        {
            // Serilog is configured via Host.UseSerilog in Program.cs.
            // TODO: add OpenTelemetry tracing/metrics here when stable package versions and configuration are finalized.
            return services;
        }
    }
}