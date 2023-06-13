/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import { createStage, Circle, EventSystem, Rect } from '../../src/index';
import { createCanvas, removeDom } from '../util';

describe('EventSystem', () => {
  let stage;
  let rect;
  let circle;
  let eventController;
  let canvasElement;

  beforeEach(() => {
    canvasElement = createCanvas();
    canvasElement.style.width = '500px';
    canvasElement.style.height = '500px';
    canvasElement.style.position = 'absolute';
    canvasElement.style.left = '0px';
    canvasElement.style.top = '0px';

    stage = createStage({ canvas: canvasElement, width: 1000, height: 1000, viewWidth: 500, viewHeight: 500 });

    // // create a rectangle
    // rect = stage.createRect(50, 50, 100, 100);
    // rect.fill = true;
    // rect.fill = VRender.createPureColor('red');

    // // create a circle
    // circle = stage.createArc(200, 200, 0, 30, 0, Math.PI * 2, 0);
    // circle.fill = true;
    // circle.fill = VRender.createPureColor('yellow');

    rect = new Rect({
      width: 100,
      height: 100,
      x: 50,
      y: 50,
      fill: 'red'
    });
    stage.defaultLayer.add(rect);

    circle = new Circle({
      radius: 30,
      startAngle: 0,
      endAngle: Math.PI * 2,
      x: 200,
      y: 200,
      fill: 'yellow'
    });
    stage.defaultLayer.add(circle);

    stage.render();

    eventController = new EventSystem({
      targetElement: stage.window.getNativeHandler().nativeCanvas,
      resolution: stage.window.dpr || stage.global.devicePixelRatio,
      rootNode: stage,
      global: stage.global,
      viewport: {
        x: 0,
        y: 0,
        width: 500,
        height: 500
      }
    });
  });

  afterEach(() => {
    stage.release();
    eventController.release();
    removeDom(canvasElement);
  });

  // Test each event(s) and ensure they are emitted at the event target.
  const staticPointerEventTests = [
    /* pointer- events */
    { type: 'pointerdown' },
    { type: 'pointermove' },
    [
      { type: 'pointerdown' },
      // pointerupoutside b/c the canvas isn't the event target, regardless of the
      // hit testing.
      { type: 'pointerupoutside', native: 'pointerup', target: 'test' }
    ],
    { type: 'pointerover' },
    [{ type: 'pointerover' }, { type: 'pointerout', native: 'pointerleave', clientX: 150, clientY: 150 }],
    /* mouse events */
    { type: 'mousedown' },
    { type: 'mousemove' },
    [{ type: 'mousedown' }, { type: 'mouseupoutside', native: 'mouseup', target: 'test' }],
    { type: 'mouseover' },
    [{ type: 'mouseover' }, { type: 'mouseout', clientX: 150, clientY: 150 }],
    { type: 'touchstart' },
    { type: 'touchmove' },
    [{ type: 'touchstart' }, { type: 'touchendoutside', native: 'touchend', target: 'test' }]
  ] as Array<{
    type: string;
    clientX?: number;
    clientY?: number;
    native?: string;
  }>;

  const handlers = {
    pointerdown: 'onPointerDown',
    pointermove: 'onPointerMove',
    pointerup: 'onPointerUp',
    pointerover: 'onPointerOverOut',
    pointerleave: 'onPointerOverOut',
    mousedown: 'onPointerDown',
    mousemove: 'onPointerMove',
    mouseup: 'onPointerUp',
    mouseover: 'onPointerOverOut',
    mouseout: 'onPointerOverOut',
    touchstart: 'onPointerDown',
    touchmove: 'onPointerMove',
    touchend: 'onPointerUp'
  };

  staticPointerEventTests.forEach(event => {
    const events = Array.isArray(event) ? event : [event];
    const isMouseEvent = events[0].type.startsWith('mouse');
    const isTouchEvent = events[0].type.startsWith('touch');

    it(`should fire ${events[events.length - 1].type}`, () => {
      // set supportTouchEvents to be true
      // @ts-ignore
      eventController.supportsTouchEvents = true;
      events.forEach(({ native, type, clientX, clientY, target }) => {
        clientX = clientX || 60;
        clientY = clientY || 80;

        const eventSpy = jest.fn();
        const handler = handlers[(native || type) as keyof typeof handlers];
        rect.addEventListener(type, function testEvent(e) {
          expect(e.nativeEvent.clientX).toEqual(clientX);
          expect(e.nativeEvent.clientY).toEqual(clientY);
          eventSpy();
        });

        stage.on(type, () => {
          eventSpy();
        });

        let event;

        if (!isMouseEvent && !isTouchEvent) {
          event = new PointerEvent(native || type, { clientX, clientY });
        } else if (isTouchEvent) {
          event = new TouchEvent(native || type, {
            changedTouches: [
              new Touch({
                identifier: 0,
                target: stage.window.getNativeHandler().nativeCanvas,
                clientX,
                clientY
              })
            ]
          });
        } else {
          event = new MouseEvent(native || type, { clientX, clientY });
        }

        Object.defineProperty(event, 'target', {
          writable: false,
          value: target ?? stage.window.getNativeHandler().nativeCanvas
        });

        eventController[handler](event);

        expect(eventSpy).toHaveBeenCalledTimes(2);
      });
    });
  });

  it('should dispatch over/out event on move type event', () => {
    // const eventController = new EventSystem({
    //   targetElement: stage.window.getNativeHandler().nativeCanvas,
    //   resolution: stage.window.dpr || stage.global.devicePixelRatio,
    //   rootNode: stage,
    //   global: stage.global
    // });

    const rectOverSpy = jest.fn();
    const rectOutSpy = jest.fn();
    const rectMoveSpy = jest.fn();

    const circleOverSpy = jest.fn();
    const circleOutSpy = jest.fn();
    const circleMoveSpy = jest.fn();

    let callCount = 0;
    rect.addEventListener('pointerover', () => {
      expect(callCount).toEqual(0);
      rectOverSpy();
      ++callCount;
    });
    rect.addEventListener('pointermove', () => {
      expect(callCount).toEqual(1);
      rectMoveSpy();
      ++callCount;
    });
    rect.addEventListener('pointerout', () => {
      expect(callCount).toEqual(2);
      rectOutSpy();
      ++callCount;
    });

    circle.addEventListener('pointerover', () => {
      expect(callCount).toEqual(3);
      circleOverSpy();
      ++callCount;
    });
    circle.addEventListener('pointermove', () => {
      expect(callCount).toEqual(4);
      circleMoveSpy();
      ++callCount;
    });
    circle.addEventListener('pointerout', () => {
      expect(callCount).toEqual(5);
      circleOutSpy();
      ++callCount;
    });

    // trigger pointermove that will hit rect
    const moveEvents1 = new PointerEvent('pointermove', { clientX: 75, clientY: 75 });
    Object.defineProperty(moveEvents1, 'target', {
      writable: false,
      value: stage.window.getNativeHandler().nativeCanvas
    });
    // @ts-ignore
    eventController.onPointerMove(moveEvents1);
    expect(rectOverSpy).toHaveBeenCalledOnce();
    expect(rectMoveSpy).toHaveBeenCalledOnce();

    // trigger mousemove that will hit circle
    // @ts-ignore
    const moveEvents2 = new PointerEvent('pointermove', { clientX: 210, clientY: 210 });
    Object.defineProperty(moveEvents2, 'target', {
      writable: false,
      value: stage.window.getNativeHandler().nativeCanvas
    });
    eventController.onPointerMove(moveEvents2);
    expect(rectOutSpy).toHaveBeenCalledOnce();

    expect(circleOverSpy).toHaveBeenCalledOnce();
    expect(circleMoveSpy).toHaveBeenCalledOnce();
  });

  it('should dispatch pointertap event', () => {
    // const eventController = new EventSystem(layer);
    const circleTapSpy = jest.fn();

    circle.addEventListener('pointertap', e => {
      expect(e.type).toBe('click');
      circleTapSpy();
    });

    // trigger pointerdown event
    // @ts-ignore
    eventController.onPointerDown(new PointerEvent('pointerdown', { clientX: 210, clientY: 210 }));
    const e = new PointerEvent('pointerup', { clientX: 210, clientY: 220 });

    // so it isn't a pointerupoutside
    Object.defineProperty(e, 'target', {
      writable: false,
      value: stage.window.getNativeHandler().nativeCanvas
    });

    // trigger pointerup event
    // @ts-ignore
    eventController.onPointerUp(e);

    expect(circleTapSpy).toHaveBeenCalledOnce();
  });

  it('should dispatch click event', () => {
    // const eventController = new EventSystem(layer);
    const circleClickSpy = jest.fn();

    circle.addEventListener('click', e => {
      expect(e.type).toBe('click');
      circleClickSpy();
    });

    // trigger pointerdown event
    // @ts-ignore
    eventController.onPointerDown(
      new PointerEvent('pointerdown', { clientX: 210, clientY: 210, pointerType: 'mouse' })
    );
    const e = new PointerEvent('pointerup', { clientX: 210, clientY: 220, pointerType: 'mouse' });

    // so it isn't a pointerupoutside
    Object.defineProperty(e, 'target', {
      writable: false,
      value: stage.window.getNativeHandler().nativeCanvas
    });

    // trigger pointerup event
    // @ts-ignore
    eventController.onPointerUp(e);

    expect(circleClickSpy).toHaveBeenCalledOnce();
  });

  it('should dispatch tap event', () => {
    // const eventController = new EventSystem(layer);
    const circleTapSpy = jest.fn();

    circle.addEventListener('pointertap', e => {
      expect(e.type).toBe('click');
      circleTapSpy();
    });

    // trigger pointerdown event
    // @ts-ignore
    eventController.onPointerDown(
      new PointerEvent('pointerdown', { clientX: 210, clientY: 210, pointerType: 'touch' })
    );
    const e = new PointerEvent('pointerup', { clientX: 210, clientY: 220, pointerType: 'touch' });

    // so it isn't a pointerupoutside
    Object.defineProperty(e, 'target', {
      writable: false,
      value: stage.window.getNativeHandler().nativeCanvas
    });

    // trigger pointerup event
    // @ts-ignore
    eventController.onPointerUp(e);

    expect(circleTapSpy).toHaveBeenCalledOnce();
  });

  it('should set the detail of click events to the click count', done => {
    // const eventController = new EventSystem(layer);

    const eventSpy = jest.fn();
    let clickCount = 0;

    rect.addEventListener('pointertap', e => {
      ++clickCount;
      expect((e as PointerEvent).detail).toEqual(clickCount);
      eventSpy();
    });

    for (let i = 0; i < 3; i++) {
      // @ts-ignore
      eventController.onPointerDown(new PointerEvent('pointerdown', { clientX: 60, clientY: 60 }));
      const e = new PointerEvent('pointerup', { clientX: 60, clientY: 60 });

      // so it isn't a pointerupoutside
      Object.defineProperty(e, 'target', {
        writable: false,
        value: stage.window.getNativeHandler().nativeCanvas
      });
      // @ts-ignore
      eventController.onPointerUp(e);
    }

    expect(eventSpy).toBeCalledTimes(3);

    rect.removeAllEventListeners();

    const newSpy = jest.fn();

    rect.addEventListener('pointertap', e => {
      expect((e as PointerEvent).detail).toEqual(1);
      newSpy();
    });

    setTimeout(() => {
      // @ts-ignore
      eventController.onPointerDown(new PointerEvent('pointerdown', { clientX: 60, clientY: 60 }));
      const e = new PointerEvent('pointerup', { clientX: 60, clientY: 75 });

      // so it isn't a pointerupoutside
      Object.defineProperty(e, 'target', {
        writable: false,
        value: stage.window.getNativeHandler().nativeCanvas
      });
      // @ts-ignore
      eventController.onPointerUp(e);

      expect(newSpy).toHaveBeenCalledOnce();
      done();
    }, 800);
  });

  it('should set the CSS cursor right', () => {
    // const eventController = new EventSystem(layer);
    const canvasElement = stage.window.getNativeHandler().nativeCanvas;
    rect.setAttribute('cursor', 'copy');

    const e = new PointerEvent('pointermove', {
      clientX: 60,
      clientY: 80,
      pointerType: 'mouse'
    });
    Object.defineProperty(e, 'target', {
      writable: false,
      value: stage.window.getNativeHandler().nativeCanvas
    });
    // @ts-ignore
    eventController.onPointerMove(e);
    expect(canvasElement.style.cursor).toEqual('copy');

    const eventSpy = jest.fn();

    rect.addEventListener('mousemove', eventSpy);
    const e1 = new PointerEvent('pointermove', {
      clientX: 20,
      clientY: 60,
      pointerType: 'mouse'
    });
    Object.defineProperty(e1, 'target', {
      writable: false,
      value: stage.window.getNativeHandler().nativeCanvas
    });
    // @ts-ignore
    eventController.onPointerMove(e1);

    expect(eventSpy).not.toBeCalled();
    expect(canvasElement.style.cursor).toEqual('inherit');
  });
});
