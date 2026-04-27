import { createGroup, createRect } from '@visactor/vrender-core';
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
  animationRuntimeRegistered = true;
}

function createGraphicServiceStub() {
  return {
    onAttributeUpdate: jest.fn(),
    onSetStage: jest.fn(),
    onRemove: jest.fn(),
    onAddIncremental: jest.fn(),
    onClearIncremental: jest.fn(),
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
    expect(rect.attribute.opacity).toBeCloseTo(0.8, 5);

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
