import { application, createLine, createRect, createText } from '@visactor/vrender-core';
import { DefaultTimeline, ManualTicker, registerAnimate } from '@visactor/vrender-animate';
import { AABBBounds } from '@visactor/vutils';
import { LabelBase } from '../../src/label/base';
import { RectLabel } from '../../src/label/rect';
import type { LabelContent } from '../../src/label/type';
import { commitUpdateAnimationTarget } from '../../src/animation/static-truth';

class TestLabel extends LabelBase<any> {
  protected render(): void {
    return;
  }

  runUpdate(prevLabel: LabelContent, currentLabel: LabelContent, mark?: ReturnType<typeof createRect>): void {
    this._updateLabel(prevLabel, currentLabel, mark);
  }
}

class TestRectLabel extends RectLabel {
  protected getGraphicBounds(graphic?: any, point: any = {}, position?: string): any {
    if (graphic?.type === 'text') {
      const { x = 0, y = 0 } = graphic.attribute;
      return {
        x1: x,
        y1: y,
        x2: x + 20,
        y2: y + 10
      };
    }

    if (graphic) {
      return super.getGraphicBounds(graphic, point, position);
    }

    const { x = 0, y = 0, x1 = x, y1 = y } = point;
    return { x1, y1, x2: x1, y2: y1 };
  }
}

let runtimeRegistered = false;

function ensureRuntime() {
  if (runtimeRegistered) {
    return;
  }
  registerAnimate();
  runtimeRegistered = true;
}

function createGraphicServiceStub() {
  return {
    onAttributeUpdate: jest.fn(),
    onSetStage: jest.fn(),
    onRemove: jest.fn(),
    onAddIncremental: jest.fn(),
    onClearIncremental: jest.fn(),
    beforeUpdateAABBBounds: jest.fn(),
    afterUpdateAABBBounds: jest.fn(),
    clearAABBBounds: jest.fn(),
    updateTempAABBBounds: jest.fn((aabbBounds: any) => ({
      tb1: aabbBounds,
      tb2: aabbBounds
    })),
    transformAABBBounds: jest.fn((attribute: any, aabbBounds: any) => {
      aabbBounds.translate(attribute.x ?? 0, attribute.y ?? 0);
    }),
    validCheck: jest.fn(() => true)
  };
}

function createStageHarness(label: string) {
  ensureRuntime();

  const timeline = new DefaultTimeline();
  const ticker = new ManualTicker();
  (ticker as any).setupTickHandler();
  ticker.autoStop = false;
  ticker.addTimeline(timeline);

  const graphicService = createGraphicServiceStub();
  const stage: any = {
    stage: null,
    name: label,
    params: { optimize: { tickRenderMode: 'effect' } },
    ticker,
    graphicService,
    renderNextFrame: jest.fn(),
    getTimeline: () => timeline
  };
  stage.stage = stage;
  application.graphicService = graphicService as any;

  return {
    stage,
    ticker
  };
}

function tick(ticker: ManualTicker, delta: number) {
  ticker.tick(delta);
}

function createMovingMarkCase(
  markFirst: boolean,
  finalContext: boolean,
  harness = createStageHarness('moving-mark-line')
) {
  const { stage, ticker } = harness;
  const label = new TestLabel({
    type: 'rect',
    baseMarkGroupName: 'bar',
    data: [],
    animation: true,
    animationEnter: false,
    animationExit: false,
    animationUpdate: { duration: 300, easing: 'linear' }
  });
  label._prepareAnimate({});
  label.setStage(stage, null as any);
  const text = createText({ x: 40, y: 0, text: 'Label' });
  label.add(text);
  jest
    .spyOn(text, 'AABBBounds', 'get')
    .mockImplementation(() => new AABBBounds().set(text.attribute.x, 0, text.attribute.x + 20, 10));
  const mark = createRect({ x: 35, y: 0, width: 10, height: 10 });
  mark.setStage(stage, null as any);
  const finalAttrs = { ...mark.attribute, x: 75 };
  if (finalContext) {
    mark.context = { animationState: 'update', finalAttrs };
  }
  commitUpdateAnimationTarget(mark, finalAttrs);
  const line = createLine({
    points: [
      { x: 100, y: 5 },
      { x: 85, y: 5 }
    ]
  });
  const content: LabelContent = { text };
  const animateMark = () => mark.animate().to({ x: 75 }, 300, 'linear');
  if (markFirst) {
    animateMark();
  }
  label.runUpdate(content, { text: createText({ x: 100, y: 0, text: 'Label' }), labelLine: line }, mark);
  if (!markFirst) {
    animateMark();
  }
  return { stage, ticker, label, text, mark, line, content };
}

