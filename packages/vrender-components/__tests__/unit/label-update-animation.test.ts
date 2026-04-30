import { application, createText } from '@visactor/vrender-core';
import { DefaultTimeline, ManualTicker, registerAnimate } from '@visactor/vrender-animate';
import { LabelBase } from '../../src/label/base';

class TestLabel extends LabelBase<any> {
  protected render(): void {
    return;
  }

  runUpdate(prevLabel: any, currentLabel: any): void {
    (this as any)._updateLabel(prevLabel, currentLabel);
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
    const prevText = createText(oldAttrs);
    const curText = createText(newAttrs);
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
});
