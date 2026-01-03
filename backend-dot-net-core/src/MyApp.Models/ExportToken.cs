using System;

namespace MyApp.Models;

public class ExportToken
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Token { get; set; } = Guid.NewGuid().ToString("N");
    public string? CreatedBy { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime ExpiresAt { get; set; }
    public bool Used { get; set; } = false;
    // Simple storage for query and ids
    public string? Query { get; set; }
    public string? IdsCsv { get; set; }

    // IP binding and download metadata
    public string? CreatedFromIp { get; set; }
    public DateTime? DownloadedAt { get; set; }
    public string? DownloadedByIp { get; set; }

    // Revocation support
    public bool Revoked { get; set; } = false;
    public DateTime? RevokedAt { get; set; }
    public string? RevokedBy { get; set; }
}