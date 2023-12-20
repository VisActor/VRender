/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import { createStage, Circle, Rect, EventManager, FederatedPointerEvent, Group } from '../../src/index';
import { createCanvas, removeDom } from '../util';

describe('EventManager', () => {
  // let layer;
  let group;
  let target;
  let rect;

  let stage;
  let canvasDom;

  beforeEach(() => {
    canvasDom = createCanvas();
    canvasDom.style.position = 'relative';
    canvasDom.style.width = '500px';
    canvasDom.style.height = '500px';
    canvasDom.width = 500;
    canvasDom.height = 500;
    // // create layer
    // layer = new VRender.Layer(canvasDom, '2d', 2);
    // // TODO：因为 layer 默认集成了 EventSystem, 所以这里为了测试方便，先卸载了, layer 提供一个卸载的方法
    // layer._systems.forEach(system => {
    //   system.destroy();
    // });

    stage = createStage({
      canvas: canvasDom,
      width: 1000,
      height: 1000,
      viewBox: { x1: 0, y1: 0, x2: 500, y2: 500 },
      background: '#ccc'
    });

    // // append a rect
    // rect = new VRender.CanvasRect(100, 100, 100, 100);
    // rect.fill = true;
    // rect.fill = VRender.createPureColor('red');
    // layer.appendChild(rect);

    rect = new Rect({
      width: 100,
      height: 100,
      x: 100,
      y: 100,
      fill: 'red'
    });
    stage.defaultLayer.add(rect);

    // // append a circle
    // const circle = new VRender.CanvasArc(300, 300, 0, 50, 0, Math.PI * 2, 0);
    // circle.fill = true;
    // circle.fill = VRender.createPureColor('red');
    // layer.appendChild(circle);

    const circle = new Circle({
      radius: 50,
      startAngle: 0,
      endAngle: Math.PI * 2,
      x: 300,
      y: 300,
      fill: 'red'
    });

    // append a group
    // group = new VRender.CanvasGroup(10, 10);
    // layer.appendChild(group);

    group = new Group({
      x: 10,
      y: 10,
      width: 150,
      height: 20
    });
    stage.defaultLayer.add(group);

    // target = new VRender.CanvasText(30, 20, 'Hello, VRender');
    // target.fill = true;
    // target.fill = VRender.createPureColor('#000');
    // group.appendChild(target);

    target = new Rect({
      width: 120,
      height: 18,
      x: 30,
      y: 20,
      fill: 'red'
    });
    group.add(target);

    // layer.draw({});

    stage.render();

    // // FIXME: 事件拾取依赖于 bound, 但是 VRender 内部不会自动计算 bound, 需要外部手动调用
    // rect.updateBounds();
    // group.updateBounds();
    // target.updateBounds();
  });

  afterEach(() => {
    // destroy layer
    stage.release();
    removeDom(canvasDom);
  });

  it('should fire capture, bubble events on the correct target, just like DOM Event model', () => {
    const manager = new EventManager(stage);

    const event = new FederatedPointerEvent(manager);
    event.target = target;
    event.global.x = 40;
    event.global.y = 25;
    event.type = 'click';

    const eventSpy = jest.fn();
    const captureSpy = jest.fn();
    const rootSpy = jest.fn();

    target.addEventListener('click', eventSpy, true);
    target.addEventListener('click', {
      handleEvent(e) {
        expect(this).toBeDefined();
        expect(e.eventPhase).toEqual(e.AT_TARGET);

        eventSpy();
      }
    });
    group.addEventListener(
      'click',
      () => {
        captureSpy();
      },
      true
    );
    stage.on('click', () => {
      rootSpy();
    });

    manager.dispatchEvent(event);

    expect(eventSpy).toBeCalledTimes(2);
    expect(captureSpy).toHaveBeenCalledOnce();
    expect(captureSpy).toHaveBeenCalledBefore(eventSpy);
    expect(rootSpy).toHaveBeenCalledOnce();
  });

  it('should set hit-test target to most specific ancestor if hit object is not interactive', () => {
    const manager = new EventManager(stage);

    target.attribute.pickable = false;
    const hitTestTarget = manager.pickTarget(40, 32);
    expect(hitTestTarget).toEqual(group);
  });

  it('should fire event when set event delegation', () => {
    const manager = new EventManager(stage);

    const event = new FederatedPointerEvent(manager);
    event.target = target;
    event.global.x = 40;
    event.global.y = 25;
    event.type = 'pointerleave';

    const eventSpy = jest.fn();
    const pointerleaveSpy = jest.fn();
    stage.on('*', (e, type) => {
      eventSpy();
      if (type === 'pointerleave') {
        pointerleaveSpy();
      }
    });

    manager.dispatchEvent(event);
    expect(eventSpy).toBeCalledTimes(2);
    expect(pointerleaveSpy).toBeCalledTimes(1);
  });

  xit('should fire pointerupoutside only on relevant & still mounted targets', () => {
    const manager = new EventManager(stage);

    const eventSpy = jest.fn();
    const groupSpy = jest.fn();
    const layerSpy = jest.fn();
    const layerOutsideSpy = jest.fn();

    target.addEventListener('pointerupoutside', eventSpy);
    group.addEventListener('pointerupoutside', groupSpy);
    stage.on('pointerup', layerSpy);
    stage.on('pointerupoutside', layerOutsideSpy);

    const on = new FederatedPointerEvent(manager);
    const off = new FederatedPointerEvent(manager);

    on.pointerId = 1;
    on.button = 1;
    on.type = 'pointerdown';
    on.global.x = 40;
    on.global.y = 20;

    off.pointerId = 1;
    off.button = 1;
    off.type = 'pointerup';
    off.global.x = 150;
    off.global.y = 150;

    manager.mapEvent(on);
    expect(manager.trackingData(1).pressTargetsByButton[1][3]).toEqual(target);

    target.dispose();
    manager.mapEvent(off);

    // "target" unmounted so it shouldn't get a pointerupoutside
    expect(eventSpy).not.toBeCalled();

    // "group" still mounted so it should get pointerupoutside
    expect(groupSpy).toHaveBeenCalledOnce();

    // "stage" still ancestor of the hit "outside" on pointerup, so it get pointerup instead
    expect(layerOutsideSpy).not.toBeCalled();
    // not a "pointerupoutside"
    expect(layerSpy).toHaveBeenCalledOnce();
  });

  xit('should fire pointerout on the most specific mounted ancestor of pointerover target', () => {
    const manager = new EventManager(stage);
    const container = group;
    const over = target;
    const to = rect;

    const orgOverSpy = jest.fn();
    const orgContainerOverSpy = jest.fn();
    const outSpy = jest.fn();
    const containerOutSpy = jest.fn();
    const toOverSpy = jest.fn();

    over.addEventListener('pointerover', orgOverSpy);
    container.addEventListener('pointerover', e => {
      expect(e.target).toEqual(over);
      orgContainerOverSpy();
    });
    over.addEventListener('pointerout', outSpy);
    container.addEventListener('pointerout', e => {
      expect(e.target).toEqual(container);
      containerOutSpy();
    });
    to.addEventListener('pointerover', toOverSpy);

    const on = new FederatedPointerEvent(manager);
    const off = new FederatedPointerEvent(manager);

    on.pointerId = 1;
    on.type = 'pointerover';
    on.global.x = 40;
    on.global.y = 20;

    off.pointerId = 1;
    off.type = 'pointermove';
    off.global.x = 150;
    off.global.y = 150;

    manager.mapEvent(on);

    expect(orgOverSpy).toHaveBeenCalledOnce();
    expect(orgContainerOverSpy).toHaveBeenCalledOnce();

    over.dispose();

    manager.mapEvent(off);

    expect(outSpy).not.toBeCalled();
    expect(containerOutSpy).toHaveBeenCalledOnce();
    expect(toOverSpy).toHaveBeenCalledOnce();
  });
});
