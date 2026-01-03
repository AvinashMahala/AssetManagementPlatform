using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MyApp.Models;

namespace MyApp.Repositories.Configurations;

public class LeaseConfiguration : IEntityTypeConfiguration<Lease>
{
    public void Configure(EntityTypeBuilder<Lease> builder)
    {
        builder.ToTable("leases");

        // Map model properties to DB columns
        builder.Property(l => l.Id).HasColumnName("id");
        builder.Property(l => l.PropertyId).HasColumnName("property_id");
        builder.Property(l => l.TenantId).HasColumnName("tenant_id");
        builder.Property(l => l.UnitId).HasColumnName("unit_id");
        builder.Property(l => l.StartDate).HasColumnName("start_date");
        builder.Property(l => l.EndDate).HasColumnName("end_date");
        builder.Property(l => l.Rent).HasColumnName("monthly_rent");

        // Financials & charges
        builder.Property(l => l.SecurityDeposit).HasColumnName("security_deposit");
        builder.Property(l => l.LateFeeAmount).HasColumnName("late_fee_amount");
        builder.Property(l => l.MaintenanceCharges).HasColumnName("maintenance_charges");
        builder.Property(l => l.PaymentFrequency).HasColumnName("payment_frequency");
        builder.Property(l => l.RentDueDay).HasColumnName("rent_due_day");
        builder.Property(l => l.PaymentDueDay).HasColumnName("payment_due_day");
        builder.Property(l => l.GracePeriodDays).HasColumnName("grace_period_days");
        builder.Property(l => l.ElectricityCharges).HasColumnName("electricity_charges");
        builder.Property(l => l.WaterCharges).HasColumnName("water_charges");
        builder.Property(l => l.OtherCharges).HasColumnName("other_charges");

        // Terms, rules, and status
        builder.Property(l => l.TermsConditions).HasColumnName("terms_conditions");
        builder.Property(l => l.SpecialClauses).HasColumnName("special_clauses");
        builder.Property(l => l.Status).HasColumnName("status");
        builder.Property(l => l.NoticePeriodDays).HasColumnName("notice_period_days");
        builder.Property(l => l.AutoRenewal).HasColumnName("auto_renewal");
        builder.Property(l => l.PetsAllowed).HasColumnName("pets_allowed");
        builder.Property(l => l.SmokingAllowed).HasColumnName("smoking_allowed");
        builder.Property(l => l.SublettingAllowed).HasColumnName("subletting_allowed");

        // Signing and termination
        builder.Property(l => l.SignedAt).HasColumnName("signed_at");
        builder.Property(l => l.TerminatedAt).HasColumnName("terminated_at");
        builder.Property(l => l.TerminationReason).HasColumnName("termination_reason");
        builder.Property(l => l.LeaseDocumentUrl).HasColumnName("lease_document_url");

        // Timestamps
        builder.Property(l => l.CreatedAt).HasColumnName("created_at");
        builder.Property(l => l.UpdatedAt).HasColumnName("updated_at");

        // Add indexes and relationships here
    }
}