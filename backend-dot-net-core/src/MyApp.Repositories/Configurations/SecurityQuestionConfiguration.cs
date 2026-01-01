using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MyApp.Models;

namespace MyApp.Repositories.Configurations;

public class SecurityQuestionConfiguration : IEntityTypeConfiguration<SecurityQuestion>
{
    public void Configure(EntityTypeBuilder<SecurityQuestion> builder)
    {
        builder.ToTable("security_questions");
        builder.Property(p => p.Id).HasColumnName("id");
        builder.Property(p => p.UserId).HasColumnName("user_id");
        builder.Property(p => p.Question).HasColumnName("question");
        builder.Property(p => p.AnswerHash).HasColumnName("answer_hash");
        builder.Property(p => p.CreatedAt).HasColumnName("created_at");
        builder.Property(p => p.UpdatedAt).HasColumnName("updated_at");
    }
}
