using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MyApp.Models;

namespace MyApp.Repositories.Configurations;

public class UnitConfiguration : IEntityTypeConfiguration<Unit>
{
    public void Configure(EntityTypeBuilder<Unit> builder)
    {
        builder.ToTable("units");

        builder.Property(u => u.Id).HasColumnName("id");
        builder.Property(u => u.PropertyId).HasColumnName("property_id");

        builder.Property(u => u.UnitNumber).HasColumnName("unit_number");
        builder.Property(u => u.Name).HasColumnName("unit_name");
        builder.Property(u => u.Description).HasColumnName("description");
        builder.Property(u => u.UnitType).HasColumnName("unit_type");

        builder.Property(u => u.Status).HasColumnName("status");
        builder.Property(u => u.Floor).HasColumnName("floor");
        builder.Property(u => u.Area).HasColumnName("area");
        builder.Property(u => u.Bedrooms).HasColumnName("bedrooms");
        builder.Property(u => u.Bathrooms).HasColumnName("bathrooms");
        builder.Property(u => u.Balconies).HasColumnName("balconies");
        builder.Property(u => u.Furnished).HasColumnName("furnished");
        builder.Property(u => u.MaxOccupants).HasColumnName("max_occupants");

        // JSON columns
        builder.Property(u => u.UnitAmenities).HasColumnName("unit_amenities").HasColumnType("jsonb");
        builder.Property(u => u.UnitPhotos).HasColumnName("unit_photos").HasColumnType("jsonb");

        // Financials
        builder.Property(u => u.MonthlyRent).HasColumnName("monthly_rent");
        builder.Property(u => u.SecurityDeposit).HasColumnName("security_deposit");
        builder.Property(u => u.MaintenanceCharges).HasColumnName("maintenance_charges");

        builder.Property(u => u.CreatedAt).HasColumnName("created_at");
        builder.Property(u => u.UpdatedAt).HasColumnName("updated_at");
    }
}
