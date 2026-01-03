using System;
using System.IO;
using System.Linq;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Configuration;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Mvc;
using Serilog;
using MyApp.Services;
using FluentValidation;
using FluentValidation.AspNetCore;
using Prometheus;

// `ProgramSetup` has been refactored into smaller extension classes.
// Kept for compatibility: façade methods delegate to the new extensions.
using System;
using Serilog;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Configuration;
using Microsoft.AspNetCore.Builder;

namespace MyApp.Api
{
    [Obsolete("Use the focused extension methods in ServiceCollectionExtensions, LoggingExtensions, ApplicationBuilderExtensions and AppInitializationExtensions instead.")]
    internal static class ProgramSetup
    {
        public static void ConfigureSerilog(HostBuilderContext ctx, IServiceProvider services, LoggerConfiguration loggerConfig)
            => LoggingExtensions.ConfigureJsonSerilog(ctx, services, loggerConfig);

        public static void MapMainDatabaseUrl(Microsoft.Extensions.Configuration.IConfiguration configuration)
            => configuration.MapMainDatabaseUrl();

        public static void ConfigureJwtAuthentication(IServiceCollection services, Microsoft.Extensions.Configuration.IConfiguration configuration)
            => services.AddMyAppJwtAuthentication(configuration);

        public static void ConfigureRateLimitingDefaults(IServiceCollection services)
            => services.AddMyAppRateLimitingDefaults();

        public static void ConfigureFluentValidation(IServiceCollection services)
            => services.AddMyAppFluentValidation();

        public static void InitializeDatabaseAndBackgroundSubscribers(WebApplication app)
            => app.InitializeDatabaseAndBackgroundSubscribers();

        public static void ConfigurePipeline(WebApplication app)
            => app.UseMyAppPipeline();
    }
}