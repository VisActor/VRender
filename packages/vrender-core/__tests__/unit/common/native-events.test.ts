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
    useNativeEvents: false
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
  ['pointerdown', 'pointerup', 'pointercancel', 'pointerout', 'click'].forEach(type =>
    root.on(type, () => events.push(type))
  );
  const receive = (event: MouseEvent) => {
    if (event !== authorized || event.target !== canvas) {
      return;
    }
    system.handleNativeEvent(event, {
      canvasPoint: { x: (event.clientX - 20) / 2, y: (event.clientY - 10) / 2 },
      inViewport: true
    });
  };
  const blur = () => system.cancelAllPointers();
  const types = ['mousedown', 'mousemove', 'mouseup'];
  types.forEach(type => document.addEventListener(type, receive));
  window.addEventListener('blur', blur);
  const unbind = () => {
    types.forEach(type => document.removeEventListener(type, receive));
    window.removeEventListener('blur', blur);
  };
  return {
    system,
    unbind,
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
      unbind();
      system.release();
      ['mousedown', 'mousemove', 'mouseup'].forEach(type => document.removeEventListener(type, arbitrate));
      canvas.remove();
      expect(errors).toEqual([]);
    }
  };
}

describe('native input ownership', () => {
  test('host arbitration precedes normalization and rejected down cannot click on allowed up', () => {
    const s = setup();
    const point: number[] = [];
    s.root.on('pointerup', event => point.push(event.canvasX, event.canvasY));
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
    s.system.cancelAllPointers();
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
    s.system.cancelAllPointers();
    const afterReset = s.events.slice();
    expect(afterReset).toContain('pointercancel');
    s.system.cancelAllPointers();
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
    s.unbind();
    const before = s.events.slice();
    s.send('mousedown');
    s.send('mouseup');
    expect(s.events).toEqual(before);
    s.release();
  });
});
