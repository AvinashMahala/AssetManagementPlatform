using System;

namespace MyApp.Models;

public class Expense
{
    public Guid Id { get; set; }
    public Guid? PropertyId { get; set; }
    public Guid? UnitId { get; set; }
    public string Description { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string? Category { get; set; }
    public DateTime Date { get; set; } = DateTime.UtcNow;
    public string? CreatedBy { get; set; }
    public string? UpdatedBy { get; set; }
}
