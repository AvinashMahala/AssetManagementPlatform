using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using MyApp.Models;

namespace MyApp.Interfaces;

public partial interface ILeaseRepository
{
    Task<IEnumerable<Lease>> ListByUnitAndPeriodAsync(Guid unitId, DateTime start, DateTime end);
}