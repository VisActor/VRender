/** @jest-environment jsdom */
import { EventEmitter } from '@visactor/vutils';
import { EventSystem } from '../../../src/event/event-system';
import type { RenderConfig } from '../../../src/interface/event';

// Scene boundary only; normalization, mapping, propagation and click tracking are real.
function setup() {
  const canvas = document.createElement('canvas');
  document.body.appendChild(canvas);
  const root = Object.assign(new EventEmitter(), {
    parent: null,
    stage: { renderCount: 0 },
    attribute: {},
    getCursor: () => 'pointer',
    pick: () => ({ graphic: root })
  });
  const system = new EventSystem({
    targetElement: canvas,
    resolution: 1,
    rootNode: root,
    global: { supportsMouseEvents: true, supportsPointerEvents: false, supportsTouchEvents: false },
    nativeEvents: false
  } as unknown as RenderConfig);
  const events: string[] = [];
  const errors: unknown[] = [];
  let allowed = true;
  let authorized: Event;
  const arbitrate = (event: Event) => {
    if (allowed) {
      authorized = event;
    }
  };
  document.addEventListener('mousedown', arbitrate);
  document.addEventListener('mousemove', arbitrate);
  document.addEventListener('mouseup', arbitrate);
  ['pointerdown', 'pointerup', 'pointercancel', 'pointerout', 'click'].forEach((type) =>
    root.on(type, () => events.push(type))
  );
  system.setNativeEventOptions({
    target: canvas,
    root: document,
    pointerEvents: false,
    filter: (event) => event === authorized,
    mapPoint: (event) => ({ x: (event.clientX - 20) / 2, y: (event.clientY - 10) / 2 }),
    onCursor: () => undefined,
    onError: (error) => errors.push(error)
  });
  return {
    system,
    canvas,
    root,
    events,
    errors,
    allow(value: boolean) {
      allowed = value;
    },
    send(type: string, target: HTMLElement = canvas) {
      target.dispatchEvent(new MouseEvent(type, { bubbles: true, clientX: 60, clientY: 50, button: 0 }));
    },
    release() {
      system.release();
      ['mousedown', 'mousemove', 'mouseup'].forEach((type) => document.removeEventListener(type, arbitrate));
      canvas.remove();
      expect(errors).toEqual([]);
    }
  };
}

describe('native input ownership', () => {
  test('host arbitration precedes normalization and rejected down cannot click on allowed up', () => {
    const s = setup();
    const point: number[] = [];
    s.root.on('pointerup', (event) => point.push(event.canvasX, event.canvasY));
    s.allow(false);
    s.send('mousedown');
    s.allow(true);
    s.send('mouseup');
    expect(s.events).toEqual(['pointerup']);
    expect(point).toEqual([20, 20]);
    s.release();
  });

  test('takeover cancels the press and hover without a later click', () => {
    const s = setup();
    s.send('mousemove');
    s.send('mousedown');
    s.allow(false);
    s.send('mousemove');
    s.allow(true);
    s.send('mouseup');
    expect(s.events).toContain('pointercancel');
    expect(s.events).toContain('pointerout');
    expect(s.events).not.toContain('click');
    s.release();
  });

  test('explicit reset is synchronous and idempotent', () => {
    const s = setup();
    s.send('mousemove');
    s.send('mousedown');
    s.system.resetNativeEvents();
    const afterReset = s.events.slice();
    expect(afterReset).toContain('pointercancel');
    s.system.resetNativeEvents();
    expect(s.events).toEqual(afterReset);
    s.send('mouseup');
    expect(s.events).not.toContain('click');
    s.release();
  });

  test('authorized input over a foreign DOM element still cannot hit the chart', () => {
    const s = setup();
    const button = document.createElement('button');
    document.body.appendChild(button);
    s.send('mousedown', button);
    s.send('mouseup', button);
    expect(s.events).toEqual([]);
    button.remove();
    s.release();
  });

  test('blur clears the gesture and unbinding removes native listeners', () => {
    const s = setup();
    s.send('mousedown');
    window.dispatchEvent(new Event('blur'));
    s.send('mouseup');
    expect(s.events).toContain('pointercancel');
    expect(s.events).not.toContain('click');
    s.system.setNativeEventOptions();
    const before = s.events.slice();
    s.send('mousedown');
    s.send('mouseup');
    expect(s.events).toEqual(before);
    s.release();
  });
});
