using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MyApp.Models;

namespace MyApp.Repositories.Configurations;

public class ExpenseConfiguration : IEntityTypeConfiguration<Expense>
{
    public void Configure(EntityTypeBuilder<Expense> builder)
    {
        builder.ToTable("expenses");

        // Map model properties to DB columns (best-effort based on current DB schema)
        builder.Property(e => e.Id).HasColumnName("id");
        builder.Property(e => e.PropertyId).HasColumnName("property_id");
        builder.Property(e => e.UnitId).HasColumnName("unit_id");
        // Model uses `Category` while DB column is `type`
        builder.Property(e => e.Category).HasColumnName("type");
        builder.Property(e => e.Description).HasColumnName("description");
        builder.Property(e => e.Amount).HasColumnName("amount");

        builder.Property(e => e.Frequency).HasColumnName("frequency");
        builder.Property(e => e.StartDate).HasColumnName("start_date");
        builder.Property(e => e.EndDate).HasColumnName("end_date");
        builder.Property(e => e.Distribution).HasColumnName("distribution");
        builder.Property(e => e.AffectedUnitIds).HasColumnName("affected_unit_ids");
        builder.Property(e => e.BillPhotoUrl).HasColumnName("bill_photo_url");
        builder.Property(e => e.Status).HasColumnName("status");
        builder.Property(e => e.IsActive).HasColumnName("is_active");

        // Audit fields
        builder.Property(e => e.CreatedBy).HasColumnName("created_by");
        builder.Property(e => e.UpdatedBy).HasColumnName("updated_by");
        builder.Property(e => e.CreatedAt).HasColumnName("created_at");
        builder.Property(e => e.UpdatedAt).HasColumnName("updated_at");
    }
}
