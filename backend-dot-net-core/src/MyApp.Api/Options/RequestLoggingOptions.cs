namespace MyApp.Api.Options
{
    public class RequestLoggingOptions
    {
        public bool Enabled { get; set; } = true;
        public bool IncludeRequestBody { get; set; } = false;
        public int MaxBodySizeBytes { get; set; } = 1024 * 8; // 8KB default
        public string[] SensitiveHeaders { get; set; } = new[] { "Authorization", "Cookie" };
    }
}