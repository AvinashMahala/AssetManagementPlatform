using System;
using System.Diagnostics;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Prometheus;
using MyApp.Api.Options;

namespace MyApp.Api.Middleware
{
    public class RequestLoggingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<RequestLoggingMiddleware> _logger;
        private readonly RequestLoggingOptions _options;

        private static readonly Counter RequestCounter = Metrics.CreateCounter("myapp_http_requests_total", "Total HTTP requests.", new[] { "method", "path", "status" });
        private static readonly Histogram RequestDuration = Metrics.CreateHistogram("myapp_http_request_duration_seconds", "Request duration in seconds.", new[] { "method", "path" });

        public RequestLoggingMiddleware(RequestDelegate next, ILogger<RequestLoggingMiddleware> logger, IOptions<RequestLoggingOptions> options)
        {
            _next = next;
            _logger = logger;
            _options = options?.Value ?? new RequestLoggingOptions();
        }

        public async Task InvokeAsync(HttpContext context)
        {
            if (!_options.Enabled)
            {
                await _next(context);
                return;
            }

            var sw = Stopwatch.StartNew();
            var method = context.Request.Method;
            var path = context.Request.Path.ToString();
            var correlationId = context.Items.ContainsKey("CorrelationId") ? context.Items["CorrelationId"]?.ToString() : context.Request.Headers["X-Correlation-ID"].ToString();

            _logger.LogInformation("Request start {Method} {Path} {CorrelationId}", method, path, correlationId);

            try
            {
                using (RequestDuration.WithLabels(method, path).NewTimer())
                {
                    await _next(context);
                }
            }
            catch (Exception ex)
            {
                sw.Stop();
                var status = 500;
                RequestCounter.WithLabels(method, path, status.ToString()).Inc();
                _logger.LogError(ex, "Request error {Method} {Path} {Status} {DurationMs}ms {CorrelationId}", method, path, status, sw.ElapsedMilliseconds, correlationId);
                throw; // let ExceptionHandlingMiddleware handle response
            }

            sw.Stop();
            var statusCode = context.Response?.StatusCode ?? 0;
            RequestCounter.WithLabels(method, path, statusCode.ToString()).Inc();
            _logger.LogInformation("Request end {Method} {Path} {Status} {DurationMs}ms {CorrelationId}", method, path, statusCode, sw.ElapsedMilliseconds, correlationId);
        }
    }
}
