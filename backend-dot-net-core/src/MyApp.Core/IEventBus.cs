using System;
using System.Threading.Tasks;

namespace MyApp.Core;

public interface IEventBus
{
    void Publish<T>(T @event);
    void Subscribe<T>(Func<T, System.Threading.Tasks.Task> handler);
}