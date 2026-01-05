using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MyApp.Models;

namespace MyApp.Repositories.Configurations;

public class MeterAllocationConfiguration : IEntityTypeConfiguration<MeterAllocation>
{
    public void Configure(EntityTypeBuilder<MeterAllocation> builder)
    {
        builder.ToTable("meter_allocations");

        builder.Property(a => a.Id).HasColumnName("id");
        builder.Property(a => a.MeterId).HasColumnName("meter_id");
        builder.Property(a => a.SubscriptionId).HasColumnName("subscription_id");
        builder.Property(a => a.AllocationFraction).HasColumnName("allocation_fraction");
        // Stored as JSONB
        builder.Property(a => a.AllocationRule).HasColumnName("allocation_rule").HasColumnType("jsonb").HasDefaultValueSql("'{}'::jsonb");
        builder.Property(a => a.EffectiveFrom).HasColumnName("effective_from");
        builder.Property(a => a.EffectiveTo).HasColumnName("effective_to");
        builder.Property(a => a.CreatedAt).HasColumnName("created_at");
        builder.Property(a => a.UpdatedAt).HasColumnName("updated_at");

        builder.HasIndex(a => a.MeterId).HasDatabaseName("idx_meter_allocations_meter_id");
        builder.HasIndex(a => a.SubscriptionId).HasDatabaseName("idx_meter_allocations_subscription_id");
    }
}