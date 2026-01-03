using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using MyApp.Models;

namespace MyApp.Interfaces.Repositories
{
    public interface ISessionJtiRepository
    {
        Task AddAsync(SessionJti jti);
        Task<SessionJti?> FindByJtiAsync(string jti);
        Task<IEnumerable<SessionJti>> FindBySessionIdAsync(Guid sessionId);
        Task RemoveAsync(string jti);
        Task RemoveAllForSessionAsync(Guid sessionId);
    }
}