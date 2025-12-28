using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MyApp.Models;

namespace MyApp.Repositories.Configurations;

public class ReceiptConfiguration : IEntityTypeConfiguration<Receipt>
{
    public void Configure(EntityTypeBuilder<Receipt> builder)
    {
        builder.ToTable("receipts");

        builder.Property(r => r.Id).HasColumnName("id");
        // The DB schema does not include a `rent_payment_id` column. Ignore the model property
        // to avoid EF querying a non-existent column (which causes Postgres 42703 errors).
        builder.Ignore(r => r.RentPaymentId);

        builder.Property(r => r.RentTransactionId).HasColumnName("rent_transaction_id");
        builder.Property(r => r.ReceiptNumber).HasColumnName("receipt_number");
        builder.Property(r => r.Amount).HasColumnName("amount");
        builder.Property(r => r.PdfStorageId).HasColumnName("pdf_url");
        builder.Property(r => r.CreatedAt).HasColumnName("created_at");

        // receipt_data is mapped in queries as JSON when needed
    }
}