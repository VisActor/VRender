/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import {
  createStage,
  Circle,
  Rect,
  EventSystem,
  FederatedPointerEvent,
  EventTarget,
  DragNDrop
} from '../../../src/index';
import { createCanvas, removeDom } from '../../util';

describe('DragNDrop', () => {
  let layer;
  let stage;
  let target;
  let source;
  let dragController;
  let canvasDom;

  beforeEach(() => {
    canvasDom = createCanvas();
    canvasDom.style.position = 'absolute';
    canvasDom.style.width = '500px';
    canvasDom.style.height = '500px';
    canvasDom.style.top = '10px';
    canvasDom.style.left = '10px';
    canvasDom.style.border = '1px solid #000';
    canvasDom.width = 500;
    canvasDom.height = 500;
    // // create layer
    // layer = new VRender.Layer(canvasDom, '2d', 2);
    // // TODO：因为 layer 默认集成了 EventSystem, 所以这里为了测试方便，先卸载了, layer 提供一个卸载的方法
    // layer._systems.forEach(system => {
    //   system.destroy();
    // });
    stage = createStage({ canvas: canvasDom, width: 1000, height: 1000, viewWidth: 500, viewHeight: 500 });
    stage.eventSystem.release();

    // append a rect
    // target = new VRender.CanvasRect(100, 100, 100, 80);
    // target.fill = true;
    // target.fillColor = VRender.createPureColor('#999');
    // layer.appendChild(target);

    target = new Rect({
      x: 100,
      y: 100,
      width: 100,
      height: 80,
      fillColor: '#999'
    });
    stage.defaultLayer.add(target);

    // const circleBelow = new VRender.CanvasArc(300, 300, 0, 25, 0, Math.PI * 2, 0);
    // circleBelow.fill = true;
    // circleBelow.fillColor = VRender.createPureColor('yellow');
    // circleBelow.name = 'circleBelow';
    // layer.appendChild(circleBelow);

    // FIXME: 拾取逻辑优化后修改
    // const circleBelow = new Circle({
    //   x: 300,
    //   y: 300,
    //   radius: 25,
    //   startAngle: 0,
    //   endAngle: Math.PI * 2,
    //   fillColor: 'yellow'
    // });
    // stage.add(circleBelow);

    // append a circle
    // source = new VRender.CanvasArc(300, 300, 0, 25, 0, Math.PI * 2, 0);
    // source.fill = true;
    // source.fillColor = VRender.createPureColor('green');
    // source.name = 'circleUp';

    // layer.appendChild(source);

    source = new Circle({
      x: 300,
      y: 300,
      radius: 25,
      startAngle: 0,
      endAngle: Math.PI * 2,
      fillColor: 'green'
    });
    stage.defaultLayer.add(source);

    // layer.draw({});

    // // FIXME: 事件拾取依赖于 bound, 但是 VRender 内部不会自动计算 bound, 需要外部手动调用
    // target.updateBounds();
    // source.updateBounds();
    // circleBelow.updateBounds();

    stage.render();
    // 绑定 drag 事件
    dragController = new DragNDrop(stage);
  });

  afterEach(() => {
    dragController.release();
    // destroy layer
    // layer.dispose().draw({});
    stage.release();
    removeDom(canvasDom);
  });

  it('should emit drag relative event', () => {
    const eventSystem = new EventSystem({
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
    const dragSpy = jest.fn();
    const dragstartSpy = jest.fn();
    const dragendSpy = jest.fn();
    const dragenterSpy = jest.fn();
    const dragleaveSpy = jest.fn();
    const dragoverSpy = jest.fn();
    const dropSpy = jest.fn();
    source.addEventListener('dragstart', e => {
      dragstartSpy();
    });

    source.addEventListener('drag', e => {
      dragSpy();
    });

    source.addEventListener('dragend', e => {
      dragendSpy();
    });

    // target
    target.addEventListener('dragenter', e => {
      dragenterSpy();
    });

    target.addEventListener('dragover', e => {
      dragoverSpy();
    });

    target.addEventListener('dragleave', e => {
      dragleaveSpy();
    });

    target.addEventListener('drop', e => {
      dropSpy();
    });

    const e1 = new PointerEvent('pointerdown', {
      clientX: 300,
      clientY: 300,
      pointerType: 'mouse'
    });
    Object.defineProperty(e1, 'target', {
      writable: false,
      value: stage.window.getNativeHandler().nativeCanvas
    });
    eventSystem.onPointerDown(e1);

    const e2 = new PointerEvent('pointermove', {
      clientX: 150,
      clientY: 150,
      pointerType: 'mouse'
    });
    Object.defineProperty(e2, 'target', {
      writable: false,
      value: stage.window.getNativeHandler().nativeCanvas
    });
    eventSystem.onPointerMove(e2);

    const e3 = new PointerEvent('pointerup', {
      clientX: 150,
      clientY: 150,
      pointerType: 'mouse'
    });
    Object.defineProperty(e3, 'target', {
      writable: false,
      value: stage.window.getNativeHandler().nativeCanvas
    });
    eventSystem.onPointerUp(e3);

    expect(dragSpy).toHaveBeenCalledTimes(1);
    expect(dragstartSpy).toHaveBeenCalledTimes(1);
    expect(dragendSpy).toHaveBeenCalledTimes(1);
    expect(dragenterSpy).toHaveBeenCalledTimes(1);
    expect(dragoverSpy).toHaveBeenCalledTimes(1);
    expect(dropSpy).toHaveBeenCalledTimes(1);
    // expect(dragleaveSpy).toHaveBeenCalledTimes(1);
  });
});
