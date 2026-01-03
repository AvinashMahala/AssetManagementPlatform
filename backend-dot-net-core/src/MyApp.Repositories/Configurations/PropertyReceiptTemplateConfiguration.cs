using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MyApp.Models;

namespace MyApp.Repositories.Configurations;

public class PropertyReceiptTemplateConfiguration : IEntityTypeConfiguration<PropertyReceiptTemplate>
{
    public void Configure(EntityTypeBuilder<PropertyReceiptTemplate> builder)
    {
        builder.ToTable("property_receipt_templates");
        builder.Property(p => p.Id).HasColumnName("id");
        builder.Property(p => p.PropertyId).HasColumnName("property_id");
        builder.Property(p => p.BankName).HasColumnName("bank_name");
        builder.Property(p => p.AccountNumber).HasColumnName("account_number");
        builder.Property(p => p.IfscCode).HasColumnName("ifsc_code");
        builder.Property(p => p.AccountHolderName).HasColumnName("account_holder_name");
        builder.Property(p => p.Wallets).HasColumnName("wallets");
        builder.Property(p => p.PaymentQrCodeUrl).HasColumnName("payment_qr_code_url");
        builder.Property(p => p.SignatureUrl).HasColumnName("signature_url");
        builder.Property(p => p.WatermarkUrl).HasColumnName("watermark_url");
        builder.Property(p => p.AdditionalInfo).HasColumnName("additional_info");
        builder.Property(p => p.CreatedAt).HasColumnName("created_at");
        builder.Property(p => p.UpdatedAt).HasColumnName("updated_at");
    }
}
