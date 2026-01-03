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
        builder.Property(s => s.IsEnabled).HasColumnName("is_enabled");

        builder.Property(s => s.BillingMethod).HasColumnName("billing_method").HasMaxLength(20);
        builder.Property(s => s.FixedAmount).HasColumnName("fixed_amount");
        builder.Property(s => s.BillingMultiplier).HasColumnName("billing_multiplier");

        builder.Property(s => s.Notes).HasColumnName("notes");

        builder.Property(s => s.CreatedAt).HasColumnName("created_at");
        builder.Property(s => s.UpdatedAt).HasColumnName("updated_at");

        builder.HasIndex(s => s.UnitId).HasDatabaseName("idx_utility_subscriptions_unit_id");
        builder.HasIndex(s => s.UtilityTypeId).HasDatabaseName("idx_utility_subscriptions_utility_type_id");

        builder.HasIndex(s => new { s.UnitId, s.UtilityTypeId }).IsUnique();
    }
}