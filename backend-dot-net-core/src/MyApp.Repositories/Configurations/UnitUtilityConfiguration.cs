using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MyApp.Models;

namespace MyApp.Repositories.Configurations;

public class UnitUtilityConfiguration : IEntityTypeConfiguration<UnitUtility>
{
    public void Configure(EntityTypeBuilder<UnitUtility> builder)
    {
        builder.ToTable("unit_utilities");

        builder.HasKey(u => u.Id);

        builder.Property(u => u.Id).HasColumnName("id");
        builder.Property(u => u.UnitId).HasColumnName("unit_id");
        builder.Property(u => u.UtilityType).HasColumnName("utility_type");
        builder.Property(u => u.Enabled).HasColumnName("is_enabled");
        builder.Property(u => u.CreatedAt).HasColumnName("created_at");
    }
}
