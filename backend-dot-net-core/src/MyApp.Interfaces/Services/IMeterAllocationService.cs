using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using MyApp.Models;

namespace MyApp.Interfaces;

public interface IMeterAllocationService
{
    Task<IEnumerable<MeterAllocation>> ListAsync();
    Task<MeterAllocation?> GetByIdAsync(Guid id);
    Task<MeterAllocation> CreateAsync(MeterAllocation m);
    Task UpdateAsync(MeterAllocation m);
    Task DeleteAsync(Guid id);
    Task<IEnumerable<MeterAllocation>> ListByMeterAsync(Guid meterId);
    Task<IEnumerable<MeterAllocation>> ListBySubscriptionAsync(Guid subscriptionId);
}