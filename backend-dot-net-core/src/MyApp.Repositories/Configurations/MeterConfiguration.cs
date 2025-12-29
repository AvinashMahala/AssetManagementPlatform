using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MyApp.Models;

namespace MyApp.Repositories.Configurations;

public class MeterConfiguration : IEntityTypeConfiguration<Meter>
{
    public void Configure(EntityTypeBuilder<Meter> builder)
    {
        builder.ToTable("meters");

        builder.Property(m => m.Id).HasColumnName("id");
        builder.Property(m => m.PropertyId).HasColumnName("property_id");
        builder.Property(m => m.UnitId).HasColumnName("unit_id");

        // Serial maps to meter_number in DB
        builder.Property(m => m.MeterNumber).HasColumnName("meter_number").HasMaxLength(100);
        builder.Property(m => m.MeterType).HasColumnName("meter_type").HasMaxLength(50);
        builder.Property(m => m.MeterName).HasColumnName("meter_name").HasMaxLength(255);

        builder.Property(m => m.Multiplier).HasColumnName("multiplier");
        builder.Property(m => m.CostPerUnit).HasColumnName("cost_per_unit");
        builder.Property(m => m.FixedCharge).HasColumnName("fixed_charge");

        builder.Property(m => m.Remarks).HasColumnName("remarks");
        builder.Property(m => m.InstallationDate).HasColumnName("installation_date");

        builder.Property(m => m.Status).HasColumnName("status").HasMaxLength(50);
        builder.Property(m => m.IsActive).HasColumnName("is_active");

        builder.Property(m => m.CreatedAt).HasColumnName("created_at");
        builder.Property(m => m.UpdatedAt).HasColumnName("updated_at");
    }
}
