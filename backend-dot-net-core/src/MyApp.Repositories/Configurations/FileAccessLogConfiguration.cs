using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MyApp.Models;

namespace MyApp.Repositories.Configurations;

public class FileAccessLogConfiguration : IEntityTypeConfiguration<FileAccessLog>
{
    public void Configure(EntityTypeBuilder<FileAccessLog> builder)
    {
        builder.ToTable("file_access_log");

        builder.Property(f => f.Id).HasColumnName("id");
        builder.Property(f => f.FileId).HasColumnName("file_id");
        builder.Property(f => f.UserId).HasColumnName("user_id");
        builder.Property(f => f.AccessType).HasColumnName("access_type").HasMaxLength(20);
        builder.Property(f => f.IpAddress).HasColumnName("ip_address");
        builder.Property(f => f.UserAgent).HasColumnName("user_agent");
        builder.Property(f => f.AccessedAt).HasColumnName("accessed_at");

        builder.HasIndex(f => f.FileId).HasDatabaseName("idx_file_access_log_file_id");
    }
}
