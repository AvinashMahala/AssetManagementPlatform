using System;

namespace MyApp.Models;

public class FileMetadata
{
    public Guid Id { get; set; }
    public string FileId { get; set; } = string.Empty; // storage id (filename)
    public string FileName { get; set; } = string.Empty;
    public string ContentType { get; set; } = string.Empty;
    public long Size { get; set; }
    public string? FileHash { get; set; }
    public string? Category { get; set; }
    public string[]? Tags { get; set; }

    public string EntityType { get; set; } = string.Empty; // e.g., "property"
    // entity id stored as uuid in DB
    public Guid? EntityId { get; set; }
    public Guid? UploadedBy { get; set; }
    public DateTime? UploadedAt { get; set; }
    public DateTime? LastAccessed { get; set; }
    public bool IsDeleted { get; set; }
    public DateTime? DeletedAt { get; set; }
    public int Version { get; set; } = 1;
    public Guid? ParentFileId { get; set; }
}

public class FileContent
{
    public Guid Id { get; set; }
    public Guid MetadataId { get; set; }
    public int ChunkNumber { get; set; }
    public byte[] ChunkData { get; set; } = Array.Empty<byte>();
    public int ChunkSize { get; set; }
    public DateTime? CreatedAt { get; set; }
}

public class FileAccessLog
{
    public Guid Id { get; set; }
    public Guid FileId { get; set; }
    public Guid UserId { get; set; }
    public string AccessType { get; set; } = string.Empty; // 'view', 'download', 'upload', 'delete'
    public string? IpAddress { get; set; }
    public string? UserAgent { get; set; }
    public DateTime? AccessedAt { get; set; }
}