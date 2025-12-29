using FluentValidation;
using MyApp.Models;

namespace MyApp.Api.Validators;

public class UnitValidator : AbstractValidator<Unit>
{
    public UnitValidator()
    {
        RuleFor(x => x.PropertyId).NotEmpty().WithMessage("PropertyId is required");

        // Unit number is required and constrained to 50 chars per DB
        RuleFor(x => x.UnitNumber)
            .NotEmpty().WithMessage("UnitNumber is required")
            .MaximumLength(50).WithMessage("UnitNumber must be 50 characters or fewer");

        // Name is required and constrained to 255 chars
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Name is required")
            .MaximumLength(255).WithMessage("Name must be 255 characters or fewer");

        // Numeric constraints
        RuleFor(x => x.Area).GreaterThanOrEqualTo(0).When(x => x.Area.HasValue).WithMessage("Area must be >= 0");
        RuleFor(x => x.Bedrooms).GreaterThanOrEqualTo(0).When(x => x.Bedrooms.HasValue).WithMessage("Bedrooms must be >= 0");
        RuleFor(x => x.Bathrooms).GreaterThanOrEqualTo(0).When(x => x.Bathrooms.HasValue).WithMessage("Bathrooms must be >= 0");
        RuleFor(x => x.Balconies).GreaterThanOrEqualTo(0).When(x => x.Balconies.HasValue).WithMessage("Balconies must be >= 0");
        RuleFor(x => x.MaxOccupants).GreaterThanOrEqualTo(0).When(x => x.MaxOccupants.HasValue).WithMessage("MaxOccupants must be >= 0");

        RuleFor(x => x.MonthlyRent).GreaterThanOrEqualTo(0).When(x => x.MonthlyRent.HasValue).WithMessage("MonthlyRent must be >= 0");
        RuleFor(x => x.SecurityDeposit).GreaterThanOrEqualTo(0).When(x => x.SecurityDeposit.HasValue).WithMessage("SecurityDeposit must be >= 0");
        RuleFor(x => x.MaintenanceCharges).GreaterThanOrEqualTo(0).When(x => x.MaintenanceCharges.HasValue).WithMessage("MaintenanceCharges must be >= 0");

        // JSON fields are stored as strings in the model; ensure they're not excessively large when provided
        RuleFor(x => x.UnitAmenities).MaximumLength(20000).When(x => !string.IsNullOrWhiteSpace(x.UnitAmenities)).WithMessage("UnitAmenities too large");
        RuleFor(x => x.UnitPhotos).MaximumLength(20000).When(x => !string.IsNullOrWhiteSpace(x.UnitPhotos)).WithMessage("UnitPhotos too large");

        // Status length constraint
        RuleFor(x => x.Status).MaximumLength(50).When(x => !string.IsNullOrWhiteSpace(x.Status)).WithMessage("Status must be 50 characters or fewer");
    }
}