using System.ComponentModel.DataAnnotations;
using System;

namespace MyApp.Api.Requests;

public class UtilityTypeCreateRequest
{
    [Required]
    [MaxLength(50)]
    public string Key { get; set; } = string.Empty;

    [MaxLength(100)]
    public string? Name { get; set; }

    [MaxLength(50)]
    public string? UnitOfMeasure { get; set; }

    // JSON string for metadata (optional)
    public string? Metadata { get; set; }
}

public class UtilityTypeUpdateRequest
{
    [MaxLength(100)]
    public string? Name { get; set; }

    [MaxLength(50)]
    public string? UnitOfMeasure { get; set; }

    public string? Metadata { get; set; }
}