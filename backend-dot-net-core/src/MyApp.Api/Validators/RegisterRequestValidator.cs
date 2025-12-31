using FluentValidation;
using MyApp.Models;

namespace MyApp.Api.Validators;

public class RegisterRequestValidator : AbstractValidator<RegisterRequest>
{
    public RegisterRequestValidator()
    {
        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("Email is required")
            .EmailAddress().WithMessage("Email must be a valid email address")
            .MaximumLength(255).WithMessage("Email must be at most 255 characters");

        RuleFor(x => x.Password)
            .NotEmpty().WithMessage("Password is required")
            .MinimumLength(8).WithMessage("Password must be at least 8 characters")
            .MaximumLength(128).WithMessage("Password must be at most 128 characters")
            .Matches(@"[A-Z]").WithMessage("Password must contain at least one uppercase letter")
            .Matches(@"[a-z]").WithMessage("Password must contain at least one lowercase letter")
            .Matches(@"\d").WithMessage("Password must contain a number")
            .Matches(@"[^A-Za-z0-9]").WithMessage("Password must contain at least one special character");

        RuleFor(x => x.DisplayName)
            .MaximumLength(100).WithMessage("Display name must be at most 100 characters")
            .When(x => !string.IsNullOrWhiteSpace(x.DisplayName));

        RuleFor(x => x.Username)
            .MaximumLength(255).WithMessage("Username must be at most 255 characters")
            .Must(u =>
            {
                if (string.IsNullOrWhiteSpace(u)) return true;
                // Allow either a simple username (letters, numbers, underscores) or a valid email address
                var simpleMatch = System.Text.RegularExpressions.Regex.IsMatch(u, "^[a-zA-Z0-9_]+$");
                var emailAttr = new System.ComponentModel.DataAnnotations.EmailAddressAttribute();
                var isEmail = emailAttr.IsValid(u);
                return simpleMatch || isEmail;
            })
            .WithMessage("Username may only contain letters, numbers and underscores, or be a valid email address")
            .When(x => !string.IsNullOrWhiteSpace(x.Username));
    }
}