using MyApp.Api.Responses;
using MyApp.Models;

namespace MyApp.Api.Mapping;

public static class ExportMappingExtensions
{
    public static ExportTokenDto ToDto(this ExportToken entity)
    {
        return new ExportTokenDto
        {
            Id = entity.Id,
            Token = entity.Token,
            CreatedBy = entity.CreatedBy,
            CreatedAt = entity.CreatedAt,
            ExpiresAt = entity.ExpiresAt,
            Used = entity.Used,
            DownloadedAt = entity.DownloadedAt,
            DownloadedByIp = entity.DownloadedByIp,
            Revoked = entity.Revoked,
            RevokedAt = entity.RevokedAt,
            RevokedBy = entity.RevokedBy,
            Query = entity.Query,
            IdsCsv = entity.IdsCsv
        };
    }
}
