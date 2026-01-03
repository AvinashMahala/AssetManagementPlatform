using System;
using System.Text.Json;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;
using MyApp.Core;

namespace MyApp.Messaging;

public class RabbitMqEventBus : IEventBus, IDisposable
{
    private readonly object _connection;
    private readonly object _channel;
    private readonly IServiceScopeFactory _scopes;
    private readonly ILogger<RabbitMqEventBus> _logger;
    private readonly string _exchange = "myapp.events";
    private readonly string _serviceName;

    public RabbitMqEventBus(IConfiguration configuration, IServiceScopeFactory scopes, ILogger<RabbitMqEventBus> logger)
    {
        _logger = logger;
        _scopes = scopes;
        _serviceName = configuration.GetValue<string>("ServiceName") ?? "MyApp";

        var factory = new ConnectionFactory()
        {
            HostName = configuration["RabbitMq:Host"] ?? "localhost",
            UserName = configuration["RabbitMq:Username"] ?? "guest",
            Password = configuration["RabbitMq:Password"] ?? "guest"
        };

        // Use reflection to create connection/model to handle potential RabbitMQ.Client API differences at runtime
        // Try to call CreateConnection using any available overload (some RabbitMQ.Client versions differ)
        var createConnMethods = factory.GetType().GetMethods().Where(m => m.Name == "CreateConnection").ToArray();
        object? conn = null;
        foreach (var m in createConnMethods)
        {
            try
            {
                var args = m.GetParameters().Select(p => (object?)null).ToArray();
                conn = m.Invoke(factory, args);
                if (conn != null) break;
            }
            catch { }
        }

        if (conn == null) throw new InvalidOperationException("RabbitMQ client does not expose a usable CreateConnection on ConnectionFactory");
        _connection = conn;

        // Create model
        var createModel = _connection.GetType().GetMethod("CreateModel", Array.Empty<Type>());
        if (createModel == null) throw new InvalidOperationException("RabbitMQ connection does not expose CreateModel");
        _channel = createModel.Invoke(_connection, null);

        var exchangeDeclare = _channel.GetType().GetMethod("ExchangeDeclare", new[] { typeof(string), typeof(string), typeof(bool) }) ?? _channel.GetType().GetMethod("ExchangeDeclare");
        if (exchangeDeclare != null) exchangeDeclare.Invoke(_channel, new object[] { _exchange, RabbitMQ.Client.ExchangeType.Topic, true });
    }

    public void Publish<T>(T @event)
    {
        var routingKey = typeof(T).Name;
        var body = JsonSerializer.SerializeToUtf8Bytes(@event);
        var props = ((dynamic)_channel).CreateBasicProperties();
        props.Persistent = true;
        ((dynamic)_channel).BasicPublish(_exchange, routingKey, props, body);
    }

    public void Subscribe<T>(Func<T, System.Threading.Tasks.Task> handler)
    {
        var eventName = typeof(T).Name;
        var queueName = $"{_serviceName}.{eventName}";

        ((dynamic)_channel).QueueDeclare(queueName, durable: true, exclusive: false, autoDelete: false, arguments: null);
        ((dynamic)_channel).QueueBind(queueName, _exchange, eventName);

        var consumerType = Type.GetType("RabbitMQ.Client.Events.AsyncEventingBasicConsumer, RabbitMQ.Client");
        var consumer = consumerType != null ? Activator.CreateInstance(consumerType, _channel) : null;

        if (consumer != null)
        {
            var receivedEvent = consumer.GetType().GetEvent("Received");
            if (receivedEvent != null)
            {
                var handlerDelegate = (Func<object, object, System.Threading.Tasks.Task>)(async (sender, ea) =>
                {
                    try
                    {
                        var payload = JsonSerializer.Deserialize<T>(((dynamic)ea).Body.ToArray());
                        if (payload != null)
                        {
                            using var scope = _scopes.CreateScope();
                            await handler(payload);
                        }
                        ((dynamic)_channel).BasicAck(((dynamic)ea).DeliveryTag, false);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Error handling event {Event}", eventName);
                        try { ((dynamic)_channel).BasicNack(((dynamic)ea).DeliveryTag, false, true); } catch { }
                    }
                    await System.Threading.Tasks.Task.CompletedTask;
                });

                var del = Delegate.CreateDelegate(receivedEvent.EventHandlerType, handlerDelegate.Target, handlerDelegate.Method);
                receivedEvent.AddEventHandler(consumer, del);
            }
        }

        ((dynamic)_channel).BasicConsume(queueName, autoAck: false, consumer: consumer);
    }

    public void Dispose()
    {
        try
        {
            try { ((dynamic)_channel).Close(); } catch { }
            try { ((dynamic)_connection).Close(); } catch { }
        }
        catch { }
    }
}