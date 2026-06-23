import type { IGraphic, IGroup, Stage } from '@visactor/vrender-core';
import { ManualTicker, registerAnimate } from '@visactor/vrender-animate';
import { createBrowserVRenderApp } from '../../../../vrender/src/entries';
import {
  MarkArea,
  MarkLine,
  MarkPoint,
  registerMarkAreaAnimate,
  registerMarkLineAnimate,
  registerMarkPointAnimate
} from '../../../src/marker';
import { createCanvas, removeDom } from '../../util/dom';

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
  registerMarkAreaAnimate();
  registerMarkLineAnimate();
  registerMarkPointAnimate();
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

function isAttached(graphic: TraversableGraphic) {
  return Boolean(graphic.parent || graphic.stage);
}

function hasIntermediateOpacity(graphic: TraversableGraphic) {
  const { fillOpacity, strokeOpacity } = graphic.attribute ?? {};
  return (
    (typeof fillOpacity === 'number' && fillOpacity > 0 && fillOpacity < 1) ||
    (typeof strokeOpacity === 'number' && strokeOpacity > 0 && strokeOpacity < 1)
  );
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

function expectMarkerExitFade(
  marker: IGraphic,
  ticker: ManualTicker,
  trackedGraphics: TraversableGraphic[],
  options: { expectReleased: boolean }
) {
  expect((marker as any).releaseWithExitAnimation({ removeFromParent: options.expectReleased })).toBe(true);

  ticker.tick(EXIT_DURATION / 2);
  expect(trackedGraphics.some(isAttached)).toBe(true);
  expect(trackedGraphics.some(graphic => isAttached(graphic) && hasIntermediateOpacity(graphic))).toBe(true);

  ticker.tick(EXIT_DURATION / 2 + 16);
  if (options.expectReleased) {
    expect(marker.parent).toBeNull();
    expect((marker as any).releaseStatus).toBe('released');
    expect(trackedGraphics.some(isAttached)).toBe(false);
  } else {
    expect(marker.parent).toBeTruthy();
    expect((marker as any).releaseStatus).not.toBe('released');
  }
  expect((marker as IGroup).childrenCount).toBe(0);
  expect(getTrackedAnimateCount(marker as unknown as TraversableGraphic)).toBe(0);
  trackedGraphics.forEach(graphic => {
    expect(getTrackedAnimateCount(graphic)).toBe(0);
  });
}

function createMarkPoint() {
  return new MarkPoint({
    position: {
      x: 100,
      y: 150
    },
    animation: {
      type: 'callIn',
      duration: 100,
      easing: 'linear'
    },
    animationExit: {
      type: 'fadeOut',
      duration: EXIT_DURATION,
      easing: 'linear'
    },
    itemContent: {
      type: 'text',
      offsetX: 80,
      offsetY: 30,
      style: {
        text: 'exit marker',
        textStyle: {
          fill: '#E8346D'
        }
      }
    },
    itemLine: {
      type: 'type-do',
      line: {
        style: {
          stroke: '#E8346D'
        }
      }
    }
  } as any);
}

function createMarkLine() {
  return new MarkLine({
    points: [
      { x: 100, y: 80 },
      { x: 380, y: 80 }
    ],
    animation: {
      duration: 100,
      easing: 'linear'
    },
    animationExit: {
      type: 'fadeOut',
      duration: EXIT_DURATION,
      easing: 'linear'
    },
    label: {
      text: 'exit line',
      refX: 10
    },
    endSymbol: {
      visible: true
    }
  } as any);
}

function createMarkArea() {
  return new MarkArea({
    points: [
      { x: 100, y: 80 },
      { x: 380, y: 80 },
      { x: 380, y: 180 },
      { x: 100, y: 180 }
    ],
    animation: {
      duration: 100,
      easing: 'linear'
    },
    animationExit: {
      type: 'fadeOut',
      duration: EXIT_DURATION,
      easing: 'linear'
    },
    areaStyle: {
      fill: '#66A3FE',
      fillOpacity: 0.8
    },
    label: {
      text: 'exit area'
    }
  } as any);
}

function getTrackedChildren(marker: IGraphic) {
  const trackedGraphics = collectGraphics(marker as unknown as TraversableGraphic).filter(
    graphic => graphic !== (marker as unknown as TraversableGraphic)
  );

  expect(trackedGraphics.length).toBeGreaterThan(0);
  return trackedGraphics;
}

describe('marker exit animation lifecycle', () => {
  test.each([
    ['markPoint', createMarkPoint],
    ['markLine', createMarkLine],
    ['markArea', createMarkArea]
  ] as const)(
    'keeps %s children attached during release exit fade and removes them after completion',
    (_name, createMarker) => {
      const harness = createStageHarness(`marker-exit-release-${_name}`);
      const marker = createMarker();

      harness.stage.defaultLayer.add(marker as unknown as IGraphic);
      harness.stage.render();
      harness.ticker.tick(120);

      const trackedGraphics = getTrackedChildren(marker as unknown as IGraphic);

      try {
        expectMarkerExitFade(marker as unknown as IGraphic, harness.ticker, trackedGraphics, {
          expectReleased: true
        });
      } finally {
        releaseStageHarness(harness);
      }
    }
  );

  test('returns false for animationExit false so callers can use synchronous cleanup', () => {
    const harness = createStageHarness('marker-exit-disabled');
    const markPoint = createMarkPoint();
    (markPoint.attribute as any).animationExit = false;

    harness.stage.defaultLayer.add(markPoint as unknown as IGraphic);
    harness.stage.render();
    harness.ticker.tick(120);

    try {
      expect((markPoint as any).releaseWithExitAnimation({ removeFromParent: true })).toBe(false);
      markPoint.release(true);
      harness.stage.defaultLayer.removeChild(markPoint as unknown as IGraphic);

      expect(markPoint.parent).toBeNull();
      expect(markPoint.childrenCount).toBe(0);
      expect((markPoint as any).releaseStatus).toBe('released');
      expect(getTrackedAnimateCount(markPoint as unknown as TraversableGraphic)).toBe(0);
    } finally {
      releaseStageHarness(harness);
    }
  });

  test('keeps invalid marker children attached during exit fade and clears only the marker content after completion', () => {
    const harness = createStageHarness('marker-exit-invalid');
    const markArea = createMarkArea();

    harness.stage.defaultLayer.add(markArea as unknown as IGraphic);
    harness.stage.render();
    harness.ticker.tick(120);

    const trackedGraphics = getTrackedChildren(markArea as unknown as IGraphic);

    try {
      markArea.setAttributes({
        points: []
      } as any);

      harness.ticker.tick(EXIT_DURATION / 2);
      expect(trackedGraphics.some(isAttached)).toBe(true);
      expect(trackedGraphics.some(graphic => isAttached(graphic) && hasIntermediateOpacity(graphic))).toBe(true);

      harness.ticker.tick(EXIT_DURATION / 2 + 16);
      expect(markArea.parent).toBeTruthy();
      expect(markArea.childrenCount).toBe(0);
      expect((markArea as any).releaseStatus).not.toBe('released');
      expect(trackedGraphics.some(isAttached)).toBe(false);
      expect(getTrackedAnimateCount(markArea as unknown as TraversableGraphic)).toBe(0);
      trackedGraphics.forEach(graphic => {
        expect(getTrackedAnimateCount(graphic)).toBe(0);
      });
    } finally {
      releaseStageHarness(harness);
    }
  });

  test('force release during pending exit finalizes once without leaving attached children', () => {
    const harness = createStageHarness('marker-exit-force-release');
    const markPoint = createMarkPoint();
    const onComplete = jest.fn();
    const onSecondComplete = jest.fn();

    harness.stage.defaultLayer.add(markPoint as unknown as IGraphic);
    harness.stage.render();
    harness.ticker.tick(120);

    const trackedGraphics = getTrackedChildren(markPoint as unknown as IGraphic);

    try {
      expect((markPoint as any).releaseWithExitAnimation({ removeFromParent: true, onComplete })).toBe(true);
      expect(
        (markPoint as any).releaseWithExitAnimation({ removeFromParent: true, onComplete: onSecondComplete })
      ).toBe(true);

      markPoint.release(true);

      expect(onComplete).toHaveBeenCalledTimes(1);
      expect(onSecondComplete).toHaveBeenCalledTimes(1);
      expect(markPoint.parent).toBeNull();
      expect(markPoint.childrenCount).toBe(0);
      expect((markPoint as any).releaseStatus).toBe('released');
      expect(trackedGraphics.some(isAttached)).toBe(false);
      expect(getTrackedAnimateCount(markPoint as unknown as TraversableGraphic)).toBe(0);
      trackedGraphics.forEach(graphic => {
        expect(getTrackedAnimateCount(graphic)).toBe(0);
      });
    } finally {
      releaseStageHarness(harness);
    }
  });
});
