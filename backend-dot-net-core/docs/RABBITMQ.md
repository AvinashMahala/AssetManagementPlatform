RabbitMQ (Durable Event Bus) — Setup & Notes

Overview
- We provide a RabbitMQ-backed implementation of `IEventBus` at `src/MyApp.Messaging/RabbitMqEventBus.cs`.
- The app will use RabbitMQ for durable publish/subscribe when `RabbitMq:Host` is set in configuration; otherwise it falls back to the in-memory bus (dev/test).

Docker quickstart
1) Add this service to your local docker-compose (example):

```yaml
services:
  rabbitmq:
    image: rabbitmq:3-management
    ports:
      - "5672:5672"
      - "15672:15672"
    environment:
      RABBITMQ_DEFAULT_USER: guest
      RABBITMQ_DEFAULT_PASS: guest
```

2) Configure the app (e.g., `appsettings.Development.json`):

{
  "RabbitMq": {
    "Host": "localhost",
    "Username": "guest",
    "Password": "guest"
  },
  "ServiceName": "assetmanagement-api"
}

Notes & considerations
- Each event type is published to exchange `myapp.events` with routing key equal to the CLR type name. Subscribers declare/consume a queue named `{ServiceName}.{EventType}` and bind to that exchange/routing key.
- Messages are published as persistent (delivery_mode=2), and the queue is durable; on handler failure messages are NACKed with requeue=true.
- Handlers are executed synchronously inside the consumer; subscription handlers should be resilient and idempotent. In production you may want a more robust strategy (dead-lettering, retry/backoff, poison message handling).
- Next steps: provide a background worker version, add instrumentation/health endpoints, and support different exchange/routing strategies for advanced topologies.
