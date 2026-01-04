using System;

namespace MyApp.Api.Responses;

public record AuditEventDto(
    Guid Id,
    string Actor,
    string Action,
    string ResourceType,
    string? ResourceId,
    string Data,
    DateTime OccurredAt
);
