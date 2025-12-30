using Prometheus;
using Microsoft.AspNetCore.Builder;

namespace MyApp.Api
{
    public static class ApplicationBuilderExtensions
    {
        public static WebApplication UseMyAppPipeline(this WebApplication app)
        {
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

            return app;
        }
    }
}