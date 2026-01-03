using Serilog;
using System;
using System.IO;
using Microsoft.Extensions.Hosting;

namespace MyApp.Api
{
    public static class LoggingExtensions
    {
        public static void ConfigureJsonSerilog(HostBuilderContext ctx, IServiceProvider services, LoggerConfiguration loggerConfig)
        {
            // Ensure logs directory exists (write to logs/backend by default)
            var logPath = Path.Combine(Directory.GetCurrentDirectory(), "logs", "backend");
            try { Directory.CreateDirectory(logPath); } catch { /* ignore if we cannot create */ }

            loggerConfig.ReadFrom.Configuration(ctx.Configuration)
                        .Enrich.FromLogContext()
                        .WriteTo.Console(new Serilog.Formatting.Json.JsonFormatter());
        }
    }
}