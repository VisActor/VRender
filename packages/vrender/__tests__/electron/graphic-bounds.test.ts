/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import { AABBBounds } from '@visactor/vutils';
import {
  createStage,
  Circle,
  Rect,
  EventManager,
  FederatedPointerEvent,
  Group,
  createRect,
  createArc,
  createCircle,
  createArea,
  createGlyph,
  createSymbol,
  createText
} from '../../src/index';
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

  it('graphic bounds', () => {
    let rect = createRect({
      x: 100,
      y: 100
    });

    expect(rect.AABBBounds.x1).toEqual(100);
    expect(rect.AABBBounds.y1).toEqual(100);
    expect(rect.AABBBounds.x2).toEqual(100);
    expect(rect.AABBBounds.y2).toEqual(100);

    rect = createRect({
      x: 100,
      y: 100,
      visible: true
    });

    expect(rect.AABBBounds.x1).toEqual(100);
    expect(rect.AABBBounds.y1).toEqual(100);
    expect(rect.AABBBounds.x2).toEqual(100);
    expect(rect.AABBBounds.y2).toEqual(100);

    rect = createRect({
      y: 100,
      visible: true
    });

    expect(rect.AABBBounds.x1).toEqual(0);
    expect(rect.AABBBounds.y1).toEqual(100);
    expect(rect.AABBBounds.x2).toEqual(0);
    expect(rect.AABBBounds.y2).toEqual(100);

    rect = createRect({
      y: 100,
      x: NaN,
      visible: true
    });

    expect(rect.AABBBounds.x1).toEqual(Number.MAX_VALUE);
    expect(rect.AABBBounds.y1).toEqual(Number.MAX_VALUE);
    expect(rect.AABBBounds.x2).toEqual(-Number.MAX_VALUE);
    expect(rect.AABBBounds.y2).toEqual(-Number.MAX_VALUE);

    rect = createRect({
      y: 100,
      x: 100,
      stroke: 'green',
      lineWidth: 10
    });

    expect(rect.AABBBounds.x1).toEqual(95);
    expect(rect.AABBBounds.y1).toEqual(95);
    expect(rect.AABBBounds.x2).toEqual(105);
    expect(rect.AABBBounds.y2).toEqual(105);

    rect = createRect({
      y: 100,
      x: 100,
      stroke: 'green',
      lineWidth: 10,
      outerBorder: {
        distance: 10,
        lineWidth: 6,
        stroke: 'green'
      },
      innerBorder: {
        distance: 10,
        lineWidth: 2,
        stroke: 'white'
      }
    });

    expect(rect.AABBBounds.x1).toEqual(87);
    expect(rect.AABBBounds.y1).toEqual(87);
    expect(rect.AABBBounds.x2).toEqual(113);
    expect(rect.AABBBounds.y2).toEqual(113);

    rect = createRect({ fill: 'red' });
    expect(rect.AABBBounds.empty()).toEqual(true);

    // arc
    const arc = createArc({
      x: 0,
      y: 0,
      innerRadius: 10,
      outerRadius: 30,
      fill: 'red',
      startAngle: 0,
      endAngle: Math.PI / 3
    });

    expect(arc.AABBBounds.x1).toBeCloseTo(5);
    expect(arc.AABBBounds.y1).toBeCloseTo(0);
    expect(arc.AABBBounds.x2).toBeCloseTo(30);
    expect(arc.AABBBounds.y2).toBeCloseTo(25.98);

    // area
    const area = createArea({
      x: 100,
      y: 100,
      points: [
        { x: 10, y: 20, x1: null, y1: 100 },
        { x: 20, y: 70, x1: null, y1: 100 },
        { x: 30, y: 60, x1: null, y1: 100 },
        { x: 40, y: 10, x1: null, y1: 100 },
        { x: 50, y: 30, x1: null, y1: 100 },
        { x: 60, y: 90, x1: null, y1: 100 }
      ],
      fill: 'red'
    });

    expect(area.AABBBounds.x1).toBeCloseTo(110);
    expect(area.AABBBounds.y1).toBeCloseTo(110);
    expect(area.AABBBounds.x2).toBeCloseTo(160);
    expect(area.AABBBounds.y2).toBeCloseTo(200);

    // circle
    const circle = createCircle({
      x: 0,
      y: 0,
      radius: 30,
      fill: 'red',
      startAngle: 0,
      endAngle: Math.PI / 3
    });

    expect(circle.AABBBounds.x1).toBeCloseTo(15);
    expect(circle.AABBBounds.y1).toBeCloseTo(0);
    expect(circle.AABBBounds.x2).toBeCloseTo(30);
    expect(circle.AABBBounds.y2).toBeCloseTo(25.98);

    // glyph
    const g = createGlyph({
      x: 300,
      y: 100,
      stroke: 'green',

      lineWidth: 10
    });

    const subGraphic = [];

    subGraphic.push(
      createRect({
        width: 100,
        height: 100,
        fill: 'pink'
      })
    );

    const symbol = createSymbol({
      dx: 50,
      dy: 50,
      symbolType: 'star',
      fill: 'green',
      stroke: true
    });
    subGraphic.push(symbol);
    g.setSubGraphic(subGraphic);

    expect(g.AABBBounds.x1).toEqual(295);
    expect(g.AABBBounds.y1).toEqual(95);
    expect(g.AABBBounds.x2).toEqual(405);
    expect(g.AABBBounds.y2).toEqual(205);

    let text = createText({
      x: 100,
      y: 100,
      fontFamily: 'Arial',
      text: 'aaa这是aaa',
      fill: 'red'
    });

    expect(text.AABBBounds.x1).toBeCloseTo(100);
    expect(text.AABBBounds.y1).toBeCloseTo(85.50588235294117);
    expect(text.AABBBounds.x2).toBeCloseTo(185.390625);
    expect(text.AABBBounds.y2).toBeCloseTo(103.10588235294118);

    text = createText({
      x: 100,
      y: 100,
      fontFamily: 'Arial',
      text: ['aaa这是aaa', 'aa这是aa'],
      fontSize: 16,
      fill: 'red'
    });

    expect(text.AABBBounds.x1).toBeCloseTo(100);
    expect(text.AABBBounds.y1).toBeCloseTo(72.192);
    expect(text.AABBBounds.x2).toBeCloseTo(185.390625);
    expect(text.AABBBounds.y2).toBeCloseTo(107.392);
  });

  it('arc bounds', () => {
    const arc = createArc({
      innerRadius: 60,
      outerRadius: 137.8,
      startAngle: 5.2,
      endAngle: 2.2,
      x: 100,
      y: 200,
      lineWidth: 2,
      stroke: true
    });

    expect(arc.AABBBounds.x1).toBeCloseTo(-40.80000000000001);
    expect(arc.AABBBounds.y1).toBeCloseTo(59.19999999999999);
    expect(arc.AABBBounds.x2).toBeCloseTo(167.56159730519198);
    expect(arc.AABBBounds.y2).toBeCloseTo(314.4108044463395);
  });
});
