using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using MyApp.Models;

namespace MyApp.Interfaces;

public partial interface IFileRepository
{
    Task<string> AddAsync(FileMetadata metadata); // returns id
    Task<FileMetadata?> GetByIdAsync(Guid id);
    Task<IEnumerable<FileMetadata>> ListByEntityAsync(string entityType, string entityId);
    Task<PagedResult<FileMetadata>> ListByEntityPagedAsync(string? entityType, string? entityId, int offset, int limit);
    Task UpdateAsync(FileMetadata metadata);
    Task DeleteAsync(Guid id);
}