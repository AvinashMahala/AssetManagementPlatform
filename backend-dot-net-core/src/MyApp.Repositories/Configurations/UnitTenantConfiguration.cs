using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MyApp.Models;

namespace MyApp.Repositories.Configurations;

public class UnitTenantConfiguration : IEntityTypeConfiguration<UnitTenant>
{
    public void Configure(EntityTypeBuilder<UnitTenant> builder)
    {
        builder.ToTable("unit_tenants");

        builder.Property(u => u.Id).HasColumnName("id");
        builder.Property(u => u.UnitId).HasColumnName("unit_id");
        builder.Property(u => u.TenantId).HasColumnName("tenant_id");
        builder.Property(u => u.StartDate).HasColumnName("move_in_date");
        builder.Property(u => u.EndDate).HasColumnName("move_out_date");

        // The model has a Role property that's not represented in the DB; ignore it
        builder.Ignore(u => u.Role);

        builder.HasIndex(u => u.UnitId).HasDatabaseName("idx_unit_tenants_unit_id");
        builder.HasIndex(u => u.TenantId).HasDatabaseName("idx_unit_tenants_tenant_id");
    }
}