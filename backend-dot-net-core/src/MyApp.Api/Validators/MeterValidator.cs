using FluentValidation;
using MyApp.Models;

namespace MyApp.Api.Validators;

public class MeterValidator : AbstractValidator<Meter>
{
    public MeterValidator()
    {
        RuleFor(x => x.Serial)
            .NotEmpty().WithMessage("Meter number (Serial) is required")
            .MaximumLength(100).WithMessage("Serial must be 100 characters or fewer");

        RuleFor(x => x.PropertyId).NotEmpty().WithMessage("PropertyId is required");

        RuleFor(x => x.MeterType)
            .NotEmpty().WithMessage("MeterType is required")
            .MaximumLength(50).WithMessage("MeterType must be 50 characters or fewer");

        RuleFor(x => x.MeterName).MaximumLength(255).When(x => !string.IsNullOrWhiteSpace(x.MeterName)).WithMessage("MeterName must be 255 characters or fewer");

        RuleFor(x => x.Multiplier).GreaterThanOrEqualTo(0).WithMessage("Multiplier must be >= 0");
        RuleFor(x => x.CostPerUnit).GreaterThanOrEqualTo(0).WithMessage("CostPerUnit must be >= 0");
        RuleFor(x => x.FixedCharge).GreaterThanOrEqualTo(0).When(x => x.FixedCharge.HasValue).WithMessage("FixedCharge must be >= 0");

        RuleFor(x => x.Status).MaximumLength(50).When(x => !string.IsNullOrWhiteSpace(x.Status)).WithMessage("Status must be 50 characters or fewer");
    }
}