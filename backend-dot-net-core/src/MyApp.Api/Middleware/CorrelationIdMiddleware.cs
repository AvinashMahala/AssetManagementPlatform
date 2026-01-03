using System.Diagnostics;
using System.Linq;
using System.Collections.Generic;
using Microsoft.Extensions.Options;
using Microsoft.Extensions.Primitives;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.Http;
using System.Threading.Tasks;
using System;

namespace MyApp.Api.Middleware
{
    public class CorrelationIdMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<CorrelationIdMiddleware> _logger;
        private readonly MyApp.Api.Options.CorrelationIdOptions _options;

        public CorrelationIdMiddleware(RequestDelegate next, ILogger<CorrelationIdMiddleware> logger, IOptions<MyApp.Api.Options.CorrelationIdOptions> options)
        {
            _next = next;
            _logger = logger;
            _options = options.Value;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            var header = _options.HeaderName ?? "X-Correlation-ID";
            string correlationId;

            if (context.Request.Headers.TryGetValue(header, out StringValues values) && !StringValues.IsNullOrEmpty(values))
            {
                correlationId = values.First();
            }
            else if (_options.UseTraceIdIfMissing && Activity.Current?.TraceId != null && Activity.Current.TraceId != default)
            {
                correlationId = Activity.Current.TraceId.ToString();
            }
            else
            {
                correlationId = Guid.NewGuid().ToString();
            }

            // Store in HttpContext for later access
            context.Items["CorrelationId"] = correlationId;

            // Add to response header
            context.Response.OnStarting(() =>
            {
                context.Response.Headers[header] = correlationId;
                return Task.CompletedTask;
            });

            using (_logger.BeginScope(new Dictionary<string, object> { { "CorrelationId", correlationId } }))
            {
                if (Activity.Current != null)
                {
                    Activity.Current.SetTag("correlation_id", correlationId);
                }

                await _next(context);
            }
        }
    }
}