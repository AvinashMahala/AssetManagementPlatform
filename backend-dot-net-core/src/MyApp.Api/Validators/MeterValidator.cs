using FluentValidation;
using MyApp.Models;

namespace MyApp.Api.Validators;

public class MeterValidator : AbstractValidator<Meter>
{
    public MeterValidator()
    {
        RuleFor(x => x.Serial).NotEmpty().WithMessage("Serial is required");
        RuleFor(x => x.PropertyId).NotEmpty().WithMessage("PropertyId is required");
    }
}