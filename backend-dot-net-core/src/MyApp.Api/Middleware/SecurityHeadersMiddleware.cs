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
            _options = options.Value;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            if (_options.Enabled)
            {
                if (!string.IsNullOrEmpty(_options.ContentSecurityPolicy))
                    context.Response.Headers["Content-Security-Policy"] = _options.ContentSecurityPolicy;

                if (_options.StrictTransportSecurity)
                    context.Response.Headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains";

                if (!string.IsNullOrEmpty(_options.XContentTypeOptions))
                    context.Response.Headers["X-Content-Type-Options"] = _options.XContentTypeOptions;

                if (!string.IsNullOrEmpty(_options.XFrameOptions))
                    context.Response.Headers["X-Frame-Options"] = _options.XFrameOptions;

                if (!string.IsNullOrEmpty(_options.ReferrerPolicy))
                    context.Response.Headers["Referrer-Policy"] = _options.ReferrerPolicy;
            }

            await _next(context);
        }
    }
}