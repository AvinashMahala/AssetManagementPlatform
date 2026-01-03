using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MyApp.Models;

namespace MyApp.Repositories.Configurations;

public class ReceiptTemplateConfiguration : IEntityTypeConfiguration<ReceiptTemplate>
{
    public void Configure(EntityTypeBuilder<ReceiptTemplate> builder)
    {
        builder.ToTable("receipt_templates");

        builder.Property(t => t.Id).HasColumnName("id");
        builder.Property(t => t.Name).HasColumnName("name");
        builder.Property(t => t.Type).HasColumnName("type");
        builder.Property(t => t.SettingsJson).HasColumnName("default_settings");
        builder.Property(t => t.IsDefault).HasColumnName("is_default");
        builder.Property(t => t.CreatedAt).HasColumnName("created_at");

        // Add other mappings (preview url, templates, etc.) as needed
    }
}