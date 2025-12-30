using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace MyApp.Api.Swagger;

public class AddDeviceHeaderOperationFilter : IOperationFilter
{
    public void Apply(OpenApiOperation operation, OperationFilterContext context)
    {
        var path = context.ApiDescription.RelativePath?.ToLowerInvariant() ?? string.Empty;
        if (path.Contains("auth/login") || path.Contains("auth/refresh-token"))
        {
            operation.Parameters ??= new List<OpenApiParameter>();
            operation.Parameters.Add(new OpenApiParameter
            {
                Name = "X-Device-Info",
                In = ParameterLocation.Header,
                Required = false,
                Description = "Optional device info (e.g., device name) used to tag the session",
                Schema = new OpenApiSchema { Type = "string" }
            });
        }
    }
}