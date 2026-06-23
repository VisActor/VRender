import { createRect } from '../../src/graphic/rect';

declare const process: {
  env: Record<string, string | undefined>;
  stdout: {
    write: (message: string) => void;
  };
};

const runPerf = process.env.VRENDER_D3_ATTR_PERF === '1' ? describe : describe.skip;

function timeLoop(label: string, fn: () => void): number {
  const start = performance.now();
  fn();
  const duration = performance.now() - start;
  process.stdout.write(`${label}: ${duration.toFixed(3)}ms\n`);
  return duration;
}

function createBenchmarkRect(index = 0) {
  const rect = createRect({
    x: index % 1000,
    y: (index * 3) % 800,
    width: 10 + (index % 9),
    height: 12 + (index % 7),
    fill: index % 2 ? '#1664ff' : '#ff8a00',
    stroke: '#222',
    lineWidth: 1,
    opacity: 1,
    visible: true
  });
  jest.spyOn(rect as any, 'getGraphicService').mockReturnValue({
    onAttributeUpdate: jest.fn(),
    onSetStage: jest.fn()
  });
  return rect;
}

function report(benchmark: string, details: Record<string, unknown>) {
  process.stdout.write(JSON.stringify({ benchmark, ...details }) + '\n');
}

runPerf('D3 attribute model performance baseline', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('ordinary setAttributes without state reports hot path cost', () => {
    const graphicCount = Number(process.env.VRENDER_D3_ATTR_GRAPHICS ?? 10_000);
    const iterations = Number(process.env.VRENDER_D3_ATTR_ITERATIONS ?? 20);
    const maxMs =
      process.env.VRENDER_D3_ATTR_MAX_SET_MS == null
        ? Number.POSITIVE_INFINITY
        : Number(process.env.VRENDER_D3_ATTR_MAX_SET_MS);
    const graphics = Array.from({ length: graphicCount }, (_, index) => createBenchmarkRect(index));

    const duration = timeLoop('d3-ordinary-setAttributes', () => {
      for (let r = 0; r < iterations; r++) {
        const attrs = r % 2 ? { x: 10, y: 20, fill: '#8d72f6' } : { x: 30, y: 40, fill: '#51d5e6' };
        for (let i = 0; i < graphics.length; i++) {
          graphics[i].setAttributes(attrs);
        }
      }
    });

    report('ordinary-setAttributes', {
      graphicCount,
      iterations,
      writes: graphicCount * iterations,
      durationMs: Number(duration.toFixed(3)),
      maxMs: Number.isFinite(maxMs) ? maxMs : null
    });
    expect(duration).toBeLessThanOrEqual(maxMs);
  });

  test('state switch without animation reports resolved patch cost', () => {
    const graphicCount = Number(process.env.VRENDER_D3_ATTR_GRAPHICS ?? 10_000);
    const iterations = Number(process.env.VRENDER_D3_ATTR_ITERATIONS ?? 20);
    const maxMs =
      process.env.VRENDER_D3_ATTR_MAX_STATE_MS == null
        ? Number.POSITIVE_INFINITY
        : Number(process.env.VRENDER_D3_ATTR_MAX_STATE_MS);
    const graphics = Array.from({ length: graphicCount }, (_, index) => {
      const rect = createBenchmarkRect(index);
      rect.states = {
        hover: { fill: '#f00', lineWidth: 2 },
        selected: { fill: '#0f0', opacity: 0.6 }
      } as any;
      return rect;
    });

    const duration = timeLoop('d3-state-switch-no-animation', () => {
      for (let r = 0; r < iterations; r++) {
        const states = r % 2 ? ['hover'] : ['selected'];
        for (let i = 0; i < graphics.length; i++) {
          graphics[i].useStates(states, false);
        }
      }
    });

    report('state-switch-no-animation', {
      graphicCount,
      iterations,
      switches: graphicCount * iterations,
      durationMs: Number(duration.toFixed(3)),
      maxMs: Number.isFinite(maxMs) ? maxMs : null
    });
    expect(duration).toBeLessThanOrEqual(maxMs);
  });

  test('state switch with animation setup reports complex-path cost', () => {
    const graphicCount = Number(process.env.VRENDER_D3_ATTR_GRAPHICS ?? 10_000);
    const iterations = Number(process.env.VRENDER_D3_ATTR_ITERATIONS ?? 20);
    const maxMs =
      process.env.VRENDER_D3_ATTR_MAX_STATE_ANIM_MS == null
        ? Number.POSITIVE_INFINITY
        : Number(process.env.VRENDER_D3_ATTR_MAX_STATE_ANIM_MS);
    const graphics = Array.from({ length: graphicCount }, (_, index) => {
      const rect = createBenchmarkRect(index);
      rect.states = {
        hover: { fill: '#f00', lineWidth: 2 },
        selected: { fill: '#0f0', opacity: 0.6 }
      } as any;
      (rect as any).applyAnimationState = jest.fn();
      return rect;
    });

    const duration = timeLoop('d3-state-switch-animation-setup', () => {
      for (let r = 0; r < iterations; r++) {
        const states = r % 2 ? ['hover'] : ['selected'];
        for (let i = 0; i < graphics.length; i++) {
          graphics[i].useStates(states, true);
        }
      }
    });

    report('state-switch-animation-setup', {
      graphicCount,
      iterations,
      switches: graphicCount * iterations,
      durationMs: Number(duration.toFixed(3)),
      maxMs: Number.isFinite(maxMs) ? maxMs : null
    });
    expect(duration).toBeLessThanOrEqual(maxMs);
  });
});
