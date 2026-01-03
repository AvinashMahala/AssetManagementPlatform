using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MyApp.Models;

namespace MyApp.Repositories.Configurations;

public class RentTransactionConfiguration : IEntityTypeConfiguration<RentTransaction>
{
    public void Configure(EntityTypeBuilder<RentTransaction> builder)
    {
        builder.ToTable("rent_transactions");

        builder.Property(t => t.Id).HasColumnName("id");
        builder.Property(t => t.LeaseId).HasColumnName("lease_id");
        // Map logical Amount to total_amount column
        builder.Property(t => t.Amount).HasColumnName("total_amount");
        builder.Property(t => t.CreatedAt).HasColumnName("created_at");
        builder.Property(t => t.Status).HasColumnName("status");

        // Many other fields exist in the DB (billing_periods, invoices, etc.)
    }
}