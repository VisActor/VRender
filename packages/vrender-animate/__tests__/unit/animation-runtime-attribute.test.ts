import { application, createGroup, createRect, DefaultGraphicService } from '@visactor/vrender-core';
import { registerAnimate } from '../../src/register';
import { registerCustomAnimate } from '../../src/custom/register';
import { AnimateExecutor } from '../../src/executor/animate-executor';
import { DefaultTimeline } from '../../src/timeline';
import { ManualTicker } from '../../src/ticker/manual-ticker';

let animationRuntimeRegistered = false;

function ensureAnimationRuntime() {
  if (animationRuntimeRegistered) {
    return;
  }
  registerAnimate();
  registerCustomAnimate();
  if (!application.graphicService) {
    application.graphicService = new DefaultGraphicService();
  }
  animationRuntimeRegistered = true;
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

function bindGraphicService(graphic: any, graphicService: any) {
  jest.spyOn(graphic, 'getGraphicService').mockReturnValue(graphicService);
}

function createStageHarness(label: string) {
  ensureAnimationRuntime();

  const timeline = new DefaultTimeline();
  const ticker = new ManualTicker();
  // DefaultTicker only creates a handler when env is available; tests install one explicitly.
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

  const group = createGroup({});
  bindGraphicService(group as any, graphicService);
  group.setStage(stage, null as any);

  return {
    stage,
    group,
    ticker,
    timeline,
    graphicService
  };
}

function createAnimatedRect(graphicService: any) {
  const rect = createRect({
    x: 0,
    y: 0,
    width: 10,
    height: 10,
    opacity: 1,
    fill: 'blue'
  });
  bindGraphicService(rect as any, graphicService);
  return rect;
}

function tick(ticker: ManualTicker, delta: number) {
  ticker.tick(delta);
}

function boundsSize(graphic: any) {
  const bounds = graphic.AABBBounds;
  return {
    width: bounds.x2 - bounds.x1,
    height: bounds.y2 - bounds.y1
  };
}

describe('D3 pre-handoff animation runtime', () => {
  beforeAll(() => {
    ensureAnimationRuntime();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('state animation updates graphic.attribute over time without polluting baseAttributes', () => {
    const { group, ticker, graphicService } = createStageHarness('state-runtime');
    const rect = createAnimatedRect(graphicService);
    group.appendChild(rect);

    rect.states = {
      hover: {
        opacity: 0.2
      }
    } as any;
    rect.stateAnimateConfig = {
      duration: 100,
      easing: 'linear'
    } as any;

    rect.useStates(['hover'], true);

    expect(rect.attribute.opacity).toBe(1);
    expect((rect as any).baseAttributes.opacity).toBe(1);

    tick(ticker, 50);
    expect(rect.attribute.opacity).toBeCloseTo(0.6, 5);
    expect((rect as any).baseAttributes.opacity).toBe(1);

    tick(ticker, 50);
    expect(rect.attribute.opacity).toBeCloseTo(0.2, 5);
    expect((rect as any).baseAttributes.opacity).toBe(1);
  });

  test('state animation ends at the resolved state style without committing it to baseAttributes', () => {
    const { group, ticker, graphicService } = createStageHarness('state-runtime-end-style');
    const rect = createAnimatedRect(graphicService);
    rect.setAttribute('lineWidth', 1);
    rect.setFinalAttributes({ ...rect.attribute });
    group.appendChild(rect);

    rect.states = {
      a: {
        opacity: 0.35,
        lineWidth: 6
      }
    } as any;
    rect.stateAnimateConfig = {
      duration: 100,
      easing: 'linear'
    } as any;

    rect.useStates(['a'], true);

    expect(rect.currentStates).toEqual(['a']);
    expect(rect.resolvedStatePatch).toEqual({
      opacity: 0.35,
      lineWidth: 6
    });
    expect(rect.attribute.opacity).toBe(1);
    expect(rect.attribute.lineWidth).toBe(1);
    expect((rect as any).baseAttributes.opacity).toBe(1);
    expect((rect as any).baseAttributes.lineWidth).toBe(1);
    expect(rect.getFinalAttribute().opacity).toBe(0.35);
    expect(rect.getFinalAttribute().lineWidth).toBe(6);

    tick(ticker, 50);
    expect(rect.attribute.opacity).toBeCloseTo(0.675, 5);
    expect(rect.attribute.lineWidth).toBeCloseTo(3.5, 5);
    expect((rect as any).baseAttributes.opacity).toBe(1);
    expect((rect as any).baseAttributes.lineWidth).toBe(1);

    tick(ticker, 50);
    expect(rect.attribute.opacity).toBeCloseTo(0.35, 5);
    expect(rect.attribute.lineWidth).toBeCloseTo(6, 5);
    expect(rect.getFinalAttribute().opacity).toBeCloseTo(0.35, 5);
    expect(rect.getFinalAttribute().lineWidth).toBeCloseTo(6, 5);
    expect((rect as any).baseAttributes.opacity).toBe(1);
    expect((rect as any).baseAttributes.lineWidth).toBe(1);
    expect(rect.currentStates).toEqual(['a']);
    expect(rect.resolvedStatePatch).toEqual({
      opacity: 0.35,
      lineWidth: 6
    });
  });

  test('interrupted state animations resolve [] to [a] to [a,b] to [a] to [] without stale state styles', () => {
    const { group, ticker, graphicService } = createStageHarness('state-runtime-interrupted-stack');
    const rect = createAnimatedRect(graphicService);
    rect.setAttribute('lineWidth', 1);
    rect.setFinalAttributes({ ...rect.attribute });
    group.appendChild(rect);

    rect.states = {
      a: {
        opacity: 0.2
      },
      b: {
        lineWidth: 5
      }
    } as any;
    rect.stateAnimateConfig = {
      duration: 100,
      easing: 'linear'
    } as any;

    rect.useStates(['a'], true);
    tick(ticker, 25);
    expect(rect.attribute.opacity).toBeCloseTo(0.8, 5);
    expect(rect.attribute.lineWidth).toBe(1);
    expect(rect.currentStates).toEqual(['a']);
    expect(rect.resolvedStatePatch).toEqual({
      opacity: 0.2
    });

    rect.useStates(['a', 'b'], true);
    tick(ticker, 25);
    expect(rect.attribute.opacity).toBeGreaterThan(0.2);
    expect(rect.attribute.opacity).toBeLessThan(0.8);
    expect(rect.attribute.lineWidth).toBeGreaterThan(1);
    expect(rect.attribute.lineWidth).toBeLessThan(5);
    expect(rect.currentStates).toEqual(['a', 'b']);
    expect(rect.resolvedStatePatch).toEqual({
      opacity: 0.2,
      lineWidth: 5
    });
    const lineWidthWithB = rect.attribute.lineWidth;

    rect.useStates(['a'], true);
    tick(ticker, 25);
    expect(rect.attribute.opacity).toBeGreaterThan(0.2);
    expect(rect.attribute.opacity).toBeLessThan(0.8);
    expect(rect.attribute.lineWidth).toBeGreaterThan(1);
    expect(rect.attribute.lineWidth).toBeLessThan(lineWidthWithB);
    expect(rect.getFinalAttribute().opacity).toBe(0.2);
    expect(rect.getFinalAttribute().lineWidth).toBe(1);
    expect(rect.currentStates).toEqual(['a']);
    expect(rect.resolvedStatePatch).toEqual({
      opacity: 0.2
    });
    const lineWidthAfterRemovingB = rect.attribute.lineWidth;

    rect.useStates([], true);
    tick(ticker, 25);
    expect(rect.attribute.opacity).toBeGreaterThan(0.2);
    expect(rect.attribute.opacity).toBeLessThan(1);
    expect(rect.attribute.lineWidth).toBeGreaterThan(1);
    expect(rect.attribute.lineWidth).toBeLessThan(lineWidthAfterRemovingB);
    expect(rect.currentStates).toEqual([]);
    expect(rect.resolvedStatePatch).toBeUndefined();

    tick(ticker, 100);
    expect(rect.attribute.opacity).toBe(1);
    expect(rect.attribute.lineWidth).toBe(1);
    expect(rect.getFinalAttribute().opacity).toBe(1);
    expect(rect.getFinalAttribute().lineWidth).toBe(1);
    expect((rect as any).baseAttributes.opacity).toBe(1);
    expect((rect as any).baseAttributes.lineWidth).toBe(1);
    expect(rect.currentStates).toEqual([]);
    expect(rect.resolvedStatePatch).toBeUndefined();
  });

  test('clearing hover state keeps y/y1 rect layout from collapsing through undefined height aliases', () => {
    const { group, ticker, graphicService } = createStageHarness('state-runtime-clear-vertical-alias');
    const rect = createRect({
      x: 150,
      y: 0,
      y1: 320,
      width: 140,
      x1: undefined,
      height: undefined,
      lineWidth: 0,
      fill: '#1664FF',
      stroke: '#1664FF',
      fillOpacity: undefined,
      visible: true
    } as any);
    bindGraphicService(rect as any, graphicService);
    rect.setFinalAttributes({ ...rect.attribute });
    group.appendChild(rect);

    rect.states = {
      hover: {
        lineWidth: 4,
        fillOpacity: 0.6
      }
    } as any;
    rect.stateAnimateConfig = {
      duration: 100,
      easing: 'linear'
    } as any;

    rect.useStates(['hover'], true);
    tick(ticker, 100);
    expect(rect.attribute.lineWidth).toBe(4);
    expect(rect.attribute.fillOpacity).toBe(0.6);
    expect((rect as any).baseAttributes.height).toBeUndefined();
    expect((rect as any).baseAttributes.x1).toBeUndefined();

    rect.useStates([], true);
    tick(ticker, 16);

    expect(rect.attribute.height).toBeUndefined();
    expect(rect.attribute.x1).toBeUndefined();
    expect(rect.attribute.y).toBe(0);
    expect(rect.attribute.y1).toBe(320);
    expect(boundsSize(rect).height).toBeGreaterThan(100);

    tick(ticker, 100);
    expect(rect.attribute.height).toBeUndefined();
    expect(rect.attribute.x1).toBeUndefined();
    expect((rect as any).baseAttributes.height).toBeUndefined();
    expect((rect as any).baseAttributes.x1).toBeUndefined();
    expect(rect.getFinalAttribute().height).toBeUndefined();
    expect(rect.getFinalAttribute().x1).toBeUndefined();
    expect(rect.attribute.y).toBe(0);
    expect(rect.attribute.y1).toBe(320);
    expect(rect.attribute.lineWidth).toBe(0);
    expect(boundsSize(rect).height).toBeGreaterThan(100);
  });

  test('clearing hover state keeps x/x1 rect layout from collapsing through undefined width aliases', () => {
    const { group, ticker, graphicService } = createStageHarness('state-runtime-clear-horizontal-alias');
    const rect = createRect({
      x: 10,
      x1: 210,
      y: 5,
      height: 40,
      width: undefined,
      y1: undefined,
      lineWidth: 0,
      fill: '#1664FF',
      stroke: '#1664FF',
      fillOpacity: undefined,
      visible: true
    } as any);
    bindGraphicService(rect as any, graphicService);
    rect.setFinalAttributes({ ...rect.attribute });
    group.appendChild(rect);

    rect.states = {
      hover: {
        lineWidth: 4,
        fillOpacity: 0.6
      }
    } as any;
    rect.stateAnimateConfig = {
      duration: 100,
      easing: 'linear'
    } as any;

    rect.useStates(['hover'], true);
    tick(ticker, 100);
    expect(rect.attribute.lineWidth).toBe(4);
    expect(rect.attribute.fillOpacity).toBe(0.6);
    expect((rect as any).baseAttributes.width).toBeUndefined();
    expect((rect as any).baseAttributes.y1).toBeUndefined();

    rect.useStates([], true);
    tick(ticker, 16);

    expect(rect.attribute.width).toBeUndefined();
    expect(rect.attribute.y1).toBeUndefined();
    expect(rect.attribute.x).toBe(10);
    expect(rect.attribute.x1).toBe(210);
    expect(boundsSize(rect).width).toBeGreaterThan(100);

    tick(ticker, 100);
    expect(rect.attribute.width).toBeUndefined();
    expect(rect.attribute.y1).toBeUndefined();
    expect((rect as any).baseAttributes.width).toBeUndefined();
    expect((rect as any).baseAttributes.y1).toBeUndefined();
    expect(rect.getFinalAttribute().width).toBeUndefined();
    expect(rect.getFinalAttribute().y1).toBeUndefined();
    expect(rect.attribute.x).toBe(10);
    expect(rect.attribute.x1).toBe(210);
    expect(rect.attribute.lineWidth).toBe(0);
    expect(boundsSize(rect).width).toBeGreaterThan(100);
  });

  test('clearing hover state animates removed style keys to defaults when base lacks those keys', () => {
    const { group, ticker, graphicService } = createStageHarness('state-runtime-clear-missing-style-key');
    const rect = createRect({
      x: 0,
      y: 0,
      y1: 100,
      width: 20,
      lineWidth: 0,
      fill: '#1664FF',
      visible: true
    } as any);
    bindGraphicService(rect as any, graphicService);
    rect.setFinalAttributes({ ...rect.attribute });
    group.appendChild(rect);

    rect.states = {
      hover: {
        lineWidth: 4,
        fillOpacity: 0.6
      }
    } as any;
    rect.stateAnimateConfig = {
      duration: 100,
      easing: 'linear'
    } as any;

    rect.useStates(['hover'], true);
    tick(ticker, 100);
    expect(rect.attribute.fillOpacity).toBe(0.6);
    expect((rect as any).baseAttributes.fillOpacity).toBeUndefined();

    rect.useStates([], true);
    tick(ticker, 16);

    expect(rect.attribute.fillOpacity).toBeGreaterThan(0.6);
    expect(rect.attribute.fillOpacity).toBeLessThan(1);
    expect((rect as any).baseAttributes.fillOpacity).toBeUndefined();
    expect(rect.getFinalAttribute().fillOpacity).toBeUndefined();

    tick(ticker, 100);
    expect(rect.attribute.fillOpacity).toBeUndefined();
    expect((rect as any).baseAttributes.fillOpacity).toBeUndefined();
    expect(rect.getFinalAttribute().fillOpacity).toBeUndefined();
  });

  test('clearing explicit height state on y/y1 rect animates to computed layout height', () => {
    const { group, ticker, graphicService } = createStageHarness('state-runtime-clear-explicit-height-alias');
    const rect = createRect({
      x: 0,
      y: 0,
      y1: 100,
      width: 20,
      height: undefined,
      visible: true
    } as any);
    bindGraphicService(rect as any, graphicService);
    rect.setFinalAttributes({ ...rect.attribute });
    group.appendChild(rect);

    rect.states = {
      hover: {
        height: 60
      }
    } as any;
    rect.stateAnimateConfig = {
      duration: 100,
      easing: 'linear'
    } as any;

    rect.useStates(['hover'], true);
    tick(ticker, 100);
    expect(rect.attribute.height).toBe(60);
    expect((rect as any).baseAttributes.height).toBeUndefined();

    rect.useStates([], true);
    tick(ticker, 50);

    expect(rect.attribute.height).toBeGreaterThan(60);
    expect(rect.attribute.height).toBeLessThan(100);
    expect(boundsSize(rect).height).toBeGreaterThan(60);
    expect((rect as any).baseAttributes.height).toBeUndefined();
    expect(rect.getFinalAttribute().height).toBeUndefined();

    tick(ticker, 100);
    expect(rect.attribute.height).toBeUndefined();
    expect(rect.attribute.y).toBe(0);
    expect(rect.attribute.y1).toBe(100);
    expect(boundsSize(rect).height).toBeGreaterThan(90);
    expect((rect as any).baseAttributes.height).toBeUndefined();
    expect(rect.getFinalAttribute().height).toBeUndefined();
  });

  test('clearing explicit width state on x/x1 rect animates to computed layout width', () => {
    const { group, ticker, graphicService } = createStageHarness('state-runtime-clear-explicit-width-alias');
    const rect = createRect({
      x: 0,
      x1: 100,
      y: 0,
      height: 20,
      width: undefined,
      visible: true
    } as any);
    bindGraphicService(rect as any, graphicService);
    rect.setFinalAttributes({ ...rect.attribute });
    group.appendChild(rect);

    rect.states = {
      hover: {
        width: 60
      }
    } as any;
    rect.stateAnimateConfig = {
      duration: 100,
      easing: 'linear'
    } as any;

    rect.useStates(['hover'], true);
    tick(ticker, 100);
    expect(rect.attribute.width).toBe(60);
    expect((rect as any).baseAttributes.width).toBeUndefined();

    rect.useStates([], true);
    tick(ticker, 50);

    expect(rect.attribute.width).toBeGreaterThan(60);
    expect(rect.attribute.width).toBeLessThan(100);
    expect(boundsSize(rect).width).toBeGreaterThan(60);
    expect((rect as any).baseAttributes.width).toBeUndefined();
    expect(rect.getFinalAttribute().width).toBeUndefined();

    tick(ticker, 100);
    expect(rect.attribute.width).toBeUndefined();
    expect(rect.attribute.x).toBe(0);
    expect(rect.attribute.x1).toBe(100);
    expect(boundsSize(rect).width).toBeGreaterThan(90);
    expect((rect as any).baseAttributes.width).toBeUndefined();
    expect(rect.getFinalAttribute().width).toBeUndefined();
  });

  test('switching from explicit height state to another state animates to computed layout height', () => {
    const { group, ticker, graphicService } = createStageHarness('state-runtime-switch-explicit-height-alias');
    const rect = createRect({
      x: 0,
      y: 0,
      y1: 100,
      width: 20,
      height: undefined,
      visible: true
    } as any);
    bindGraphicService(rect as any, graphicService);
    rect.setFinalAttributes({ ...rect.attribute });
    group.appendChild(rect);

    rect.states = {
      hover: {
        height: 60
      },
      selected: {
        fillOpacity: 0.5
      }
    } as any;
    rect.stateAnimateConfig = {
      duration: 100,
      easing: 'linear'
    } as any;

    rect.useStates(['hover'], true);
    tick(ticker, 100);
    expect(rect.attribute.height).toBe(60);

    rect.useStates(['selected'], true);
    tick(ticker, 50);

    expect(rect.attribute.height).toBeGreaterThan(60);
    expect(rect.attribute.height).toBeLessThan(100);
    expect(rect.attribute.fillOpacity).toBeGreaterThan(0.5);
    expect(rect.attribute.fillOpacity).toBeLessThan(1);
    expect(boundsSize(rect).height).toBeGreaterThan(60);
    expect((rect as any).baseAttributes.height).toBeUndefined();
    expect(rect.getFinalAttribute().height).toBeUndefined();

    tick(ticker, 100);
    expect(rect.attribute.height).toBeUndefined();
    expect(rect.attribute.y).toBe(0);
    expect(rect.attribute.y1).toBe(100);
    expect(rect.attribute.fillOpacity).toBe(0.5);
    expect(boundsSize(rect).height).toBeGreaterThan(90);
    expect((rect as any).baseAttributes.height).toBeUndefined();
    expect(rect.getFinalAttribute().height).toBeUndefined();
  });

  test('switching from explicit width state to another state animates to computed layout width', () => {
    const { group, ticker, graphicService } = createStageHarness('state-runtime-switch-explicit-width-alias');
    const rect = createRect({
      x: 0,
      x1: 100,
      y: 0,
      height: 20,
      width: undefined,
      visible: true
    } as any);
    bindGraphicService(rect as any, graphicService);
    rect.setFinalAttributes({ ...rect.attribute });
    group.appendChild(rect);

    rect.states = {
      hover: {
        width: 60
      },
      selected: {
        fillOpacity: 0.5
      }
    } as any;
    rect.stateAnimateConfig = {
      duration: 100,
      easing: 'linear'
    } as any;

    rect.useStates(['hover'], true);
    tick(ticker, 100);
    expect(rect.attribute.width).toBe(60);

    rect.useStates(['selected'], true);
    tick(ticker, 50);

    expect(rect.attribute.width).toBeGreaterThan(60);
    expect(rect.attribute.width).toBeLessThan(100);
    expect(rect.attribute.fillOpacity).toBeGreaterThan(0.5);
    expect(rect.attribute.fillOpacity).toBeLessThan(1);
    expect(boundsSize(rect).width).toBeGreaterThan(60);
    expect((rect as any).baseAttributes.width).toBeUndefined();
    expect(rect.getFinalAttribute().width).toBeUndefined();

    tick(ticker, 100);
    expect(rect.attribute.width).toBeUndefined();
    expect(rect.attribute.x).toBe(0);
    expect(rect.attribute.x1).toBe(100);
    expect(rect.attribute.fillOpacity).toBe(0.5);
    expect(boundsSize(rect).width).toBeGreaterThan(90);
    expect((rect as any).baseAttributes.width).toBeUndefined();
    expect(rect.getFinalAttribute().width).toBeUndefined();
  });

  test('animate.to restores static truth after completion and keeps baseAttributes untouched', () => {
    const { group, ticker, graphicService } = createStageHarness('self-to');
    const rect = createAnimatedRect(graphicService);
    group.appendChild(rect);

    rect.animate().to({ x: 100 }, 100, 'linear');

    expect(rect.attribute.x).toBe(0);
    expect((rect as any).baseAttributes.x).toBe(0);

    tick(ticker, 50);
    expect(rect.attribute.x).toBeCloseTo(50, 5);
    expect((rect as any).baseAttributes.x).toBe(0);

    tick(ticker, 50);
    expect(rect.attribute.x).toBe(0);
    expect((rect as any).baseAttributes.x).toBe(0);
  });

  test('animate.from interpolates from the provided value back to static truth', () => {
    const { group, ticker, graphicService } = createStageHarness('self-from');
    const rect = createAnimatedRect(graphicService);
    rect.setAttribute('x', 80);
    group.appendChild(rect);

    rect.animate().from({ x: 0 }, 100, 'linear');

    expect(rect.attribute.x).toBe(0);
    expect((rect as any).baseAttributes.x).toBe(80);

    tick(ticker, 50);
    expect(rect.attribute.x).toBeCloseTo(40, 5);
    expect((rect as any).baseAttributes.x).toBe(80);

    tick(ticker, 50);
    expect(rect.attribute.x).toBe(80);
    expect((rect as any).baseAttributes.x).toBe(80);
  });

  test('wait step holds the previous frame without committing it to baseAttributes', () => {
    const { group, ticker, graphicService } = createStageHarness('wait-step');
    const rect = createAnimatedRect(graphicService);
    group.appendChild(rect);

    rect.animate().to({ x: 100 }, 100, 'linear').wait(50).to({ x: 200 }, 100, 'linear');

    tick(ticker, 100);
    expect(rect.attribute.x).toBeCloseTo(100, 5);
    expect((rect as any).baseAttributes.x).toBe(0);

    tick(ticker, 1);
    expect(rect.attribute.x).toBeCloseTo(100, 5);
    expect((rect as any).baseAttributes.x).toBe(0);
  });

  test('loop reset applies the start frame without overwriting current static truth', () => {
    const { group, ticker, graphicService } = createStageHarness('loop-reset');
    const rect = createAnimatedRect(graphicService);
    group.appendChild(rect);

    rect.animate().to({ x: 100 }, 100, 'linear').loop(1);

    tick(ticker, 50);
    expect(rect.attribute.x).toBeCloseTo(50, 5);
    rect.setAttribute('x', 20);
    expect((rect as any).baseAttributes.x).toBe(20);

    tick(ticker, 50);
    expect(rect.attribute.x).toBe(0);
    expect((rect as any).baseAttributes.x).toBe(20);
  });

  test('stop with an explicit target is a static commit API', () => {
    const { group, ticker, graphicService } = createStageHarness('stop-commit');
    const endRect = createAnimatedRect(graphicService);
    const startRect = createAnimatedRect(graphicService);
    const customRect = createAnimatedRect(graphicService);
    group.appendChild(endRect);
    group.appendChild(startRect);
    group.appendChild(customRect);

    const endAnimate = endRect.animate().to({ x: 100 }, 100, 'linear');
    tick(ticker, 50);
    endAnimate.stop('end');
    expect(endRect.attribute.x).toBe(100);
    expect((endRect as any).baseAttributes.x).toBe(100);

    const startAnimate = startRect.animate().to({ x: 100 }, 100, 'linear');
    tick(ticker, 50);
    startAnimate.stop('start');
    expect(startRect.attribute.x).toBe(0);
    expect((startRect as any).baseAttributes.x).toBe(0);

    const customAnimate = customRect.animate().to({ x: 100 }, 100, 'linear');
    tick(ticker, 50);
    customAnimate.stop({ x: 12 });
    expect(customRect.attribute.x).toBe(12);
    expect((customRect as any).baseAttributes.x).toBe(12);
  });

  test('executor attrOutChannel commits non-animated diff attrs as static truth', () => {
    const { group, ticker, graphicService } = createStageHarness('executor-attr-out-channel');
    const rect = createAnimatedRect(graphicService);
    (rect as any).context = {
      diffAttrs: {
        x: 80,
        fill: 'red'
      }
    };
    group.appendChild(rect);

    new AnimateExecutor(rect).execute({
      channel: {
        x: { to: 80 }
      },
      duration: 100,
      easing: 'linear'
    });

    expect((rect as any).baseAttributes.fill).toBe('red');
    expect((rect as any).baseAttributes.x).toBe(0);

    tick(ticker, 50);
    expect(rect.attribute.x).toBeCloseTo(40, 5);
    expect(rect.attribute.fill).toBe('red');
    expect((rect as any).baseAttributes.fill).toBe('red');
    expect((rect as any).baseAttributes.x).toBe(0);
  });

  test('executor keeps from-only appear channels out of attrOutChannel static writes', () => {
    const { group, ticker, graphicService } = createStageHarness('executor-from-only-appear-channel');
    const final = {
      x: 78.75,
      y: 31.2,
      y1: 260,
      width: 202.5,
      visible: true
    };
    const rect = createRect(final);
    bindGraphicService(rect as any, graphicService);
    rect.setFinalAttributes(final);
    (rect as any).context = {
      animationState: 'appear',
      data: [{ value: 10 }],
      diffAttrs: {
        y: 260,
        y1: 260
      }
    };
    group.appendChild(rect);

    new AnimateExecutor(rect).execute({
      type: 'growHeightIn',
      channel: {
        y: { from: 260 },
        y1: { from: 260 }
      },
      duration: 100,
      easing: 'linear',
      options: { overall: 260 }
    });

    expect((rect as any).baseAttributes.y).toBe(31.2);
    expect((rect as any).baseAttributes.y1).toBe(260);
    expect(rect.attribute.y).toBe(260);
    expect(rect.attribute.y1).toBe(260);
    expect(rect.getFinalAttribute().y).toBe(31.2);
    expect(rect.getFinalAttribute().y1).toBe(260);

    tick(ticker, 50);
    expect(rect.attribute.y).toBeCloseTo(145.6, 5);
    expect(rect.attribute.y1).toBe(260);
    expect((rect as any).baseAttributes.y).toBe(31.2);
    expect((rect as any).baseAttributes.y1).toBe(260);

    tick(ticker, 50);
    expect((rect as any).baseAttributes.y).toBe(31.2);
    expect((rect as any).baseAttributes.y1).toBe(260);
    expect(rect.attribute.y).toBe(31.2);
    expect(rect.attribute.y1).toBe(260);
    expect(rect.getFinalAttribute().y).toBe(31.2);
    expect(rect.getFinalAttribute().y1).toBe(260);
  });

  test('executor update animation restores to resized final layout after completion', () => {
    const { group, ticker, graphicService } = createStageHarness('executor-update-resize-static-truth');
    const initial = {
      x: 78.75,
      y: 31.2,
      y1: 260,
      width: 202.5,
      visible: true
    };
    const resized = {
      x: 105,
      y: 38.4,
      y1: 320,
      width: 270,
      visible: true
    };
    const rect = createRect(initial);
    bindGraphicService(rect as any, graphicService);
    rect.setFinalAttributes(initial);
    group.appendChild(rect);

    (rect as any).context = {
      animationState: 'update',
      data: [{ value: 10 }],
      diffAttrs: {
        x: resized.x,
        y: resized.y,
        y1: resized.y1,
        width: resized.width
      },
      finalAttrs: resized
    };
    rect.setFinalAttributes(resized);

    new AnimateExecutor(rect).execute({
      type: 'update',
      duration: 100,
      easing: 'linear'
    });

    expect((rect as any).baseAttributes.x).toBe(initial.x);
    expect((rect as any).baseAttributes.y).toBe(initial.y);
    expect((rect as any).baseAttributes.y1).toBe(initial.y1);
    expect((rect as any).baseAttributes.width).toBe(initial.width);
    expect(rect.getFinalAttribute().x).toBe(resized.x);
    expect(rect.getFinalAttribute().y).toBe(resized.y);
    expect(rect.getFinalAttribute().y1).toBe(resized.y1);
    expect(rect.getFinalAttribute().width).toBe(resized.width);

    tick(ticker, 50);
    expect(rect.attribute.x).toBeCloseTo(91.875, 5);
    expect(rect.attribute.y).toBeCloseTo(34.8, 5);
    expect(rect.attribute.y1).toBeCloseTo(290, 5);
    expect(rect.attribute.width).toBeCloseTo(236.25, 5);
    expect((rect as any).baseAttributes.x).toBe(initial.x);
    expect((rect as any).baseAttributes.y).toBe(initial.y);
    expect((rect as any).baseAttributes.y1).toBe(initial.y1);
    expect((rect as any).baseAttributes.width).toBe(initial.width);

    tick(ticker, 50);
    expect((rect as any).baseAttributes.x).toBe(resized.x);
    expect((rect as any).baseAttributes.y).toBe(resized.y);
    expect((rect as any).baseAttributes.y1).toBe(resized.y1);
    expect((rect as any).baseAttributes.width).toBe(resized.width);
    expect(rect.attribute.x).toBe(resized.x);
    expect(rect.attribute.y).toBe(resized.y);
    expect(rect.attribute.y1).toBe(resized.y1);
    expect(rect.attribute.width).toBe(resized.width);
    expect(rect.getFinalAttribute().x).toBe(resized.x);
    expect(rect.getFinalAttribute().y).toBe(resized.y);
    expect(rect.getFinalAttribute().y1).toBe(resized.y1);
    expect(rect.getFinalAttribute().width).toBe(resized.width);
  });

  test('superseded executor update cannot commit stale layout when it ends late', () => {
    const { group, ticker, graphicService } = createStageHarness('executor-update-stale-end');
    const threeItemLayout = {
      x: 76.61875,
      y: 0,
      y1: 320,
      width: 41.5125,
      visible: true
    };
    const fourItemLayout = {
      x: 73.54375,
      y: 0,
      y1: 320,
      width: 32.2875,
      visible: true
    };
    const rect = createRect(threeItemLayout);
    bindGraphicService(rect as any, graphicService);
    rect.setFinalAttributes(threeItemLayout);
    group.appendChild(rect);

    (rect as any).context = {
      animationState: 'update',
      data: [{ value: 10 }],
      diffAttrs: {
        x: fourItemLayout.x,
        width: fourItemLayout.width
      },
      finalAttrs: fourItemLayout
    };
    rect.setFinalAttributes(fourItemLayout);
    new AnimateExecutor(rect).execute({
      type: 'update',
      duration: 200,
      easing: 'linear'
    });

    tick(ticker, 50);
    expect(rect.attribute.x).toBeLessThan(threeItemLayout.x);
    expect(rect.attribute.x).toBeGreaterThan(fourItemLayout.x);
    expect(rect.attribute.width).toBeLessThan(threeItemLayout.width);
    expect(rect.attribute.width).toBeGreaterThan(fourItemLayout.width);

    (rect as any).context = {
      animationState: 'update',
      data: [{ value: 10 }],
      diffAttrs: {
        x: threeItemLayout.x,
        width: threeItemLayout.width
      },
      finalAttrs: threeItemLayout
    };
    rect.setFinalAttributes(threeItemLayout);
    new AnimateExecutor(rect).execute({
      type: 'update',
      duration: 100,
      easing: 'linear'
    });

    tick(ticker, 100);
    expect(rect.attribute.x).toBeCloseTo(threeItemLayout.x, 5);
    expect(rect.attribute.width).toBeCloseTo(threeItemLayout.width, 5);
    expect((rect as any).baseAttributes.x).toBeCloseTo(threeItemLayout.x, 5);
    expect((rect as any).baseAttributes.width).toBeCloseTo(threeItemLayout.width, 5);
    expect(rect.getFinalAttribute().x).toBeCloseTo(threeItemLayout.x, 5);
    expect(rect.getFinalAttribute().width).toBeCloseTo(threeItemLayout.width, 5);

    tick(ticker, 50);
    expect(rect.attribute.x).toBeCloseTo(threeItemLayout.x, 5);
    expect(rect.attribute.width).toBeCloseTo(threeItemLayout.width, 5);
    expect((rect as any).baseAttributes.x).toBeCloseTo(threeItemLayout.x, 5);
    expect((rect as any).baseAttributes.width).toBeCloseTo(threeItemLayout.width, 5);
    expect(rect.getFinalAttribute().x).toBeCloseTo(threeItemLayout.x, 5);
    expect(rect.getFinalAttribute().width).toBeCloseTo(threeItemLayout.width, 5);
  });

  test('switching states mid-animation restores to the new static truth and blocks late writes', () => {
    const { group, ticker, graphicService } = createStageHarness('state-conflict');
    const rect = createAnimatedRect(graphicService);
    group.appendChild(rect);

    rect.states = {
      hover: { opacity: 0.2 },
      selected: { opacity: 0.8 }
    } as any;
    rect.stateAnimateConfig = {
      duration: 100,
      easing: 'linear'
    } as any;

    rect.useStates(['hover'], true);
    tick(ticker, 50);
    expect(rect.attribute.opacity).toBeCloseTo(0.6, 5);

    rect.useStates(['selected'], true);
    tick(ticker, 50);
    expect(rect.attribute.opacity).toBeCloseTo(0.7, 5);

    tick(ticker, 50);
    expect(rect.attribute.opacity).toBeCloseTo(0.8, 5);
    expect((rect as any).baseAttributes.opacity).toBe(1);

    tick(ticker, 50);
    expect(rect.attribute.opacity).toBeCloseTo(0.8, 5);
  });

  test('state switch wins over an in-flight self-driven animation on the same attribute', () => {
    const { group, ticker, graphicService } = createStageHarness('self-vs-state');
    const rect = createAnimatedRect(graphicService);
    group.appendChild(rect);

    rect.states = {
      hover: { opacity: 0.2 }
    } as any;
    rect.stateAnimateConfig = {
      duration: 100,
      easing: 'linear'
    } as any;

    rect.animate().to({ opacity: 0 }, 100, 'linear');
    tick(ticker, 50);
    expect(rect.attribute.opacity).toBeCloseTo(0.5, 5);

    rect.useStates(['hover'], true);
    tick(ticker, 50);
    expect(rect.attribute.opacity).toBeCloseTo(0.2, 5);

    tick(ticker, 50);
    expect(rect.attribute.opacity).toBeCloseTo(0.2, 5);
    expect((rect as any).baseAttributes.opacity).toBe(1);

    tick(ticker, 50);
    expect(rect.attribute.opacity).toBeCloseTo(0.2, 5);
  });

  test('removeChild and removeAllChild do not crash and prevent late animation writes', () => {
    const { group, ticker, graphicService } = createStageHarness('tree-remove');
    const rect = createAnimatedRect(graphicService);
    const other = createAnimatedRect(graphicService);
    group.appendChild(rect);
    group.appendChild(other);

    rect.animate().to({ x: 100 }, 100, 'linear');
    tick(ticker, 50);
    expect(rect.attribute.x).toBeCloseTo(50, 5);

    expect(() => group.removeChild(rect)).not.toThrow();
    const detachedValue = rect.attribute.x;
    tick(ticker, 50);
    expect(rect.attribute.x).toBe(detachedValue);
    expect((rect as any).baseAttributes.x).toBe(0);

    other.animate().to({ x: 40 }, 100, 'linear');
    tick(ticker, 50);
    expect(() => group.removeAllChild()).not.toThrow();
    const removedValue = other.attribute.x;
    tick(ticker, 50);
    expect(other.attribute.x).toBe(removedValue);
    expect((other as any).baseAttributes.x).toBe(0);
  });

  test('setStage(null) stops stage-bound animations and prevents late writes from the old timeline', () => {
    const stageA = createStageHarness('stage-a');
    const rect = createAnimatedRect(stageA.graphicService);
    stageA.group.appendChild(rect);

    rect.animate().to({ x: 100 }, 100, 'linear');
    tick(stageA.ticker, 50);
    expect(rect.attribute.x).toBeCloseTo(50, 5);

    rect.setStage(null as any, null as any);
    expect(rect.attribute.x).toBe(0);
    tick(stageA.ticker, 50);
    expect(rect.attribute.x).toBe(0);
  });

  test('reparent restores static truth and prevents both old and new stage timelines from writing stale values', () => {
    const stageA = createStageHarness('stage-a');
    const stageB = createStageHarness('stage-b');
    const rect = createAnimatedRect(stageA.graphicService);
    stageA.group.appendChild(rect);

    rect.animate().to({ x: 100 }, 100, 'linear');
    tick(stageA.ticker, 50);
    expect(rect.attribute.x).toBeCloseTo(50, 5);

    stageB.group.appendChild(rect);
    expect(rect.attribute.x).toBe(0);
    tick(stageA.ticker, 50);
    expect(rect.attribute.x).toBe(0);

    tick(stageB.ticker, 50);
    expect(rect.attribute.x).toBe(0);
    expect((rect as any).baseAttributes.x).toBe(0);
  });
});
