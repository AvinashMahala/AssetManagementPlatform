using System;
using System.Threading.Tasks;

namespace MyApp.Interfaces;

public interface IBillingService
{
    /// <summary>
    /// Run billing for a lease and billing period. Returns id of created rent transaction.
    /// </summary>
    Task<Guid> RunBillingForLeaseAsync(Guid leaseId, DateTime periodStart, DateTime periodEnd);
}