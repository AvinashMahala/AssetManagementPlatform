using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using MyApp.Models;

namespace MyApp.Interfaces.Repositories;

public interface ITariffRepository
{
    Task<IEnumerable<Tariff>> ListAsync();
    Task<Tariff?> GetByIdAsync(Guid id);
    Task AddAsync(Tariff t);
    Task UpdateAsync(Tariff t);
    Task DeleteAsync(Guid id);
    Task<IEnumerable<Tariff>> ListByUtilityTypeAsync(Guid utilityTypeId);
    Task<IEnumerable<Tariff>> ListBySubscriptionAsync(Guid subscriptionId);
    Task<IEnumerable<Tariff>> ListByMeterAsync(Guid meterId);
}
