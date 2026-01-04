using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MyApp.Models;

namespace MyApp.Repositories.Configurations;

public class UtilitySubscriptionConfiguration : IEntityTypeConfiguration<UtilitySubscription>
{
    public void Configure(EntityTypeBuilder<UtilitySubscription> builder)
    {
        builder.ToTable("utility_subscriptions");

        builder.Property(s => s.Id).HasColumnName("id");
        builder.Property(s => s.UnitId).HasColumnName("unit_id");
        builder.Property(s => s.UtilityTypeId).HasColumnName("utility_type_id");
        builder.Property(s => s.SubscriptionName).HasColumnName("subscription_name").HasMaxLength(255);
        builder.Property(s => s.IsEnabled).HasColumnName("is_enabled").HasDefaultValue(true);

        builder.Property(s => s.BillingMethod).HasColumnName("billing_method").HasMaxLength(20).IsRequired().HasDefaultValue("fixed");
        builder.Property(s => s.FixedAmount).HasColumnName("fixed_amount").HasColumnType("numeric(12,2)");
        builder.Property(s => s.BillingMultiplier).HasColumnName("billing_multiplier").HasColumnType("numeric(8,4)").HasDefaultValue(1.0m);

        builder.Property(s => s.Notes).HasColumnName("notes");

        builder.Property(s => s.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("CURRENT_TIMESTAMP");
        builder.Property(s => s.UpdatedAt).HasColumnName("updated_at").HasDefaultValueSql("CURRENT_TIMESTAMP");

        builder.HasIndex(s => s.UnitId).HasDatabaseName("idx_utility_subscriptions_unit_id");
        builder.HasIndex(s => s.UtilityTypeId).HasDatabaseName("idx_utility_subscriptions_utility_type_id");

        builder.HasIndex(s => new { s.UnitId, s.UtilityTypeId }).IsUnique();

        builder.HasCheckConstraint("chk_fixed_amount_required", "(billing_method = 'fixed' AND fixed_amount IS NOT NULL AND fixed_amount >= 0) OR (billing_method = 'meter_allocated')");
        builder.HasCheckConstraint("chk_billing_method", "billing_method IN ('fixed', 'meter_allocated')");

        // Foreign keys
        builder.HasOne<MyApp.Models.Unit>().WithMany().HasForeignKey(s => s.UnitId).OnDelete(DeleteBehavior.Cascade);
        builder.HasOne<MyApp.Models.UtilityType>().WithMany().HasForeignKey(s => s.UtilityTypeId).OnDelete(DeleteBehavior.Restrict);
    }
}