using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace MyApp.Interfaces;

public interface ICommunicationService
{
    Task<bool> SendToTenantAsync(Guid tenantId, string subject, string message, IEnumerable<string> channels, IEnumerable<string>? attachmentStorageIds = null);
}