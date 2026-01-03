using Microsoft.EntityFrameworkCore;
using MyApp.Models;

namespace MyApp.Repositories;

using Microsoft.Extensions.Logging;

public class AppDbContext : DbContext
{
    private readonly ILogger<AppDbContext>? _logger;

    public AppDbContext(DbContextOptions<AppDbContext> options, ILogger<AppDbContext>? logger = null) : base(options) { _logger = logger; }

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

    // Rent transaction meter readings snapshots
    public DbSet<MyApp.Models.RentTransactionMeterReading> RentTransactionMeterReadings => Set<MyApp.Models.RentTransactionMeterReading>();
    public DbSet<MyApp.Models.UtilitySubscription> UtilitySubscriptions => Set<MyApp.Models.UtilitySubscription>();
    public DbSet<MyApp.Models.UtilityType> UtilityTypes => Set<MyApp.Models.UtilityType>();
    public DbSet<MyApp.Models.UnitTenant> UnitTenants => Set<MyApp.Models.UnitTenant>();
    public DbSet<MyApp.Models.Expense> Expenses => Set<MyApp.Models.Expense>();
    public DbSet<MyApp.Models.UnitUtility> UnitUtilities => Set<MyApp.Models.UnitUtility>();
    public DbSet<MyApp.Models.Meter> Meters => Set<MyApp.Models.Meter>();
    public DbSet<MyApp.Models.MeterReading> MeterReadings => Set<MyApp.Models.MeterReading>();

    // New utilities billing tables
    public DbSet<MyApp.Models.MeterAllocation> MeterAllocations => Set<MyApp.Models.MeterAllocation>();
    public DbSet<MyApp.Models.Tariff> Tariffs => Set<MyApp.Models.Tariff>();
    public DbSet<MyApp.Models.SessionToken> SessionTokens => Set<MyApp.Models.SessionToken>();
    public DbSet<MyApp.Models.SessionJti> SessionJtis => Set<MyApp.Models.SessionJti>();

    // Auth helper tables
    public DbSet<MyApp.Models.PhoneVerificationCode> PhoneVerificationCodes => Set<MyApp.Models.PhoneVerificationCode>();
    public DbSet<MyApp.Models.PasswordResetMethod> PasswordResetMethods => Set<MyApp.Models.PasswordResetMethod>();
    public DbSet<MyApp.Models.SecurityQuestion> SecurityQuestions => Set<MyApp.Models.SecurityQuestion>();
    public DbSet<MyApp.Models.RecoveryCode> RecoveryCodes => Set<MyApp.Models.RecoveryCode>();

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

    // Property-specific templates
    public DbSet<MyApp.Models.PropertyReceiptTemplate> PropertyReceiptTemplates => Set<MyApp.Models.PropertyReceiptTemplate>();

    /// <summary>
    /// Ensure DateTime kinds are normalized to UTC before saving to Postgres.
    /// This prevents Npgsql errors when a DateTime has Kind==Unspecified.
    /// </summary>
    private void NormalizeDateTimeKinds()
    {
        foreach (var entry in ChangeTracker.Entries())
        {
            // Only consider entities that will be inserted/updated
            if (entry.State == Microsoft.EntityFrameworkCore.EntityState.Added || entry.State == Microsoft.EntityFrameworkCore.EntityState.Modified)
            {
                foreach (var prop in entry.Properties)
                {
                    var clrType = prop.Metadata.ClrType;
                    if (clrType == typeof(DateTime))
                    {
                        var val = (DateTime)prop.CurrentValue!;
                        // If the value is Local, convert it to UTC (preserves instant)
                        if (val.Kind == DateTimeKind.Local)
                        {
                            _logger?.LogWarning("Converting Local DateTime to UTC for entity {Entity} property {Property} value {Value}", entry.Entity.GetType().Name, prop.Metadata.Name, val);
                            prop.CurrentValue = val.ToUniversalTime();
                        }
                        // If the value has an unspecified Kind, treat it as already UTC (no instant shift) by specifying Utc kind
                        else if (val.Kind == DateTimeKind.Unspecified)
                        {
                            _logger?.LogWarning("Normalizing DateTime Kind to UTC for entity {Entity} property {Property} value {Value}", entry.Entity.GetType().Name, prop.Metadata.Name, val);
                            prop.CurrentValue = DateTime.SpecifyKind(val, DateTimeKind.Utc);
                        }
                    }
                    else if (clrType == typeof(DateTime?))
                    {
                        var val = (DateTime?)prop.CurrentValue;
                        if (val.HasValue)
                        {
                            if (val.Value.Kind == DateTimeKind.Local)
                            {
                                _logger?.LogWarning("Converting nullable Local DateTime to UTC for entity {Entity} property {Property} value {Value}", entry.Entity.GetType().Name, prop.Metadata.Name, val.Value);
                                prop.CurrentValue = val.Value.ToUniversalTime();
                            }
                            else if (val.Value.Kind == DateTimeKind.Unspecified)
                            {
                                _logger?.LogWarning("Normalizing nullable DateTime Kind to UTC for entity {Entity} property {Property} value {Value}", entry.Entity.GetType().Name, prop.Metadata.Name, val.Value);
                                prop.CurrentValue = DateTime.SpecifyKind(val.Value, DateTimeKind.Utc);
                            }
                        }
                    }
                }
            }
        }
    }

    public override int SaveChanges()
    {
        NormalizeDateTimeKinds();
        return base.SaveChanges();
    }

    public override System.Threading.Tasks.Task<int> SaveChangesAsync(bool acceptAllChangesOnSuccess, System.Threading.CancellationToken cancellationToken = default)
    {
        NormalizeDateTimeKinds();
        return base.SaveChangesAsync(acceptAllChangesOnSuccess, cancellationToken);
    }

    public override System.Threading.Tasks.Task<int> SaveChangesAsync(System.Threading.CancellationToken cancellationToken = default)
    {
        NormalizeDateTimeKinds();
        return base.SaveChangesAsync(cancellationToken);
    }

    /// <summary>
    /// Public helper to normalize DateTime kinds for consumers that need a retry path from repositories.
    /// </summary>
    public void EnsureUtcDateTimes() => NormalizeDateTimeKinds();
}
