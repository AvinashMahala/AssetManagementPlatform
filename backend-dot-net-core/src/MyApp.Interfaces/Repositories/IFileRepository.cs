using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using MyApp.Models;

namespace MyApp.Interfaces;

public partial interface IFileRepository
{
    Task<string> AddAsync(FileMetadata metadata, CancellationToken cancellationToken = default); // returns id
    Task<FileMetadata?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IEnumerable<FileMetadata>> ListByEntityAsync(string entityType, string entityId, CancellationToken cancellationToken = default);
    Task<PagedResult<FileMetadata>> ListByEntityPagedAsync(string? entityType, string? entityId, int offset, int limit, CancellationToken cancellationToken = default);
    Task UpdateAsync(FileMetadata metadata, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
} 