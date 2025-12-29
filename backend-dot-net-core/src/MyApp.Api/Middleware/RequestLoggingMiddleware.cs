using System;
using System.Diagnostics;
using System.IO;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using MyApp.Api.Options;
using Prometheus;

namespace MyApp.Api.Middleware
{
    public class RequestLoggingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<RequestLoggingMiddleware> _logger;
        private readonly RequestLoggingOptions _options;

        private static readonly Counter RequestCounter = Metrics.CreateCounter("myapp_http_requests_total", "Total HTTP requests", new CounterConfiguration
        {
            LabelNames = new[] { "method", "path", "status" }
        });

        private static readonly Histogram RequestDuration = Metrics.CreateHistogram("myapp_http_request_duration_seconds", "HTTP request duration seconds", new HistogramConfiguration
        {
            LabelNames = new[] { "method", "path" },
            Buckets = Histogram.ExponentialBuckets(0.01, 2, 10)
        });

        public RequestLoggingMiddleware(RequestDelegate next, ILogger<RequestLoggingMiddleware> logger, IOptions<RequestLoggingOptions> options)
        {
            _next = next;
            _logger = logger;
            _options = options.Value;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            if (!_options.Enabled)
            {
                await _next(context);
                return;
            }

            var sw = Stopwatch.StartNew();
            var path = context.Request.Path.HasValue ? context.Request.Path.Value : "";
            var method = context.Request.Method;
            string correlationId = context.Items.ContainsKey("CorrelationId") ? context.Items["CorrelationId"]?.ToString() : null;

            _logger.LogInformation("Request start {Method} {Path} CorrelationId={CorrelationId}", method, path, correlationId);

            // Optionally capture request body (bounded)
            string requestBody = null;
            if (_options.IncludeRequestBody && context.Request.ContentLength.GetValueOrDefault() > 0 && context.Request.Body.CanSeek)
            {
                try
                {
                    context.Request.Body.Seek(0, SeekOrigin.Begin);
                    using var reader = new StreamReader(context.Request.Body, Encoding.UTF8, leaveOpen: true);
                    var max = Math.Min(_options.MaxBodySizeBytes, (int)context.Request.ContentLength.GetValueOrDefault());
                    var buffer = new char[max];
                    var read = await reader.ReadBlockAsync(buffer, 0, max);
                    requestBody = new string(buffer, 0, read);
                    context.Request.Body.Seek(0, SeekOrigin.Begin);
                }
                catch
                {
                    // ignore body capture errors
                }
            }

            int statusCode = 200;
            using (RequestDuration.Labels(method, path).NewTimer())
            {
                try
                {
                    await _next(context);
                    statusCode = context.Response?.StatusCode ?? 200;
                }
                catch (Exception ex)
                {
                    statusCode = 500;
                    _logger.LogError(ex, "Unhandled exception while processing request {Method} {Path}", method, path);
                    throw;
                }
            }

            sw.Stop();
            RequestCounter.Labels(method, path, statusCode.ToString()).Inc();

            _logger.LogInformation("Request end {Method} {Path} Status={Status} DurationMs={Duration} CorrelationId={CorrelationId}", method, path, statusCode, sw.Elapsed.TotalMilliseconds, correlationId);
        }
    }
}