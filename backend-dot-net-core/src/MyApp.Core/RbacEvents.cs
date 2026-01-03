using System;

namespace MyApp.Core
{
    public record UserPermissionsInvalidatedEvent(Guid UserId);
    public record RolePermissionsUpdatedEvent(Guid RoleId);
}
