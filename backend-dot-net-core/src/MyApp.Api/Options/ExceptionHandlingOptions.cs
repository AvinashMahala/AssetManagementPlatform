using System.Collections.Generic;

namespace MyApp.Api.Options
{
    public class ExceptionHandlingOptions
    {
        public bool ShowDetailedErrors { get; set; } = false;
        public bool ShowExceptionStackTrace { get; set; } = false; // when true, include stack trace/exception details in ProblemDetails.Extensions
        public bool LogStackTrace { get; set; } = true;
        public Dictionary<string, int> ExceptionStatusMap { get; set; } = new Dictionary<string, int>
        {
            { "System.ArgumentException", 400 },
            { "System.UnauthorizedAccessException", 401 }
        };
    }
}