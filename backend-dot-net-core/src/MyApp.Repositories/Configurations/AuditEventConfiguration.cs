using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MyApp.Models;

namespace MyApp.Repositories.Configurations;

public class AuditEventConfiguration : IEntityTypeConfiguration<AuditEvent>
{
    public void Configure(EntityTypeBuilder<AuditEvent> builder)
    {
        builder.ToTable("audit_events");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id).HasColumnName("id");
        builder.Property(x => x.Actor).IsRequired().HasMaxLength(200).HasColumnName("actor");
        builder.Property(x => x.Action).IsRequired().HasMaxLength(200).HasColumnName("action");
        builder.Property(x => x.ResourceType).IsRequired().HasMaxLength(200).HasColumnName("resource_type");
        builder.Property(x => x.ResourceId).HasMaxLength(50).HasColumnName("resource_id");
        builder.Property(x => x.Data).IsRequired().HasColumnType("jsonb").HasColumnName("data");
        builder.Property(x => x.OccurredAt).IsRequired().HasColumnName("occurred_at");
    }
}