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
    public DbSet<MyApp.Models.Tenant> Tenants => Set<MyApp.Models.Tenant>();
    public DbSet<MyApp.Models.TenantDocument> TenantDocuments => Set<MyApp.Models.TenantDocument>();
    public DbSet<MyApp.Models.Unit> Units => Set<MyApp.Models.Unit>();
    public DbSet<MyApp.Models.UnitTenant> UnitTenants => Set<MyApp.Models.UnitTenant>();
    public DbSet<MyApp.Models.Expense> Expenses => Set<MyApp.Models.Expense>();
    public DbSet<MyApp.Models.UnitUtility> UnitUtilities => Set<MyApp.Models.UnitUtility>();
    public DbSet<MyApp.Models.Meter> Meters => Set<MyApp.Models.Meter>();
    public DbSet<MyApp.Models.MeterReading> MeterReadings => Set<MyApp.Models.MeterReading>();
    public DbSet<MyApp.Models.SessionToken> SessionTokens => Set<MyApp.Models.SessionToken>();
    public DbSet<MyApp.Models.SessionJti> SessionJtis => Set<MyApp.Models.SessionJti>();

    // RBAC / PoC entities
    public DbSet<MyApp.Models.Role> Roles => Set<MyApp.Models.Role>();
    public DbSet<MyApp.Models.Permission> Permissions => Set<MyApp.Models.Permission>();
    public DbSet<MyApp.Models.RolePermission> RolePermissions => Set<MyApp.Models.RolePermission>();
    public DbSet<MyApp.Models.UserRole> UserRoles => Set<MyApp.Models.UserRole>();

    // Permission categories and audit events
    public DbSet<MyApp.Models.PermissionCategory> PermissionCategories => Set<MyApp.Models.PermissionCategory>();
    public DbSet<MyApp.Models.AuditEvent> AuditEvents => Set<MyApp.Models.AuditEvent>();

    // Export tokens for pre-signed downloads
    public DbSet<MyApp.Models.ExportToken> ExportTokens => Set<MyApp.Models.ExportToken>();
}
