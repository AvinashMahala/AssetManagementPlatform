using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MyApp.Models;

namespace MyApp.Repositories.Configurations;

public class TariffConfiguration : IEntityTypeConfiguration<Tariff>
{
    public void Configure(EntityTypeBuilder<Tariff> builder)
    {
        builder.ToTable("tariffs");

        builder.Property(t => t.Id).HasColumnName("id");
        builder.Property(t => t.UtilityTypeId).HasColumnName("utility_type_id");
        builder.Property(t => t.SubscriptionId).HasColumnName("subscription_id");
        builder.Property(t => t.MeterId).HasColumnName("meter_id");

        builder.Property(t => t.Name).HasColumnName("name").HasMaxLength(255);
        builder.Property(t => t.Description).HasColumnName("description");

        builder.Property(t => t.EffectiveFrom).HasColumnName("effective_from");
        builder.Property(t => t.EffectiveTo).HasColumnName("effective_to");

        builder.Property(t => t.RatePerUnit).HasColumnName("rate_per_unit");
        builder.Property(t => t.FixedCharge).HasColumnName("fixed_charge");
        builder.Property(t => t.TieredRates).HasColumnName("tiered_rates");
        builder.Property(t => t.Metadata).HasColumnName("metadata");

        builder.Property(t => t.CreatedBy).HasColumnName("created_by");
        builder.Property(t => t.CreatedAt).HasColumnName("created_at");
        builder.Property(t => t.UpdatedAt).HasColumnName("updated_at");

        builder.HasIndex(t => t.UtilityTypeId).HasDatabaseName("idx_tariffs_utility_type");
        builder.HasIndex(t => t.SubscriptionId).HasDatabaseName("idx_tariffs_subscription");
        builder.HasIndex(t => t.MeterId).HasDatabaseName("idx_tariffs_meter");
        builder.HasIndex(t => new { t.EffectiveFrom, t.EffectiveTo }).HasDatabaseName("idx_tariffs_effective_range");
    }
}