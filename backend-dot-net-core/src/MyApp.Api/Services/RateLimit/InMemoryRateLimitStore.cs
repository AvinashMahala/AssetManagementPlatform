using System;
using System.Collections.Concurrent;
using System.Threading.Tasks;

namespace MyApp.Api.Services.RateLimit
{
    internal class TokenBucket
    {
        public double Tokens;
        public long LastRefillUnixSeconds;
    }

    public class InMemoryRateLimitStore : IRateLimitStore
    {
        private readonly ConcurrentDictionary<string, TokenBucket> _buckets = new();

        public Task<RateLimitResult> TryConsumeAsync(string key, int limit, TimeSpan window, int burstCapacity)
        {
            var now = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
            var bucket = _buckets.GetOrAdd(key, _ => new TokenBucket { Tokens = burstCapacity, LastRefillUnixSeconds = now });

            // Refill tokens
            var elapsed = now - bucket.LastRefillUnixSeconds;
            if (elapsed > 0)
            {
                var refillPerSec = (double)limit / window.TotalSeconds;
                var refill = elapsed * refillPerSec;
                bucket.Tokens = Math.Min(burstCapacity, bucket.Tokens + refill);
                bucket.LastRefillUnixSeconds = now;
            }

            var allowed = bucket.Tokens >= 1.0;
            if (allowed)
            {
                bucket.Tokens -= 1.0;
            }

            var remaining = (int)Math.Floor(Math.Max(0, bucket.Tokens));
            var retryAfter = allowed ? 0 : (int)Math.Ceiling(1.0 / ((double)limit / window.TotalSeconds));
            var reset = now + (int)window.TotalSeconds;

            var result = new RateLimitResult
            {
                Allowed = allowed,
                Remaining = remaining,
                RetryAfterSeconds = retryAfter,
                ResetUnixSeconds = reset
            };

            return Task.FromResult(result);
        }
    }
}