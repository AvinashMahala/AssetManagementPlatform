using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using MyApp.Models;

namespace MyApp.Interfaces;

public interface IMeterReadingRepository
{
    Task<IEnumerable<MeterReading>> ListAsync();
    Task<MeterReading?> GetByIdAsync(Guid id);
    Task<IEnumerable<MeterReading>> ListByMeterAsync(Guid meterId);
    Task<MeterReading?> GetLatestByMeterBeforeDateAsync(Guid meterId, DateTime date);
    Task AddAsync(MeterReading r);
    Task UpdateAsync(MeterReading r);
    Task DeleteAsync(Guid id);
}