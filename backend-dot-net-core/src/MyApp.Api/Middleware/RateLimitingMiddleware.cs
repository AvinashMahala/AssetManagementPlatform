using System;
using System.Net;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using MyApp.Api.Options;
using MyApp.Api.Services.RateLimit;
using Prometheus;
using MyApp.Api.Security;

namespace MyApp.Api.Middleware
{
    public class RateLimitingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<RateLimitingMiddleware> _logger;
        private readonly RateLimitingOptions _options;
        private readonly IRateLimitStore _store;
        private readonly FailureTracker _failureTracker;

        // Prometheus metrics
        private static readonly Counter _refreshRateLimited = Metrics.CreateCounter("auth_refresh_rate_limited_total", "Number of times the refresh endpoint was rate limited");
        private static readonly Counter _refreshFailed = Metrics.CreateCounter("auth_refresh_failed_total", "Number of failed refresh attempts (400/401)");
        private static readonly Counter _refreshAnomaly = Metrics.CreateCounter("auth_refresh_anomaly_total", "Number of detected refresh failure anomalies");

        public RateLimitingMiddleware(RequestDelegate next, ILogger<RateLimitingMiddleware> logger, IOptions<RateLimitingOptions> options, IRateLimitStore store, FailureTracker failureTracker)
        {
            _next = next;
            _logger = logger;
            _options = options.Value;
            _store = store;
            _failureTracker = failureTracker;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            if (!_options.Enabled)
            {
                await _next(context);
                return;
            }

            var path = context.Request.Path.Value?.ToLowerInvariant() ?? string.Empty;
            var method = context.Request.Method?.ToUpperInvariant() ?? "GET";

            // Determine applicable policy (method-prefixed key first, then path-only)
            RateLimitPolicy policy = _options.DefaultPolicy;
            var methodKey = $"{method}:{path}";
            if (_options.PerRoutePolicies.TryGetValue(methodKey, out var p1))
            {
                policy = p1;
            }
            else if (_options.PerRoutePolicies.TryGetValue(path, out var p2))
            {
                policy = p2;
            }

            var limit = policy.Limit;
            var window = TimeSpan.FromSeconds(policy.WindowSeconds);
            var burst = policy.BurstCapacity;

            // Compute key based on ApplyTo
            string key;
            if (string.Equals(policy.ApplyTo, "User", StringComparison.OrdinalIgnoreCase))
            {
                // If authenticated, use user id; fallback to IP
                var userId = context.User?.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
                key = userId is not null ? $"user:{userId}:{methodKey}" : $"ip:{context.Connection.RemoteIpAddress?.ToString() ?? "unknown"}:{methodKey}";
            }
            else if (string.Equals(policy.ApplyTo, "ApiKey", StringComparison.OrdinalIgnoreCase))
            {
                // Not implemented: API key extraction
                key = $"ip:{context.Connection.RemoteIpAddress?.ToString() ?? "unknown"}:{methodKey}";
            }
            else
            {
                // Default apply to IP
                key = $"ip:{context.Connection.RemoteIpAddress?.ToString() ?? "unknown"}:{methodKey}";
            }

            var res = await _store.TryConsumeAsync(key, limit, window, burst);
            context.Response.Headers["X-RateLimit-Limit"] = limit.ToString();
            context.Response.Headers["X-RateLimit-Remaining"] = res.Remaining.ToString();
            context.Response.Headers["X-RateLimit-Reset"] = res.ResetUnixSeconds.ToString();

            if (!res.Allowed)
            {
                context.Response.StatusCode = (int)HttpStatusCode.TooManyRequests;
                context.Response.Headers["Retry-After"] = res.RetryAfterSeconds.ToString();
                _logger.LogWarning("Request rate-limited (key={Key}) path={Path}", key, path);

                // If this is the refresh endpoint, emit metric
                if (path.Contains("auth/refresh-token"))
                {
                    _refreshRateLimited.Inc();
                }

                await context.Response.WriteAsync("Too Many Requests");
                return;
            }

            // Wrap downstream call so we can inspect response status for anomaly detection on the refresh endpoint
            await _next(context);

            if (path.Contains("auth/refresh-token"))
            {
                var status = context.Response.StatusCode;
                if (status == 400 || status == 401)
                {
                    _refreshFailed.Inc();
                    // Track failures per remote IP
                    var ip = context.Connection.RemoteIpAddress?.ToString() ?? "unknown";
                    var keyFailure = $"refresh-fail:{ip}";
                    _failureTracker.RecordFailure(keyFailure);
                    var count = _failureTracker.CountRecent(keyFailure);
                    _logger.LogWarning("Refresh failure detected for IP {Ip} (count {Count} in window)", ip, count);
                    if (_failureTracker.IsAnomalous(keyFailure))
                    {
                        _refreshAnomaly.Inc();
                        _logger.LogWarning("Anomalous refresh activity detected for IP {Ip} (count {Count})", ip, count);
                    }
                }
            }
        }
    }
}