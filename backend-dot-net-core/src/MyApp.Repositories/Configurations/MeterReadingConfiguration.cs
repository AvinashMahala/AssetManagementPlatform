using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MyApp.Models;

namespace MyApp.Repositories.Configurations;

public class MeterReadingConfiguration : IEntityTypeConfiguration<MeterReading>
{
    public void Configure(EntityTypeBuilder<MeterReading> builder)
    {
        builder.ToTable("meter_readings");

        builder.Property(r => r.Id).HasColumnName("id");
        builder.Property(r => r.MeterId).HasColumnName("meter_id");
        builder.Property(r => r.PreviousReading).HasColumnName("previous_reading");
        builder.Property(r => r.CurrentReading).HasColumnName("current_reading");
        builder.Property(r => r.ReadingDate).HasColumnName("reading_date");
        builder.Property(r => r.RecordedBy).HasColumnName("recorded_by");
        builder.Property(r => r.Notes).HasColumnName("notes");
        builder.Property(r => r.CreatedAt).HasColumnName("created_at");

        // Index on meter_id+reading_date could be useful
        builder.HasIndex(r => new { r.MeterId, r.ReadingDate });
    }
}
