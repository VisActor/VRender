import { FederatedPointerEvent } from '../../../src/event/federated-event/pointer-event';
import { FederatedWheelEvent } from '../../../src/event/federated-event/wheel-event';
import { FederatedMouseEvent } from '../../../src/event/federated-event/mouse-event';
import { EventManager } from '../../../src/event/event-manager';

describe('federated input clone', () => {
  test.each([false, true])('pointer data survives reuse (managed: %s)', managed => {
    const manager = managed ? new EventManager(null, {}) : undefined;
    const event = new FederatedPointerEvent(manager);
    const payload = { label: 'consumer-owned' };
    const extension = Symbol('extension');
    Object.assign(event, { type: 'pointerdown', pointerId: 7, buttons: 1, timeStamp: 123, payload, [extension]: 42 });
    const points = ['layer', 'page', 'canvas', 'viewport', 'client', 'movement', 'offset', 'global', 'screen'] as const;
    points.forEach(key => Object.assign(event[key], { x: 10, y: 20 }));
    event.nativeEvent = { type: 'pointerdown' } as PointerEvent;
    event.currentTarget = {} as any;
    event.eventPhase = event.AT_TARGET;
    event.defaultPrevented = true;
    event.propagationStopped = true;
    event.propagationImmediatelyStopped = true;
    const cloned = event.clone();
    points.forEach(key => Object.assign(event[key], { x: 30, y: 40 }));
    event.type = 'pointerup';
    event.buttons = 0;
    event.nativeEvent = null;
    expect(cloned).toBeInstanceOf(FederatedPointerEvent);
    expect(cloned).toMatchObject({ type: 'pointerdown', pointerId: 7, buttons: 1, timeStamp: 123, clientX: 10 });
    points.forEach(key => {
      expect(cloned[key]).toEqual({ x: 10, y: 20 });
      expect(cloned[key]).not.toBe(event[key]);
    });
    expect((cloned as any).payload).toBe(payload);
    expect(cloned[extension]).toBe(42);
    expect(cloned.nativeEvent.type).toBe('pointerdown');
    expect(cloned.path).toEqual([]);
    expect(cloned.currentTarget).toBeNull();
    expect(cloned.eventPhase).toBe(cloned.NONE);
    expect(cloned.defaultPrevented).toBe(false);
    expect(cloned.propagationStopped).toBe(false);
    expect(cloned.propagationImmediatelyStopped).toBe(false);
  });

  test.each([false, true])('wheel clone retains deltas (managed: %s)', managed => {
    const event = new FederatedWheelEvent(managed ? new EventManager(null, {}) : undefined);
    Object.assign(event, { type: 'wheel', deltaMode: 1, deltaX: 2, deltaY: 3, deltaZ: 4 });
    event.viewport.x = 10;
    const cloned = event.clone();
    event.deltaY = 30;
    event.viewport.x = 100;
    expect(cloned).toBeInstanceOf(FederatedWheelEvent);
    expect(cloned).toMatchObject({ type: 'wheel', deltaMode: 1, deltaX: 2, deltaY: 3, deltaZ: 4, viewX: 10 });
  });

  test('root mouse clone retains coordinates without a manager', () => {
    const event = new FederatedMouseEvent();
    event.type = 'mousemove';
    event.client.x = 10;
    const cloned = event.clone();
    event.client.x = 20;
    expect(cloned).toBeInstanceOf(FederatedMouseEvent);
    expect(cloned).toMatchObject({ type: 'mousemove', clientX: 10, path: [] });
  });

  test.each([FederatedMouseEvent, FederatedPointerEvent, FederatedWheelEvent])(
    '%p clone detaches propagation paths and retains target identity',
    EventConstructor => {
      const root = {} as any;
      const target = { parent: root } as any;
      const manager = new EventManager(root, {});
      const event = new EventConstructor(manager);
      event.target = target;
      const cloned = event.clone();
      expect(cloned.manager).toBe(manager);
      expect(cloned.target).toBe(target);
      expect(cloned.path).toEqual([root, target]);
      expect(cloned.detailPath).toEqual([root, target]);
      event.path.length = 0;
      event.detailPath.length = 0;
      expect(cloned.path).toEqual([root, target]);
      expect(cloned.detailPath).toEqual([root, target]);
    }
  );

  test('cloned gesture retains its complete payload', () => {
    const event = Object.assign(new FederatedPointerEvent(new EventManager(null, {})), {
      scale: 2,
      center: { x: 5, y: 0 },
      points: [
        { x: 0, y: 0 },
        { x: 20, y: 0 }
      ],
      direction: 'right',
      velocity: 3
    });
    const cloned = event.clone();
    expect(cloned).toMatchObject({
      scale: 2,
      center: event.center,
      points: event.points,
      direction: 'right',
      velocity: 3
    });
    expect((cloned as typeof event).center).toBe(event.center);
    expect((cloned as typeof event).points).toBe(event.points);
  });
});