describe('Label update animation static truth', () => {
  let originalGraphicService: typeof application.graphicService;

  beforeEach(() => {
    originalGraphicService = application.graphicService;
  });

  afterEach(() => {
    application.graphicService = originalGraphicService;
    jest.restoreAllMocks();
  });

  test('keeps updated text position and style after LabelBase update animation ends', () => {
    const { stage, ticker } = createStageHarness('label-update-static-truth');
    const oldAttrs = {
      x: 170.3125,
      y: 40,
      text: '10',
      fontSize: 12,
      opacity: 1,
      visible: true
    };
    const newAttrs = {
      ...oldAttrs,
      x: 182.4777,
      y: 56,
      text: '20',
      opacity: 0.8
    };
    const prevText = createText({ ...oldAttrs });
    const curText = createText({ ...newAttrs });
    const label = new TestLabel({ data: [], animation: true } as any);

    prevText.setStage(stage, null as any);
    (prevText as any).setFinalAttributes({ ...oldAttrs });
    (label as any)._enableAnimation = true;
    (label as any)._animationConfig = {
      enter: false,
      exit: false,
      update: {
        duration: 300,
        easing: 'linear'
      }
    };

    label.runUpdate({ text: prevText }, { text: curText });

    tick(ticker, 150);
    expect(prevText.attribute.x).toBeGreaterThan(oldAttrs.x);
    expect(prevText.attribute.x).toBeLessThan(newAttrs.x);
    expect(prevText.attribute.y).toBeGreaterThan(oldAttrs.y);
    expect(prevText.attribute.y).toBeLessThan(newAttrs.y);

    tick(ticker, 150);
    expect(prevText.attribute.x).toBeCloseTo(newAttrs.x, 5);
    expect(prevText.attribute.y).toBeCloseTo(newAttrs.y, 5);
    expect(prevText.attribute.text).toBe(newAttrs.text);
    expect(prevText.attribute.opacity).toBeCloseTo(newAttrs.opacity, 5);
    expect((prevText as any).baseAttributes.x).toBeCloseTo(newAttrs.x, 5);
    expect((prevText as any).baseAttributes.y).toBeCloseTo(newAttrs.y, 5);
    expect((prevText as any).baseAttributes.text).toBe(newAttrs.text);
    expect((prevText as any).baseAttributes.opacity).toBeCloseTo(newAttrs.opacity, 5);
    expect((prevText as any).getFinalAttribute().x).toBeCloseTo(newAttrs.x, 5);
    expect((prevText as any).getFinalAttribute().y).toBeCloseTo(newAttrs.y, 5);
    expect((prevText as any).getFinalAttribute().text).toBe(newAttrs.text);
    expect((prevText as any).getFinalAttribute().opacity).toBeCloseTo(newAttrs.opacity, 5);
  });

  test.each([true, false])('reconciles label lines during updates with animation=%s', animation => {
    const { stage, ticker } = createStageHarness('label-line-update');
    const label = new TestLabel({
      type: 'rect',
      baseMarkGroupName: 'bar',
      data: [],
      animation,
      animationEnter: false,
      animationExit: false,
      animationUpdate: { duration: 300, easing: 'linear' }
    });
    label._prepareAnimate({});
    label.setStage(stage, null as any);
    const firstLine = createLine({
      points: [
        { x: 0, y: 0 },
        { x: 20, y: 0 }
      ]
    });
    const text = createText({ x: 20, y: 0, text: 'Label' });
    const renderedLabel: LabelContent = { text, labelLine: firstLine };
    label.add(text);
    label.add(firstLine);

    label.runUpdate(renderedLabel, { text: createText({ x: 40, y: 0, text: 'Label' }) });
    expect(renderedLabel.labelLine).toBeUndefined();
    expect(firstLine.parent).toBeNull();
    expect(text.parent).toBe(label);
    if (animation) {
      tick(ticker, 150);
      expect(text.attribute.x).toBeGreaterThan(20);
      expect(text.attribute.x).toBeLessThan(40);
      tick(ticker, 150);
    }
    expect(text.attribute.x).toBe(40);

    const restoredLine = createLine({
      points: [
        { x: 60, y: 5 },
        { x: 45, y: 5 }
      ]
    });
    const mark = createRect({ x: 35, y: 0, width: 10, height: 10 });
    jest.spyOn(text, 'AABBBounds', 'get').mockImplementation(() => {
      const x = text.attribute.x;
      return new AABBBounds().set(x, 0, x + 20, 10);
    });
    label.runUpdate(renderedLabel, { text: createText({ x: 60, y: 0, text: 'Label' }), labelLine: restoredLine }, mark);
    expect(renderedLabel.labelLine).toBe(restoredLine);
    expect(restoredLine.parent).toBe(label);
    if (animation) {
      expect(restoredLine.attribute.visible).toBe(false);
      tick(ticker, 150);
      expect(text.attribute.x).toBe(50);
      expect(restoredLine.attribute.visible).toBe(true);
      expect(restoredLine.attribute.points).toEqual([
        { x: 50, y: 5 },
        { x: 45, y: 5 }
      ]);
      expect(restoredLine.baseAttributes.points[0].x).toBe(60);
      tick(ticker, 150);
    }
    expect(restoredLine.attribute.points[0].x).toBe(60);

    const nextLine = createLine({
      points: [
        { x: 80, y: 5 },
        { x: 45, y: 5 }
      ]
    });
    label.runUpdate(renderedLabel, { text: createText({ x: 80, y: 0, text: 'Label' }), labelLine: nextLine });
    expect(renderedLabel.labelLine).toBe(restoredLine);
    expect(label.getChildren()).toEqual([text, restoredLine]);
    if (animation) {
      tick(ticker, 150);
      expect(restoredLine.attribute.points[0].x).toBeGreaterThan(60);
      expect(restoredLine.attribute.points[0].x).toBeLessThan(80);
      tick(ticker, 150);
    }
    expect(restoredLine.attribute.points[0].x).toBe(80);
  });

  test.each([
    [true, true],
    [true, false],
    [false, true],
    [false, false]
  ])('restores a line against moving geometry with markFirst=%s, finalContext=%s', (markFirst, finalContext) => {
    const { ticker, text, mark, line } = createMovingMarkCase(markFirst, finalContext);
    expect(line.attribute.visible).toBe(false);
    tick(ticker, 150);
    const points = line.attribute.points;
    expect([mark.AABBBounds.x1, mark.AABBBounds.x2]).toEqual([55, 65]);
    expect([text.AABBBounds.x1, text.AABBBounds.x2]).toEqual([70, 90]);
    expect(line.attribute.visible).toBe(true);
    expect(points).toEqual([
      { x: 70, y: 5 },
      { x: 65, y: 5 }
    ]);
    expect(line.baseAttributes.points).toEqual([
      { x: 100, y: 5 },
      { x: 85, y: 5 }
    ]);
    expect(text.baseAttributes.x).toBe(100);
    expect(mark.baseAttributes.x).toBe(75);
    tick(ticker, 150);
    expect(line.attribute.points).toEqual(line.baseAttributes.points);
    expect(line.attribute.visible).not.toBe(false);
    expect(text.attribute.x).toBe(100);
    expect(mark.attribute.x).toBe(75);
    expect(ticker.listenerCount('tick')).toBe(0);
  });

  test('batches restored lines and preserves the remaining frame when one line is cancelled', () => {
    const harness = createStageHarness('shared-moving-lines');
    const first = createMovingMarkCase(false, true, harness);
    const second = createMovingMarkCase(false, true, harness);
    harness.stage.getTimeline().tick(150);
    expect(harness.ticker.listenerCount('tick')).toBe(1);
    first.line.stopAnimates();
    expect(harness.ticker.listenerCount('tick')).toBe(1);
    harness.ticker.emit('tick', 150);
    expect(second.line.attribute.points).toEqual([
      { x: 70, y: 5 },
      { x: 65, y: 5 }
    ]);
    expect(harness.ticker.listenerCount('tick')).toBe(0);
    harness.stage.getTimeline().clear();
  });

  test.each(['stop', 'detach', 'release'])('clears a pending restored-line frame on %s', action => {
    const { stage, ticker, label, line } = createMovingMarkCase(false, true);
    stage.getTimeline().tick(150);
    expect(ticker.listenerCount('tick')).toBe(1);
    if (action === 'stop') {
      line.stopAnimates();
    } else if (action === 'detach') {
      label.removeChild(line);
    } else {
      line.release();
    }
    expect(ticker.listenerCount('tick')).toBe(0);
    const points = line.attribute.points;
    ticker.emit('tick', 150);
    expect(line.attribute.points).toBe(points);
  });

  test('uses the current stage ticker after switching tickers during restoration', () => {
    const { stage, ticker, line, label, mark } = createMovingMarkCase(false, true);
    tick(ticker, 100);
    const next = createStageHarness('next-label-stage');
    // Reparent the label and its related mark to the same destination stage.
    label.setStage(next.stage, null as any);
    mark.setStage(next.stage, null as any);
    tick(next.ticker, 100);
    expect(ticker.listenerCount('tick')).toBe(0);
    expect(next.ticker.listenerCount('tick')).toBe(0);
    expect(line.attribute.visible).toBe(true);
    expect(line.attribute.points[1].x).toBeCloseTo(mark.AABBBounds.x2);
    label.setStage(null, null);
    stage.getTimeline().clear();
    next.stage.getTimeline().clear();
  });

  test('takes over restored-line points on a new update and removes the line without residual writes', () => {
    const { stage, ticker, label, text, mark, line, content } = createMovingMarkCase(false, true);
    tick(ticker, 150);
    const nextLine = createLine({
      points: [
        { x: 120, y: 5 },
        { x: 85, y: 5 }
      ]
    });
    label.runUpdate(content, { text: createText({ x: 120, y: 0, text: 'Label' }), labelLine: nextLine }, mark);
    tick(ticker, 150);
    tick(ticker, 150);
    expect(line.attribute.points).toEqual(nextLine.attribute.points);
    expect(line.baseAttributes.points).toEqual(nextLine.attribute.points);
    label.runUpdate(content, { text: createText({ x: 80, y: 0, text: 'Label' }) }, mark);
    expect(line.parent).toBeNull();
    tick(ticker, 300);
    expect(label.getChildren()).toEqual([text]);
    expect(ticker.listenerCount('tick')).toBe(0);
    stage.getTimeline().clear();
  });

  test('lays out labels from related rect context final attrs before update handoff', () => {
    createStageHarness('label-related-rect-static-truth');

    const oldAttrs = {
      x: 0,
      y: 46.90909090909094,
      width: 10,
      height: 34,
      fill: '#1664ff',
      visible: true
    };
    const finalAttrs = {
      ...oldAttrs,
      x: 974.1100285714286,
      y: 3
    };
    const rect = createRect(oldAttrs);
    const initAttributesSpy = jest.spyOn(rect as any, 'initAttributes');
    const label = new TestRectLabel({
      type: 'rect',
      data: [{ id: 'China_share_global_co2', text: '31.953' }],
      getBaseMarks: () => [rect],
      animation: true,
      animationEnter: false,
      animationExit: false,
      animationUpdate: false,
      overlap: false,
      smartInvert: false,
      position: 'top'
    } as any);

    rect.context = {
      diffState: 'update',
      animationState: 'update',
      diffAttrs: {
        x: finalAttrs.x,
        y: finalAttrs.y,
        height: finalAttrs.height
      },
      finalAttrs
    };

    (label as any).render();

    const labelContent = [...((label as any)._graphicToText as Map<any, any>).values()][0];
    expect(labelContent.text.attribute.x).toBeCloseTo(finalAttrs.x + finalAttrs.width / 2, 6);

    expect(initAttributesSpy).not.toHaveBeenCalled();
    expect(rect.attribute.x).toBeCloseTo(oldAttrs.x, 6);
    expect(rect.attribute.y).toBeCloseTo(oldAttrs.y, 6);
    expect((rect as any).baseAttributes.x).toBeCloseTo(oldAttrs.x, 6);
    expect((rect as any).baseAttributes.y).toBeCloseTo(oldAttrs.y, 6);
    expect((rect as any).getFinalAttribute()).toBeUndefined();
  });
});
