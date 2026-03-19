import { EventListenerManager } from '../../../src/common/event-listener-manager';

type AddedRecord = {
  type: string;
  listener: EventListener;
  options?: boolean | AddEventListenerOptions;
};

type RemovedRecord = {
  type: string;
  listener: EventListener;
  options?: boolean | EventListenerOptions;
};

class TestEventListenerManager extends EventListenerManager {
  public readonly added: AddedRecord[] = [];
  public readonly removed: RemovedRecord[] = [];

  protected _nativeAddEventListener(
    type: string,
    listener: EventListener,
    options?: boolean | AddEventListenerOptions
  ): void {
    this.added.push({ type, listener, options });
  }

  protected _nativeRemoveEventListener(type: string, listener: EventListener, options?: boolean | EventListenerOptions): void {
    this.removed.push({ type, listener, options });
  }

  protected _nativeDispatchEvent = jest.fn((_event: Event) => {
    return true;
  });
}

describe('EventListenerManager', () => {
  test('setEventListenerTransformer uses identity for null/undefined', () => {
    const manager = new TestEventListenerManager();
    manager.setEventListenerTransformer(null as any);

    const originalEvent = { type: 'click' } as unknown as Event;
    const listener = jest.fn();

    manager.addEventListener('click', listener);

    expect(manager.added).toHaveLength(1);
    manager.added[0].listener(originalEvent);

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith(originalEvent);
  });

  test('dispatchEvent forwards to native dispatch', () => {
    const manager = new TestEventListenerManager();
    const res = manager.dispatchEvent({ type: 'x' } as any);

    expect(res).toBe(true);
    expect((manager as any)._nativeDispatchEvent).toHaveBeenCalledTimes(1);
  });

  test('addEventListener ignores falsy listener', () => {
    const manager = new TestEventListenerManager();

    manager.addEventListener('click', null as any);
    expect(manager.added).toHaveLength(0);
  });

  test('addEventListener is no-op for duplicated (type, listener, capture)', () => {
    const manager = new TestEventListenerManager();
    const listener = jest.fn();

    manager.addEventListener('click', listener, true);
    manager.addEventListener('click', listener, true);

    expect(manager.added).toHaveLength(1);
  });

  test('wrapped listener transforms event and supports handleEvent', () => {
    const manager = new TestEventListenerManager();
    const transformedEvent = { type: 'click', transformed: true } as unknown as Event;

    manager.setEventListenerTransformer(event => ({ ...(event as any), transformed: true } as any));

    const handleEvent = jest.fn();
    const listenerObject = { handleEvent };

    const originalEvent = { type: 'click' } as unknown as Event;

    manager.addEventListener('click', listenerObject, { capture: false });
    expect(manager.added).toHaveLength(1);

    manager.added[0].listener(originalEvent);

    expect(handleEvent).toHaveBeenCalledTimes(1);
    expect(handleEvent).toHaveBeenCalledWith(transformedEvent);
  });

  test('once option clears internal mapping after dispatch', () => {
    const manager = new TestEventListenerManager();
    const listener = jest.fn();

    manager.addEventListener('click', listener, { once: true });
    expect(manager.added).toHaveLength(1);

    const wrappedListener = manager.added[0].listener;
    wrappedListener({ type: 'click' } as unknown as Event);

    // mapping has been cleared so removeEventListener will not call nativeRemove
    manager.removeEventListener('click', listener);
    expect(manager.removed).toHaveLength(0);
  });

  test('removeEventListener removes wrapped listener when record exists', () => {
    const manager = new TestEventListenerManager();
    const listener = jest.fn();

    manager.addEventListener('click', listener, { capture: true });
    manager.removeEventListener('click', listener, { capture: true });

    expect(manager.removed).toHaveLength(1);
    expect(manager.removed[0].type).toBe('click');
    expect(manager.removed[0].options).toBe(true);
  });

  test('clearAllEventListeners removes all native listeners', () => {
    const manager = new TestEventListenerManager();
    const l1 = jest.fn();
    const l2 = { handleEvent: jest.fn() };

    manager.addEventListener('a', l1, { capture: true });
    manager.addEventListener('b', l2, false);

    manager.clearAllEventListeners();

    expect(manager.removed).toHaveLength(2);
    expect(manager.removed.map(r => r.type).sort()).toEqual(['a', 'b']);
  });
});
