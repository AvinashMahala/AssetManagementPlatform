using FluentValidation;
using MyApp.Models;

namespace MyApp.Api.Validators;

public class UserAdminValidator : AbstractValidator<User>
{
    public UserAdminValidator()
    {
        RuleFor(x => x.DisplayName).NotEmpty().WithMessage("DisplayName is required");
        RuleFor(x => x.Email).EmailAddress().WithMessage("Email is invalid");
    }
}