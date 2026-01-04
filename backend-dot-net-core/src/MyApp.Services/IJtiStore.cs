using System;
using System.Threading.Tasks;

namespace MyApp.Services
{
    /// <summary>
    /// Persistent store for JTI values (JWT IDs) to allow server-side validation and revocation.
    /// </summary>
    public interface IJtiStore
    {
        /// <summary>
        /// Adds a new JTI associated with a session with the specified TTL.
        /// </summary>
        Task AddJtiAsync(string jti, Guid sessionId, TimeSpan ttl);

        /// <summary>
        /// Validates whether the provided JTI is valid for the given session id.
        /// </summary>
        Task<bool> ValidateJtiAsync(string jti, Guid sessionId);

        /// <summary>
        /// Removes a specific JTI from the store.
        /// </summary>
        Task RemoveJtiAsync(string jti);

        /// <summary>
        /// Removes all JTIs associated with a session.
        /// </summary>
        Task RemoveAllForSessionAsync(Guid sessionId);
    }
}