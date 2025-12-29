using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MyApp.Api.Options;

namespace MyApp.Api.Controllers.Admin
{
    [ApiController]
    [Route("api/admin/maintenance")]
    [Authorize(Roles = "Admin")]
    public class MaintenanceController : ControllerBase
    {
        [HttpPatch]
        public IActionResult Patch([FromBody] MaintenanceOptions model)
        {
            if (model == null) return BadRequest();
            MyApp.Api.Middleware.MaintenanceMiddleware.IsMaintenanceEnabled = model.Enabled;
            MyApp.Api.Middleware.MaintenanceMiddleware.CurrentRetryAfterSeconds = model.RetryAfterSeconds;
            return Ok(new { enabled = MyApp.Api.Middleware.MaintenanceMiddleware.IsMaintenanceEnabled, retryAfterSeconds = MyApp.Api.Middleware.MaintenanceMiddleware.CurrentRetryAfterSeconds });
        }

        [HttpGet]
        public IActionResult Get() => Ok(new { enabled = MyApp.Api.Middleware.MaintenanceMiddleware.IsMaintenanceEnabled, retryAfterSeconds = MyApp.Api.Middleware.MaintenanceMiddleware.CurrentRetryAfterSeconds });
    }
}