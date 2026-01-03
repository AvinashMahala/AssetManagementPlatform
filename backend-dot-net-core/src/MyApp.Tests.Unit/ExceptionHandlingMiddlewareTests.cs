using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Xunit;
using MyApp.Api.Middleware;
using MyApp.Api.Options;
using System.IO;
using System.Text.Json;
using System.Linq;

namespace MyApp.Tests.Unit;

public class ExceptionHandlingMiddlewareTests
{
    [Fact]
    public async Task Returns_400_On_ArgumentException()
    {
        var options = Options.Create(new ExceptionHandlingOptions { ShowDetailedErrors = true });
        var loggerFactory = LoggerFactory.Create(builder => builder.AddDebug());
        var logger = loggerFactory.CreateLogger<ExceptionHandlingMiddleware>();

        var middleware = new ExceptionHandlingMiddleware(async ctx =>
        {
            throw new System.ArgumentException("bad arg");
        }, logger, options);

        var context = new DefaultHttpContext();
        context.Response.Body = new MemoryStream();

        await middleware.InvokeAsync(context);

        Assert.Equal(400, context.Response.StatusCode);
        Assert.Equal("application/problem+json", context.Response.ContentType);

        context.Response.Body.Position = 0;
        using var sr = new StreamReader(context.Response.Body);
        var body = await sr.ReadToEndAsync();
        Assert.True(body.Contains("bad arg"));
    }

    [Fact]
    public async Task Returns_500_On_GenericException()
    {
        var options = Options.Create(new ExceptionHandlingOptions { ShowDetailedErrors = false });
        var loggerFactory = LoggerFactory.Create(builder => builder.AddDebug());
        var logger = loggerFactory.CreateLogger<ExceptionHandlingMiddleware>();

        var middleware = new ExceptionHandlingMiddleware(async ctx =>
        {
            throw new System.Exception("boom");
        }, logger, options);

        var context = new DefaultHttpContext();
        context.Response.Body = new MemoryStream();

        await middleware.InvokeAsync(context);

        Assert.Equal(500, context.Response.StatusCode);
        Assert.Equal("application/problem+json", context.Response.ContentType);

        context.Response.Body.Position = 0;
        using var sr = new StreamReader(context.Response.Body);
        var body = await sr.ReadToEndAsync();
        Assert.False(body.Contains("boom")); // detailed disabled
    }
}