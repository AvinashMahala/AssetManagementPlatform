using FluentValidation;
using MyApp.Models;

namespace MyApp.Api.Validators;

public class MeterReadingValidator : AbstractValidator<MeterReading>
{
    public MeterReadingValidator()
    {
        RuleFor(x => x.MeterId).NotEmpty().WithMessage("MeterId is required");
        RuleFor(x => x.CurrentReading).GreaterThanOrEqualTo(0).WithMessage("CurrentReading must be >= 0");
        RuleFor(x => x.ReadingDate).NotEmpty().WithMessage("ReadingDate is required");
    }
}