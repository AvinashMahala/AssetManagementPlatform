using System;
using System.Threading.Tasks;
using MyApp.Models;

namespace MyApp.Interfaces.Repositories;

public interface ISessionRepository
{
    Task CreateAsync(SessionToken session);
    Task<SessionToken?> FindByRefreshTokenHashAsync(string hash);
    Task RevokeAsync(Guid sessionId);
    Task RevokeAllForUserAsync(Guid userId);
    Task ReplaceSessionAsync(SessionToken oldSession, SessionToken newSession);
    Task UpdateLastUsedAsync(Guid sessionId, DateTime lastUsed);

    /// <summary>
    /// Atomically rotate a refresh session by locating the existing session using the
    /// provided refresh token hash and replacing it with <paramref name="newSession"/>.
    /// This method performs row-level locking when supported by the provider to
    /// serialize concurrent rotations and detect reuse.
    /// Returns the created <see cref="SessionToken"/> if successful; throws when reuse detected.
    /// </summary>
    Task<SessionToken> ReplaceSessionWithLockAsync(string oldRefreshTokenHash, SessionToken newSession);

    /// <summary>
    /// Atomically rotate the session in place by replacing the refresh token hash on the existing session row.
    /// Uses row-level locking when supported to serialize concurrent rotations.
    /// Returns the updated session.
    /// </summary>
    Task<SessionToken> RotateSessionWithLockAsync(string oldRefreshTokenHash, string newRefreshTokenHash, DateTime newIssuedAt, DateTime newExpiresAt);
}