using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MyApp.Models;

namespace MyApp.Repositories.Configurations;

public class PasswordResetMethodConfiguration : IEntityTypeConfiguration<PasswordResetMethod>
{
    public void Configure(EntityTypeBuilder<PasswordResetMethod> builder)
    {
        builder.ToTable("password_reset_methods");
        builder.Property(p => p.Id).HasColumnName("id");
        builder.Property(p => p.UserId).HasColumnName("user_id");
        builder.Property(p => p.MethodType).HasColumnName("method_type");
        builder.Property(p => p.IsEnabled).HasColumnName("is_enabled");
        builder.Property(p => p.CreatedAt).HasColumnName("created_at");
        builder.Property(p => p.UpdatedAt).HasColumnName("updated_at");
    }
}
