using System;

namespace MyApp.Services.Exceptions;

public class DuplicatePropertyException : Exception
{
    public Guid ExistingId { get; }

    public DuplicatePropertyException(string message, Guid existingId) : base(message)
    {
        ExistingId = existingId;
    }
}
