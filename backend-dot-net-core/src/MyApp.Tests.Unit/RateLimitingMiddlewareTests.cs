using System.IO;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Xunit;
using MyApp.Api.Middleware;
using MyApp.Api.Options;
using MyApp.Api.Services.RateLimit;

namespace MyApp.Tests.Unit;

public class RateLimitingMiddlewareTests
{
    [Fact]
    public async Task Returns_429_When_Limit_Exceeded()
    {
        var options = Options.Create(new RateLimitingOptions { Enabled = true, DefaultPolicy = new RateLimitPolicy { Limit = 2, WindowSeconds = 60, BurstCapacity = 2 } });
        var loggerFactory = LoggerFactory.Create(builder => builder.AddDebug());
        var logger = loggerFactory.CreateLogger<RateLimitingMiddleware>();
        var store = new InMemoryRateLimitStore();

        var middleware = new RateLimitingMiddleware(async ctx =>
        {
            ctx.Response.StatusCode = 200;
            await ctx.Response.WriteAsync("ok");
        }, logger, options, store);

        for (int i = 0; i < 3; i++)
        {
            var context = new DefaultHttpContext();
            context.Response.Body = new MemoryStream();
            // Simulate different remote IPs not needed; using default
            await middleware.InvokeAsync(context);
            if (i < 2) Assert.Equal(200, context.Response.StatusCode);
            else Assert.Equal(429, context.Response.StatusCode);
        }

        [Fact]
        public async Task Returns_429_When_DefaultBurst_Allows_only_limit_one()
        {
            // Default BurstCapacity is not set explicitly here — it should be 1 by default
            var options = Options.Create(new RateLimitingOptions { Enabled = true, DefaultPolicy = new RateLimitPolicy { Limit = 1, WindowSeconds = 60 } });
            var loggerFactory = LoggerFactory.Create(builder => builder.AddDebug());
            var logger = loggerFactory.CreateLogger<RateLimitingMiddleware>();
            var store = new InMemoryRateLimitStore();

            var middleware = new RateLimitingMiddleware(async ctx =>
            {
                ctx.Response.StatusCode = 200;
                await ctx.Response.WriteAsync("ok");
            }, logger, options, store);

            // First request allowed
            var context1 = new DefaultHttpContext();
            context1.Response.Body = new MemoryStream();
            await middleware.InvokeAsync(context1);
            Assert.Equal(200, context1.Response.StatusCode);

            // Second request should be denied (429)
            var context2 = new DefaultHttpContext();
            context2.Response.Body = new MemoryStream();
            await middleware.InvokeAsync(context2);
            Assert.Equal(429, context2.Response.StatusCode);
        }
    }
}