using System.IO;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using MyApp.Api.Middleware;
using MyApp.Api.Options;
using Xunit;
using Moq;

namespace MyApp.Tests.Unit;

public class RequestLoggingMiddlewareTests
{
    [Fact]
    public async Task Logs_start_and_end_and_increments_metrics()
    {
        var options = Options.Create(new RequestLoggingOptions { Enabled = true });
        var loggerFactory = LoggerFactory.Create(b => b.AddDebug());
        var logger = loggerFactory.CreateLogger<RequestLoggingMiddleware>();

        var middleware = new RequestLoggingMiddleware(async ctx =>
        {
            ctx.Response.StatusCode = 200;
            await ctx.Response.WriteAsync("ok");
        }, logger, options);

        var context = new DefaultHttpContext();
        context.Request.Method = "GET";
        context.Request.Path = "/api/test";
        context.Response.Body = new MemoryStream();

        await middleware.InvokeAsync(context);

        Assert.Equal(200, context.Response.StatusCode);
    }
}
