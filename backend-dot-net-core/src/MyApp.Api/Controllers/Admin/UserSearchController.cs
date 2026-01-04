using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MyApp.Services;
using System.Linq;
using System.Threading.Tasks;

namespace MyApp.Api.Controllers.Admin;

[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/admin/user-search")]
[Authorize]
public class UserSearchController(IRoleAdminService svc) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> Search([FromQuery] string? q)
    {
        var users = await svc.SearchUsersAsync(q);
        return Ok(users);
    }
}
