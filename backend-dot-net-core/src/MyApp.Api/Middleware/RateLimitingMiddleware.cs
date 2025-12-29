using System;
using System.Net;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using MyApp.Api.Options;
using MyApp.Api.Services.RateLimit;

namespace MyApp.Api.Middleware
{
    public class RateLimitingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<RateLimitingMiddleware> _logger;
        private readonly RateLimitingOptions _options;
        private readonly IRateLimitStore _store;

        public RateLimitingMiddleware(RequestDelegate next, ILogger<RateLimitingMiddleware> logger, IOptions<RateLimitingOptions> options, IRateLimitStore store)
        {
            _next = next;
            _logger = logger;
            _options = options.Value;
            _store = store;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            if (!_options.Enabled)
            {
                await _next(context);
                return;
            }

            // Compute key (default per-IP)
            var key = context.Connection.RemoteIpAddress?.ToString() ?? "unknown";
            var policy = _options.DefaultPolicy;
            var limit = policy.Limit;
            var window = TimeSpan.FromSeconds(policy.WindowSeconds);
            var burst = policy.BurstCapacity;

            var res = await _store.TryConsumeAsync(key, limit, window, burst);
            context.Response.Headers["X-RateLimit-Limit"] = limit.ToString();
            context.Response.Headers["X-RateLimit-Remaining"] = res.Remaining.ToString();
            context.Response.Headers["X-RateLimit-Reset"] = res.ResetUnixSeconds.ToString();

            if (!res.Allowed)
            {
                context.Response.StatusCode = (int)HttpStatusCode.TooManyRequests;
                context.Response.Headers["Retry-After"] = res.RetryAfterSeconds.ToString();
                _logger.LogWarning("Request rate-limited (key={Key})", key);
                await context.Response.WriteAsync("Too Many Requests");
                return;
            }

            await _next(context);
        }
    }
}