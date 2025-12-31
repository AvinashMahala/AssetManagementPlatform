using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using FluentValidation;
using FluentValidation.AspNetCore;
using Microsoft.AspNetCore.Mvc;
using System.Linq;
using System.Threading.Tasks;
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

                    // Validate session bound to access token (sid claim) to support immediate logout/invalidation
                    var requireSid = configuration.GetValue<bool>("Auth:RequireSidInAccessToken", false);
                    options.Events = new JwtBearerEvents
                    {
                        OnMessageReceived = ctx =>
                        {
                            // Prefer Authorization header, but fall back to HttpOnly cookie named `accessToken` when present
                            if (string.IsNullOrEmpty(ctx.Token) && ctx.Request?.Cookies != null && ctx.Request.Cookies.TryGetValue("accessToken", out var cookieToken))
                            {
                                ctx.Token = cookieToken;
                            }
                            return Task.CompletedTask;
                        },
                        OnTokenValidated = async context =>
                        {
                            try
                            {
                                var sid = context.Principal?.FindFirst("sid")?.Value;

                                // If SID is required but missing or invalid, reject immediately
                                if (string.IsNullOrWhiteSpace(sid))
                                {
                                    if (requireSid)
                                    {
                                        context.Fail("Access tokens must include session id (sid) claim");
                                    }
                                    return; // nothing to validate further
                                }

                                if (!Guid.TryParse(sid, out var sessionId))
                                {
                                    context.Fail("Invalid session id in token");
                                    return;
                                }

                                var repo = context.HttpContext.RequestServices.GetService<MyApp.Interfaces.Repositories.ISessionRepository>();
                                if (repo != null)
                                {
                                    var session = await repo.FindByIdAsync(sessionId);
                                    if (session == null || session.Revoked || session.ExpiresAt < DateTime.UtcNow)
                                    {
                                        context.Fail("Session invalid or revoked");
                                        return;
                                    }

                                    // Optionally update last used timestamp
                                    await repo.UpdateLastUsedAsync(sessionId, DateTime.UtcNow);

                                    // JTI allowlist check (optional, behind config)
                                    var useJti = configuration.GetValue<bool>("Auth:UseJtiAllowlist", false);
                                    if (useJti)
                                    {
                                        var jti = context.Principal?.FindFirst(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Jti)?.Value;
                                        if (string.IsNullOrWhiteSpace(jti)) { context.Fail("Missing jti"); return; }
                                        var jtiStore = context.HttpContext.RequestServices.GetService<MyApp.Services.IJtiStore>();
                                        if (jtiStore == null) { context.Fail("JTI store not configured"); return; }
                                        var ok = await jtiStore.ValidateJtiAsync(jti, sessionId);
                                        if (!ok) { context.Fail("Invalid or revoked token"); return; }
                                    }
                                }
                            }
                            catch (Exception ex)
                            {
                                // Any exception during validation should reject the token
                                context.Fail("Session validation failed");
                            }
                        }
                    };
                });

            services.AddAuthorization();

            // JTI allowlist setup: register IJtiStore implementation based on configuration.
            // If Redis connection string present, use RedisJtiStore; otherwise fallback to DB-backed store.
            var redisCs = configuration["Redis:ConnectionString"];
            if (!string.IsNullOrEmpty(redisCs))
            {
                services.AddSingleton<IJtiStore, MyApp.Services.RedisJtiStore>();
            }
            else
            {
                services.AddScoped<IJtiStore, MyApp.Services.DbFallbackJtiStore>();
            }

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
