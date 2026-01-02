using System;

namespace MyApp.Shared.Exceptions;

public class DuplicateUnitException : Exception
{
    public string Code => "DUPLICATE_UNIT";
    public object? Details { get; }

    public DuplicateUnitException(string message, object? details = null) : base(message)
    {
        Details = details;
    }
}
