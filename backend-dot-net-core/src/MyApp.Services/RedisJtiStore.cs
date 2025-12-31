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
    public class RedisJtiStore : IJtiStore, IDisposable
    {
        private readonly ConnectionMultiplexer _conn;
        private readonly IDatabase _db;
        private readonly ILogger<RedisJtiStore>? _logger;

        public RedisJtiStore(IConfiguration configuration, ILogger<RedisJtiStore>? logger = null)
        {
            _logger = logger;
            var cs = configuration["Redis:ConnectionString"] ?? throw new ArgumentNullException("Redis:ConnectionString");
            _conn = ConnectionMultiplexer.Connect(cs);
            _db = _conn.GetDatabase();
        }

        private static string JtiKey(string jti) => $"jti:{jti}";
        private static string SessionSetKey(Guid sessionId) => $"session_jtis:{sessionId}";

        public async Task AddJtiAsync(string jti, Guid sessionId, TimeSpan ttl)
        {
            // Ensure only one active JTI exists per session to avoid unbounded growth when multiple tabs refresh.
            await RemoveAllForSessionAsync(sessionId);
            // store mapping jti -> sessionId with TTL
            await _db.StringSetAsync(JtiKey(jti), sessionId.ToString(), ttl);
            // add to session set (no expiry; we'll remove entries on RemoveAll)
            await _db.SetAddAsync(SessionSetKey(sessionId), jti);
        }

        public async Task<bool> ValidateJtiAsync(string jti, Guid sessionId)
        {
            var val = await _db.StringGetAsync(JtiKey(jti));
            if (val.IsNullOrEmpty) return false;
            return Guid.TryParse(val.ToString(), out var sid) && sid == sessionId;
        }

        public async Task RemoveJtiAsync(string jti)
        {
            // remove jti key and remove from any session set that contains it
            await _db.KeyDeleteAsync(JtiKey(jti));
            // best-effort: we don't know sessionId; try remove from sets via scan isn't trivial here.
            // rely on RemoveAllForSessionAsync to clean session sets when available.
        }

        public async Task RemoveAllForSessionAsync(Guid sessionId)
        {
            var setKey = SessionSetKey(sessionId);
            var entries = await _db.SetMembersAsync(setKey);
            if (entries != null && entries.Length > 0)
            {
                var keys = entries.Select(e => (RedisKey)JtiKey(e)).ToArray();
                await _db.KeyDeleteAsync(keys);
            }
            await _db.KeyDeleteAsync(setKey);
        }

        public void Dispose()
        {
            _conn?.Dispose();
        }
    }
}