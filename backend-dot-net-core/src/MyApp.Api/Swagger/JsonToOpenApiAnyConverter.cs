using System.Text.Json;
using Microsoft.OpenApi.Any;

namespace MyApp.Api.Swagger
{
    internal static class JsonToOpenApiAnyConverter
    {
        public static IOpenApiAny Convert(JsonElement element)
        {
            switch (element.ValueKind)
            {
                case JsonValueKind.Object:
                    var obj = new OpenApiObject();
                    foreach (var prop in element.EnumerateObject())
                    {
                        obj[prop.Name] = Convert(prop.Value);
                    }
                    return obj;
                case JsonValueKind.Array:
                    var arr = new OpenApiArray();
                    foreach (var item in element.EnumerateArray()) arr.Add(Convert(item));
                    return arr;
                case JsonValueKind.String:
                    return new OpenApiString(element.GetString() ?? string.Empty);
                case JsonValueKind.Number:
                    if (element.TryGetInt64(out var i)) return new OpenApiLong(i);
                    if (element.TryGetDouble(out var d)) return new OpenApiDouble(d);
                    return new OpenApiString(element.GetRawText());
                case JsonValueKind.True:
                    return new OpenApiBoolean(true);
                case JsonValueKind.False:
                    return new OpenApiBoolean(false);
                case JsonValueKind.Null:
                    return new OpenApiNull();
                default:
                    return new OpenApiString(element.GetRawText());
            }
        }
    }
}
