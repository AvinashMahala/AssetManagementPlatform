using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using MyApp.Api.Middleware;
using MyApp.Api.Options;
using Xunit;

namespace MyApp.Tests.Unit;

public class MaintenanceMiddlewareTests
{
    [Fact]
    public async Task Returns_503_when_enabled()
    {
        var options = Options.Create(new MaintenanceOptions { Enabled = true, RetryAfterSeconds = 10 });
        var loggerFactory = LoggerFactory.Create(b => b.AddDebug());
        var logger = loggerFactory.CreateLogger<MaintenanceMiddleware>();

        // initialize static toggle
        MyApp.Api.Middleware.MaintenanceMiddleware.IsMaintenanceEnabled = true;
        MyApp.Api.Middleware.MaintenanceMiddleware.CurrentRetryAfterSeconds = 10;

        var middleware = new MaintenanceMiddleware(async ctx =>
        {
            ctx.Response.StatusCode = 200;
            await ctx.Response.WriteAsync("ok");
        }, logger, options);

        var context = new DefaultHttpContext();
        context.Response.Body = new System.IO.MemoryStream();

        await middleware.InvokeAsync(context);

        Assert.Equal(503, context.Response.StatusCode);
    }
}
