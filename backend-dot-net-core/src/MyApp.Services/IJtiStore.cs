using System;
using System.Threading.Tasks;

namespace MyApp.Services
{
    public interface IJtiStore
    {
        Task AddJtiAsync(string jti, Guid sessionId, TimeSpan ttl);
        Task<bool> ValidateJtiAsync(string jti, Guid sessionId);
        Task RemoveJtiAsync(string jti);
        Task RemoveAllForSessionAsync(Guid sessionId);
    }
}