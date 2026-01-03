using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using MyApp.Models;
using MyApp.Repositories;
using MyApp.Services;
using Xunit;

namespace MyApp.Tests.Unit
{
    public class DbFallbackJtiStoreTests
    {
        private AppDbContext CreateInMemoryDb(string dbName)
        {
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(dbName)
                .Options;
            return new AppDbContext(options);
        }

        [Fact]
        public async Task AddJtiAsync_ReplacesExistingJtisForSession()
        {
            // Arrange
            var dbName = Guid.NewGuid().ToString();
            await using var db = CreateInMemoryDb(dbName);
            var repo = new SessionJtiRepository(db);
            var store = new DbFallbackJtiStore(repo, null);

            var sessionId = Guid.NewGuid();
            var jti1 = "jti-1";
            var jti2 = "jti-2";

            // Act
            await store.AddJtiAsync(jti1, sessionId, TimeSpan.FromHours(1));
            await store.AddJtiAsync(jti2, sessionId, TimeSpan.FromHours(1));

            // Assert: only the second JTI remains for that session
            var rows = db.SessionJtis.Where(s => s.SessionId == sessionId).ToList();
            Assert.Single(rows);
            Assert.Equal(jti2, rows[0].Jti);
        }
    }
}