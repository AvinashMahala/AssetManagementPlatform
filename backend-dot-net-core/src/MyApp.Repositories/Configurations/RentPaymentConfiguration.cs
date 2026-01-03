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
        builder.Property(r => r.PropertyId).HasColumnName("property_id");
        builder.Property(r => r.TenantId).HasColumnName("tenant_id");

        // The DB does not have a `rent_transaction_id` column on `rent_payments` in the current schema,
        // so ignore the model property to prevent EF from querying a missing column.
        builder.Ignore(r => r.RentTransactionId);

        builder.Property(r => r.Amount).HasColumnName("amount");
        builder.Property(r => r.DueDate).HasColumnName("due_date");
        builder.Property(r => r.PaidDate).HasColumnName("paid_date");
        builder.Property(r => r.PaymentMethod).HasColumnName("payment_method");
        builder.Property(r => r.TransactionReference).HasColumnName("transaction_reference");
        builder.Property(r => r.Status).HasColumnName("status");

        builder.Property(r => r.LateFee).HasColumnName("late_fee");
        builder.Property(r => r.PenaltyAmount).HasColumnName("penalty_amount");
        builder.Property(r => r.RentAmount).HasColumnName("rent_amount");
        builder.Property(r => r.MaintenanceCharges).HasColumnName("maintenance_charges");
        builder.Property(r => r.OtherCharges).HasColumnName("other_charges");
        builder.Property(r => r.Notes).HasColumnName("notes");

        builder.Property(r => r.CreatedBy).HasColumnName("created_by");
        builder.Property(r => r.UpdatedBy).HasColumnName("updated_by");
        builder.Property(r => r.CreatedAt).HasColumnName("created_at");
        builder.Property(r => r.UpdatedAt).HasColumnName("updated_at");
    }
}