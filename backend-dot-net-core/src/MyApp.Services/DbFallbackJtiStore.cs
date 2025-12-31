using System;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using MyApp.Interfaces.Repositories;
using MyApp.Models;

namespace MyApp.Services
{
    public class DbFallbackJtiStore : IJtiStore
    {
        private readonly ISessionJtiRepository _repo;
        private readonly ILogger<DbFallbackJtiStore>? _logger;

        public DbFallbackJtiStore(ISessionJtiRepository repo, ILogger<DbFallbackJtiStore>? logger = null)
        {
            _repo = repo;
            _logger = logger;
        }

        public async Task AddJtiAsync(string jti, Guid sessionId, TimeSpan ttl)
        {
            var row = new SessionJti { SessionId = sessionId, Jti = jti, ExpiresAt = DateTime.UtcNow.Add(ttl) };
            await _repo.AddAsync(row);
        }

        public async Task<bool> ValidateJtiAsync(string jti, Guid sessionId)
        {
            var row = await _repo.FindByJtiAsync(jti);
            return row != null && row.SessionId == sessionId && row.ExpiresAt > DateTime.UtcNow;
        }

        public async Task RemoveJtiAsync(string jti)
        {
            await _repo.RemoveAsync(jti);
        }

        public async Task RemoveAllForSessionAsync(Guid sessionId)
        {
            await _repo.RemoveAllForSessionAsync(sessionId);
        }
    }
}