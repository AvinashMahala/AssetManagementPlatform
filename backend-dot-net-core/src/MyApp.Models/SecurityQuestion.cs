using System;

namespace MyApp.Models;

public class SecurityQuestion
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string Question { get; set; } = string.Empty;
    public string AnswerHash { get; set; } = string.Empty;
}
