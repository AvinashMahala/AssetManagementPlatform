using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MyApp.Models;

namespace MyApp.Repositories.Configurations;

public class FileContentConfiguration : IEntityTypeConfiguration<FileContent>
{
    public void Configure(EntityTypeBuilder<FileContent> builder)
    {
        builder.ToTable("file_content");

        builder.Property(f => f.Id).HasColumnName("id");
        builder.Property(f => f.MetadataId).HasColumnName("metadata_id");
        builder.Property(f => f.ChunkNumber).HasColumnName("chunk_number");
        builder.Property(f => f.ChunkData).HasColumnName("chunk_data");
        builder.Property(f => f.ChunkSize).HasColumnName("chunk_size");
        builder.Property(f => f.CreatedAt).HasColumnName("created_at");

        builder.HasIndex(f => new { f.MetadataId, f.ChunkNumber }).HasDatabaseName("idx_file_content_metadata");

        // FK - not enforced via Fluent API here; we leave DB-level constraint from migration/schema
    }
}
