using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using MyApp.Api.Middleware;
using MyApp.Api.Options;
using Xunit;

namespace MyApp.Tests.Unit;

public class SecurityHeadersMiddlewareTests
{
    [Fact]
    public async Task Adds_security_headers_when_enabled()
    {
        var options = Options.Create(new SecurityHeadersOptions());
        var loggerFactory = LoggerFactory.Create(b => b.AddDebug());
        var logger = loggerFactory.CreateLogger<SecurityHeadersMiddleware>();

        var middleware = new SecurityHeadersMiddleware(async ctx =>
        {
            ctx.Response.StatusCode = 200;
            await ctx.Response.WriteAsync("ok");
        }, logger, options);

        var context = new DefaultHttpContext();
        context.Response.Body = new System.IO.MemoryStream();

        await middleware.InvokeAsync(context);

        Assert.Equal("nosniff", context.Response.Headers["X-Content-Type-Options"]);
        Assert.Equal("DENY", context.Response.Headers["X-Frame-Options"]);
    }
}
