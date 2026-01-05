using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using MyApp.Models;

namespace MyApp.Interfaces;

public interface IMeterReadingRepository
{
    Task<IEnumerable<MeterReading>> ListAsync(CancellationToken cancellationToken = default);
    Task<MeterReading?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IEnumerable<MeterReading>> ListByMeterAsync(Guid meterId, CancellationToken cancellationToken = default);
    Task<MeterReading?> GetLatestByMeterBeforeDateAsync(Guid meterId, DateTime date, CancellationToken cancellationToken = default);
    Task AddAsync(MeterReading r, CancellationToken cancellationToken = default);
    Task UpdateAsync(MeterReading r, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}