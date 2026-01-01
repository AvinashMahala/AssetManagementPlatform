using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MyApp.Models;

namespace MyApp.Repositories.Configurations;

public class RecoveryCodeConfiguration : IEntityTypeConfiguration<RecoveryCode>
{
    public void Configure(EntityTypeBuilder<RecoveryCode> builder)
    {
        builder.ToTable("recovery_codes");
        builder.Property(p => p.Id).HasColumnName("id");
        builder.Property(p => p.UserId).HasColumnName("user_id");
        builder.Property(p => p.CodeHash).HasColumnName("code_hash");
        builder.Property(p => p.Used).HasColumnName("used");
        builder.Property(p => p.CreatedAt).HasColumnName("created_at");
        builder.Property(p => p.UsedAt).HasColumnName("used_at");
    }
}
