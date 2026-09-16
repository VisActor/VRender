import {
  EventManager,
  FederatedPointerEvent,
  type CustomEvent,
  type IEventTarget,
  type IPolygon,
  type Stage
} from '@visactor/vrender-core';
import { Brush } from '../../src';
import type { BrushAttributes } from '../../src/brush/type';
import { createCanvas, removeDom } from '../util/dom';
import { createTestStage } from '../util/vrender';

describe('Brush initial mask', () => {
  let canvas: HTMLCanvasElement;
  let stage: Stage;
  let manager: EventManager;

  beforeEach(() => {
    canvas = createCanvas(document.body, 'brush-initial-mask');
    stage = createTestStage('brush-initial-mask');
    manager = new EventManager(stage as unknown as IEventTarget, {});
    // 隔离 jsdom 的 DOM 尺寸，不 mock Brush 几何或 pointer 事件处理。
    jest.spyOn(stage, 'eventPointTransform').mockImplementation(event => {
      const pointer = event as PointerEvent;
      return { x: pointer.clientX, y: pointer.clientY };
    });
  });

  afterEach(() => {
    manager.release();
    stage.release();
    removeDom(canvas);
    jest.restoreAllMocks();
  });

  function pointer(type: string, x: number, y: number) {
    const event = new FederatedPointerEvent(manager);
    event.type = type;
    event.pointerId = 1;
    event.pointerType = 'mouse';
    event.button = 0;
    event.buttons = type === 'pointerup' ? 0 : 1;
    event.client.x = x;
    event.client.y = y;
    stage.dispatchEvent(event);
  }

  function setup(attributes: Partial<BrushAttributes> = {}) {
    const brush = new Brush({
      brushType: 'rect',
      delayTime: 0,
      interactiveRange: { minX: 0, maxX: 200, minY: 0, maxY: 200 },
      xRange: [10, 150],
      yRange: [15, 140],
      ...attributes
    });
    let mask: IPolygon;
    const events: string[] = [];
    brush.addEventListener('drawStart', (event: CustomEvent) => {
      mask = event.detail.operateMask;
    });
    ['drawStart', 'brushActive', 'drawing', 'drawEnd'].forEach(type => {
      brush.addEventListener(type, () => events.push(type));
    });
    stage.defaultLayer.add(brush as any);
    stage.render();
    return { getMask: () => mask, events };
  }

  test.each([
    [
      'rect',
      [20, 30],
      [80, 100],
      [
        [20, 30],
        [80, 30],
        [80, 100],
        [20, 100]
      ]
    ],
    [
      'rect',
      [80, 100],
      [20, 30],
      [
        [80, 100],
        [20, 100],
        [20, 30],
        [80, 30]
      ]
    ],
    [
      'x',
      [20, 30],
      [80, 100],
      [
        [20, 15],
        [80, 15],
        [80, 140],
        [20, 140]
      ]
    ],
    [
      'x',
      [80, 100],
      [20, 30],
      [
        [80, 15],
        [20, 15],
        [20, 140],
        [80, 140]
      ]
    ],
    [
      'y',
      [20, 30],
      [80, 100],
      [
        [10, 30],
        [10, 100],
        [150, 100],
        [150, 30]
      ]
    ],
    [
      'y',
      [80, 100],
      [20, 30],
      [
        [10, 100],
        [10, 30],
        [150, 30],
        [150, 100]
      ]
    ]
  ] as [NonNullable<BrushAttributes['brushType']>, number[], number[], number[][]][])(
    '%s has the correct mask after exactly one pointermove (%j -> %j)',
    (brushType, start, end, expected) => {
      const { getMask, events } = setup({ brushType });
      pointer('pointerdown', start[0], start[1]);
      pointer('pointermove', end[0], end[1]);
      stage.render();
      expect(getMask().attribute.points).toEqual(expected.map(([x, y]) => ({ x, y })));
      expect(events).toEqual(['drawStart']);
      // 没有第二次移动就松手：结束时不能遗留两点遮罩。
      pointer('pointerup', end[0], end[1]);
      expect(getMask().attribute.points).toEqual(expected.map(([x, y]) => ({ x, y })));
      expect(events).toEqual(['drawStart', 'drawEnd']);
    }
  );

  test('keeps the polygon trajectory and its previous points snapshot', () => {
    const { getMask } = setup({ brushType: 'polygon' });
    pointer('pointerdown', 20, 30);
    pointer('pointermove', 80, 100);
    const initialPoints = getMask().attribute.points;
    expect(initialPoints).toEqual([
      { x: 20, y: 30 },
      { x: 80, y: 100 }
    ]);
    pointer('pointermove', 110, 60);
    expect(initialPoints).toEqual([
      { x: 20, y: 30 },
      { x: 80, y: 100 }
    ]);
    expect(getMask().attribute.points).toEqual([
      { x: 20, y: 30 },
      { x: 80, y: 100 },
      { x: 110, y: 60 }
    ]);
    pointer('pointerup', 110, 60);
  });

  test('preserves the draw event sequence and subsequent rectangle updates', () => {
    const { getMask, events } = setup();
    pointer('pointerdown', 20, 30);
    pointer('pointermove', 80, 100);
    expect(events).toEqual(['drawStart']);
    pointer('pointermove', 100, 110);
    expect(events).toEqual(['drawStart', 'brushActive']);
    pointer('pointermove', 120, 130);
    pointer('pointerup', 120, 130);
    expect(events).toEqual(['drawStart', 'brushActive', 'drawing', 'drawEnd']);
    expect(getMask().attribute.points).toEqual([
      { x: 20, y: 30 },
      { x: 120, y: 30 },
      { x: 120, y: 130 },
      { x: 20, y: 130 }
    ]);
  });
});
