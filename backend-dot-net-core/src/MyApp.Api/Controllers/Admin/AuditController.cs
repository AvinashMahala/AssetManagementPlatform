using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MyApp.Interfaces;
using MyApp.Api.Responses;
using MyApp.Api.Mapping;

namespace MyApp.Api.Controllers.Admin;

[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/admin/audit")]
[Authorize]
public class AuditController(IAuditService service) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> List([FromQuery] string? actor, [FromQuery] string? action, [FromQuery] string? resourceType, [FromQuery] int page = 1, [FromQuery] int pageSize = 50)
    {
        var items = await service.ListAsync(actor, action, resourceType, page, pageSize);
        var total = await service.CountAsync(actor, action, resourceType);

        return Ok(new { items = items.Select(i => i.ToDto()), total, page, pageSize });
    }
}
