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
        builder.Property(f => f.FileHash).HasColumnName("file_hash");
        builder.Property(f => f.Category).HasColumnName("category");
        builder.Property(f => f.Tags).HasColumnName("tags");
        builder.Property(f => f.EntityType).HasColumnName("entity_type");
        builder.Property(f => f.EntityId).HasColumnName("entity_id");
        builder.Property(f => f.UploadedBy).HasColumnName("uploaded_by");
        builder.Property(f => f.UploadedAt).HasColumnName("uploaded_at");
        builder.Property(f => f.LastAccessed).HasColumnName("last_accessed");
        builder.Property(f => f.IsDeleted).HasColumnName("is_deleted");
        builder.Property(f => f.DeletedAt).HasColumnName("deleted_at");
        builder.Property(f => f.Version).HasColumnName("version");
        builder.Property(f => f.ParentFileId).HasColumnName("parent_file_id");

        // Additional indexes/constraints
    }
}