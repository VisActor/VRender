import type { IEventListenerManager } from '../interface/event-listener-manager';

/**
 * Base class to manage event listeners with support for event transformation
 * Used by DefaultGlobal and DefaultWindow to handle the transformation of event coordinates
 */
export class EventListenerManager implements IEventListenerManager {
  /**
   * Map that stores the mapping from original listeners to wrapped listeners
   * Structure: Map<eventType, Map<originalListener, Map<capture, wrappedRecord>>>
   */
  protected _listenerMap: Map<
    string,
    Map<
      EventListenerOrEventListenerObject,
      Map<boolean, { wrappedListener: EventListener; options?: boolean | AddEventListenerOptions }>
    >
  >;

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

    const capture = this._resolveCapture(options);
    const once = this._resolveOnce(options);
    const listenerTypeMap = this._getOrCreateListenerTypeMap(type);
    const wrappedMap = this._getOrCreateWrappedMap(listenerTypeMap, listener);

    // Align with native behavior: adding same (type, listener, capture) repeatedly is a no-op.
    if (wrappedMap.has(capture)) {
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

      // Native once listeners are removed automatically after dispatch, clear the mapping as well.
      if (once) {
        this._deleteListenerRecord(type, listener, capture);
      }
    };

    // Store the mapping between original and wrapped listener
    wrappedMap.set(capture, { wrappedListener, options });

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

    const capture = this._resolveCapture(options);
    const wrappedRecord = this._listenerMap.get(type)?.get(listener)?.get(capture);
    if (wrappedRecord) {
      // Remove the wrapped listener
      this._nativeRemoveEventListener(type, wrappedRecord.wrappedListener, capture);
      this._deleteListenerRecord(type, listener, capture);
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
    this._listenerMap.forEach((listenerMap, type) => {
      listenerMap.forEach(wrappedMap => {
        wrappedMap.forEach((wrappedRecord, capture) => {
          this._nativeRemoveEventListener(type, wrappedRecord.wrappedListener, capture);
        });
      });
    });
    this._listenerMap.clear();
  }

  protected _resolveCapture(options?: boolean | EventListenerOptions | AddEventListenerOptions): boolean {
    if (typeof options === 'boolean') {
      return options;
    }
    return !!options?.capture;
  }

  protected _resolveOnce(options?: boolean | AddEventListenerOptions): boolean {
    return typeof options === 'object' && !!options?.once;
  }

  protected _getOrCreateListenerTypeMap(
    type: string
  ): Map<
    EventListenerOrEventListenerObject,
    Map<boolean, { wrappedListener: EventListener; options?: boolean | AddEventListenerOptions }>
  > {
    let listenerTypeMap = this._listenerMap.get(type);
    if (!listenerTypeMap) {
      listenerTypeMap = new Map();
      this._listenerMap.set(type, listenerTypeMap);
    }
    return listenerTypeMap;
  }

  protected _getOrCreateWrappedMap(
    listenerTypeMap: Map<
      EventListenerOrEventListenerObject,
      Map<boolean, { wrappedListener: EventListener; options?: boolean | AddEventListenerOptions }>
    >,
    listener: EventListenerOrEventListenerObject
  ): Map<boolean, { wrappedListener: EventListener; options?: boolean | AddEventListenerOptions }> {
    let wrappedMap = listenerTypeMap.get(listener);
    if (!wrappedMap) {
      wrappedMap = new Map();
      listenerTypeMap.set(listener, wrappedMap);
    }
    return wrappedMap;
  }

  protected _deleteListenerRecord(type: string, listener: EventListenerOrEventListenerObject, capture: boolean): void {
    const listenerTypeMap = this._listenerMap.get(type);
    if (!listenerTypeMap) {
      return;
    }
    const wrappedMap = listenerTypeMap.get(listener);
    if (!wrappedMap) {
      return;
    }
    wrappedMap.delete(capture);
    if (wrappedMap.size === 0) {
      listenerTypeMap.delete(listener);
    }
    if (listenerTypeMap.size === 0) {
      this._listenerMap.delete(type);
    }
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
