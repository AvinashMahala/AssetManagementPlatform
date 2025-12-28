using System;
using System.IO;
using System.Text.Json;
using Microsoft.AspNetCore.Hosting;
using Microsoft.OpenApi.Any;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;
using YamlDotNet.Serialization;
using YamlDotNet.Serialization.NamingConventions;

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

                // Parse YAML front matter if present
                var (frontMatterJson, body) = ExtractFrontMatter(md);
                if (frontMatterJson != null)
                {
                    ApplyYamlFrontMatterToOperation(frontMatterJson, operation);
                    // Use body (after front matter) as description if not provided in front matter or as additional text
                    operation.Description = string.IsNullOrWhiteSpace(operation.Description) ? body : operation.Description + "\n\n" + body;
                }
                else
                {
                    operation.Summary = ExtractSummary(md) ?? operation.Summary;
                    operation.Description = md;
                }
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

                // Responses (supports examples and multiple named examples)
                if (root.TryGetProperty("responses", out var responses)) ApplyResponsesFromJson(responses, operation.Responses);

                // Request body examples
                if (root.TryGetProperty("requestBody", out var requestBody))
                {
                    if (requestBody.TryGetProperty("content", out var rbContent))
                    {
                        foreach (var media in rbContent.EnumerateObject())
                        {
                            var mediaType = media.Name;
                            var mediaObj = new OpenApiMediaType();
                            var mediaVal = media.Value;

                            if (mediaVal.TryGetProperty("example", out var example))
                            {
                                mediaObj.Example = JsonToOpenApiAnyConverter.Convert(example);
                            }

                            if (mediaVal.TryGetProperty("examples", out var examples))
                            {
                                var dict = new Dictionary<string, OpenApiExample>();
                                foreach (var ex in examples.EnumerateObject())
                                {
                                    var exName = ex.Name;
                                    var exObj = ex.Value;
                                    var openApiExample = new OpenApiExample();
                                    if (exObj.TryGetProperty("summary", out var es)) openApiExample.Summary = es.GetString();
                                    if (exObj.TryGetProperty("value", out var ev)) openApiExample.Value = JsonToOpenApiAnyConverter.Convert(ev);
                                    dict[exName] = openApiExample;
                                }

                                foreach (var kv in dict) mediaObj.Extensions.Add($"x-example-{kv.Key}", new Microsoft.OpenApi.Any.OpenApiString(kv.Value.Value?.ToString() ?? kv.Value.Summary ?? ""));
                                // Note: OpenApiMediaType.Examples is not available in the OpenAPI v3 types here; we store simple extensions per example to allow SwaggerUI to pick them up via customizations if needed.
                            }

                            operation.RequestBody ??= new OpenApiRequestBody();
                            operation.RequestBody.Content[mediaType] = mediaObj;
                        }
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

        private (string? frontMatterJson, string body) ExtractFrontMatter(string md)
        {
            var trimmed = md.TrimStart();
            if (!trimmed.StartsWith("---")) return (null, md);

            // find closing '---' (start at position 3)
            var idx = trimmed.IndexOf("---", 3);
            if (idx < 0) return (null, md);

            var yaml = trimmed.Substring(3, idx - 3);
            var body = trimmed.Substring(idx + 3).Trim();

            try
            {
                var des = new DeserializerBuilder().IgnoreUnmatchedProperties().Build();
                var obj = des.Deserialize(new StringReader(yaml));
                var serializer = new SerializerBuilder().JsonCompatible().Build();
                var json = serializer.Serialize(obj);
                // Return raw JSON string; parsing will happen where needed to avoid JsonDocument lifetime issues
                return (json, body);
            }
            catch
            {
                // Fall back to no front matter
                return (null, md);
            }
        }

        private void ApplyYamlFrontMatterToOperation(string? frontMatterJson, OpenApiOperation operation)
        {
            if (string.IsNullOrWhiteSpace(frontMatterJson)) return;

            try
            {
                using var doc = JsonDocument.Parse(frontMatterJson);
                var fm = doc.RootElement;
                if (fm.ValueKind != JsonValueKind.Object) return;

                if (fm.TryGetProperty("summary", out var s) && s.ValueKind == JsonValueKind.String)
                    operation.Summary = s.GetString() ?? operation.Summary;

                if (fm.TryGetProperty("description", out var d) && d.ValueKind == JsonValueKind.String)
                    operation.Description = d.GetString() ?? operation.Description;

                if (fm.TryGetProperty("tags", out var t) && t.ValueKind == JsonValueKind.Array)
                {
                    operation.Tags.Clear();
                    foreach (var tagEl in t.EnumerateArray())
                    {
                        if (tagEl.ValueKind == JsonValueKind.String) operation.Tags.Add(new OpenApiTag { Name = tagEl.GetString()! });
                    }
                }

                if (fm.TryGetProperty("responses", out var responses))
                {
                    ApplyResponsesFromJson(responses, operation.Responses);
                }
            }
            catch
            {
                // Ignore malformed front matter
            }
        }

        private void ApplyResponsesFromJson(JsonElement responsesEl, IDictionary<string, OpenApiResponse> responsesDict)
        {
            foreach (var prop in responsesEl.EnumerateObject())
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

                        if (mediaVal.TryGetProperty("examples", out var examples))
                        {
                            foreach (var ex in examples.EnumerateObject())
                            {
                                var exName = ex.Name;
                                var exObj = ex.Value;
                                if (exObj.TryGetProperty("value", out var ev))
                                {
                                    var converted = JsonToOpenApiAnyConverter.Convert(ev);
                                    mediaObj.Extensions[$"x-example-{exName}"] = converted is IOpenApiPrimitive p ? new OpenApiString(p.ToString()) : new OpenApiString(ev.GetRawText());
                                }
                            }
                        }

                        respObj.Content[mediaType] = mediaObj;
                    }
                }

                responsesDict[status] = respObj;
            }
        }
    }
}
