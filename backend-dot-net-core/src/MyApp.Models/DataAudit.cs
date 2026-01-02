using System.Collections.Generic;

namespace MyApp.Models;

public class DataAuditIssue
{
    public string Field { get; set; } = string.Empty;
    public object? Requested { get; set; }
    public object? Stored { get; set; }
    public string Reason { get; set; } = string.Empty; // e.g., truncated|normalized|defaulted|coerced
}

public class DataAuditResult
{
    public bool Success { get; set; } = true;
    public List<DataAuditIssue> Issues { get; set; } = new List<DataAuditIssue>();
}
