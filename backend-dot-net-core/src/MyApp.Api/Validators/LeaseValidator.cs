using FluentValidation;
using MyApp.Models;

namespace MyApp.Api.Validators;

public class LeaseValidator : AbstractValidator<Lease>
{
    public LeaseValidator()
    {
        RuleFor(x => x.PropertyId).NotEmpty().WithMessage("PropertyId is required");
        RuleFor(x => x.TenantId).NotEmpty().WithMessage("TenantId is required");
        RuleFor(x => x.StartDate).NotEmpty().WithMessage("StartDate is required");
        RuleFor(x => x.Rent).GreaterThan(0).WithMessage("Rent must be greater than 0");
    }
}