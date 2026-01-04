using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using MyApp.Models;

namespace MyApp.Interfaces.Services;

public interface IUtilitySubscriptionService
{
    Task<IEnumerable<UtilitySubscription>> ListAsync();
    Task<IEnumerable<UtilitySubscription>> ListByUnitAsync(Guid unitId);
    Task<UtilitySubscription?> GetByIdAsync(Guid id);
    Task<UtilitySubscription> CreateAsync(UtilitySubscription s);
    Task UpdateAsync(UtilitySubscription s);
    Task DeleteAsync(Guid id);
    Task<UtilitySubscription?> GetByUnitAndTypeAsync(Guid unitId, Guid utilityTypeId);
}