namespace MyApp.Api.Options
{
    public class CorrelationIdOptions
    {
        public string HeaderName { get; set; } = "X-Correlation-ID";
        public bool UseTraceIdIfMissing { get; set; } = true;
    }
}