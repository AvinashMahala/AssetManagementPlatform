using Microsoft.EntityFrameworkCore;
using MyApp.Models;

namespace MyApp.Repositories;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Apply all IEntityTypeConfiguration<T> implementations in this assembly
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);

        base.OnModelCreating(modelBuilder);
    }

    public DbSet<Lease> Leases => Set<Lease>();
    public DbSet<MyApp.Models.User> Users => Set<MyApp.Models.User>();
    public DbSet<MyApp.Models.Property> Properties => Set<MyApp.Models.Property>();
    public DbSet<MyApp.Models.FileMetadata> Files => Set<MyApp.Models.FileMetadata>();
    public DbSet<MyApp.Models.ReceiptTemplate> ReceiptTemplates => Set<MyApp.Models.ReceiptTemplate>();
    public DbSet<MyApp.Models.RentPayment> RentPayments => Set<MyApp.Models.RentPayment>();
    public DbSet<MyApp.Models.RentTransaction> RentTransactions => Set<MyApp.Models.RentTransaction>();
    public DbSet<MyApp.Models.Receipt> Receipts => Set<MyApp.Models.Receipt>();
}
