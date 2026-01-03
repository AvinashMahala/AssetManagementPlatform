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
        builder.Property(t => t.UnitId).HasColumnName("unit_id");
        builder.Property(t => t.TenantId).HasColumnName("tenant_id");
        builder.Property(t => t.PropertyId).HasColumnName("property_id");

        // Billing period
        builder.Property(t => t.BillingPeriodStart).HasColumnName("billing_period_start");
        builder.Property(t => t.BillingPeriodEnd).HasColumnName("billing_period_end");
        builder.Property(t => t.BillingMethod).HasColumnName("billing_method");
        builder.Property(t => t.DaysCount).HasColumnName("days_count");

        // Amounts
        builder.Property(t => t.BaseRent).HasColumnName("base_rent").HasColumnType("decimal(12,2)");
        builder.Property(t => t.MaintenanceCharges).HasColumnName("maintenance_charges").HasColumnType("decimal(12,2)");
        builder.Property(t => t.PreviousBalance).HasColumnName("previous_balance").HasColumnType("decimal(12,2)");
        builder.Property(t => t.TotalMeterCharges).HasColumnName("total_meter_charges").HasColumnType("decimal(12,2)");
        builder.Property(t => t.TotalExpenses).HasColumnName("total_expenses").HasColumnType("decimal(12,2)");
        builder.Property(t => t.Expenses).HasColumnName("expenses").HasColumnType("jsonb");

        // Totals
        builder.Property(t => t.Amount).HasColumnName("total_amount").HasColumnType("decimal(12,2)");
        builder.Property(t => t.AmountPaid).HasColumnName("amount_paid").HasColumnType("decimal(12,2)");
        builder.Property(t => t.NewBalance).HasColumnName("new_balance").HasColumnType("decimal(12,2)");

        // Payments
        builder.Property(t => t.Payments).HasColumnName("payments").HasColumnType("jsonb");
        builder.Property(t => t.PaidDate).HasColumnName("paid_date");
        builder.Property(t => t.Status).HasColumnName("status");
        builder.Property(t => t.PaymentMethod).HasColumnName("payment_method");
        builder.Property(t => t.TransactionId).HasColumnName("transaction_id");
        builder.Property(t => t.PaymentReference).HasColumnName("payment_reference");
        builder.Property(t => t.LateFee).HasColumnName("late_fee").HasColumnType("decimal(10,2)");
        builder.Property(t => t.PenaltyAmount).HasColumnName("penalty_amount").HasColumnType("decimal(10,2)");

        // Receipt and invoice
        builder.Property(t => t.ReceiptId).HasColumnName("receipt_id");
        builder.Property(t => t.ReceiptGenerated).HasColumnName("receipt_generated");
        builder.Property(t => t.InvoiceNumber).HasColumnName("invoice_number");
        builder.Property(t => t.InvoiceDate).HasColumnName("invoice_date");
        builder.Property(t => t.InvoicePdfUrl).HasColumnName("invoice_pdf_url");

        // Workflow tracking fields
        builder.Property(t => t.WorkflowStatus).HasColumnName("workflow_status");
        builder.Property(t => t.InvoiceGenerated).HasColumnName("invoice_generated");
        builder.Property(t => t.InvoiceSentDate).HasColumnName("invoice_sent_date");
        builder.Property(t => t.NotificationSent).HasColumnName("notification_sent");
        builder.Property(t => t.NotificationSentDate).HasColumnName("notification_sent_date");
        builder.Property(t => t.NotificationMethod).HasColumnName("notification_method");
        builder.Property(t => t.LastPaymentDate).HasColumnName("last_payment_date");
        builder.Property(t => t.ReceiptSent).HasColumnName("receipt_sent");
        builder.Property(t => t.ReceiptSentDate).HasColumnName("receipt_sent_date");
        builder.Property(t => t.WorkflowCompletedDate).HasColumnName("workflow_completed_date");

        // Notes and tracking
        builder.Property(t => t.Notes).HasColumnName("notes");
        builder.Property(t => t.CreatedBy).HasColumnName("created_by");
        builder.Property(t => t.UpdatedBy).HasColumnName("updated_by");
        builder.Property(t => t.CreatedAt).HasColumnName("created_at");
        builder.Property(t => t.UpdatedAt).HasColumnName("updated_at");

        // Model-only property that doesn't exist in DB—ignore to avoid EF mapping error
    }
}