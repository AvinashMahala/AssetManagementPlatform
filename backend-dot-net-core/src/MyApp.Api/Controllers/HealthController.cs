using Microsoft.AspNetCore.Mvc;

namespace MyApp.Api.Controllers;

/// <summary>
/// Health check endpoints for the API.
/// </summary>
[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/health")]
public class HealthController : ControllerBase
{
    /// <summary>
    /// Returns the overall health status of the API.
    /// </summary>
    /// <returns>200 OK with a simple health payload.</returns>
    [HttpGet]
    public IActionResult Get() => Ok(new { status = "ok" });
}
