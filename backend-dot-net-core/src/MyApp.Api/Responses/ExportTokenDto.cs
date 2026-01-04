using System;

namespace MyApp.Api.Responses;

public class ExportTokenDto
{
    public Guid Id { get; set; }
    public string Token { get; set; } = string.Empty;
    public string CreatedBy { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime ExpiresAt { get; set; }
    public bool Used { get; set; }
    public DateTime? DownloadedAt { get; set; }
    public string? DownloadedByIp { get; set; }
    public bool Revoked { get; set; }
    public DateTime? RevokedAt { get; set; }
    public string? RevokedBy { get; set; }
    public string? Query { get; set; }
    public string? IdsCsv { get; set; }
}
