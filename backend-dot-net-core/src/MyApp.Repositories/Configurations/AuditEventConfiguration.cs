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
        builder.Property(x => x.Actor).IsRequired().HasMaxLength(200);
        builder.Property(x => x.Action).IsRequired().HasMaxLength(200);
        builder.Property(x => x.ResourceType).IsRequired().HasMaxLength(200);
        builder.Property(x => x.ResourceId).HasMaxLength(50);
        builder.Property(x => x.Data).IsRequired().HasColumnType("jsonb");
        builder.Property(x => x.OccurredAt).IsRequired();
    }
}