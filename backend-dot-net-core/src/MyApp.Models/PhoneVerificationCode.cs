using System;

namespace MyApp.Models;

public class PhoneVerificationCode
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string Phone { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
    public bool Verified { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
