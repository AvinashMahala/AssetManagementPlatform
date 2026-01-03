using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;
using System.Collections.Generic;
using System.Linq;

namespace MyApp.Api.Swagger
{
    /// <summary>
    /// Document filter to lowercase all path keys in the generated OpenAPI document so paths like
    /// /api/v1/Auth/login become /api/v1/auth/login in Swagger UI.
    /// </summary>
    public class LowercasePathsDocumentFilter : IDocumentFilter
    {
        public void Apply(OpenApiDocument swaggerDoc, DocumentFilterContext context)
        {
            if (swaggerDoc?.Paths == null) return;

            var paths = new OpenApiPaths();
            foreach (var kv in swaggerDoc.Paths)
            {
                var lowerKey = kv.Key?.ToLowerInvariant() ?? string.Empty;
                if (!paths.ContainsKey(lowerKey))
                {
                    paths.Add(lowerKey, kv.Value);
                }
                else
                {
                    // Merge operations if collision occurs (unlikely, but safe)
                    var existing = paths[lowerKey];
                    foreach (var op in kv.Value.Operations)
                    {
                        existing.Operations[op.Key] = op.Value;
                    }
                }
            }

            // Replace with the lowercased dictionary
            swaggerDoc.Paths = paths;
        }
    }
}