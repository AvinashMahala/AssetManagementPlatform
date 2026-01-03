using System;
using Microsoft.Extensions.Logging;
using MyApp.Core;

namespace MyApp.Api.Startup;

// Small subscriber that listens for user invalidation events and calls the PermissionEvaluator
using Microsoft.Extensions.DependencyInjection;

public class RbacInvalidationSubscriber
{
    public RbacInvalidationSubscriber(IEventBus bus, IServiceProvider provider, ILogger<RbacInvalidationSubscriber> logger)
    {
        bus.Subscribe<UserPermissionsInvalidatedEvent>(async ev => {
            logger.LogInformation("RBAC: invalidating perms for user {UserId}", ev.UserId);
            using var scope = provider.CreateScope();
            try
            {
                var evaluator = scope.ServiceProvider.GetService<MyApp.Api.Authorization.PermissionEvaluator>();
                evaluator?.InvalidateUserPermissions(ev.UserId);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed to invalidate permissions for user {UserId}", ev.UserId);
            }

            await System.Threading.Tasks.Task.CompletedTask;
        });

        // Listen for role updates to log and optionally take action; role admin publishes per-user invalidation events
        bus.Subscribe<RolePermissionsUpdatedEvent>(async ev => {
            logger.LogInformation("RBAC: role updated {RoleId} — you may want to invalidate caches across instances", ev.RoleId);
            await System.Threading.Tasks.Task.CompletedTask;
        });
    }
}