using System.Text.Json;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using MyApp.Api.Services.Maintenance;
using Microsoft.Extensions.Options;
using MyApp.Api.Options;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using System;
using Microsoft.Extensions.Primitives;

namespace MyApp.Api.Middleware
{
    public class MaintenanceMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<MaintenanceMiddleware> _logger;
        private readonly IMaintenanceService _service;
        private readonly MaintenanceOptions _options;

        public MaintenanceMiddleware(RequestDelegate next, ILogger<MaintenanceMiddleware> logger, IMaintenanceService service, IOptions<MaintenanceOptions> options)
        {
            _next = next;
            _logger = logger;
            _service = service;
            _options = options?.Value ?? new MaintenanceOptions();
        }

        public async Task InvokeAsync(HttpContext context)
        {
            // Check runtime flag first
            if (_service.Enabled)
            {
                // Bypass header
                if (!string.IsNullOrEmpty(_options.BypassHeader) && context.Request.Headers.TryGetValue(_options.BypassHeader, out var v) && !StringValues.IsNullOrEmpty(v))
                {
                    _logger.LogInformation("Maintenance bypass header present, allowing request.");
                    await _next(context);
                    return;
                }

                // Admin bypass via role
                if (context.User?.Identity?.IsAuthenticated == true && context.User.IsInRole("Admin"))
                {
                    _logger.LogInformation("Admin bypassing maintenance mode.");
                    await _next(context);
                    return;
                }

                var retry = _service.RetryAfterSeconds;
                context.Response.Clear();
                context.Response.StatusCode = 503;
                context.Response.ContentType = "application/problem+json";
                context.Response.Headers["Retry-After"] = retry.ToString();

                var problem = new ProblemDetails
                {
                    Status = 503,
                    Title = "Service temporarily unavailable",
                    Detail = "The service is temporarily in maintenance mode.",
                    Instance = context.Request.Path
                };

                var json = JsonSerializer.Serialize(problem, new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase });
                await context.Response.WriteAsync(json);
                _logger.LogWarning("Request blocked due to maintenance mode (RetryAfter={Retry})", retry);
                return;
            }

            await _next(context);
        }
    }
}
