using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using MyApp.Interfaces.Repositories;
using MyApp.Models;

namespace MyApp.Repositories
{
    public class SessionJtiRepository : ISessionJtiRepository
    {
        private readonly AppDbContext _db;
        public SessionJtiRepository(AppDbContext db) => _db = db ?? throw new ArgumentNullException(nameof(db));

        public async Task AddAsync(SessionJti jti, CancellationToken cancellationToken = default)
        {
            if (jti.Id == Guid.Empty) jti.Id = Guid.NewGuid();
            await _db.Set<SessionJti>().AddAsync(jti, cancellationToken);
            await _db.SaveChangesAsync(cancellationToken);
        }

        public Task<SessionJti?> FindByJtiAsync(string jti, CancellationToken cancellationToken = default) =>
            _db.Set<SessionJti>().FirstOrDefaultAsync(s => s.Jti == jti && s.ExpiresAt > DateTime.UtcNow, cancellationToken);

        public Task<IEnumerable<SessionJti>> FindBySessionIdAsync(Guid sessionId, CancellationToken cancellationToken = default) =>
            _db.Set<SessionJti>().Where(s => s.SessionId == sessionId && s.ExpiresAt > DateTime.UtcNow).ToListAsync(cancellationToken).ContinueWith(t => (IEnumerable<SessionJti>)t.Result, cancellationToken);

        public async Task RemoveAsync(string jti, CancellationToken cancellationToken = default)
        {
            var s = await _db.Set<SessionJti>().FirstOrDefaultAsync(x => x.Jti == jti, cancellationToken);
            if (s == null) return;
            _db.Set<SessionJti>().Remove(s);
            await _db.SaveChangesAsync(cancellationToken);
        }

        public async Task RemoveAllForSessionAsync(Guid sessionId, CancellationToken cancellationToken = default)
        {
            var rows = await _db.Set<SessionJti>().Where(x => x.SessionId == sessionId).ToListAsync(cancellationToken);
            if (!rows.Any()) return;
            _db.Set<SessionJti>().RemoveRange(rows);
            await _db.SaveChangesAsync(cancellationToken);
        }
    }
}