using Microsoft.EntityFrameworkCore;
using MyApp.Models;

namespace MyApp.Repositories;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Explicitly map entities to lowercase table names used in the Postgres schema
        var userEntity = modelBuilder.Entity<MyApp.Models.User>();
        userEntity.ToTable("users");
        // Map properties to actual database column names
        userEntity.Property(u => u.Id).HasColumnName("id");
        userEntity.Property(u => u.Email).HasColumnName("email");
        userEntity.Property(u => u.PasswordHash).HasColumnName("password");
        userEntity.Property(u => u.DisplayName).HasColumnName("name");
        userEntity.Property(u => u.GoogleId).HasColumnName("google_id");
        userEntity.Property(u => u.RefreshToken).HasColumnName("refresh_token");
        userEntity.Property(u => u.RefreshTokenExpiry).HasColumnName("refresh_token_expiry");

        modelBuilder.Entity<MyApp.Models.Property>().ToTable("properties");
        modelBuilder.Entity<MyApp.Models.Lease>().ToTable("leases");
        modelBuilder.Entity<MyApp.Models.FileMetadata>().ToTable("file_metadata");
        modelBuilder.Entity<MyApp.Models.ReceiptTemplate>().ToTable("receipt_templates");
        modelBuilder.Entity<MyApp.Models.RentPayment>().ToTable("rent_payments");
        modelBuilder.Entity<MyApp.Models.RentTransaction>().ToTable("rent_transactions");
        modelBuilder.Entity<MyApp.Models.Receipt>().ToTable("receipts");

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
