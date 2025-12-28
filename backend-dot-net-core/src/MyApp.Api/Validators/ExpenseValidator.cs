using FluentValidation;
using MyApp.Models;

namespace MyApp.Api.Validators;

public class ExpenseValidator : AbstractValidator<Expense>
{
    public ExpenseValidator()
    {
        RuleFor(x => x.Description).NotEmpty().WithMessage("Description is required");
        RuleFor(x => x.Amount).GreaterThan(0).WithMessage("Amount must be greater than 0");
    }
}