namespace MyApp.Api.Options
{
    public class SecurityHeadersOptions
    {
        public bool Enabled { get; set; } = true;
        public string ContentSecurityPolicy { get; set; } = "default-src 'self';";
        public bool StrictTransportSecurity { get; set; } = true;
        public string XContentTypeOptions { get; set; } = "nosniff";
        public string XFrameOptions { get; set; } = "DENY";
        public string ReferrerPolicy { get; set; } = "no-referrer";
    }
}