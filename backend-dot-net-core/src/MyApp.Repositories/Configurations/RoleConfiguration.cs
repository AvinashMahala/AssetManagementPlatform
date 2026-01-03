using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MyApp.Models;

namespace MyApp.Repositories.Configurations;

public class RoleConfiguration : IEntityTypeConfiguration<Role>
{
    public void Configure(EntityTypeBuilder<Role> builder)
    {
        builder.ToTable("roles");

        builder.Property(r => r.Id).HasColumnName("id");
        builder.Property(r => r.Name).HasColumnName("name").IsRequired().HasMaxLength(255);
        builder.Property(r => r.Description).HasColumnName("description");
        builder.Property(r => r.IsSystem).HasColumnName("is_system");
        builder.Property(r => r.TenantId).HasColumnName("tenant_id");

        builder.HasIndex(r => new { r.TenantId, r.Name }).IsUnique();

        builder.HasMany(r => r.RolePermissions).WithOne(rp => rp.Role).HasForeignKey(rp => rp.RoleId);
        builder.HasMany(r => r.UserRoles).WithOne(ur => ur.Role).HasForeignKey(ur => ur.RoleId);
    }
}