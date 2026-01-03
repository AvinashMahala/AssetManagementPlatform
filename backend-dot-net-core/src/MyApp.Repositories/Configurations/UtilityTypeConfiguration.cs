using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MyApp.Models;

namespace MyApp.Repositories.Configurations;

public class UtilityTypeConfiguration : IEntityTypeConfiguration<UtilityType>
{
    public void Configure(EntityTypeBuilder<UtilityType> builder)
    {
        builder.ToTable("utility_types");

        builder.Property(t => t.Id).HasColumnName("id");
        builder.Property(t => t.Key).HasColumnName("key").HasMaxLength(50);
        builder.Property(t => t.Name).HasColumnName("name").HasMaxLength(100);
        builder.Property(t => t.UnitOfMeasure).HasColumnName("unit_of_measure").HasMaxLength(50);
        builder.Property(t => t.Metadata).HasColumnName("metadata");

        builder.Property(t => t.CreatedAt).HasColumnName("created_at");
        builder.Property(t => t.UpdatedAt).HasColumnName("updated_at");

        builder.HasIndex(t => t.Key).HasDatabaseName("idx_utility_types_key");
    }
}