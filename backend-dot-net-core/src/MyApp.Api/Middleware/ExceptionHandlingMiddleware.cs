using System.Text.Json;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using System;

namespace MyApp.Api.Middleware
{
    public class ExceptionHandlingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<ExceptionHandlingMiddleware> _logger;
        private readonly MyApp.Api.Options.ExceptionHandlingOptions _options;

        public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger, IOptions<MyApp.Api.Options.ExceptionHandlingOptions> options)
        {
            _next = next;
            _logger = logger;
            _options = options.Value;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (Exception ex)
            {
                var errorId = Guid.NewGuid().ToString();
                var correlationId = context.Items.ContainsKey("CorrelationId") ? context.Items["CorrelationId"]?.ToString() : null;

                // Map exception to status
                var exType = ex.GetType().FullName ?? ex.GetType().Name;
                var status = 500;
                if (_options.ExceptionStatusMap != null && _options.ExceptionStatusMap.TryGetValue(exType, out var mapped)) status = mapped;
                else if (ex is UnauthorizedAccessException) status = 401;
                else if (ex is ArgumentException) status = 400;

                // Log structured error (do not leak PII)
                _logger.LogError(ex, "Unhandled exception (ErrorId={ErrorId}, CorrelationId={CorrelationId})", errorId, correlationId);

                // Build ProblemDetails response
                var problem = new ProblemDetails
                {
                    Type = $"https://httpstatuses.io/{status}",
                    Title = status >= 500 ? "An unexpected error occurred." : "A request error occurred.",
                    Status = status,
                    Detail = _options.ShowDetailedErrors ? ex.Message : "An error occurred while processing the request."
                };

                // If configured to show stack traces, include full exception text in extensions
                if (_options.ShowExceptionStackTrace)
                {
                    // Avoid modifying the core 'detail' used by client UX; expose details under extensions
                    problem.Extensions["exception"] = ex.ToString();
                    if (ex.InnerException != null)
                    {
                        problem.Extensions["innerException"] = ex.InnerException.ToString();
                    }
                }

                context.Response.Clear();
                context.Response.StatusCode = status;
                context.Response.ContentType = "application/problem+json";
                context.Response.Headers["X-Error-Id"] = errorId;
                if (!string.IsNullOrEmpty(correlationId)) context.Response.Headers["X-Correlation-ID"] = correlationId;

                var json = JsonSerializer.Serialize(problem, new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase });
                await context.Response.WriteAsync(json);
            }
        }
    }
}