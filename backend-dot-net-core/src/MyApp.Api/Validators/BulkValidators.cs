using FluentValidation;
using MyApp.Api.Requests;

namespace MyApp.Api.Validators;

public class BulkRentCollectionValidator : AbstractValidator<BulkRentCollectionRequest>
{
    public BulkRentCollectionValidator()
    {
        RuleFor(x => x.UnitIds).NotEmpty().WithMessage("unitIds is required");
        RuleFor(x => x.BillingPeriodStart).LessThanOrEqualTo(x => x.BillingPeriodEnd).WithMessage("billingPeriodStart must be <= billingPeriodEnd");
    }
}

public class BulkPaymentsValidator : AbstractValidator<BulkPaymentsRequest>
{
    public BulkPaymentsValidator()
    {
        RuleFor(x => x.TransactionIds).NotEmpty().WithMessage("transactionIds is required");
        RuleFor(x => x.Amount).GreaterThan(0).WithMessage("amount must be greater than 0");
        RuleFor(x => x.PaymentMethod).NotEmpty().WithMessage("paymentMethod is required");
        RuleFor(x => x.PaymentDate).NotEmpty().WithMessage("paymentDate is required");
    }
}