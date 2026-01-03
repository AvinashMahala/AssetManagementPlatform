using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MyApp.Models;

namespace MyApp.Repositories.Configurations;

public class PermissionConfiguration : IEntityTypeConfiguration<Permission>
{
    public void Configure(EntityTypeBuilder<Permission> builder)
    {
        builder.ToTable("permissions");

        // Id column and DB default
        builder.Property(p => p.Id).HasColumnName("id").HasDefaultValueSql("gen_random_uuid()");
        builder.Property(p => p.Name).HasColumnName("name").IsRequired().HasMaxLength(255);
        builder.Property(p => p.Description).HasColumnName("description");

        builder.HasIndex(p => p.Name).IsUnique();

        builder.HasMany(p => p.RolePermissions).WithOne(rp => rp.Permission).HasForeignKey(rp => rp.PermissionId);

        // Optional category relationship
        builder.Property(p => p.CategoryId).HasColumnName("category_id");
        builder.HasOne(p => p.Category).WithMany().HasForeignKey(p => p.CategoryId);
    }
}