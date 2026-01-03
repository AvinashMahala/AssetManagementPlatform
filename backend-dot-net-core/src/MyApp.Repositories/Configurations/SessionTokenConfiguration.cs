using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MyApp.Models;

namespace MyApp.Repositories.Configurations;

public class SessionTokenConfiguration : IEntityTypeConfiguration<SessionToken>
{
    public void Configure(EntityTypeBuilder<SessionToken> builder)
    {
        builder.ToTable("session_tokens");
        builder.HasKey(s => s.Id);

        builder.Property(t => t.Id).HasColumnName("id");
        builder.Property(s => s.UserId).HasColumnName("user_id");

        builder.Property(s => s.RefreshTokenHash)
                .HasColumnName("refresh_token_hash")
                .IsRequired()
                .HasMaxLength(64);

        builder.Property(s => s.IssuedAt).HasColumnName("issued_at").IsRequired();
        builder.Property(s => s.ExpiresAt).HasColumnName("expires_at").IsRequired();
        builder.Property(s => s.Revoked).HasColumnName("revoked").IsRequired().HasDefaultValue(false);
        builder.Property(s => s.DeviceInfo).HasColumnName("device_info");
        builder.Property(s => s.IpAddress).HasColumnName("ip_address");
        builder.Property(s => s.UserAgent).HasColumnName("user_agent");
        builder.Property(s => s.LastUsedAt).HasColumnName("last_used_at");
        builder.Property(s => s.ReplacedBySessionId).HasColumnName("replaced_by_session_id");
        builder.Property(s => s.CreatedAt).HasColumnName("created_at").IsRequired();

        builder.HasIndex(s => s.UserId);
        builder.HasIndex(s => s.RefreshTokenHash).IsUnique();
        builder.HasIndex(s => s.Revoked);
    }
}