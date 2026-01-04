using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using MyApp.Models;

namespace MyApp.Interfaces;

public interface IMeterService
{
    Task<IEnumerable<Meter>> ListAsync();
    Task<Meter?> GetByIdAsync(Guid id);
    Task<Meter> CreateAsync(Meter m);
    Task<(Meter meter, DataAuditResult? audit)> CreateWithAuditAsync(Meter m, bool audit = false);
    Task<Meter?> UpdateAsync(Guid id, Meter m);
    Task<(Meter? meter, DataAuditResult? audit)> UpdateWithAuditAsync(Guid id, Meter m, bool audit = false);
    Task<bool> UpdateStatusAsync(Guid id, bool? isActive, string? status);
    Task<bool> DeleteAsync(Guid id);
    Task<IEnumerable<Meter>> ListByPropertyAsync(Guid propertyId);
    Task<IEnumerable<Meter>> ListByUnitAsync(Guid unitId);
} 

public interface IMeterReadingService
{
    Task<IEnumerable<MeterReading>> ListAsync();
    Task<MeterReading?> GetByIdAsync(Guid id);
    Task<IEnumerable<MeterReading>> ListByMeterAsync(Guid meterId);
    Task<MeterReading> CreateAsync(MeterReading r);
    Task<MeterReading?> UpdateAsync(Guid id, MeterReading r);
    Task<bool> DeleteAsync(Guid id);
}