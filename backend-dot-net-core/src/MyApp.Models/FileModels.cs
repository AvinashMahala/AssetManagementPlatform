using System;

namespace MyApp.Models;

public class FileMetadata
{
    public Guid Id { get; set; }
    public string FileId { get; set; } = string.Empty; // storage id (filename)
    public string FileName { get; set; } = string.Empty;
    public string ContentType { get; set; } = string.Empty;
    public long Size { get; set; }
    public string EntityType { get; set; } = string.Empty; // e.g., "property"
    public string EntityId { get; set; } = string.Empty; // e.g., propertyId
    public string? CreatedBy { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}