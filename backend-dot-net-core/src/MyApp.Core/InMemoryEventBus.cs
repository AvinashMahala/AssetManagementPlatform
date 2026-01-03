using System;
using System.Collections.Concurrent;

namespace MyApp.Core;

public class InMemoryEventBus : IEventBus
{
    private readonly ConcurrentDictionary<Type, ConcurrentBag<Delegate>> _handlers = new();

    public void Publish<T>(T @event)
    {
        if (_handlers.TryGetValue(typeof(T), out var bag))
        {
            foreach (var d in bag)
            {
                try
                {
                    // sync-wait the task to ensure consistency for in-memory bus
                    ((Func<T, System.Threading.Tasks.Task>)d)(@event).GetAwaiter().GetResult();
                }
                catch { /* swallow for now */ }
            }
        }
    }

    public void Subscribe<T>(Func<T, System.Threading.Tasks.Task> handler)
    {
        var bag = _handlers.GetOrAdd(typeof(T), t => new ConcurrentBag<Delegate>());
        bag.Add(handler);
    }
}
