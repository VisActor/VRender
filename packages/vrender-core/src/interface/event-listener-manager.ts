/**
 * Interface for event listener management with transformation capabilities
 */
export interface IEventListenerManager {
  /**
   * Set the event transformer function
   * @param transformer Function that transforms events
   */
  setEventListenerTransformer: (transformer: (event: Event) => Event) => void;

  /**
   * Add an event listener with event transformation
   * @param type Event type
   * @param listener Event listener function or object
   * @param options Event listener options
   */
  addEventListener: (
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ) => void;

  /**
   * Remove an event listener
   * @param type Event type
   * @param listener Event listener to remove
   * @param options Event listener options
   */
  removeEventListener: (
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ) => void;

  /**
   * Dispatch an event
   * @param event Event to dispatch
   */
  dispatchEvent: (event: Event) => boolean;

  /**
   * Clear all event listeners
   */
  clearAllEventListeners: () => void;
}
