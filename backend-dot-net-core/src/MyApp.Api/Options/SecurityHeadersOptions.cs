namespace MyApp.Api.Options
{
    public class SecurityHeadersOptions
    {
        public bool EnableCsp { get; set; } = true;
        public string CspValue { get; set; } = "default-src 'self'; object-src 'none'; frame-ancestors 'none'; base-uri 'self';";

        public bool EnableHsts { get; set; } = true;
        public string HstsValue { get; set; } = "max-age=31536000; includeSubDomains";

        public bool EnableXContentTypeOptions { get; set; } = true;
        public string XContentTypeOptionsValue { get; set; } = "nosniff";

        public bool EnableXFrameOptions { get; set; } = true;
        public string XFrameOptionsValue { get; set; } = "DENY";

        public bool EnableReferrerPolicy { get; set; } = true;
        public string ReferrerPolicyValue { get; set; } = "no-referrer";
    }
}