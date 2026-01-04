using System;

namespace MyApp.Services.Exceptions
{
    /// <summary>
    /// Generic exception type used by services to represent domain/service-level errors.
    /// </summary>
    public class ServiceException : Exception
    {
        public ServiceException(string message) : base(message) { }
        public ServiceException(string message, Exception inner) : base(message, inner) { }
    }
}
