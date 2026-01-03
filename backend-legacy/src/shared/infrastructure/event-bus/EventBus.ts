import { EventEmitter } from 'events';

export class EventBus extends EventEmitter {
  private static instance: EventBus;

  private constructor() {
    super();
    this.setMaxListeners(20); // Increase limit for scalability
  }

  static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }

  /**
   * Publish an event to all subscribers.
   * @param eventName The name of the event (e.g., 'LeaseCreated')
   * @param payload The data associated with the event
   */
  publish(eventName: string, payload: any): void {
    console.log(`[EventBus] Publishing: ${eventName}`, payload);
    this.emit(eventName, payload);
  }

  /**
   * Subscribe to an event.
   * @param eventName The name of the event
   * @param handler The function to execute when the event is emitted
   */
  subscribe(eventName: string, handler: (payload: any) => void): void {
    this.on(eventName, async (payload) => {
      try {
        await handler(payload);
      } catch (error) {
        console.error(`[EventBus] Error in handler for ${eventName}:`, error);
      }
    });
  }
}
