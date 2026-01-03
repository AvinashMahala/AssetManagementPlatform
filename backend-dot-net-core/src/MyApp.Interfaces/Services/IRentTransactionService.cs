using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using MyApp.Models;

namespace MyApp.Interfaces;

public partial interface IRentTransactionService
{
    Task<IEnumerable<RentTransaction>> ListAsync();
    Task<IEnumerable<RentTransaction>> ListByLeaseAsync(Guid leaseId);
    Task<IEnumerable<RentTransaction>> ListByPropertyAsync(Guid propertyId);
    Task<IEnumerable<RentTransaction>> ListByTenantAsync(Guid tenantId);
    Task<IEnumerable<RentTransaction>> ListByUnitAsync(Guid unitId);
    Task<RentTransaction?> GetByIdAsync(Guid id);
    Task<RentTransaction> CreateAsync(RentTransaction t);
    Task UpdateAsync(RentTransaction t);
    Task DeleteAsync(Guid id);

    // Get last meter readings (latest reading per meter) for a unit
    Task<IEnumerable<MyApp.Models.LastMeterReading>> GetLastMeterReadingsByUnitAsync(Guid unitId);

    // Get meter reading snapshots for a rent transaction
    Task<IEnumerable<MyApp.Models.RentTransactionMeterReading>> GetMeterReadingsAsync(Guid transactionId);
}