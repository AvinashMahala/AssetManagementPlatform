using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MyApp.Services;
using System.Linq;
using System.Threading.Tasks;

namespace MyApp.Api.Controllers.Admin;

[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/admin/users")]
[Authorize]
public class UsersController(IRoleAdminService svc) : ControllerBase
{
    private readonly IRoleAdminService _svc = svc;

    [HttpGet]
    public async Task<IActionResult> Search([FromQuery] string? q)
    {
        var users = await _svc.SearchUsersAsync(q);
        var outUsers = users.Select(u => new { id = u.Id, email = u.Email, username = u.Username, name = u.DisplayName });
        return Ok(outUsers);
    }
}
