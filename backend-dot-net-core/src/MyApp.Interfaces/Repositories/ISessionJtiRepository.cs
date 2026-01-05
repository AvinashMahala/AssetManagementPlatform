using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using MyApp.Models;

namespace MyApp.Interfaces.Repositories
{
    public interface ISessionJtiRepository
    {
        Task AddAsync(SessionJti jti, CancellationToken cancellationToken = default);
        Task<SessionJti?> FindByJtiAsync(string jti, CancellationToken cancellationToken = default);
        Task<IEnumerable<SessionJti>> FindBySessionIdAsync(Guid sessionId, CancellationToken cancellationToken = default);
        Task RemoveAsync(string jti, CancellationToken cancellationToken = default);
        Task RemoveAllForSessionAsync(Guid sessionId, CancellationToken cancellationToken = default);
    }
}