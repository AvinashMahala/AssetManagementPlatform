using System.Threading.Tasks;
using MyApp.Api.Services.RateLimit;
using System;
using Xunit;

namespace MyApp.Tests.Unit;

public class InMemoryRateLimitStoreTests
{
    [Fact]
    public async Task Allows_up_to_limit_then_denies()
    {
        var store = new InMemoryRateLimitStore();
        var key = "test-key";
        var limit = 5;
        var window = TimeSpan.FromSeconds(60);
        var burst = 5;

        int allowed = 0;
        for (int i = 0; i < 7; i++)
        {
            var res = await store.TryConsumeAsync(key, limit, window, burst);
            if (res.Allowed) allowed++;
        }

        Assert.Equal(5, allowed);
    }
}