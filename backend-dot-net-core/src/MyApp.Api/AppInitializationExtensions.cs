using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;

namespace MyApp.Api
{
    public static class AppInitializationExtensions
    {
        public static void InitializeDatabaseAndBackgroundSubscribers(this WebApplication app)
        {
            using (var scope = app.Services.CreateScope())
            {
                var db = scope.ServiceProvider.GetService<MyApp.Repositories.AppDbContext>();
                if (db != null)
                {
                    db.Database.EnsureCreated();
                }

                // Resolve the services once to run their constructors (they will register event handlers)
                scope.ServiceProvider.GetService<MyApp.Interfaces.IRentTransactionService>();
                scope.ServiceProvider.GetService<MyApp.Interfaces.IReceiptService>();
            }
        }
    }
}