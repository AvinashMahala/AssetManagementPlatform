using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using MyApp.Models;

namespace MyApp.Interfaces.Repositories;

public interface IRentTransactionMeterReadingRepository
{
    Task<IEnumerable<RentTransactionMeterReading>> FindByTransactionAsync(Guid transactionId);
    Task<IEnumerable<RentTransactionMeterReading>> FindByMeterAsync(Guid meterId);
    Task AddAsync(RentTransactionMeterReading r);
    Task AddRangeAsync(IEnumerable<RentTransactionMeterReading> items);
}
