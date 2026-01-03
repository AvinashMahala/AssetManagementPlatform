using FluentValidation;
using MyApp.Models;

namespace MyApp.Api.Validators;

public class TenantValidator : AbstractValidator<Tenant>
{
    public TenantValidator()
    {
        RuleFor(x => x.FirstName).NotEmpty().WithMessage("FirstName is required");
        RuleFor(x => x.LastName).NotEmpty().WithMessage("LastName is required");
        RuleFor(x => x.Email).EmailAddress().When(x => !string.IsNullOrWhiteSpace(x.Email)).WithMessage("Email is invalid");
    }
}