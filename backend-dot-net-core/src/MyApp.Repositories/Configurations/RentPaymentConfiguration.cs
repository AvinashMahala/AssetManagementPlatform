using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MyApp.Models;

namespace MyApp.Repositories.Configurations;

public class RentPaymentConfiguration : IEntityTypeConfiguration<RentPayment>
{
    public void Configure(EntityTypeBuilder<RentPayment> builder)
    {
        builder.ToTable("rent_payments");

        builder.Property(r => r.Id).HasColumnName("id");
        builder.Property(r => r.LeaseId).HasColumnName("lease_id");
        builder.Property(r => r.Amount).HasColumnName("amount");
        builder.Property(r => r.CreatedAt).HasColumnName("created_at");
        builder.Property(r => r.Status).HasColumnName("status");

        // Note: DB does not have a rent_transaction_id column on rent_payments in current schema
    }
}