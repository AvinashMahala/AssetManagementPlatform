using System.Collections.Generic;

namespace MyApp.Models;

public record PagedResult<T>(IEnumerable<T> Items, int Total);