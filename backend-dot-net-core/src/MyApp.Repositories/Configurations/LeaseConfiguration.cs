using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MyApp.Models;

namespace MyApp.Repositories.Configurations;

public class LeaseConfiguration : IEntityTypeConfiguration<Lease>
{
    public void Configure(EntityTypeBuilder<Lease> builder)
    {
        builder.ToTable("leases");

        // Map model properties to DB columns
        builder.Property(l => l.Id).HasColumnName("id");
        builder.Property(l => l.PropertyId).HasColumnName("property_id");
        builder.Property(l => l.TenantId).HasColumnName("tenant_id");
        builder.Property(l => l.UnitId).HasColumnName("unit_id");
        builder.Property(l => l.StartDate).HasColumnName("start_date");
        builder.Property(l => l.EndDate).HasColumnName("end_date");
        builder.Property(l => l.Rent).HasColumnName("monthly_rent");

        // Add indexes and relationships here
    }
}