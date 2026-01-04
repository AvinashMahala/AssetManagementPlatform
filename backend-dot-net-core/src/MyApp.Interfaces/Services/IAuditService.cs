using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using MyApp.Models;

namespace MyApp.Interfaces;

public interface IAuditService
{
    Task<IEnumerable<AuditEvent>> ListAsync(string? actor, string? action, string? resourceType, int page, int pageSize);
    Task<int> CountAsync(string? actor, string? action, string? resourceType);
    Task LogAsync(string actor, string action, string resourceType, string? resourceId, object data);
}
