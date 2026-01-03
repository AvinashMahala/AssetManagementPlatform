using System;

namespace MyApp.Models
{
    public record SessionInfoDto(Guid Id, string? DeviceInfo, string? IpAddress, DateTime IssuedAt, DateTime ExpiresAt, DateTime? LastUsedAt, bool Revoked);
}