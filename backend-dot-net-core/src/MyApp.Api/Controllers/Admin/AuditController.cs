using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MyApp.Repositories;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;

namespace MyApp.Api.Controllers.Admin;

[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/admin/audit")]
[Authorize]
public class AuditController(AppDbContext db) : ControllerBase
{
    private readonly AppDbContext _db = db;

    [HttpGet]
    public async Task<IActionResult> List([FromQuery] string? actor, [FromQuery] string? action, [FromQuery] string? resourceType, [FromQuery] int page = 1, [FromQuery] int pageSize = 50)
    {
        var q = _db.AuditEvents.AsQueryable();
        if (!string.IsNullOrWhiteSpace(actor)) q = q.Where(a => a.Actor.Contains(actor));
        if (!string.IsNullOrWhiteSpace(action)) q = q.Where(a => a.Action == action);
        if (!string.IsNullOrWhiteSpace(resourceType)) q = q.Where(a => a.ResourceType == resourceType);

        var total = await q.CountAsync();
        var items = await q.OrderByDescending(a => a.OccurredAt).Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();

        return Ok(new { items = items.Select(i => new { i.Id, i.Actor, i.Action, i.ResourceType, i.ResourceId, i.Data, i.OccurredAt }), total, page, pageSize });
    }
}