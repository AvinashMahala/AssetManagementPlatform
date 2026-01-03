using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;

namespace MyApp.Api.Security;

public class FailureTracker
{
    // Stores per-key timestamps of failures
    private readonly ConcurrentDictionary<string, ConcurrentQueue<DateTime>> _map = new();
    private readonly TimeSpan _window;
    private readonly int _threshold;

    public FailureTracker() : this(TimeSpan.FromSeconds(60), 5) { }
    public FailureTracker(TimeSpan window, int threshold)
    {
        _window = window;
        _threshold = threshold;
    }

    public void RecordFailure(string key)
    {
        var q = _map.GetOrAdd(key, _ => new ConcurrentQueue<DateTime>());
        var now = DateTime.UtcNow;
        q.Enqueue(now);
        // Remove old entries
        while (q.TryPeek(out var t) && (now - t) > _window)
        {
            q.TryDequeue(out _);
        }
    }

    public int CountRecent(string key)
    {
        if (!_map.TryGetValue(key, out var q)) return 0;
        var now = DateTime.UtcNow;
        // Clean up old entries
        while (q.TryPeek(out var t) && (now - t) > _window)
        {
            q.TryDequeue(out _);
        }
        return q.Count;
    }

    public bool IsAnomalous(string key)
    {
        return CountRecent(key) >= _threshold;
    }
}
