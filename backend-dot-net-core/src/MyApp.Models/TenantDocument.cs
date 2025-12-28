using System;

namespace MyApp.Models;

public class TenantDocument
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public string FileUrl { get; set; } = string.Empty;
    public string FileName { get; set; } = string.Empty;
    public long FileSize { get; set; }
    public string? DocumentType { get; set; }
    public bool Verified { get; set; } = false;
    public string? VerifiedBy { get; set; }
    public string? UploadedBy { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
