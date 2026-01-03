using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MyApp.Models;

namespace MyApp.Repositories.Configurations;

public class TenantDocumentConfiguration : IEntityTypeConfiguration<TenantDocument>
{
    public void Configure(EntityTypeBuilder<TenantDocument> builder)
    {
        builder.ToTable("tenant_documents");

        builder.Property(d => d.Id).HasColumnName("id");
        builder.Property(d => d.TenantId).HasColumnName("tenant_id");
        builder.Property(d => d.DocumentType).HasColumnName("document_type").HasMaxLength(100);
        builder.Property(d => d.FileName).HasColumnName("document_name").HasMaxLength(255);
        builder.Property(d => d.FileUrl).HasColumnName("document_url").HasMaxLength(500);
        builder.Property(d => d.FileSize).HasColumnName("file_size");
        builder.Property(d => d.CreatedAt).HasColumnName("uploaded_at");

        // The model includes some UI/logical-only fields; ignore them if they are not in the DB schema
        builder.Ignore(d => d.Verified);
        builder.Ignore(d => d.VerifiedBy);
        builder.Ignore(d => d.UploadedBy);

        builder.HasIndex(d => d.TenantId).HasDatabaseName("idx_tenant_documents_tenant_id");
    }
}