/** @jest-environment jsdom */
import { EventEmitter } from '@visactor/vutils';
import { EventSystem } from '../../../src/event/event-system';
import type { RenderConfig } from '../../../src/interface/event';

function setup() {
  const canvas = document.createElement('canvas');
  const root = Object.assign(new EventEmitter(), {
    parent: null,
    stage: { renderCount: 0 },
    attribute: {},
    getCursor: () => '',
    pick: () => ({ graphic: root })
  });
  const system = new EventSystem({
    targetElement: canvas,
    resolution: 1,
    rootNode: root,
    global: { supportsMouseEvents: true, supportsPointerEvents: false, supportsTouchEvents: false },
    useNativeEvents: false
  } as unknown as RenderConfig);
  const send = (type: string, inside = true) =>
    system.handleNativeEvent(new MouseEvent(type, { clientX: 60, clientY: 50, button: 0 }), {
      canvasPoint: { x: 20, y: 20 },
      inViewport: inside
    });
  return { system, root, send };
}
test('cancel in down listener prevents later click', () => {
  const { system, root, send } = setup();
  const click = jest.fn();
  root.on('pointerdown', () => system.cancelPointer(1));
  root.on('click', click);
  send('mousedown');
  send('mouseup');
  expect(click).not.toHaveBeenCalled();
  system.release();
});
test('outside up is published once to window only', () => {
  const { system, send } = setup();
  const win = jest.fn();
  const canvas = jest.fn();
  system.input.window.on('pointerup', win);
  system.input.canvas.on('pointerup', canvas);
  send('mousedown');
  send('mouseup', false);
  expect(win).toHaveBeenCalledTimes(1);
  expect(canvas).not.toHaveBeenCalled();
  system.release();
});
test('input reentered during cancel starts after old terminal notifications', () => {
  const { system, root, send } = setup();
  const order: string[] = [];
  root.on('pointerdown', () => order.push('down'));
  root.on('pointercancel', () => {
    order.push('cancel');
    send('mousedown');
  });
  system.input.window.on('pointercancel', () => order.push('window-cancel'));
  send('mousedown');
  system.cancelPointer(1);
  expect(order).toEqual(['down', 'cancel', 'window-cancel', 'down']);
  root.removeAllListeners();
  system.release();
});

test.each(['target', 'window', 'canvas'])('release in %s down callback stops further dispatch', scope => {
  const { system, root, send } = setup();
  const later = jest.fn();
  if (scope === 'target') {
    root.on('pointerdown', () => system.release());
  } else {
    system.input[scope].on('pointerdown', () => system.release());
  }
  system.input.canvas.on('mousedown', later);
  expect(() => send('mousedown')).not.toThrow();
  expect(later).not.toHaveBeenCalled();
  expect(() => send('mouseup')).not.toThrow();
});
test('window up cancellation suppresses click and canvas up', () => {
  const { system, root, send } = setup();
  const click = jest.fn();
  const up = jest.fn();
  root.on('click', click);
  system.input.canvas.on('pointerup', up);
  system.input.window.on('pointerup', () => system.cancelPointer(1));
  send('mousedown');
  send('mouseup');
  expect(click).not.toHaveBeenCalled();
  expect(up).not.toHaveBeenCalled();
  system.release();
});
test('ignoring one move does not implicitly cancel an accepted press', () => {
  const { system, root, send } = setup();
  const click = jest.fn();
  root.on('click', click);
  send('mousedown'); // The host does not deliver an unrelated move.
  send('mousemove');
  send('mouseup');
  expect(click).toHaveBeenCalledTimes(1);
  system.release();
});

test('new input enqueued while draining cancellation stays behind already queued input', () => {
  const { system, root, send } = setup();
  const order: string[] = [];
  let restarting = false;
  root.on('pointerdown', () => {
    if (restarting) {
      order.push('down');
      send('mousemove');
    }
  });
  root.on('pointerup', () => order.push('up'));
  root.on('pointermove', () => order.push('move'));
  root.on('pointercancel', () => {
    restarting = true;
    send('mousedown');
    send('mouseup');
  });
  send('mousedown');
  system.cancelPointer(1);
  expect(order).toEqual(['down', 'up', 'move']);
  root.removeAllListeners();
  system.release();
});
