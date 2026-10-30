// Real Canvas/DOM regression fixture; shared by Electron and the source-browser verification.
import { createStage, createRect } from '@visactor/vrender';
import { DataZoom } from '@visactor/vrender-components';
import { loadBrowserEnv } from '@visactor/vrender-kits';
import { vglobal } from '@visactor/vrender-core';
import { Matrix } from '@visactor/vutils';
import { Slider } from '@visactor/vrender-components';
let results;
const check = (name, ok, detail) => {
  results.push({ name, pass: !!ok, detail });
  if (!ok) throw Error(name + ': ' + JSON.stringify(detail));
};
function setup(component, defaults = false, extra = {}, defer = false) {
  const canvas = document.createElement('canvas');
  document.body.appendChild(canvas);
  const stage = createStage({
    canvas,
    width: 400,
    height: 180,
    dpr: devicePixelRatio,
    autoRender: false,
    autoRefresh: false,
    interactiveLayerMode: 'virtual',
    event: { useNativeEvents: defaults },
    ...extra
  });
  if (component) stage.defaultLayer.add(component);
  if (!defer) stage.render();
  const sys = stage.eventSystem;
  function send(type, x, y, id = 1, inside = true) {
    const ev = new PointerEvent(type, {
      clientX: x,
      clientY: y,
      pointerId: id,
      pointerType: 'mouse',
      button: 0,
      buttons: type === 'pointerup' ? 0 : 1,
      bubbles: true
    });
    if (defaults) canvas.dispatchEvent(ev);
    else sys.handleNativeEvent(ev, { canvasPoint: { x, y }, inViewport: inside });
  }
  return {
    stage,
    sys,
    send,
    release() {
      stage.release();
      canvas.remove();
    }
  };
}
function center(g) {
  const b = g.globalAABBBounds;
  return [(b.x1 + b.x2) / 2, (b.y1 + b.y2) / 2];
}
function node(s, name) {
  let found;
  s.stage.find(g => {
    if (g.name === name) found = g;
    return false;
  }, true);
  return found;
}
export async function runHostInputChecks() {
  results = [];
  loadBrowserEnv();
  vglobal.setEnv('browser');
  // A clipped point must not trigger another scenegraph pick.
  for (const affine of [false, true]) {
    const rect = createRect({ x: 10, y: 10, width: 60, height: 60, fill: 'red' });
    const a = setup(rect);
    const b = createRect({ x: 100, y: 10, width: 60, height: 60, fill: 'blue' });
    a.stage.defaultLayer.add(b);
    a.stage.render();
    let hits = 0,
      outsideMoves = 0,
      leaves = 0;
    for (const type of ['pointerover', 'pointerenter', 'pointermove', 'mousemove']) b.on(type, () => hits++);
    rect.on('pointerout', () => leaves++);
    a.sys.input.window.on('pointermove', () => outsideMoves++);
    const send = (type, x, inside) => {
      const client = affine ? { x: 1.5 * x + 46, y: 0.2 * x + 36 } : { x, y: 20 };
      a.sys.handleNativeEvent(
        new PointerEvent(type, {
          clientX: client.x,
          clientY: client.y,
          pointerId: 1,
          pointerType: 'mouse',
          buttons: 1
        }),
        { canvasPoint: { x, y: 20 }, inViewport: inside }
      );
    };
    send('pointermove', 20, true);
    send('pointerdown', 20, true);
    send('pointermove', 120, false);
    check('host-clipped-target-' + affine, hits === 0 && outsideMoves === 2 && leaves === 1, {
      hits,
      outsideMoves,
      leaves
    });
    a.release();
  }
  for (const capture of [true, false]) {
    const rect = createRect({ x: 10, y: 10, width: 60, height: 60, fill: 'red' });
    const a = setup(rect);
    let later = 0,
      cancelled = 0,
      scoped = 0;
    const cancelOther = e => {
      if (e.pointerId === 7) a.sys.cancelPointer(19);
    };
    (capture ? a.stage : rect).addEventListener('pointerdown', cancelOther, capture);
    rect.on('pointerdown', e => {
      if (e.pointerId === 7) later++;
    });
    a.sys.input.window.on('pointercancel', e => {
      if (e.pointerId === 19) cancelled++;
    });
    a.sys.input.window.on('pointerdown', e => {
      if (e.pointerId === 7) scoped++;
    });
    for (const id of [19, 7])
      a.sys.handleNativeEvent(
        new PointerEvent('pointerdown', {
          pointerId: id,
          pointerType: 'touch',
          clientX: 20,
          clientY: 20,
          buttons: 1
        }),
        { canvasPoint: { x: 20, y: 20 }, inViewport: true }
      );
    check('cancel-other-pointer-' + capture, later === 1 && cancelled === 1 && scoped === 1, {
      later,
      cancelled,
      scoped
    });
    a.release();
  }
  for (const defaults of [false, true]) {
    const a = setup(createRect({ x: 10, y: 10, width: 100, height: 100, fill: 'red' }), defaults);
    let clicks = 0,
      cancels = 0;
    a.stage.on('click', () => clicks++);
    a.stage.on('pointerdown', () => a.sys.cancelPointer(1));
    a.sys.input.window.on('pointercancel', () => cancels++);
    a.send('pointerdown', 30, 30);
    a.send('pointerup', 30, 30);
    check('synchronous-cancel-' + defaults, clicks === 0 && cancels === 1, { clicks, cancels });
    a.release();
  }
  for (const scope of ['target', 'capture', 'window', 'canvas']) {
    const a = setup(createRect({ x: 10, y: 10, width: 100, height: 100, fill: 'red' }));
    let down = 0,
      click = 0,
      alias = 0;
    a.stage.on('click', () => click++);
    a.sys.input.canvas.on('mousedown', () => alias++);
    const rect = a.stage.defaultLayer.children[0];
    rect.on('pointerdown', () => down++);
    if (scope === 'capture') a.stage.addEventListener('pointerdown', () => a.sys.cancelPointer(1), { capture: true });
    else if (scope === 'target') rect.on('pointerdown', () => a.sys.cancelPointer(1));
    else a.sys.input[scope].on('pointerdown', () => a.sys.cancelPointer(1));
    a.send('pointerdown', 30, 30);
    a.send('pointerup', 30, 30);
    check('cancel-' + scope, click === 0 && alias === 0 && (scope !== 'capture' || down === 0), { down, click, alias });
    a.release();
  }
  {
    const a = setup(createRect({ x: 10, y: 10, width: 100, height: 100, fill: 'red' }));
    const order = [];
    a.stage.on('pointerdown', () => order.push('down'));
    a.stage.on('pointercancel', () => {
      order.push('cancel');
      a.send('pointerdown', 30, 30);
    });
    a.sys.input.window.on('pointercancel', () => order.push('window-cancel'));
    a.send('pointerdown', 30, 30);
    a.sys.cancelPointer(1);
    check('cancel-reentrant-down', order.join(',') === 'down,cancel,window-cancel,down', order);
    a.stage.removeAllListeners();
    a.release();
  }
  {
    const a = setup(createRect({ x: 10, y: 10, width: 100, height: 100, fill: 'red' }));
    let w = 0,
      c = 0,
      click = 0;
    a.sys.input.window.on('pointerup', () => w++);
    a.sys.input.canvas.on('pointerup', () => c++);
    a.stage.on('click', () => click++);
    a.send('pointerdown', 30, 30);
    a.send('pointerup', 450, 30, 1, false);
    check('outside-up', w === 1 && c === 0 && click === 0, { w, c, click });
    a.release();
  }
  for (const kind of ['zoom', 'slider'])
    for (const delay of kind === 'zoom' ? [0, 30] : [0])
      for (const cancel of [false, true]) {
        const component =
          kind === 'zoom'
            ? new DataZoom({
                position: { x: 30, y: 30 },
                size: { width: 300, height: 50 },
                start: 0.2,
                end: 0.8,
                realTime: true,
                delayType: 'debounce',
                delayTime: delay
              })
            : new Slider({ x: 30, y: 30, min: 0, max: 100, value: 20, railWidth: 300, railHeight: 10 });
        const a = setup(component);
        const all = [];
        a.stage.find(g => {
          if (g.name) all.push(g.name);
          return false;
        }, true);
        const target = kind === 'zoom' ? node(a, 'startHandlerMask') : node(a, 'sliderStartHandler');
        if (!target) throw Error('missing ' + kind + JSON.stringify(all));
        const pos = center(target);
        a.send('pointerdown', ...pos);
        a.send('pointermove', pos[0] + 30, pos[1]);
        if (cancel) a.sys.cancelPointer(1);
        else a.send('pointerup', pos[0] + 100, pos[1]);
        const value = kind === 'zoom' ? component._state.start : component.currentValue.startValue;
        await new Promise(r => setTimeout(r, 60));
        const after = kind === 'zoom' ? component._state.start : component.currentValue.startValue;
        a.send('pointermove', pos[0] + 150, pos[1]);
        a.send('pointerup', pos[0] + 150, pos[1]);
        const late = kind === 'zoom' ? component._state.start : component.currentValue.startValue;
        check(
          `${kind}-${delay}-${cancel}`,
          value === after &&
            after === late &&
            (cancel && delay ? Math.abs(value - 0.2) < 0.001 : value > (kind === 'zoom' ? 0.2 : 20)),
          { value, after, late }
        );
        a.release();
      }

  // Logical canvas scope must not follow scenegraph sibling boundaries.
  {
    const a = setup(createRect({ x: 10, y: 10, width: 30, height: 30, fill: 'red' }));
    a.stage.defaultLayer.add(createRect({ x: 70, y: 10, width: 30, height: 30, fill: 'blue' }));
    a.stage.render();
    let leaves = 0,
      enters = 0,
      clicks = 0,
      doubles = 0;
    a.sys.input.canvas.on('pointerout', () => leaves++);
    a.sys.input.canvas.on('pointerover', () => enters++);
    a.sys.input.canvas.on('click', () => clicks++);
    a.sys.input.canvas.on('dblclick', () => doubles++);
    a.send('pointermove', 20, 20);
    a.send('pointermove', 80, 20);
    check('sibling-is-not-canvas-leave', leaves === 0 && enters === 1, { leaves, enters });
    a.send('pointermove', 450, 20, 1, false);
    check('logical-leave', leaves === 1, { leaves });
    a.send('pointerdown', 200, 100);
    a.send('pointerup', 200, 100);
    a.send('pointerdown', 200, 100);
    a.send('pointerup', 200, 100);
    check('blank-canvas-click', clicks === 2 && doubles === 1, { clicks, doubles });
    a.release();
  }
  for (const realTime of [true, false])
    for (const action of ['up', 'cancel', 'outside-cancel', 'release', 'delay-change']) {
      const c = new DataZoom({
        position: { x: 30, y: 30 },
        size: { width: 300, height: 50 },
        start: 0.2,
        end: 0.8,
        realTime,
        delayType: 'debounce',
        delayTime: 30
      });
      const a = setup(c),
        pos = center(node(a, 'startHandlerMask'));
      a.send('pointerdown', ...pos);
      a.send('pointermove', pos[0] + 30, pos[1]);
      a.send('pointermove', pos[0] + 150, pos[1], 2);
      if (action === 'up') a.send('pointerup', pos[0] + 100, pos[1]);
      if (action === 'cancel') a.sys.cancelPointer(1);
      if (action === 'outside-cancel') {
        a.stage.on('pointerupoutside', () => a.sys.cancelPointer(1));
        a.send('pointerup', 450, 30, 1, false);
      }
      if (action === 'release') c.release();
      if (action === 'delay-change') c.setAttributes({ delayTime: 60 });
      await new Promise(r => setTimeout(r, 80));
      check(
        'debounce-' + realTime + '-' + action,
        action === 'up' ? c._state.start > 0.2 && c._state.start < 0.4 : c._state.start === 0.2,
        { value: c._state.start }
      );
      a.release();
    }
  for (const kind of ['zoom', 'slider']) {
    const c =
      kind === 'zoom'
        ? new DataZoom({ position: { x: 30, y: 30 }, size: { width: 300, height: 50 }, start: 0.2, end: 0.8 })
        : new Slider({
            x: 30,
            y: 30,
            min: 0,
            max: 100,
            value: [20, 70],
            range: { draggableTrack: true },
            railWidth: 300,
            railHeight: 10
          });
    const a = setup(c),
      pos = center(node(a, kind === 'zoom' ? 'startHandlerMask' : 'sliderTrack'));
    const value = () => (kind === 'zoom' ? c._state.start : c.currentValue.startValue);
    const before = value();
    a.send('pointerdown', ...pos);
    a.send('pointermove', pos[0] + 30, pos[1], 2);
    check(kind + '-foreign-pointer', value() === before);
    a.send('pointermove', pos[0] + 30, pos[1]);
    const moved = value();
    check(kind + '-drag', moved > before, { moved, before });
    a.sys.cancelPointer(1);
    a.send('pointermove', pos[0] + 70, pos[1]);
    check(kind + '-cancel-keeps-value', value() === moved);
    a.send('pointerdown', ...center(node(a, kind === 'zoom' ? 'startHandlerMask' : 'sliderTrack')));
    a.send('pointermove', pos[0] + 90, pos[1]);
    a.send('pointerup', pos[0] + 90, pos[1]);
    check(kind + '-restart', value() > moved, { value: value(), moved });
    a.release();
  }
  // Both coordinate consumers must read view coordinates after host inverse and Stage transform.
  for (const matrix of [new Matrix(1, 0, 0, 1, 40, 20), new Matrix(1.5, 0.2, 0.3, 0.8, 40, 20)]) {
    const a = setup(createRect({ x: 10, y: 10, width: 100, height: 100, fill: 'red' }));
    a.stage.window.setViewBoxTransform(2, 0, 0, 2, 0, 0);
    let point;
    a.stage.on('pointerdown', e => (point = [e.viewX, e.viewY, ...Object.values(a.stage.eventPointTransform(e))]));
    const local = { x: 40, y: 40 },
      client = {
        x: matrix.a * local.x + matrix.c * local.y + matrix.e,
        y: matrix.b * local.x + matrix.d * local.y + matrix.f
      };
    const canvasPoint = { x: 0, y: 0 };
    matrix.transformPoint(client, canvasPoint);
    a.sys.handleNativeEvent(
      new PointerEvent('pointerdown', { clientX: client.x, clientY: client.y, pointerId: 1, pointerType: 'mouse' }),
      { canvasPoint, inViewport: true }
    );
    check(
      'mapped-stage-component-point',
      point?.every(v => Math.abs(v - 20) < 0.001),
      point
    );
    a.release();
  }
  // First normal frame and composition frame, later source Layer, runtime Layer insertion, hooks.
  for (const route of ['render', 'frame', 'renderTo']) {
    const a = setup(null, false, { background: 'transparent' }, true),
      target = setup(null, false, { background: 'transparent' });
    const later = a.stage.createLayer(undefined, 'virtual');
    const raised = createRect({ x: 20, y: 20, width: 50, height: 50, fill: 'red', globalZIndex: 1 });
    later.add(raised);
    const b = a.stage.createLayer(undefined, 'virtual');
    b.add(createRect({ x: 20, y: 20, width: 50, height: 50, fill: 'blue' }));
    const paint = () => {
      if (route === 'render') a.stage.render();
      else if (route === 'frame') {
        a.stage.renderNextFrame();
        a.stage._doRenderInThisFrame();
      } else a.stage.renderTo(target.stage.window, undefined, { clear: false });
    };
    paint();
    const canvas = (route === 'renderTo' ? target : a).stage.window.getNativeHandler().nativeCanvas;
    const pixel = () =>
      Array.from(canvas.getContext('2d').getImageData(40 * devicePixelRatio, 40 * devicePixelRatio, 1, 1).data);
    check('virtual-first-' + route, pixel()[0] === 255 && pixel()[2] === 0, pixel());
    const top = a.stage.createLayer(undefined, 'virtual');
    top.add(createRect({ x: 20, y: 20, width: 50, height: 50, fill: 'green' }));
    paint();
    check('virtual-dynamic-' + route, pixel()[0] === 255 && pixel()[1] === 0, pixel());
    a.release();
    target.release();
  }
  for (const hosted of [false, true]) {
    const a = setup(null, false, hosted ? { requestRender: () => {} } : {}),
      target = setup();
    let before = 0,
      after = 0;
    a.stage.hooks.beforeRender.tap('test', () => {
      before++;
      const layer = a.stage.createLayer(undefined, 'virtual');
      layer.add(createRect({ x: 10, y: 10, width: 20, height: 20, fill: 'red', globalZIndex: 1 }));
    });
    a.stage.hooks.afterRender.tap('test', () => after++);
    a.stage.renderTo(target.stage.window);
    check('renderTo-hooks-' + hosted, before === (hosted ? 1 : 0) && after === (hosted ? 1 : 0), { before, after });
    if (hosted) {
      a.stage.hooks.beforeRender.tap('error', () => {
        throw Error('test');
      });
      try {
        a.stage.renderTo(target.stage.window);
      } catch {}
      check('renderTo-restores-state', a.stage.state === 'normal', a.stage.state);
    }
    a.release();
    target.release();
  }
  {
    const a = setup(createRect({ x: 10, y: 10, width: 100, height: 100, fill: 'red' }));
    const order = [];
    let restarting = false;
    a.stage.on('pointerdown', () => {
      if (restarting) {
        order.push('down');
        a.send('pointermove', 30, 30);
      }
    });
    a.stage.on('pointerup', () => order.push('up'));
    a.stage.on('pointermove', () => order.push('move'));
    a.stage.on('pointercancel', () => {
      restarting = true;
      a.send('pointerdown', 30, 30);
      a.send('pointerup', 30, 30);
    });
    a.send('pointerdown', 30, 30);
    a.sys.cancelPointer(1);
    check('cancel-drain-fifo', order.join(',') === 'down,up,move', order);
    a.stage.removeAllListeners();
    a.release();
  }
  return results;
}
