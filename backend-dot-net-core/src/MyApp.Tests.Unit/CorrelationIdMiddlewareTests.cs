using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Xunit;
using MyApp.Api.Middleware;
using MyApp.Api.Options;
using System.IO;
using System.Text;

namespace MyApp.Tests.Unit;

public class CorrelationIdMiddlewareTests
{
    [Fact]
    public async Task Adds_CorrelationId_Header_WhenMissing()
    {
        var options = Options.Create(new CorrelationIdOptions());
        var loggerFactory = LoggerFactory.Create(builder => builder.AddDebug());
        var logger = loggerFactory.CreateLogger<CorrelationIdMiddleware>();

        var middleware = new CorrelationIdMiddleware(async ctx =>
        {
            ctx.Response.StatusCode = 200;
            await ctx.Response.WriteAsync("ok");
        }, logger, options);

        var context = new DefaultHttpContext();
        context.Response.Body = new MemoryStream();

        await middleware.InvokeAsync(context);

        Assert.True(context.Response.Headers.ContainsKey("X-Correlation-ID"));
        var val = context.Response.Headers["X-Correlation-ID"].FirstOrDefault();
        Assert.False(string.IsNullOrEmpty(val));
    }

    [Fact]
    public async Task Returns_Same_CorrelationId_WhenProvided()
    {
        var options = Options.Create(new CorrelationIdOptions());
        var loggerFactory = LoggerFactory.Create(builder => builder.AddDebug());
        var logger = loggerFactory.CreateLogger<CorrelationIdMiddleware>();

        var middleware = new CorrelationIdMiddleware(async ctx =>
        {
            ctx.Response.StatusCode = 200;
            await ctx.Response.WriteAsync("ok");
        }, logger, options);

        var context = new DefaultHttpContext();
        context.Request.Headers["X-Correlation-ID"] = "test-id-123";
        context.Response.Body = new MemoryStream();

        await middleware.InvokeAsync(context);

        Assert.True(context.Response.Headers.ContainsKey("X-Correlation-ID"));
        var val = context.Response.Headers["X-Correlation-ID"].FirstOrDefault();
        Assert.Equal("test-id-123", val);
    }
}