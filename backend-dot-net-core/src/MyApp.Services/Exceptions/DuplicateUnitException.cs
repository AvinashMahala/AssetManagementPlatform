using System;

namespace MyApp.Services.Exceptions;

public class DuplicateUnitException : Exception
{
    public object? Details { get; }

    public DuplicateUnitException(string message, object? details = null) : base(message)
    {
        Details = details;
    }
}