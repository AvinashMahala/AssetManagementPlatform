using System;
using MyApp.Api.Responses;
using MyApp.Models;

namespace MyApp.Api.Mapping;

public static class AuditMappingExtensions
{
    public static AuditEventDto ToDto(this AuditEvent entity)
    {
        return new AuditEventDto(
            entity.Id,
            entity.Actor,
            entity.Action,
            entity.ResourceType,
            entity.ResourceId,
            entity.Data,
            entity.OccurredAt
        );
    }
}
