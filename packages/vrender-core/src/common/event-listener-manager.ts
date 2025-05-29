import type { IEventListenerManager } from '../interface/event-listener-manager';

/**
 * Base class to manage event listeners with support for event transformation
 * Used by DefaultGlobal and DefaultWindow to handle the transformation of event coordinates
 */
export class EventListenerManager implements IEventListenerManager {
  /**
   * Map that stores the mapping from original listeners to wrapped listeners
   * Structure: Map<eventType, Map<originalListener, wrappedListener>>
   */
  protected _listenerMap: Map<string, Map<EventListenerOrEventListenerObject, EventListener>>;

  /**
   * Transformer function that transforms the event
   */
  protected _eventListenerTransformer: (event: Event) => Event;

  constructor() {
    this._listenerMap = new Map();
    this._eventListenerTransformer = event => event; // Default: no transformation
  }

  /**
   * Set the event transformer function
   * @param transformer Function that transforms events
   */
  setEventListenerTransformer(transformer: (event: Event) => Event): void {
    this._eventListenerTransformer = transformer || (event => event);
  }

  /**
   * Add an event listener with event transformation
   * @param type Event type
   * @param listener Original event listener
   * @param options Event listener options
   */
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void {
    if (!listener) {
      return;
    }

    // Create a wrapped listener that applies the transformation
    const wrappedListener = (event: Event) => {
      const transformedEvent = this._eventListenerTransformer(event);
      if (typeof listener === 'function') {
        listener(transformedEvent);
      } else if (listener.handleEvent) {
        listener.handleEvent(transformedEvent);
      }
    };

    // Store the mapping between original and wrapped listener
    if (!this._listenerMap.has(type)) {
      this._listenerMap.set(type, new Map());
    }
    this._listenerMap.get(type)!.set(listener, wrappedListener);

    // Add the wrapped listener
    this._nativeAddEventListener(type, wrappedListener, options);
  }

  /**
   * Remove an event listener
   * @param type Event type
   * @param listener Event listener to remove
   * @param options Event listener options
   */
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void {
    if (!listener) {
      return;
    }

    // Get the wrapped listener from our map
    const wrappedListener = this._listenerMap.get(type)?.get(listener);
    if (wrappedListener) {
      // Remove the wrapped listener
      this._nativeRemoveEventListener(type, wrappedListener, options);

      // Remove from our map
      this._listenerMap.get(type)!.delete(listener);
      if (this._listenerMap.get(type)!.size === 0) {
        this._listenerMap.delete(type);
      }
    }
  }

  /**
   * Dispatch an event
   * @param event Event to dispatch
   */
  dispatchEvent(event: Event): boolean {
    return this._nativeDispatchEvent(event);
  }

  /**
   * Clear all event listeners
   */
  clearAllEventListeners(): void {
    this._listenerMap.forEach((listenersMap, type) => {
      listenersMap.forEach((wrappedListener, originalListener) => {
        this._nativeRemoveEventListener(type, wrappedListener, undefined);
      });
    });
    this._listenerMap.clear();
  }

  /**
   * Native implementation of addEventListener
   * To be implemented by derived classes
   */
  protected _nativeAddEventListener(
    type: string,
    listener: EventListener,
    options?: boolean | AddEventListenerOptions
  ): void {
    throw new Error('_nativeAddEventListener must be implemented by derived classes');
  }

  /**
   * Native implementation of removeEventListener
   * To be implemented by derived classes
   */
  protected _nativeRemoveEventListener(
    type: string,
    listener: EventListener,
    options?: boolean | EventListenerOptions
  ): void {
    throw new Error('_nativeRemoveEventListener must be implemented by derived classes');
  }

  /**
   * Native implementation of dispatchEvent
   * To be implemented by derived classes
   */
  protected _nativeDispatchEvent(event: Event): boolean {
    throw new Error('_nativeDispatchEvent must be implemented by derived classes');
  }
}
