using System.Collections.Generic;

namespace MyApp.Api.Options
{
    public class RateLimitPolicy
    {
        public int Limit { get; set; } = 100; // requests
        public int WindowSeconds { get; set; } = 60; // seconds
        // By default make burstCapacity equal to 100 to avoid surprising large bursts
        public int BurstCapacity { get; set; } = 100;
        public string ApplyTo { get; set; } = "IP"; // IP, APIKey, User
    }

    public class RateLimitingOptions
    {
        public bool Enabled { get; set; } = true;
        public string Mode { get; set; } = "Local"; // Local or Distributed
        public RateLimitPolicy DefaultPolicy { get; set; } = new RateLimitPolicy();
        public Dictionary<string, RateLimitPolicy> PerRoutePolicies { get; set; } = new Dictionary<string, RateLimitPolicy>();
        // Redis connection string etc. to be added for Distributed mode
    }
}