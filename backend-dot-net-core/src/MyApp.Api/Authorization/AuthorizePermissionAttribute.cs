using System;
using Microsoft.AspNetCore.Authorization;

namespace MyApp.Api.Authorization;

[AttributeUsage(AttributeTargets.Method | AttributeTargets.Class, AllowMultiple = true, Inherited = true)]
public class AuthorizePermissionAttribute : AuthorizeAttribute
{
    public AuthorizePermissionAttribute(string permission)
    {
        if (string.IsNullOrWhiteSpace(permission)) throw new ArgumentNullException(nameof(permission));
        Policy = $"Permission:{permission}";
    }
}