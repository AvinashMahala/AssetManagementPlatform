using System.IO;
using Microsoft.AspNetCore.Hosting;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace MyApp.Api.Swagger
{
    /// <summary>
    /// Loads long-form tag documentation from ApiDocs/Tags/{Tag}.md and attaches descriptions to tags in the generated OpenAPI doc.
    /// </summary>
    public class TagDocsDocumentFilter : IDocumentFilter
    {
        private readonly string _root;

        public TagDocsDocumentFilter(IWebHostEnvironment env)
        {
            _root = Path.Combine(env.ContentRootPath, "ApiDocs", "Tags");
        }

        public void Apply(OpenApiDocument swaggerDoc, DocumentFilterContext context)
        {
            if (!Directory.Exists(_root)) return;

            var files = Directory.GetFiles(_root, "*.md");
            foreach (var file in files)
            {
                var tagName = Path.GetFileNameWithoutExtension(file);
                var md = File.ReadAllText(file);
                var desc = ExtractBodyWithoutFrontMatter(md);

                // Find existing tag or add new
                var existing = swaggerDoc.Tags.FirstOrDefault(t => t.Name == tagName);
                if (existing != null)
                {
                    existing.Description = desc;
                }
                else
                {
                    swaggerDoc.Tags.Add(new OpenApiTag { Name = tagName, Description = desc });
                }
            }
        }

        private string ExtractBodyWithoutFrontMatter(string md)
        {
            var body = md.Trim();

            // Remove YAML front matter if present
            if (body.StartsWith("---"))
            {
                var idx = body.IndexOf("---", 3);
                if (idx >= 0)
                {
                    body = body.Substring(idx + 3).Trim();
                }
            }

            // Remove an initial H1/H2 heading (e.g., "# Properties" or "## Properties") or a first-line equal to the tag name
            var lines = body.Split(new[] { '\r', '\n' }, StringSplitOptions.RemoveEmptyEntries).ToList();
            if (lines.Count > 0)
            {
                var first = lines[0].Trim();
                if (first.StartsWith("#"))
                {
                    // drop the heading line
                    lines.RemoveAt(0);
                }
                else
                {
                    // If first line equals the tag name, drop it (case-insensitive)
                    // tag name will be handled by caller who passes filename, so we conservatively drop if it's a short line < 64 chars
                    if (first.Length < 64 && !first.Contains(" ") && !first.EndsWith(":"))
                    {
                        lines.RemoveAt(0);
                    }
                }
            }

            return string.Join('\n', lines).Trim();
        }
    }
}
