using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using StackExchange.Redis;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Configuration;
using MyApp.Services;

namespace MyApp.Services
{
    /// <summary>
    /// Redis-backed JTI store implementation that persists JTIs in Redis and supports validation and removal.
    /// </summary>
    public class RedisJtiStore : IJtiStore, IDisposable
    {
        private readonly ConnectionMultiplexer _conn;
        private readonly IDatabase _db;
        private readonly ILogger<RedisJtiStore> _logger;

        /// <summary>
        /// Creates a new <see cref="RedisJtiStore"/> using the provided configuration and logger.
        /// </summary>
        public RedisJtiStore(IConfiguration configuration, ILogger<RedisJtiStore> logger)
        {
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            var cs = configuration["Redis:ConnectionString"] ?? throw new ArgumentNullException("Redis:ConnectionString");
            _conn = ConnectionMultiplexer.Connect(cs);
            _db = _conn.GetDatabase();
        }

        private static string JtiKey(string jti) => $"jti:{jti}";
        private static string SessionSetKey(Guid sessionId) => $"session_jtis:{sessionId}";

        /// <inheritdoc />
        public async Task AddJtiAsync(string jti, Guid sessionId, TimeSpan ttl)
        {
            // Ensure only one active JTI exists per session to avoid unbounded growth when multiple tabs refresh.
            await RemoveAllForSessionAsync(sessionId);
            // store mapping jti -> sessionId with TTL
            await _db.StringSetAsync(JtiKey(jti), sessionId.ToString(), ttl);
            // add to session set (no expiry; we'll remove entries on RemoveAll)
            await _db.SetAddAsync(SessionSetKey(sessionId), jti);
        }

        /// <inheritdoc />
        public async Task<bool> ValidateJtiAsync(string jti, Guid sessionId)
        {
            var val = await _db.StringGetAsync(JtiKey(jti));
            if (val.IsNullOrEmpty) return false;
            return Guid.TryParse(val.ToString(), out var sid) && sid == sessionId;
        }

        /// <inheritdoc />
        public async Task RemoveJtiAsync(string jti)
        {
            // remove jti key and remove from any session set that contains it
            await _db.KeyDeleteAsync(JtiKey(jti));
            // best-effort: we don't know sessionId; try remove from sets via scan isn't trivial here.
            // rely on RemoveAllForSessionAsync to clean session sets when available.
        }

        /// <inheritdoc />
        public async Task RemoveAllForSessionAsync(Guid sessionId)
        {
            var setKey = SessionSetKey(sessionId);
            var entries = await _db.SetMembersAsync(setKey);
            if (entries != null && entries.Length > 0)
            {
                var keys = entries.Where(e => !e.IsNullOrEmpty).Select(e => (RedisKey)JtiKey(e.ToString()!)).ToArray();
                if (keys.Length > 0) await _db.KeyDeleteAsync(keys);
            }
            await _db.KeyDeleteAsync(setKey);
        }

        /// <summary>
        /// Disposes the underlying Redis connection.
        /// </summary>
        public void Dispose()
        {
            _conn?.Dispose();
        }
    }
}