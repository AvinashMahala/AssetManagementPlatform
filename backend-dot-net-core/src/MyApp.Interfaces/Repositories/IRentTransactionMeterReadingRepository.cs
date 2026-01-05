using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using MyApp.Models;

namespace MyApp.Interfaces.Repositories;

public interface IRentTransactionMeterReadingRepository
{
    Task<IEnumerable<RentTransactionMeterReading>> FindByTransactionAsync(Guid transactionId, CancellationToken cancellationToken = default);
    Task<IEnumerable<RentTransactionMeterReading>> FindByMeterAsync(Guid meterId, CancellationToken cancellationToken = default);
    Task AddAsync(RentTransactionMeterReading r, CancellationToken cancellationToken = default);
    Task AddRangeAsync(IEnumerable<RentTransactionMeterReading> items, CancellationToken cancellationToken = default);
}
