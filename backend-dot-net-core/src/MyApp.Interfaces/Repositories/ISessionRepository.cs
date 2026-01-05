using System;
using System.Threading;
using System.Threading.Tasks;
using MyApp.Models;

namespace MyApp.Interfaces.Repositories;

public interface ISessionRepository
{
    Task CreateAsync(SessionToken session, CancellationToken cancellationToken = default);
    Task<SessionToken?> FindByRefreshTokenHashAsync(string hash, CancellationToken cancellationToken = default);
    Task RevokeAsync(Guid sessionId, CancellationToken cancellationToken = default);
    Task RevokeAllForUserAsync(Guid userId, CancellationToken cancellationToken = default);
    Task ReplaceSessionAsync(SessionToken oldSession, SessionToken newSession, CancellationToken cancellationToken = default);
    Task UpdateLastUsedAsync(Guid sessionId, DateTime lastUsed, CancellationToken cancellationToken = default);

    /// <summary>
    /// Atomically rotate a refresh session by locating the existing session using the
    /// provided refresh token hash and replacing it with <paramref name="newSession"/>.
    /// This method performs row-level locking when supported by the provider to
    /// serialize concurrent rotations and detect reuse.
    /// Returns the created <see cref="SessionToken"/> if successful; throws when reuse detected.
    /// </summary>
    Task<SessionToken> ReplaceSessionWithLockAsync(string oldRefreshTokenHash, SessionToken newSession, CancellationToken cancellationToken = default);

    /// <summary>
    /// Atomically rotate the session in place by replacing the refresh token hash on the existing session row.
    /// Uses row-level locking when supported to serialize concurrent rotations.
    /// Returns the updated session.
    /// </summary>
    Task<SessionToken> RotateSessionWithLockAsync(string oldRefreshTokenHash, string newRefreshTokenHash, DateTime newIssuedAt, DateTime newExpiresAt, CancellationToken cancellationToken = default);

    /// <summary>
    /// Find a session by id.
    /// </summary>
    Task<SessionToken?> FindByIdAsync(Guid id, CancellationToken cancellationToken = default);

    /// <summary>
    /// Find all active sessions for a user.
    /// </summary>
    Task<System.Collections.Generic.IEnumerable<SessionToken>> FindByUserIdAsync(Guid userId, CancellationToken cancellationToken = default);
}