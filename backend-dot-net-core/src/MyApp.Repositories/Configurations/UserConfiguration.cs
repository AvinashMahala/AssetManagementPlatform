using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MyApp.Models;

namespace MyApp.Repositories.Configurations;

public class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.ToTable("users");

        builder.Property(u => u.Id).HasColumnName("id");
        builder.Property(u => u.Email).HasColumnName("email");
        builder.Property(u => u.Username).HasColumnName("username").IsRequired().HasMaxLength(255);
        builder.Property(u => u.PasswordHash).HasColumnName("password");
        builder.Property(u => u.DisplayName).HasColumnName("name");
        builder.Property(u => u.GoogleId).HasColumnName("google_id");
        builder.Property(u => u.RefreshToken).HasColumnName("refresh_token");
        builder.Property(u => u.RefreshTokenExpiry).HasColumnName("refresh_token_expiry");

        // Additional auth/verification/audit mappings
        builder.Property(u => u.Phone).HasColumnName("phone");
        builder.Property(u => u.Role).HasColumnName("role");
        builder.Property(u => u.ProfilePicture).HasColumnName("profile_picture");
        builder.Property(u => u.IsEmailVerified).HasColumnName("is_email_verified");
        builder.Property(u => u.EmailVerificationToken).HasColumnName("email_verification_token");
        builder.Property(u => u.EmailVerificationExpires).HasColumnName("email_verification_expires");
        builder.Property(u => u.IsPhoneVerified).HasColumnName("is_phone_verified");
        builder.Property(u => u.PasswordResetToken).HasColumnName("password_reset_token");
        builder.Property(u => u.PasswordResetExpires).HasColumnName("password_reset_expires");
        builder.Property(u => u.LastLogin).HasColumnName("last_login");
        builder.Property(u => u.CreatedAt).HasColumnName("created_at");
        builder.Property(u => u.UpdatedAt).HasColumnName("updated_at");

        // Add keys, indexes, relationships, etc. here if needed
    }
}