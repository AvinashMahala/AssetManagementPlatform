using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MyApp.Models;

namespace MyApp.Repositories.Configurations;

public class RentTransactionMeterReadingConfiguration : IEntityTypeConfiguration<RentTransactionMeterReading>
{
    public void Configure(EntityTypeBuilder<RentTransactionMeterReading> builder)
    {
        builder.ToTable("rent_transaction_meter_readings");

        builder.Property(r => r.Id).HasColumnName("id");
        builder.Property(r => r.TransactionId).HasColumnName("transaction_id");
        builder.Property(r => r.MeterId).HasColumnName("meter_id");
        builder.Property(r => r.MeterReadingId).HasColumnName("meter_reading_id");
        builder.Property(r => r.SubscriptionId).HasColumnName("subscription_id");

        builder.Property(r => r.MeterName).HasColumnName("meter_name").HasMaxLength(255);
        builder.Property(r => r.MeterType).HasColumnName("meter_type").HasMaxLength(50);
        builder.Property(r => r.MeterNumber).HasColumnName("meter_number").HasMaxLength(100);

        builder.Property(r => r.PreviousReading).HasColumnName("previous_reading");
        builder.Property(r => r.CurrentReading).HasColumnName("current_reading");
        builder.Property(r => r.UnitsConsumed).HasColumnName("units_consumed");

        builder.Property(r => r.CostPerUnit).HasColumnName("cost_per_unit");
        builder.Property(r => r.FixedCharge).HasColumnName("fixed_charge");
        builder.Property(r => r.TotalCost).HasColumnName("total_cost");

        builder.Property(r => r.ReadingDate).HasColumnName("reading_date");

        builder.Property(r => r.CreatedAt).HasColumnName("created_at");

        builder.HasIndex(r => r.TransactionId).HasDatabaseName("idx_transaction_meter_readings_transaction_id");
        builder.HasIndex(r => r.MeterId).HasDatabaseName("idx_transaction_meter_readings_meter_id");
        builder.HasIndex(r => r.MeterReadingId).HasDatabaseName("idx_transaction_meter_readings_meter_reading_id");
        builder.HasIndex(r => r.ReadingDate).HasDatabaseName("idx_transaction_meter_readings_reading_date");
    }
}