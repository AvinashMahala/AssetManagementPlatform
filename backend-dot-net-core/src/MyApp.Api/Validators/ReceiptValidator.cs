using FluentValidation;
using MyApp.Api.Controllers;

namespace MyApp.Api.Validators;

public class ReceiptValidator : AbstractValidator<ReceiptsController.GenerateReceiptRequest>
{
    public ReceiptValidator()
    {
        RuleFor(x => x.RentPaymentId).NotEmpty().WithMessage("RentPaymentId is required if Amount is zero").When(x => (x.Amount ?? 0m) == 0m);
        RuleFor(x => x.Amount).GreaterThanOrEqualTo(0).WithMessage("Amount must be >= 0");
    }
}