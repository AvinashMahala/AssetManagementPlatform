using FluentValidation;
using MyApp.Models;

namespace MyApp.Api.Validators;

public class ExpenseValidator : AbstractValidator<Expense>
{
    public ExpenseValidator()
    {
        RuleFor(x => x.Description).NotEmpty().WithMessage("Description is required");
        RuleFor(x => x.Amount).GreaterThan(0).WithMessage("Amount must be greater than 0");

        RuleFor(x => x.Category).MaximumLength(100).When(x => !string.IsNullOrWhiteSpace(x.Category)).WithMessage("Type must be 100 characters or fewer");
        RuleFor(x => x.Frequency).MaximumLength(50).When(x => !string.IsNullOrWhiteSpace(x.Frequency)).WithMessage("Frequency must be 50 characters or fewer");
        RuleFor(x => x.Distribution).MaximumLength(50).When(x => !string.IsNullOrWhiteSpace(x.Distribution)).WithMessage("Distribution must be 50 characters or fewer");
        RuleFor(x => x.Status).MaximumLength(50).When(x => !string.IsNullOrWhiteSpace(x.Status)).WithMessage("Status must be 50 characters or fewer");

        RuleFor(x => x.StartDate).LessThanOrEqualTo(x => x.EndDate.Value).When(x => x.EndDate.HasValue).WithMessage("StartDate must be before or equal to EndDate");
    }
}