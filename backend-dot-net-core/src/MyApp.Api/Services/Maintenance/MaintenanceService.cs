using Microsoft.Extensions.Options;
using MyApp.Api.Options;

namespace MyApp.Api.Services.Maintenance
{
    public class MaintenanceService : IMaintenanceService
    {
        private volatile bool _enabled;
        private volatile int _retryAfterSeconds;

        public MaintenanceService(IOptions<MaintenanceOptions> options)
        {
            var o = options?.Value ?? new MaintenanceOptions();
            _enabled = o.Enabled;
            _retryAfterSeconds = o.RetryAfterSeconds;
        }

        public bool Enabled => _enabled;
        public int RetryAfterSeconds => _retryAfterSeconds;

        public void SetEnabled(bool enabled, int retryAfterSeconds = 3600)
        {
            _enabled = enabled;
            _retryAfterSeconds = retryAfterSeconds;
        }
    }
}