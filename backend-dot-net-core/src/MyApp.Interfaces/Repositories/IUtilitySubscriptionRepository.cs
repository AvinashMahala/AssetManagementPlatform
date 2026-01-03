using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using MyApp.Models;

namespace MyApp.Interfaces.Repositories;

public interface IUtilitySubscriptionRepository
{
    Task<IEnumerable<UtilitySubscription>> ListAsync();
    Task<IEnumerable<UtilitySubscription>> ListByUnitAsync(Guid unitId);
    Task<UtilitySubscription?> GetByIdAsync(Guid id);
    Task AddAsync(UtilitySubscription s);
    Task UpdateAsync(UtilitySubscription s);
    Task DeleteAsync(Guid id);
    Task<UtilitySubscription?> GetByUnitAndTypeAsync(Guid unitId, Guid utilityTypeId);
}