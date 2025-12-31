using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MyApp.Models;

namespace MyApp.Repositories.Configurations
{
    public class SessionJtiConfiguration : IEntityTypeConfiguration<SessionJti>
    {
        public void Configure(EntityTypeBuilder<SessionJti> builder)
        {
            builder.ToTable("session_jtis");
            builder.HasKey(x => x.Id);
            builder.Property(x => x.Id).HasColumnName("id");
            builder.Property(x => x.Jti).HasColumnName("jti").IsRequired().HasMaxLength(100);
            builder.Property(x => x.ExpiresAt).HasColumnName("expires_at").IsRequired();
            builder.Property(x => x.SessionId).HasColumnName("session_id");
            builder.Property(x => x.CreatedAt).HasColumnName("created_at");
            builder.HasIndex(x => x.Jti).IsUnique();
            builder.HasIndex(x => x.SessionId);
        }
    }
}