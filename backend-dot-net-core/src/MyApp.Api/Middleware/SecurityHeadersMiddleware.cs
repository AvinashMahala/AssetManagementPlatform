using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using MyApp.Api.Options;

namespace MyApp.Api.Middleware
{
    public class SecurityHeadersMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<SecurityHeadersMiddleware> _logger;
        private readonly SecurityHeadersOptions _options;

        public SecurityHeadersMiddleware(RequestDelegate next, ILogger<SecurityHeadersMiddleware> logger, IOptions<SecurityHeadersOptions> options)
        {
            _next = next;
            _logger = logger;
            _options = options?.Value ?? new SecurityHeadersOptions();
        }

        public async Task InvokeAsync(HttpContext context)
        {
            context.Response.OnStarting(() =>
            {
                if (_options.EnableCsp && !string.IsNullOrEmpty(_options.CspValue))
                    context.Response.Headers["Content-Security-Policy"] = _options.CspValue;

                if (_options.EnableHsts && !string.IsNullOrEmpty(_options.HstsValue))
                    context.Response.Headers["Strict-Transport-Security"] = _options.HstsValue;

                if (_options.EnableXContentTypeOptions && !string.IsNullOrEmpty(_options.XContentTypeOptionsValue))
                    context.Response.Headers["X-Content-Type-Options"] = _options.XContentTypeOptionsValue;

                if (_options.EnableXFrameOptions && !string.IsNullOrEmpty(_options.XFrameOptionsValue))
                    context.Response.Headers["X-Frame-Options"] = _options.XFrameOptionsValue;

                if (_options.EnableReferrerPolicy && !string.IsNullOrEmpty(_options.ReferrerPolicyValue))
                    context.Response.Headers["Referrer-Policy"] = _options.ReferrerPolicyValue;

                return System.Threading.Tasks.Task.CompletedTask;
            });

            await _next(context);
        }
    }
}
