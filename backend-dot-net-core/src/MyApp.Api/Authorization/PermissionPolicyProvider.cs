using Microsoft.AspNetCore.Authorization;
using System.Threading.Tasks;

namespace MyApp.Api.Authorization;

public class PermissionPolicyProvider : IAuthorizationPolicyProvider
{
    // Fallback to default provider for other policies
    private readonly DefaultAuthorizationPolicyProvider _fallback;

    public PermissionPolicyProvider(Microsoft.Extensions.Options.IOptions<Microsoft.AspNetCore.Authorization.AuthorizationOptions> options)
    {
        _fallback = new DefaultAuthorizationPolicyProvider(options);
    }

    public Task<AuthorizationPolicy> GetDefaultPolicyAsync() => _fallback.GetDefaultPolicyAsync();
    public Task<AuthorizationPolicy?> GetFallbackPolicyAsync() => _fallback.GetFallbackPolicyAsync();

    public Task<AuthorizationPolicy?> GetPolicyAsync(string policyName)
    {
        // We encode permission policies as: "Permission:properties:property:create"
        if (policyName.StartsWith("Permission:"))
        {
            var perm = policyName.Substring("Permission:".Length);
            var builder = new AuthorizationPolicyBuilder();
            builder.AddRequirements(new PermissionRequirement(perm));
            return Task.FromResult<AuthorizationPolicy?>(builder.Build());
        }

        return _fallback.GetPolicyAsync(policyName);
    }
}