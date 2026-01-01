using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace MyApp.Repositories.Configurations;

public class ExportTokenConfiguration : IEntityTypeConfiguration<MyApp.Models.ExportToken>
{
    public void Configure(EntityTypeBuilder<MyApp.Models.ExportToken> builder)
    {
        builder.ToTable("export_tokens");
        builder.HasKey(e => e.Id);
        builder.Property(e => e.Id).HasColumnName("id");
        builder.Property(e => e.Token).HasColumnName("token").IsRequired().HasMaxLength(64);
        builder.Property(e => e.CreatedBy).HasColumnName("created_by").HasMaxLength(256);
        builder.Property(e => e.Query).HasColumnName("query").HasMaxLength(1024);
        builder.Property(e => e.IdsCsv).HasColumnName("ids_csv").HasMaxLength(2048);
        builder.Property(e => e.CreatedFromIp).HasColumnName("created_from_ip").HasMaxLength(64);
        builder.Property(e => e.DownloadedByIp).HasColumnName("downloaded_by_ip").HasMaxLength(64);
        builder.Property(e => e.RevokedBy).HasColumnName("revoked_by").HasMaxLength(256);
        builder.Property(e => e.RevokedAt).HasColumnName("revoked_at");
        builder.Property(e => e.DownloadedAt).HasColumnName("downloaded_at");
        builder.Property(e => e.CreatedAt).HasColumnName("created_at").IsRequired();
        builder.Property(e => e.ExpiresAt).HasColumnName("expires_at").IsRequired();
        builder.Property(e => e.Used).HasColumnName("used").IsRequired();
        builder.Property(e => e.Revoked).HasColumnName("revoked").IsRequired();
        builder.HasIndex(e => e.Token).IsUnique();
    }
}