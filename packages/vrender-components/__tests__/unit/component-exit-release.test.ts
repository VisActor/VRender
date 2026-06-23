import { createRect, type IGraphic, type IGroup, type Stage } from '@visactor/vrender-core';
import { ManualTicker, registerAnimate } from '@visactor/vrender-animate';
import { createBrowserVRenderApp } from '../../../vrender/src/entries';
import { LineAxis } from '../../src/axis';
import { DataLabel } from '../../src/label';
import { RectLabel } from '../../src/label/rect';
import { createCanvas, removeDom } from '../util/dom';

type TraversableGraphic = IGraphic & {
  parent?: IGroup | null;
  stage?: Stage | null;
  attribute: Record<string, any>;
  forEachChildren?: (cb: (child: TraversableGraphic) => void | boolean) => void;
};

const EXIT_DURATION = 300;

let runtimeRegistered = false;

function ensureRuntime() {
  if (runtimeRegistered) {
    return;
  }
  registerAnimate();
  runtimeRegistered = true;
}

function createStageHarness(id: string) {
  ensureRuntime();

  const canvas = createCanvas(document.body, id);
  const ticker = new ManualTicker();
  (ticker as any).setupTickHandler();
  ticker.autoStop = false;

  const app = createBrowserVRenderApp();
  const stage = app.createStage({
    canvas: id,
    width: 500,
    height: 300,
    autoRender: true,
    ticker
  }) as Stage;

  return {
    app,
    canvas,
    stage,
    ticker
  };
}

function releaseStageHarness(harness: ReturnType<typeof createStageHarness>) {
  harness.stage.release();
  harness.app.release();
  removeDom(harness.canvas);
}

function collectGraphics(root: TraversableGraphic) {
  const graphics: TraversableGraphic[] = [];
  const visit = (graphic: TraversableGraphic) => {
    graphics.push(graphic);
    graphic.forEachChildren?.((child: TraversableGraphic) => {
      visit(child);
    });
  };

  visit(root);
  return graphics;
}

function getTrackedChildren(component: IGraphic) {
  const trackedGraphics = collectGraphics(component as unknown as TraversableGraphic).filter(
    graphic => graphic !== (component as unknown as TraversableGraphic)
  );

  expect(trackedGraphics.length).toBeGreaterThan(0);
  return trackedGraphics;
}

function isAttached(graphic: TraversableGraphic) {
  return Boolean(graphic.parent || graphic.stage);
}

function hasIntermediateOpacity(graphic: TraversableGraphic) {
  const { opacity, fillOpacity, strokeOpacity } = graphic.attribute ?? {};
  return [opacity, fillOpacity, strokeOpacity].some(value => typeof value === 'number' && value > 0 && value < 1);
}

function getTrackedAnimateCount(graphic: TraversableGraphic) {
  let count = 0;
  const visit = (node: TraversableGraphic) => {
    const trackedAnimates = (node as any).getTrackedAnimates?.() ?? (node as any).animates;
    count += trackedAnimates?.size ?? 0;
    node.forEachChildren?.((child: TraversableGraphic) => {
      visit(child);
    });
  };

  visit(graphic);
  return count;
}

function expectComponentExitFade(component: IGraphic, ticker: ManualTicker, trackedGraphics: TraversableGraphic[]) {
  expect((component as any).releaseWithExitAnimation({ removeFromParent: true })).toBe(true);

  ticker.tick(EXIT_DURATION / 2);
  expect(trackedGraphics.some(isAttached)).toBe(true);
  expect(trackedGraphics.some(graphic => isAttached(graphic) && hasIntermediateOpacity(graphic))).toBe(true);

  ticker.tick(EXIT_DURATION / 2 + 16);
  expect(component.parent).toBeNull();
  expect((component as any).releaseStatus).toBe('released');
  expect((component as IGroup).childrenCount).toBe(0);
  expect(trackedGraphics.some(isAttached)).toBe(false);
  expect(getTrackedAnimateCount(component as unknown as TraversableGraphic)).toBe(0);
  trackedGraphics.forEach(graphic => {
    expect(getTrackedAnimateCount(graphic)).toBe(0);
  });
}

