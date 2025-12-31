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

        // Add keys, indexes, relationships, etc. here if needed
    }
}