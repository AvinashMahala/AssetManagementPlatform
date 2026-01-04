using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using MyApp.Models;

namespace MyApp.Interfaces;

public interface IExportService
{
    Task<ExportToken> CreateTokenAsync(string actor, string? query, string[]? ids, string? ipAddress);
    Task<ExportToken?> GetTokenAsync(string token);
    Task<bool> ValidateAndMarkUsedAsync(string token, string? requestIp);
    Task<IEnumerable<ExportToken>> ListTokensAsync(int page, int pageSize);
    Task<bool> RevokeTokenAsync(string token, string actor);
}
