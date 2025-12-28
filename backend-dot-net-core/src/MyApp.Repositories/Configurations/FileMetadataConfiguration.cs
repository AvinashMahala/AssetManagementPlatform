using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MyApp.Models;

namespace MyApp.Repositories.Configurations;

public class FileMetadataConfiguration : IEntityTypeConfiguration<FileMetadata>
{
    public void Configure(EntityTypeBuilder<FileMetadata> builder)
    {
        builder.ToTable("file_metadata");

        // Map model properties to DB columns
        builder.Property(f => f.Id).HasColumnName("id");
        builder.Property(f => f.FileId).HasColumnName("filename");
        builder.Property(f => f.FileName).HasColumnName("original_name");
        builder.Property(f => f.ContentType).HasColumnName("mime_type");
        builder.Property(f => f.Size).HasColumnName("file_size");
        builder.Property(f => f.EntityType).HasColumnName("entity_type");
        builder.Property(f => f.EntityId).HasColumnName("entity_id");
        builder.Property(f => f.CreatedBy).HasColumnName("uploaded_by");
        builder.Property(f => f.CreatedAt).HasColumnName("uploaded_at");

        // Additional indexes/constraints
    }
}