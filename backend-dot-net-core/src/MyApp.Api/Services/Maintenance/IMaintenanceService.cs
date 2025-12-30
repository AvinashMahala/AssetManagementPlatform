namespace MyApp.Api.Services.Maintenance
{
    public interface IMaintenanceService
    {
        bool Enabled { get; }
        int RetryAfterSeconds { get; }
        void SetEnabled(bool enabled, int retryAfterSeconds = 3600);
    }
}