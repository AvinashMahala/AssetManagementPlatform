using System;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using MyApp.Interfaces.Repositories;
using MyApp.Models;
using Prometheus;

namespace MyApp.Repositories;

public class SessionRepository : ISessionRepository
{
    private readonly AppDbContext _db;
    private readonly Microsoft.Extensions.Logging.ILogger<SessionRepository> _logger;
    private static readonly System.Diagnostics.Metrics.Meter _meter = new("MyApp.SessionTokens", "1.0");
    private readonly System.Diagnostics.Metrics.Counter<long> _reuseCounter;
    private static readonly Prometheus.Counter _reusePromCounter = Metrics.CreateCounter("refresh_token_reuse_total", "Number of detected refresh token reuse events");

    public SessionRepository(AppDbContext db, Microsoft.Extensions.Logging.ILogger<SessionRepository> logger)
    {
        _db = db;
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        _reuseCounter = _meter.CreateCounter<long>("refresh_token_reuse_total");
    }

    public async Task CreateAsync(SessionToken session, CancellationToken cancellationToken = default)
    {
        if (session.Id == Guid.Empty) session.Id = Guid.NewGuid();
        await _db.Set<SessionToken>().AddAsync(session, cancellationToken);
        await _db.SaveChangesAsync(cancellationToken);
    }

    public Task<SessionToken?> FindByRefreshTokenHashAsync(string hash, CancellationToken cancellationToken = default) =>
        _db.Set<SessionToken>().FirstOrDefaultAsync(s => s.RefreshTokenHash == hash && !s.Revoked, cancellationToken);

    public async Task RevokeAsync(Guid sessionId, CancellationToken cancellationToken = default)
    {
        var s = await _db.Set<SessionToken>().FindAsync(new object[] { sessionId }, cancellationToken);
        if (s is null) return;
        s.Revoked = true;
        _db.Set<SessionToken>().Update(s);
        await _db.SaveChangesAsync(cancellationToken);
    }

