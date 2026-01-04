using System;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using MyApp.Interfaces.Repositories;
using MyApp.Models;

namespace MyApp.Services
{
    /// <summary>
    /// Database-backed JTI store used when Redis is not configured.
    /// </summary>
    public class DbFallbackJtiStore : IJtiStore
    {
        private readonly ISessionJtiRepository _repo;
        private readonly ILogger<DbFallbackJtiStore> _logger;

        /// <summary>
        /// Creates a new instance of <see cref="DbFallbackJtiStore"/>.
        /// </summary>
        public DbFallbackJtiStore(ISessionJtiRepository repo, ILogger<DbFallbackJtiStore> logger)
        {
            _repo = repo ?? throw new ArgumentNullException(nameof(repo));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        /// <inheritdoc />
        public async Task AddJtiAsync(string jti, Guid sessionId, TimeSpan ttl)
        {
            // Ensure only one active JTI exists per session to avoid unbounded growth when multiple tabs refresh.
            await _repo.RemoveAllForSessionAsync(sessionId);
            var row = new SessionJti { SessionId = sessionId, Jti = jti, ExpiresAt = DateTime.UtcNow.Add(ttl) };
            await _repo.AddAsync(row);
        }

        /// <inheritdoc />
        public async Task<bool> ValidateJtiAsync(string jti, Guid sessionId)
        {
            var row = await _repo.FindByJtiAsync(jti);
            return row != null && row.SessionId == sessionId && row.ExpiresAt > DateTime.UtcNow;
        }

        /// <inheritdoc />
        public async Task RemoveJtiAsync(string jti)
        {
            await _repo.RemoveAsync(jti);
        }

        /// <inheritdoc />
        public async Task RemoveAllForSessionAsync(Guid sessionId)
        {
            await _repo.RemoveAllForSessionAsync(sessionId);
        }
    }
}