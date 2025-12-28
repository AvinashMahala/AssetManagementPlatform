using FluentValidation;
using MyApp.Models;

namespace MyApp.Api.Validators;

public class MeterReadingValidator : AbstractValidator<MeterReading>
{
    public MeterReadingValidator()
    {
        RuleFor(x => x.MeterId).NotEmpty().WithMessage("MeterId is required");
        RuleFor(x => x.Value).GreaterThanOrEqualTo(0).WithMessage("Value must be >= 0");
    }
}