using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using FluentValidation;
using FluentValidation.AspNetCore;
using Microsoft.AspNetCore.Mvc;
using System.Linq;
using MyApp.Services;

namespace MyApp.Api
{
    public static class ServiceCollectionExtensions
    {
        public static IServiceCollection AddMyAppJwtAuthentication(this IServiceCollection services, IConfiguration configuration)
        {
            var jwtSection = configuration.GetSection("Jwt");
            var jwtKey = jwtSection.GetValue<string>("Key") ?? "change_this_in_production";
            var jwtIssuer = jwtSection.GetValue<string>("Issuer") ?? "MyApp";
            var jwtAudience = jwtSection.GetValue<string>("Audience") ?? "MyAppUsers";
            var keyBytes = JwtService.DeriveKeyBytesFromSecret(jwtKey);

            services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
                .AddJwtBearer(options =>
                {
                    options.TokenValidationParameters = new TokenValidationParameters
                    {
                        ValidateIssuer = true,
                        ValidIssuer = jwtIssuer,
                        ValidateAudience = true,
                        ValidAudience = jwtAudience,
                        ValidateIssuerSigningKey = true,
                        IssuerSigningKey = new SymmetricSecurityKey(keyBytes),
                        ValidateLifetime = true
                    };
                });

            services.AddAuthorization();
            return services;
        }

        public static IServiceCollection AddMyAppRateLimitingDefaults(this IServiceCollection services)
        {
            services.PostConfigure<MyApp.Api.Options.RateLimitingOptions>(opts => {
                var key = "POST:/api/v1/auth/refresh-token";
                if (!opts.PerRoutePolicies.ContainsKey(key))
                {
                    opts.PerRoutePolicies[key] = new MyApp.Api.Options.RateLimitPolicy { Limit = 10, WindowSeconds = 60, BurstCapacity = 2, ApplyTo = "IP" };
                }
            });
            return services;
        }

        public static IServiceCollection AddMyAppFluentValidation(this IServiceCollection services)
        {
            services.AddFluentValidationAutoValidation();
            services.AddValidatorsFromAssemblyContaining<MyApp.Api.Controllers.TenantsController>();
            services.Configure<ApiBehaviorOptions>(options =>
            {
                options.InvalidModelStateResponseFactory = context =>
                {
                    var errors = context.ModelState
                        .Where(kvp => kvp.Value.Errors.Count > 0)
                        .Select(kvp => new { field = kvp.Key, errors = kvp.Value.Errors.Select(e => e.ErrorMessage) });
                    var payload = new { success = false, errors = errors };
                    return new BadRequestObjectResult(payload);
                };
            });
            return services;
        }

        public static IConfiguration MapMainDatabaseUrl(this IConfiguration configuration)
        {
            var mainUrl = configuration["MAIN_DATABASE_URL"] ?? configuration["MAIN_DATABASE_URL".ToLower()];
            if (!string.IsNullOrEmpty(mainUrl) && string.IsNullOrEmpty(configuration.GetConnectionString("Default")))
            {
                configuration["ConnectionStrings:Default"] = mainUrl;
            }
            return configuration;
        }
    }
}