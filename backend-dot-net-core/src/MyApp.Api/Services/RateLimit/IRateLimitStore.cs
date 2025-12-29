using System;
using System.Threading.Tasks;

namespace MyApp.Api.Services.RateLimit
{
    public class RateLimitResult
    {
        public bool Allowed { get; set; }
        public int Remaining { get; set; }
        public long RetryAfterSeconds { get; set; }
        public long ResetUnixSeconds { get; set; }
    }

    public interface IRateLimitStore
    {
        Task<RateLimitResult> TryConsumeAsync(string key, int limit, TimeSpan window, int burstCapacity);
    }
}