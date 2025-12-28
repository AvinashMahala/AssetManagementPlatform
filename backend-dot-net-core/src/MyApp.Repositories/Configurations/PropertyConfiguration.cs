using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MyApp.Models;

namespace MyApp.Repositories.Configurations;

public class PropertyConfiguration : IEntityTypeConfiguration<Property>
{
    public void Configure(EntityTypeBuilder<Property> builder)
    {
        builder.ToTable("properties");

        // Column mappings (best-effort mapping against current DB schema)
        builder.Property(p => p.Id).HasColumnName("id");
        builder.Property(p => p.Name).HasColumnName("name");
        // The model stores a single 'Address' string; map to street component for now
        builder.Property(p => p.Address).HasColumnName("address_street");
        builder.Property(p => p.OwnerId).HasColumnName("owner_id");
        builder.Property(p => p.Status).HasColumnName("status");
        // TemplateJson is a JSON blob for overrides
        builder.Property(p => p.TemplateJson).HasColumnName("template_overrides");

        // Add additional indexes and relationships here
    }
}