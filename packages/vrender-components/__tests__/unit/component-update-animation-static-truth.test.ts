import { application, createGroup, createRect, createText } from '@visactor/vrender-core';
import { DefaultTimeline, ManualTicker, registerAnimate } from '@visactor/vrender-animate';
import { registerAxisAnimate } from '../../src/animation/axis-animate';
import { GroupTransition } from '../../src/axis/animate/group-transition';
import { graphicFadeIn } from '../../src/marker/animate/common';

let runtimeRegistered = false;

function ensureRuntime() {
  if (runtimeRegistered) {
    return;
  }
  registerAnimate();
  registerAxisAnimate();
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

describe('component update animation static truth', () => {
  let originalGraphicService: typeof application.graphicService;

  beforeEach(() => {
    originalGraphicService = application.graphicService;
  });

  afterEach(() => {
    application.graphicService = originalGraphicService;
    jest.restoreAllMocks();
  });

  test('keeps axis update target after animating a reused tick from old attrs', () => {
    const { stage, ticker } = createStageHarness('axis-update-static-truth');
    const oldAttrs = {
      x: 20,
      y: 8,
      text: 'A',
      fontSize: 12,
      opacity: 1,
      visible: true
    };
    const newAttrs = {
      ...oldAttrs,
      x: 120,
      y: 40,
      opacity: 0.75
    };
    const tickText = createText(newAttrs);

    tickText.setStage(stage, null as any);
    tickText.setFinalAttributes({ ...newAttrs });
    tickText.setAttributes({ ...oldAttrs });

    tickText.applyAnimationState(
      ['update'],
      [
        {
          name: 'update',
          animation: {
            selfOnly: true,
            type: 'axisUpdate',
            duration: 300,
            easing: 'linear',
            customParameters: {
              config: { duration: 300, easing: 'linear' },
              diffAttrs: {
                x: newAttrs.x,
                y: newAttrs.y,
                opacity: newAttrs.opacity
              }
            }
          }
        }
      ]
    );

    tick(ticker, 150);
    expect(tickText.attribute.x).toBeGreaterThan(oldAttrs.x);
    expect(tickText.attribute.x).toBeLessThan(newAttrs.x);
    expect(tickText.attribute.y).toBeGreaterThan(oldAttrs.y);
    expect(tickText.attribute.y).toBeLessThan(newAttrs.y);

    tick(ticker, 150);
    expect(tickText.attribute.x).toBeCloseTo(newAttrs.x, 5);
    expect(tickText.attribute.y).toBeCloseTo(newAttrs.y, 5);
    expect(tickText.attribute.opacity).toBeCloseTo(newAttrs.opacity, 5);
    expect((tickText as any).baseAttributes.x).toBeCloseTo(newAttrs.x, 5);
    expect((tickText as any).baseAttributes.y).toBeCloseTo(newAttrs.y, 5);
    expect((tickText as any).baseAttributes.opacity).toBeCloseTo(newAttrs.opacity, 5);
    expect((tickText as any).getFinalAttribute().x).toBeCloseTo(newAttrs.x, 5);
    expect((tickText as any).getFinalAttribute().y).toBeCloseTo(newAttrs.y, 5);
    expect((tickText as any).getFinalAttribute().opacity).toBeCloseTo(newAttrs.opacity, 5);
  });

  test('keeps axis enter target when starting from the previous scale point', () => {
    const { stage, ticker } = createStageHarness('axis-enter-static-truth');
    const startPoint = { x: 15, y: 12 };
    const newAttrs = {
      x: 115,
      y: 52,
      text: 'A',
      fontSize: 12,
      opacity: 1,
      visible: true
    };
    const tickText = createText(newAttrs);

    tickText.data = { rawValue: 'A' };
    tickText.setStage(stage, null as any);
    tickText.applyAnimationState(
      ['enter'],
      [
        {
          name: 'enter',
          animation: {
            selfOnly: true,
            type: 'axisEnter',
            duration: 300,
            easing: 'linear',
            customParameters: {
              config: { type: 'to', to: {} },
              lastScale: { scale: () => 0 },
              getTickCoord: () => startPoint
            }
          }
        }
      ]
    );

    tick(ticker, 150);
    expect(tickText.attribute.x).toBeGreaterThan(startPoint.x);
    expect(tickText.attribute.x).toBeLessThan(newAttrs.x);
    expect(tickText.attribute.y).toBeGreaterThan(startPoint.y);
    expect(tickText.attribute.y).toBeLessThan(newAttrs.y);

    tick(ticker, 150);
    expect(tickText.attribute.x).toBeCloseTo(newAttrs.x, 5);
    expect(tickText.attribute.y).toBeCloseTo(newAttrs.y, 5);
    expect((tickText as any).baseAttributes.x).toBeCloseTo(newAttrs.x, 5);
    expect((tickText as any).baseAttributes.y).toBeCloseTo(newAttrs.y, 5);
    expect((tickText as any).getFinalAttribute().x).toBeCloseTo(newAttrs.x, 5);
    expect((tickText as any).getFinalAttribute().y).toBeCloseTo(newAttrs.y, 5);
  });

  test('keeps group transition target after animating a reused child from old attrs', () => {
    const { stage, ticker } = createStageHarness('group-transition-static-truth');
    const oldAttrs = {
      x: 10,
      y: 15,
      text: 'A',
      fontSize: 12,
      opacity: 1,
      visible: true
    };
    const newAttrs = {
      ...oldAttrs,
      x: 90,
      y: 55,
      opacity: 0.6
    };
    const group = createGroup({});
    const currentText = createText(newAttrs);
    const oldText = createText(oldAttrs);

    currentText.id = 'tick-1';
    oldText.id = 'tick-1';
    group.setStage(stage, null as any);
    group.appendChild(currentText);
    (group as any).getInnerView = () => group;
    (group as any).getPrevInnerView = () => ({
      'tick-1': oldText
    });

    group.animate().play(new GroupTransition(null, null, 300, 'linear'));

    tick(ticker, 1);
    tick(ticker, 150);
    expect(currentText.attribute.x).toBeGreaterThan(oldAttrs.x);
    expect(currentText.attribute.x).toBeLessThan(newAttrs.x);
    expect(currentText.attribute.y).toBeGreaterThan(oldAttrs.y);
    expect(currentText.attribute.y).toBeLessThan(newAttrs.y);

    tick(ticker, 150);
    expect(currentText.attribute.x).toBeCloseTo(newAttrs.x, 5);
    expect(currentText.attribute.y).toBeCloseTo(newAttrs.y, 5);
    expect(currentText.attribute.opacity).toBeCloseTo(newAttrs.opacity, 5);
    expect((currentText as any).baseAttributes.x).toBeCloseTo(newAttrs.x, 5);
    expect((currentText as any).baseAttributes.y).toBeCloseTo(newAttrs.y, 5);
    expect((currentText as any).baseAttributes.opacity).toBeCloseTo(newAttrs.opacity, 5);
    expect((currentText as any).getFinalAttribute().x).toBeCloseTo(newAttrs.x, 5);
    expect((currentText as any).getFinalAttribute().y).toBeCloseTo(newAttrs.y, 5);
    expect((currentText as any).getFinalAttribute().opacity).toBeCloseTo(newAttrs.opacity, 5);
  });

  test('keeps marker fade-in opacity target after appear animation ends', () => {
    const { stage, ticker } = createStageHarness('marker-fade-in-static-truth');
    const finalAttrs = {
      x: 0,
      y: 0,
      width: 20,
      height: 20,
      fillOpacity: 0.4,
      strokeOpacity: 0.7,
      visible: true
    };
    const rect = createRect(finalAttrs);

    rect.setStage(stage, null as any);
    graphicFadeIn(rect, 0, 300, 'linear');

    tick(ticker, 150);
    expect(rect.attribute.fillOpacity).toBeGreaterThan(0);
    expect(rect.attribute.fillOpacity).toBeLessThan(finalAttrs.fillOpacity);
    expect(rect.attribute.strokeOpacity).toBeGreaterThan(0);
    expect(rect.attribute.strokeOpacity).toBeLessThan(finalAttrs.strokeOpacity);

    tick(ticker, 150);
    expect(rect.attribute.fillOpacity).toBeCloseTo(finalAttrs.fillOpacity, 5);
    expect(rect.attribute.strokeOpacity).toBeCloseTo(finalAttrs.strokeOpacity, 5);
    expect((rect as any).baseAttributes.fillOpacity).toBeCloseTo(finalAttrs.fillOpacity, 5);
    expect((rect as any).baseAttributes.strokeOpacity).toBeCloseTo(finalAttrs.strokeOpacity, 5);
    expect((rect as any).getFinalAttribute().fillOpacity).toBeCloseTo(finalAttrs.fillOpacity, 5);
    expect((rect as any).getFinalAttribute().strokeOpacity).toBeCloseTo(finalAttrs.strokeOpacity, 5);
  });
});
