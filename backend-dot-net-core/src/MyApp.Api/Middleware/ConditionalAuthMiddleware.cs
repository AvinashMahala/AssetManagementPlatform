using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.Authentication;

namespace MyApp.Api.Middleware;

/// <summary>
/// Tries to authenticate the request if an Authorization header is present.
/// It will *not* short-circuit the request on failure; instead it logs and continues.
/// This mirrors the Express `conditionalAuth` behavior that allows optional auth.
/// </summary>
public class ConditionalAuthMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ConditionalAuthMiddleware> _logger;

    /// <summary>
    /// Initializes a new instance of the <see cref="ConditionalAuthMiddleware"/> class.
    /// </summary>
    /// <param name="next">The next middleware in the pipeline.</param>
    /// <param name="logger">The logger used to record authentication events.</param>
    public ConditionalAuthMiddleware(RequestDelegate next, ILogger<ConditionalAuthMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    /// <summary>
    /// Tries to authenticate the request if an Authorization header is present.
    /// It will not short-circuit the request on failure; instead it logs and continues.
    /// </summary>
    /// <param name="context">The HTTP context for the current request.</param>
    /// <returns>A task that represents the asynchronous operation.</returns>
    public async Task InvokeAsync(HttpContext context)
    {
        // Only attempt if Authorization header exists
        if (context.Request.Headers.ContainsKey("Authorization"))
        {
            try
            {
                var result = await context.AuthenticateAsync();
                if (result?.Succeeded == true && result.Principal != null)
                {
                    context.User = result.Principal;
                }
                else if (result?.Failure != null)
                {
                    _logger.LogWarning(result.Failure, "Conditional auth: token present but authentication failed");
                }
            }
            catch (System.Exception ex)
            {
                _logger.LogWarning(ex, "Conditional auth: exception while trying to authenticate");
                // Swallow exceptions — do not fail the request
            }
        }

        await _next(context);
    }
}
