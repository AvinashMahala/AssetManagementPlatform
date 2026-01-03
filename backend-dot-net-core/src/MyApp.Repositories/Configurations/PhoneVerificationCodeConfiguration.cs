using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MyApp.Models;

namespace MyApp.Repositories.Configurations;

public class PhoneVerificationCodeConfiguration : IEntityTypeConfiguration<PhoneVerificationCode>
{
    public void Configure(EntityTypeBuilder<PhoneVerificationCode> builder)
    {
        builder.ToTable("phone_verification_codes");
        builder.Property(p => p.Id).HasColumnName("id");
        builder.Property(p => p.UserId).HasColumnName("user_id");
        builder.Property(p => p.Phone).HasColumnName("phone");
        builder.Property(p => p.Code).HasColumnName("code");
        builder.Property(p => p.ExpiresAt).HasColumnName("expires_at");
        builder.Property(p => p.Verified).HasColumnName("verified");
        builder.Property(p => p.CreatedAt).HasColumnName("created_at");
    }
}
