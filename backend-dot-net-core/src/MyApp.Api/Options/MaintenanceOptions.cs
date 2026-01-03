namespace MyApp.Api.Options
{
    public class MaintenanceOptions
    {
        public bool Enabled { get; set; } = false;
        public int RetryAfterSeconds { get; set; } = 3600;
        // Optional bypass header key to allow manual bypass for health checks or admins
        public string BypassHeader { get; set; } = "X-Maintenance-Bypass";
    }
}