function forceReleaseDuringPendingExit(component: IGraphic, trackedGraphics: TraversableGraphic[]) {
  const onComplete = jest.fn();
  const onSecondComplete = jest.fn();

  expect((component as any).releaseWithExitAnimation({ removeFromParent: true, onComplete })).toBe(true);
  expect((component as any).releaseWithExitAnimation({ removeFromParent: true, onComplete: onSecondComplete })).toBe(
    true
  );

  component.release(true);

  expect(onComplete).toHaveBeenCalledTimes(1);
  expect(onSecondComplete).toHaveBeenCalledTimes(1);
  expect(component.parent).toBeNull();
  expect((component as IGroup).childrenCount).toBe(0);
  expect((component as any).releaseStatus).toBe('released');
  expect(trackedGraphics.some(isAttached)).toBe(false);
  expect(getTrackedAnimateCount(component as unknown as TraversableGraphic)).toBe(0);
  trackedGraphics.forEach(graphic => {
    expect(getTrackedAnimateCount(graphic)).toBe(0);
  });
}

function createRectLabel(baseMark: IGraphic) {
  return new RectLabel({
    type: 'rect',
    data: [{ id: 'label-a', text: 'A' }],
    getBaseMarks: () => [baseMark],
    position: 'top',
    overlap: false,
    smartInvert: false,
    animation: true,
    animationEnter: false,
    animationUpdate: false,
    animationExit: {
      duration: EXIT_DURATION,
      easing: 'linear'
    },
    textStyle: {
      fill: '#000',
      fontSize: 12
    }
  } as any);
}

function createDataLabel(baseMark: IGraphic) {
  return new DataLabel({
    size: {
      width: 500,
      height: 300
    },
    dataLabels: [
      {
        type: 'rect',
        data: [{ id: 'label-a', text: 'A' }],
        getBaseMarks: () => [baseMark],
        position: 'top',
        overlap: false,
        smartInvert: false,
        animation: true,
        animationEnter: false,
        animationUpdate: false,
        animationExit: {
          duration: EXIT_DURATION,
          easing: 'linear'
        },
        textStyle: {
          fill: '#000',
          fontSize: 12
        }
      }
    ]
  } as any);
}

function createLineAxis() {
  return new LineAxis({
    start: { x: 40, y: 180 },
    end: { x: 460, y: 180 },
    items: [
      [
        { id: 'a', label: 'A', value: 0, rawValue: 'A' },
        { id: 'b', label: 'B', value: 0.5, rawValue: 'B' },
        { id: 'c', label: 'C', value: 1, rawValue: 'C' }
      ]
    ],
    line: {
      visible: true,
      style: {
        stroke: '#000'
      }
    },
    tick: {
      visible: true,
      length: 6,
      style: {
        stroke: '#000'
      }
    },
    subTick: {
      visible: false
    },
    label: {
      visible: true,
      space: 4,
      style: {
        fill: '#000',
        fontSize: 12
      }
    },
    title: {
      visible: false
    },
    animation: true,
    animationEnter: false,
    animationUpdate: false,
    animationExit: {
      duration: EXIT_DURATION,
      easing: 'linear'
    }
  } as any);
}

