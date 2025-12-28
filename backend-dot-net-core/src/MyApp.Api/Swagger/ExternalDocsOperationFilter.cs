using System;
using System.IO;
using System.Text.Json;
using Microsoft.AspNetCore.Hosting;
using Microsoft.OpenApi.Any;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace MyApp.Api.Swagger
{
    /// <summary>
    /// Loads external docs for an operation from ApiDocs/{Controller}/{Action}.{method}.md (description) and .json (responses/examples).
    /// </summary>
    public class ExternalDocsOperationFilter : IOperationFilter
    {
        private readonly string _root;

        public ExternalDocsOperationFilter(IWebHostEnvironment env)
        {
            _root = Path.Combine(env.ContentRootPath, "ApiDocs");
        }

        public void Apply(OpenApiOperation operation, OperationFilterContext context)
        {
            var controller = context.MethodInfo.DeclaringType?.Name?.Replace("Controller", "") ?? string.Empty;
            var action = context.MethodInfo.Name;
            var httpMethod = context.ApiDescription.HttpMethod?.ToLowerInvariant() ?? "get";

            var controllerDir = Path.Combine(_root, controller);

            // Primary convention: {Action}.{httpmethod}.md/.json
            var mdFile = Path.Combine(controllerDir, $"{action}.{httpMethod}.md");
            mdFile = FindFallbackFile(mdFile, controllerDir, ".md", action, httpMethod);
            if (File.Exists(mdFile))
            {
                var md = File.ReadAllText(mdFile);
                operation.Summary = ExtractSummary(md) ?? operation.Summary;
                operation.Description = md;
            }

            var jsonFile = Path.Combine(controllerDir, $"{action}.{httpMethod}.json");
            jsonFile = FindFallbackFile(jsonFile, controllerDir, ".json", action, httpMethod);
            if (File.Exists(jsonFile))
            {
                var json = File.ReadAllText(jsonFile);
                using var doc = JsonDocument.Parse(json);
                var root = doc.RootElement;

                if (root.TryGetProperty("summary", out var s)) operation.Summary = s.GetString() ?? operation.Summary;
                if (root.TryGetProperty("description", out var d)) operation.Description = d.GetString() ?? operation.Description;
                if (root.TryGetProperty("responses", out var responses))
                {
                    foreach (var prop in responses.EnumerateObject())
                    {
                        var status = prop.Name;
                        var respObj = new OpenApiResponse();
                        var node = prop.Value;
                        if (node.TryGetProperty("description", out var rd)) respObj.Description = rd.GetString() ?? string.Empty;

                        if (node.TryGetProperty("content", out var contentNode))
                        {
                            foreach (var media in contentNode.EnumerateObject())
                            {
                                var mediaType = media.Name;
                                var mediaObj = new OpenApiMediaType();
                                var mediaVal = media.Value;

                                if (mediaVal.TryGetProperty("example", out var example))
                                {
                                    mediaObj.Example = JsonToOpenApiAnyConverter.Convert(example);
                                }

                                respObj.Content[mediaType] = mediaObj;
                            }
                        }

                        operation.Responses[status] = respObj;
                    }
                }
            }

        }

        private string? ExtractSummary(string md)
        {
            using var reader = new StringReader(md);
            string? line;
            while ((line = reader.ReadLine()) != null)
            {
                line = line.Trim();
                if (line == string.Empty) continue;
                if (line.StartsWith("**Summary**:", StringComparison.InvariantCultureIgnoreCase))
                    return line.Substring("**Summary**:".Length).Trim();
                if (line.StartsWith("Summary:", StringComparison.InvariantCultureIgnoreCase))
                    return line.Substring("Summary:".Length).Trim();
                return line;
            }

            return null;
        }

        private string FindFallbackFile(string primaryPath, string controllerDir, string ext, string action, string httpMethod)
        {
            if (File.Exists(primaryPath)) return primaryPath;
            try
            {
                if (!Directory.Exists(controllerDir)) return primaryPath;
                // Look for any file ending with .{httpMethod}{ext}
                var pattern = $"*.{httpMethod}{ext}";
                var candidates = Directory.GetFiles(controllerDir, pattern);
                if (candidates.Length == 0) return primaryPath;

                // Prefer file that contains the action name
                var actionMatch = candidates.FirstOrDefault(c => Path.GetFileName(c).IndexOf(action, StringComparison.InvariantCultureIgnoreCase) >= 0);
                if (actionMatch != null) return actionMatch;

                // Otherwise prefer files that look like they refer to an id parameter
                var idMatch = candidates.FirstOrDefault(c => Path.GetFileName(c).IndexOf("id", StringComparison.InvariantCultureIgnoreCase) >= 0);
                if (idMatch != null) return idMatch;

                // Otherwise just return first candidate
                return candidates[0];
            }
            catch
            {
                return primaryPath;
            }
        }
    }
}
