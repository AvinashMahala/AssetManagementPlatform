using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using MyApp.Api.Options;
using System.Text.Json;

namespace MyApp.Api.Middleware
{
    public class MaintenanceMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<MaintenanceMiddleware> _logger;
        private readonly MaintenanceOptions _options;

        // simple in-memory toggle; controller will update this static instance for demo/testing
        public static volatile bool IsMaintenanceEnabled;
        public static volatile int CurrentRetryAfterSeconds;

        public MaintenanceMiddleware(RequestDelegate next, ILogger<MaintenanceMiddleware> logger, IOptions<MaintenanceOptions> options)
        {
            _next = next;
            _logger = logger;
            _options = options.Value;
            IsMaintenanceEnabled = _options.Enabled;
            CurrentRetryAfterSeconds = _options.RetryAfterSeconds;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            if (IsMaintenanceEnabled)
            {
                // Admin bypass via header if allowed
                if (_options.AllowAdminBypass && context.Request.Headers.TryGetValue(_options.BypassHeaderName, out var val) && !string.IsNullOrEmpty(val))
                {
                    _logger.LogInformation("Maintenance bypass header present; allowing request.");
                    await _next(context);
                    return;
                }

                context.Response.StatusCode = StatusCodes.Status503ServiceUnavailable;
                context.Response.Headers["Retry-After"] = CurrentRetryAfterSeconds.ToString();
                context.Response.ContentType = "application/problem+json";

                var problem = new { title = "Service is temporarily unavailable", status = 503, detail = "The service is in maintenance mode. Please try again later." };
                await context.Response.WriteAsync(JsonSerializer.Serialize(problem));
                return;
            }

            await _next(context);
        }
    }
}