describe('P0 component exit release lifecycle', () => {
  test('keeps label graphics attached during release exit fade and removes them after completion', () => {
    const harness = createStageHarness('component-exit-label');
    const rect = createRect({
      x: 120,
      y: 120,
      width: 80,
      height: 40,
      fill: '#6699ff'
    });
    const label = createRectLabel(rect);

    harness.stage.defaultLayer.add(rect);
    harness.stage.defaultLayer.add(label as unknown as IGraphic);
    harness.stage.render();
    harness.ticker.tick(16);

    const trackedGraphics = getTrackedChildren(label as unknown as IGraphic);

    try {
      expectComponentExitFade(label as unknown as IGraphic, harness.ticker, trackedGraphics);
    } finally {
      releaseStageHarness(harness);
    }
  });

  test('keeps DataLabel wrapper graphics attached during release exit fade and removes them after completion', () => {
    const harness = createStageHarness('component-exit-data-label');
    const rect = createRect({
      x: 120,
      y: 120,
      width: 80,
      height: 40,
      fill: '#6699ff'
    });
    const dataLabel = createDataLabel(rect);

    harness.stage.defaultLayer.add(rect);
    harness.stage.defaultLayer.add(dataLabel as unknown as IGraphic);
    harness.stage.render();
    harness.ticker.tick(16);

    const trackedGraphics = getTrackedChildren(dataLabel as unknown as IGraphic);

    try {
      expectComponentExitFade(dataLabel as unknown as IGraphic, harness.ticker, trackedGraphics);
    } finally {
      releaseStageHarness(harness);
    }
  });

  test('keeps axis graphics attached during release exit fade and removes them after completion', () => {
    const harness = createStageHarness('component-exit-axis');
    const axis = createLineAxis();

    harness.stage.defaultLayer.add(axis as unknown as IGraphic);
    harness.stage.render();
    harness.ticker.tick(16);

    const trackedGraphics = getTrackedChildren(axis as unknown as IGraphic);

    try {
      expectComponentExitFade(axis as unknown as IGraphic, harness.ticker, trackedGraphics);
    } finally {
      releaseStageHarness(harness);
    }
  });

  test('returns false for disabled label, DataLabel and axis exit animation so callers can clean synchronously', () => {
    const harness = createStageHarness('component-exit-disabled');
    const rect = createRect({
      x: 120,
      y: 120,
      width: 80,
      height: 40,
      fill: '#6699ff'
    });
    const label = createRectLabel(rect);
    const dataLabel = createDataLabel(rect);
    const axis = createLineAxis();

    (label.attribute as any).animationExit = false;
    (dataLabel.attribute as any).dataLabels[0].animationExit = false;
    (axis.attribute as any).animationExit = false;

    harness.stage.defaultLayer.add(rect);
    harness.stage.defaultLayer.add(label as unknown as IGraphic);
    harness.stage.defaultLayer.add(dataLabel as unknown as IGraphic);
    harness.stage.defaultLayer.add(axis as unknown as IGraphic);
    harness.stage.render();
    harness.ticker.tick(16);

    try {
      expect((label as any).releaseWithExitAnimation({ removeFromParent: true })).toBe(false);
      expect((dataLabel as any).releaseWithExitAnimation({ removeFromParent: true })).toBe(false);
      expect((axis as any).releaseWithExitAnimation({ removeFromParent: true })).toBe(false);

      label.release(true);
      dataLabel.release(true);
      (axis as any).release(true);
      harness.stage.defaultLayer.removeChild(label as unknown as IGraphic);
      harness.stage.defaultLayer.removeChild(dataLabel as unknown as IGraphic);
      harness.stage.defaultLayer.removeChild(axis as unknown as IGraphic);

      expect(label.parent).toBeNull();
      expect(dataLabel.parent).toBeNull();
      expect(axis.parent).toBeNull();
      expect(label.childrenCount).toBe(0);
      expect(dataLabel.childrenCount).toBe(0);
      expect(axis.childrenCount).toBe(0);
      expect((label as any).releaseStatus).toBe('released');
      expect((dataLabel as any).releaseStatus).toBe('released');
      expect((axis as any).releaseStatus).toBe('released');
    } finally {
      releaseStageHarness(harness);
    }
  });

  test('force release during pending label exit finalizes once without leaving attached children', () => {
    const harness = createStageHarness('component-exit-label-force-release');
    const rect = createRect({
      x: 120,
      y: 120,
      width: 80,
      height: 40,
      fill: '#6699ff'
    });
    const label = createRectLabel(rect);

    harness.stage.defaultLayer.add(rect);
    harness.stage.defaultLayer.add(label as unknown as IGraphic);
    harness.stage.render();
    harness.ticker.tick(16);

    const trackedGraphics = getTrackedChildren(label as unknown as IGraphic);

    try {
      forceReleaseDuringPendingExit(label as unknown as IGraphic, trackedGraphics);
    } finally {
      releaseStageHarness(harness);
    }
  });

  test('force release during pending DataLabel exit finalizes once without leaving attached children', () => {
    const harness = createStageHarness('component-exit-data-label-force-release');
    const rect = createRect({
      x: 120,
      y: 120,
      width: 80,
      height: 40,
      fill: '#6699ff'
    });
    const dataLabel = createDataLabel(rect);

    harness.stage.defaultLayer.add(rect);
    harness.stage.defaultLayer.add(dataLabel as unknown as IGraphic);
    harness.stage.render();
    harness.ticker.tick(16);

    const trackedGraphics = getTrackedChildren(dataLabel as unknown as IGraphic);

    try {
      forceReleaseDuringPendingExit(dataLabel as unknown as IGraphic, trackedGraphics);
    } finally {
      releaseStageHarness(harness);
    }
  });

  test('force release during pending axis exit finalizes once without leaving attached children', () => {
    const harness = createStageHarness('component-exit-axis-force-release');
    const axis = createLineAxis();

    harness.stage.defaultLayer.add(axis as unknown as IGraphic);
    harness.stage.render();
    harness.ticker.tick(16);

    const trackedGraphics = getTrackedChildren(axis as unknown as IGraphic);

    try {
      forceReleaseDuringPendingExit(axis as unknown as IGraphic, trackedGraphics);
    } finally {
      releaseStageHarness(harness);
    }
  });
});
