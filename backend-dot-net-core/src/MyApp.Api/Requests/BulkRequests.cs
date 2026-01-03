using System;
using System.Collections.Generic;

namespace MyApp.Api.Requests;

public class BulkRentCollectionRequest
{
    public IEnumerable<Guid> UnitIds { get; set; } = Array.Empty<Guid>();
    public DateTime BillingPeriodStart { get; set; }
    public DateTime BillingPeriodEnd { get; set; }
    public bool ApplyExpenses { get; set; }
    public IEnumerable<Guid>? ExpenseIds { get; set; }
    public bool SkipUnitsWithExistingTransactions { get; set; }
}

public class BulkPaymentsRequest
{
    public IEnumerable<Guid> TransactionIds { get; set; } = Array.Empty<Guid>();
    public decimal Amount { get; set; }
    public string PaymentMethod { get; set; } = string.Empty;
    public DateTime PaymentDate { get; set; }
    public string? PaymentReference { get; set; }
}
