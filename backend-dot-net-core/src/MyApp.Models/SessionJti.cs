using System;

namespace MyApp.Models
{
    public class SessionJti
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid SessionId { get; set; }
        public string Jti { get; set; } = string.Empty; // raw jti GUID string
        public DateTime ExpiresAt { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
