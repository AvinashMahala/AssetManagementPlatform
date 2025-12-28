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
            var httpMethod = context.ApiDescription.HttpMethod?.ToUpperInvariant() ?? "GET";

            var controllerDir = Path.Combine(_root, controller);

            // Primary convention (route-based): `{HTTPMETHOD}.{normalized-route}` where normalized-route is the relative
            // path with `api/` stripped, slashes replaced by dots, and route constraints removed: e.g., `GET.properties.{id}`
            string? endpointDir = null;
            if (Directory.Exists(controllerDir))
            {
                // Build normalized candidate from ApiDescription.RelativePath
                var rel = context.ApiDescription.RelativePath ?? string.Empty;
                var relOnly = rel.Split('?')[0].Trim('/');
                if (relOnly.StartsWith("api/", StringComparison.InvariantCultureIgnoreCase)) relOnly = relOnly.Substring(4);
                // Remove route constraints like {id:guid} -> {id}
                relOnly = System.Text.RegularExpressions.Regex.Replace(relOnly, "\\{([^:}]+):[^}]+\\}", "{$1}");
                var normalized = relOnly.Replace('/', '.');

                var candidate = $"{httpMethod}.{normalized}";
                // Look up exact match in the controller's ApiDocs folder (case-insensitive)
                var topDirs = Directory.GetDirectories(controllerDir, "*", SearchOption.TopDirectoryOnly);
                endpointDir = topDirs.FirstOrDefault(d => string.Equals(Path.GetFileName(d), candidate, StringComparison.InvariantCultureIgnoreCase));
            }

            if (!string.IsNullOrEmpty(endpointDir))
            {
                var descPath = Path.Combine(endpointDir, "description.md");
                if (File.Exists(descPath))
                {
                    var md = File.ReadAllText(descPath);
                    var (frontMatterJson, body) = ExtractFrontMatter(md);
                    if (frontMatterJson != null)
                    {
                        ApplyYamlFrontMatterToOperation(frontMatterJson, operation);
                        operation.Description = string.IsNullOrWhiteSpace(operation.Description) ? body : operation.Description + "\n\n" + body;
                    }
                    else
                    {
                        operation.Summary = ExtractSummary(md) ?? operation.Summary;
                        operation.Description = md;
                    }
                }
            }

            // Look for request/response fragments inside the endpoint folder (canonical layout)
            try
            {
                // endpointDir determined above (we already set endpointDir when reading description.md)
                if (!string.IsNullOrEmpty(endpointDir))
                {
                    // request.json
                    var requestPath = Path.Combine(endpointDir, "request.json");
                    if (File.Exists(requestPath))
                    {
                        var json = File.ReadAllText(requestPath);
                        using var doc = JsonDocument.Parse(json);
                        var root = doc.RootElement;

                        // Accept either a full requestBody-like object (with content) or a content map
                        if (root.ValueKind == JsonValueKind.Object && root.TryGetProperty("content", out var contentEl))
                        {
                            ApplyRequestContentFromJson(contentEl, operation);
                        }
                        else if (root.ValueKind == JsonValueKind.Object && root.TryGetProperty("example", out var exampleEl))
                        {
                            operation.RequestBody ??= new OpenApiRequestBody();
                            var exAny = JsonToOpenApiAnyConverter.Convert(exampleEl);

                            // Preserve existing schema for application/json if present
                            OpenApiSchema? existingSchema = null;
                            if (operation.RequestBody.Content.TryGetValue("application/json", out var existing)) existingSchema = existing.Schema;

                            var media = new OpenApiMediaType { Example = exAny, Schema = existingSchema ?? new OpenApiSchema() };
                            // Mirror into schema example as well for better compatibility
                            media.Schema.Example = exAny;
                            operation.RequestBody.Content["application/json"] = media;
                            // If a request example exists, mark request body required so UI shows it consistently
                            operation.RequestBody.Required = true;
                            // Also ensure other json-like content types also have the example (so default media selection doesn't hide it)
                            foreach (var kv in operation.RequestBody.Content)
                            {
                                if (string.Equals(kv.Key, "application/json", StringComparison.InvariantCultureIgnoreCase)) continue;
                                if (!kv.Key.Contains("json", StringComparison.InvariantCultureIgnoreCase)) continue;

                                kv.Value.Example ??= exAny;
                                kv.Value.Schema ??= new OpenApiSchema();
                                kv.Value.Schema.Example ??= exAny;
                            }
                        }
                    }

                    // responses/*.json
                    var responsesDir = Path.Combine(endpointDir, "responses");
                    if (Directory.Exists(responsesDir))
                    {
                        foreach (var f in Directory.GetFiles(responsesDir, "*.json"))
                        {
                            var fileName = Path.GetFileNameWithoutExtension(f);
                            var status = fileName; // e.g., '200', '404', 'default'
                            try
                            {
                                var txt = File.ReadAllText(f);
                                using var doc = JsonDocument.Parse(txt);
                                var root = doc.RootElement;

                                var respObj = new OpenApiResponse();
                                if (root.TryGetProperty("description", out var rd)) respObj.Description = rd.GetString() ?? string.Empty;

                                if (root.TryGetProperty("content", out var contentNode))
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
                                            IOpenApiAny? firstExample = null;
                                            foreach (var ex in examples.EnumerateObject())
                                            {
                                                var exName = ex.Name;
                                                var exObj = ex.Value;
                                                if (exObj.TryGetProperty("value", out var ev))
                                                {
                                                    var converted = JsonToOpenApiAnyConverter.Convert(ev);
                                                    // Preserve previous extension behavior for backwards-compat
                                                    mediaObj.Extensions[$"x-example-{exName}"] = converted is IOpenApiPrimitive p ? new OpenApiString(p.ToString()) : new OpenApiString(ev.GetRawText());
                                                    if (firstExample == null) firstExample = converted;
                                                    if (exName.Equals("default", StringComparison.InvariantCultureIgnoreCase)) firstExample = converted;
                                                }
                                            }
                                            if (firstExample != null) mediaObj.Example = firstExample;
                                        }

                                        respObj.Content[mediaType] = mediaObj;
                                    }
                                }

                                operation.Responses[status] = respObj;
                            }
                            catch
                            {
                                // ignore malformed response file
                            }
                        }
                    }

                    // parameters.json or parameters/ (optional)
                    var paramsPath = Path.Combine(endpointDir, "parameters.json");
                    if (File.Exists(paramsPath))
                    {
                        try
                        {
                            var ptxt = File.ReadAllText(paramsPath);
                            using var pdoc = JsonDocument.Parse(ptxt);
                            ApplyParameterExamplesFromJson(pdoc.RootElement, operation);
                        }
                        catch
                        {
                            // ignore malformed parameters file
                        }
                    }

                    var paramsDir = Path.Combine(endpointDir, "parameters");
                    if (Directory.Exists(paramsDir))
                    {
                        foreach (var f in Directory.GetFiles(paramsDir, "*.json"))
                        {
                            try
                            {
                                var ptxt = File.ReadAllText(f);
                                using var pdoc = JsonDocument.Parse(ptxt);
                                ApplyParameterExamplesFromJson(pdoc.RootElement, operation);
                            }
                            catch
                            {
                                // ignore malformed param file
                            }
                        }
                    }
                }
            }
            catch
            {
                // ignore any file system errors
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

        private void ApplyRequestContentFromJson(JsonElement contentEl, OpenApiOperation operation)
        {
            foreach (var media in contentEl.EnumerateObject())
            {
                var mediaType = media.Name;
                var mediaVal = media.Value;
                var mediaObj = new OpenApiMediaType();

                // Preserve any existing schema on the operation's request media so we don't lose $ref information
                if (operation.RequestBody?.Content != null && operation.RequestBody.Content.TryGetValue(mediaType, out var existingMedia))
                {
                    mediaObj.Schema = existingMedia.Schema;
                }

                if (mediaVal.TryGetProperty("example", out var example))
                {
                    var exAny = JsonToOpenApiAnyConverter.Convert(example);
                    mediaObj.Example = exAny;
                    // Also set schema.example to increase compatibility with Swagger UI
                    if (mediaObj.Schema == null) mediaObj.Schema = new OpenApiSchema();
                    mediaObj.Schema.Example = exAny;
                }

                if (mediaVal.TryGetProperty("examples", out var examples))
                {
                    IOpenApiAny? firstExample = null;
                    foreach (var ex in examples.EnumerateObject())
                    {
                        var exName = ex.Name;
                        var exObj = ex.Value;
                        if (exObj.TryGetProperty("value", out var ev))
                        {
                            var converted = JsonToOpenApiAnyConverter.Convert(ev);
                            // Preserve extension for backward compatibility
                            mediaObj.Extensions[$"x-example-{exName}"] = converted is IOpenApiPrimitive p ? new OpenApiString(p.ToString()) : new OpenApiString(ev.GetRawText());
                            if (firstExample == null) firstExample = converted;
                            if (exName.Equals("default", StringComparison.InvariantCultureIgnoreCase)) firstExample = converted;
                        }
                    }
                    if (firstExample != null)
                    {
                        mediaObj.Example = firstExample;
                        if (mediaObj.Schema == null) mediaObj.Schema = new OpenApiSchema();
                        mediaObj.Schema.Example = firstExample;
                    }
                }

                operation.RequestBody ??= new OpenApiRequestBody();
                operation.RequestBody.Content[mediaType] = mediaObj;
                // If we've attached an example to the request content, prefer showing it in the UI
                if (mediaObj.Example != null)
                {
                    operation.RequestBody.Required = true;
                    // Propagate the example to other JSON-like content types so UI shows it regardless of selected media
                    foreach (var kv in operation.RequestBody.Content)
                    {
                        if (string.Equals(kv.Key, mediaType, StringComparison.InvariantCultureIgnoreCase)) continue;
                        if (!kv.Key.Contains("json", StringComparison.InvariantCultureIgnoreCase)) continue;

                        kv.Value.Example ??= mediaObj.Example;
                        kv.Value.Schema ??= new OpenApiSchema();
                        if (mediaObj.Schema?.Example != null)
                            kv.Value.Schema.Example ??= mediaObj.Schema.Example;
                    }
                }
            }
        }

        internal void ApplyParameterExamplesFromJson(JsonElement root, OpenApiOperation operation)
        {
            // root expected shape:
            // { "parameters": { "path": { "id": { "example": "..." } }, "query": { "page": { "example": 2 } } }, "sets": { "default": { "id": "..." } } }
            if (root.ValueKind != JsonValueKind.Object) return;

            if (root.TryGetProperty("parameters", out var pnode) && pnode.ValueKind == JsonValueKind.Object)
            {
                foreach (var loc in pnode.EnumerateObject())
                {
                    var locName = loc.Name.ToLowerInvariant();
                    if (loc.Value.ValueKind != JsonValueKind.Object) continue;

                    if (!TryMapParameterLocation(locName, out var paramLoc)) continue;

                    foreach (var prop in loc.Value.EnumerateObject())
                    {
                        var paramName = prop.Name;
                        var paramObj = prop.Value;

                        // pick example or first from examples
                        IOpenApiAny? exampleAny = null;
                        if (paramObj.TryGetProperty("example", out var ex))
                        {
                            exampleAny = JsonToOpenApiAnyConverter.Convert(ex);
                        }
                        else if (paramObj.TryGetProperty("examples", out var examples) && examples.ValueKind == JsonValueKind.Object)
                        {
                            foreach (var exkp in examples.EnumerateObject())
                            {
                                if (exkp.Value.ValueKind == JsonValueKind.Object && exkp.Value.TryGetProperty("value", out var ev))
                                {
                                    exampleAny = JsonToOpenApiAnyConverter.Convert(ev);
                                    if (exkp.Name.Equals("default", StringComparison.InvariantCultureIgnoreCase)) break;
                                }
                            }
                        }

                        // attach to matching parameter or create one
                        var existing = operation.Parameters.FirstOrDefault(p => p.Name == paramName && p.In == paramLoc);
                        if (existing != null)
                        {
                            if (exampleAny != null) existing.Example = exampleAny;
                        }
                        else
                        {
                            var newParam = new OpenApiParameter { Name = paramName, In = paramLoc, Required = paramLoc == ParameterLocation.Path };
                            if (exampleAny != null) newParam.Example = exampleAny;
                            operation.Parameters.Add(newParam);
                        }

                        // preserve named examples as extensions
                        if (paramObj.TryGetProperty("examples", out var namedExamples) && namedExamples.ValueKind == JsonValueKind.Object)
                        {
                            var dict = new OpenApiObject();
                            foreach (var namedEx in namedExamples.EnumerateObject())
                            {
                                if (namedEx.Value.ValueKind == JsonValueKind.Object && namedEx.Value.TryGetProperty("value", out var ev))
                                {
                                    var converted = ev.GetRawText();
                                    dict["x-example-" + namedEx.Name] = new OpenApiString(converted);
                                }
                            }

                            // attach to operation as a hint as well
                            foreach (var p in operation.Parameters.Where(p => p.Name == paramName && p.In == paramLoc))
                            {
                                foreach (var kv in dict) p.Extensions[kv.Key] = kv.Value;
                            }
                        }
                    }
                }
            }

            // sets
            if (root.TryGetProperty("sets", out var sets) && sets.ValueKind == JsonValueKind.Object)
            {
                var obj = new OpenApiObject();
                foreach (var set in sets.EnumerateObject())
                {
                    obj[set.Name] = new OpenApiString(set.Value.GetRawText());
                }

                operation.Extensions["x-parameter-sets"] = obj;
            }
        }

        private bool TryMapParameterLocation(string loc, out ParameterLocation result)
        {
            result = ParameterLocation.Query;
            return loc switch
            {
                "path" => (result = ParameterLocation.Path) != null,
                "query" => (result = ParameterLocation.Query) != null,
                "header" => (result = ParameterLocation.Header) != null,
                "cookie" => (result = ParameterLocation.Cookie) != null,
                _ => false,
            };
        }
    }
}
