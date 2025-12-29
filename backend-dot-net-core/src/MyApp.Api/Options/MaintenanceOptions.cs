namespace MyApp.Api.Options
{
    public class MaintenanceOptions
    {
        public bool Enabled { get; set; } = false;
        public int RetryAfterSeconds { get; set; } = 3600; // default 1 hour
        // If true, requests with a valid admin bypass header or admin claim will bypass maintenance mode
        public bool AllowAdminBypass { get; set; } = true;
        public string BypassHeaderName { get; set; } = "X-Maintenance-Bypass";
    }
}