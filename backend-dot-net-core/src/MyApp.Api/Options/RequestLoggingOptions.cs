namespace MyApp.Api.Options
{
    public class RequestLoggingOptions
    {
        public bool Enabled { get; set; } = true;
        public bool IncludeRequestBody { get; set; } = false;
        public int MaxBodySizeBytes { get; set; } = 4096;
        public string[] SensitiveHeaders { get; set; } = new string[] { "Authorization", "Cookie" };
    }
}