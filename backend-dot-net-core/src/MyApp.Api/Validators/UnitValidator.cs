using FluentValidation;
using MyApp.Models;

namespace MyApp.Api.Validators;

public class UnitValidator : AbstractValidator<Unit>
{
    public UnitValidator()
    {
        RuleFor(x => x.PropertyId).NotEmpty().WithMessage("PropertyId is required");
        RuleFor(x => x.Name).NotEmpty().WithMessage("Name is required");
    }
}