    public async Task RevokeAllForUserAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        _logger.LogWarning("Revoking all sessions for user {UserId}", userId);
        var sessions = await _db.Set<SessionToken>().Where(s => s.UserId == userId && !s.Revoked).ToListAsync(cancellationToken);
        foreach (var s in sessions) s.Revoked = true;
        _db.Set<SessionToken>().UpdateRange(sessions);
        await _db.SaveChangesAsync(cancellationToken);
    }

    public Task<System.Collections.Generic.IEnumerable<SessionToken>> FindByUserIdAsync(Guid userId, CancellationToken cancellationToken = default) =>
        _db.Set<SessionToken>().Where(s => s.UserId == userId && !s.Revoked).ToListAsync(cancellationToken).ContinueWith(t => (System.Collections.Generic.IEnumerable<SessionToken>)t.Result, cancellationToken);

    public async Task ReplaceSessionAsync(SessionToken oldSession, SessionToken newSession, CancellationToken cancellationToken = default)
    {
        oldSession.Revoked = true;
        oldSession.ReplacedBySessionId = newSession.Id;
        newSession.ReplacedBySessionId = null;
        await _db.Set<SessionToken>().AddAsync(newSession, cancellationToken);
        _db.Set<SessionToken>().Update(oldSession);
        await _db.SaveChangesAsync(cancellationToken);
    }

    public async Task<SessionToken> ReplaceSessionWithLockAsync(string oldRefreshTokenHash, SessionToken newSession, CancellationToken cancellationToken = default)
    {
        var strategy = _db.Database.CreateExecutionStrategy();
        return await strategy.ExecuteAsync(async ct =>
        {
            // Ensure atomic replacement with a transaction. When using Postgres, use FOR UPDATE to lock the row.
            await using var tx = await _db.Database.BeginTransactionAsync(ct);

            SessionToken? old = null;
            var provider = _db.Database.ProviderName ?? string.Empty;
            if (provider.Contains("Npgsql", StringComparison.OrdinalIgnoreCase))
            {
                // Npgsql supports FOR UPDATE
                old = await _db.Set<SessionToken>().FromSqlInterpolated($"SELECT * FROM session_tokens WHERE refresh_token_hash = {oldRefreshTokenHash} FOR UPDATE").FirstOrDefaultAsync(ct);
            }
            else
            {
                // Default to normal query inside a transaction (SQLite will lock on write)
                old = await _db.Set<SessionToken>().FirstOrDefaultAsync(s => s.RefreshTokenHash == oldRefreshTokenHash, ct);
            }

            if (old is null) throw new InvalidOperationException("Invalid refresh token");

            // If the session was already revoked or replaced, treat it as token reuse
            if (old.Revoked || old.ReplacedBySessionId != null)
            {
                // Detected reuse or previously replaced token — revoke all sessions for the user and surface a warning
                _logger.LogWarning("Refresh token reuse detected for user {UserId} (session {SessionId}). Revoking all sessions.", old.UserId, old.Id);
                _reuseCounter.Add(1, new KeyValuePair<string, object?>("userId", old.UserId.ToString()));
                _reusePromCounter.Inc();
                await RevokeAllForUserAsync(old.UserId, ct);
                await tx.CommitAsync(ct);
                throw new InvalidOperationException("Refresh token reuse detected");
            }

            // Mark old revoked and link to new
            old.Revoked = true;
            old.ReplacedBySessionId = newSession.Id;

            await _db.Set<SessionToken>().AddAsync(newSession, ct);
            _db.Set<SessionToken>().Update(old);

            await _db.SaveChangesAsync(ct);
            await tx.CommitAsync(ct);

            return newSession;
        }, cancellationToken);
    }

    public async Task<SessionToken> RotateSessionWithLockAsync(string oldRefreshTokenHash, string newRefreshTokenHash, DateTime newIssuedAt, DateTime newExpiresAt, CancellationToken cancellationToken = default)
    {
        var strategy = _db.Database.CreateExecutionStrategy();
        return await strategy.ExecuteAsync(async ct =>
        {
            await using var tx = await _db.Database.BeginTransactionAsync(ct);

            SessionToken? s = null;
            var provider = _db.Database.ProviderName ?? string.Empty;
            if (provider.Contains("Npgsql", StringComparison.OrdinalIgnoreCase))
            {
                s = await _db.Set<SessionToken>().FromSqlInterpolated($"SELECT * FROM session_tokens WHERE refresh_token_hash = {oldRefreshTokenHash} FOR UPDATE").FirstOrDefaultAsync(ct);
            }
            else
            {
                s = await _db.Set<SessionToken>().FirstOrDefaultAsync(x => x.RefreshTokenHash == oldRefreshTokenHash, ct);
            }

            if (s is null) throw new InvalidOperationException("Invalid refresh token");
            if (s.Revoked || s.ReplacedBySessionId != null)
            {
                _logger.LogWarning("Refresh token reuse detected for user {UserId} (session {SessionId}). Revoking all sessions.", s.UserId, s.Id);
                _reuseCounter.Add(1, new KeyValuePair<string, object?>("userId", s.UserId.ToString()));
                _reusePromCounter.Inc();
                await RevokeAllForUserAsync(s.UserId, ct);
                await tx.CommitAsync(ct);
                throw new InvalidOperationException("Refresh token reuse detected");
            }

            s.RefreshTokenHash = newRefreshTokenHash;
            s.IssuedAt = newIssuedAt;
            s.ExpiresAt = newExpiresAt;
            s.LastUsedAt = DateTime.UtcNow;

            _db.Set<SessionToken>().Update(s);
            await _db.SaveChangesAsync(ct);
            await tx.CommitAsync(ct);

            _logger.LogInformation("Rotated session {SessionId} for user {UserId}", s.Id, s.UserId);
            return s;
        }, cancellationToken);
    }

    public async Task UpdateLastUsedAsync(Guid sessionId, DateTime lastUsed, CancellationToken cancellationToken = default)
    {
        var s = await _db.Set<SessionToken>().FindAsync(new object[] { sessionId }, cancellationToken);
        if (s is null) return;
        s.LastUsedAt = lastUsed;
        _db.Set<SessionToken>().Update(s);
        await _db.SaveChangesAsync(cancellationToken);
    }

    public async Task<SessionToken?> FindByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var s = await _db.Set<SessionToken>().FindAsync(new object[] { id }, cancellationToken);
        return s;
    }
}