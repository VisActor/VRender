/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import { AABBBounds } from '@visactor/vutils';
import { createStage, Circle, Rect, EventManager, FederatedPointerEvent, Group } from '../../src/index';
import { createCanvas, removeDom } from '../util';

describe('Graphic-Bounds', () => {
  // let layer;
  let group;
  let rect;
  let circle;

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
      viewWidth: 500,
      viewHeight: 500
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
    // stage.defaultLayer.add(rect);

    // // append a circle
    // const circle = new VRender.CanvasArc(300, 300, 0, 50, 0, Math.PI * 2, 0);
    // circle.fill = true;
    // circle.fill = VRender.createPureColor('red');
    // layer.appendChild(circle);

    circle = new Circle({
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
      y: 10
    });
    stage.defaultLayer.add(group);

    // target = new VRender.CanvasText(30, 20, 'Hello, VRender');
    // target.fill = true;
    // target.fill = VRender.createPureColor('#000');
    // group.appendChild(target);

    group.add(rect);
    group.add(circle);

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

  it('group bounds should union all children', () => {
    const bounds = new AABBBounds();
    bounds.setValue(rect.AABBBounds.x1, rect.AABBBounds.y1, rect.AABBBounds.x2, rect.AABBBounds.y2);
    bounds.union(circle.AABBBounds);

    expect(group.AABBBounds.x1).toEqual(bounds.x1 + 10);
    expect(group.AABBBounds.y1).toEqual(bounds.y1 + 10);
    expect(group.AABBBounds.x2).toEqual(bounds.x2 + 10);
    expect(group.AABBBounds.y2).toEqual(bounds.y2 + 10);

    const rect2 = new Rect({
      width: 100,
      height: 100,
      x: 0,
      y: 0,
      fill: 'red'
    });
    group.add(rect2);

    bounds.union(rect2.AABBBounds);

    expect(group.AABBBounds.x1).toEqual(bounds.x1 + 10);
    expect(group.AABBBounds.y1).toEqual(bounds.y1 + 10);
    expect(group.AABBBounds.x2).toEqual(bounds.x2 + 10);
    expect(group.AABBBounds.y2).toEqual(bounds.y2 + 10);
  });
});
