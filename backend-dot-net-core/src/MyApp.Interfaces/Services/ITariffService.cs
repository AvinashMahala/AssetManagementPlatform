using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using MyApp.Models;

namespace MyApp.Interfaces;

public interface ITariffService
{
    Task<IEnumerable<Tariff>> ListAsync();
    Task<Tariff?> GetByIdAsync(Guid id);
    Task<Tariff> CreateAsync(Tariff t);
    Task UpdateAsync(Tariff t);
    Task DeleteAsync(Guid id);
    Task<Tariff?> GetApplicableTariffAsync(Guid? subscriptionId, Guid? meterId, Guid utilityTypeId, DateTime date);
}