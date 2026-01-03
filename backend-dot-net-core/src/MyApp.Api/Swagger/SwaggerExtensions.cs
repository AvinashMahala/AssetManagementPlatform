using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.OpenApi.Models;
using System;
using Microsoft.AspNetCore.Mvc.ApiExplorer;

namespace MyApp.Api.Swagger
{
    public static class SwaggerExtensions
    {
        public static IServiceCollection AddMyAppSwagger(this IServiceCollection services)
        {
            services.AddEndpointsApiExplorer();

            services.AddSwaggerGen(options =>
            {
                // Add JWT Bearer definition so Swagger UI can send the Authorization header
                options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
                {
                    Name = "Authorization",
                    Type = SecuritySchemeType.Http,
                    Scheme = "bearer",
                    BearerFormat = "JWT",
                    In = ParameterLocation.Header,
                    Description = "JWT Authorization header using the Bearer scheme. Example: \"Bearer {token}\""
                });

                options.AddSecurityRequirement(new OpenApiSecurityRequirement
                {
                    {
                        new OpenApiSecurityScheme
                        {
                            Reference = new OpenApiReference
                            {
                                Type = ReferenceType.SecurityScheme,
                                Id = "Bearer"
                            }
                        },
                        new string[] { }
                    }
                });

                // Load external per-endpoint docs from ApiDocs (see ApiDocs/README.md)
                options.OperationFilter<ExternalDocsOperationFilter>();
                options.OperationFilter<AddDeviceHeaderOperationFilter>();
                options.DocumentFilter<TagDocsDocumentFilter>();
                // Lowercase path keys so controller segments appear in lower case in Swagger UI (e.g. /api/v1/auth/login)
                options.DocumentFilter<LowercasePathsDocumentFilter>();

                var xmlFile = System.IO.Path.ChangeExtension(System.Reflection.Assembly.GetExecutingAssembly().Location, ".xml");
                if (System.IO.File.Exists(xmlFile)) options.IncludeXmlComments(xmlFile);

                // Only include endpoints that belong to the swagger document's API version group
                // and whose path contains the version segment (e.g., "v1"). This prevents duplicate
                // unversioned routes from appearing in the versioned docs.
                options.DocInclusionPredicate((docName, apiDesc) =>
                {
                    if (apiDesc.GroupName != docName) return false;

                    var relativePath = apiDesc.RelativePath ?? string.Empty;
                    if (!relativePath.Contains($"{docName}/") && !relativePath.EndsWith(docName, StringComparison.OrdinalIgnoreCase))
                    {
                        return false;
                    }

                    return true;
                });

                // Register a Swagger document for each discovered API version
                var provider = services.BuildServiceProvider().GetRequiredService<IApiVersionDescriptionProvider>();
                foreach (var description in provider.ApiVersionDescriptions)
                {
                    options.SwaggerDoc(description.GroupName, new OpenApiInfo { Title = $"MyApp API {description.GroupName}", Version = description.GroupName });
                }
            });

            return services;
        }

        public static IApplicationBuilder UseMyAppSwaggerUI(this IApplicationBuilder app)
        {
            var provider = app.ApplicationServices.GetRequiredService<IApiVersionDescriptionProvider>();

            app.UseSwagger();
            app.UseSwaggerUI(c =>
            {
                // Expose a swagger endpoint for each discovered API version
                foreach (var description in provider.ApiVersionDescriptions)
                {
                    c.SwaggerEndpoint($"/swagger/{description.GroupName}/swagger.json", $"MyApp API {description.GroupName}");
                }

                // Collapse sections by default
                c.DocExpansion(Swashbuckle.AspNetCore.SwaggerUI.DocExpansion.None);
                // Inject custom JS to add Collapse All / Expand All buttons and force collapse
                c.InjectJavascript("/swagger-ui/swagger-custom.js");

                // Persist authorization so that the bearer token survives page refreshes
                // (Matches the behavior used for the Express UI in shared config)
                c.ConfigObject.AdditionalItems["persistAuthorization"] = true;
            });

            return app;
        }
    }
}
