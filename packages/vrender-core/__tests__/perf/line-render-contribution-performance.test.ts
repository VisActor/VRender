import { createLine } from '../../src/graphic/line';
import { DefaultCanvasLineRender } from '../../src/render/contributions/render/line-render';

declare const process: {
  env: Record<string, string | undefined>;
  stdout: {
    write: (message: string) => void;
  };
};

// 默认跳过，和 attribute-model-performance 一样按需开：VRENDER_LINE_RENDER_PERF=1
const runPerf = process.env.VRENDER_LINE_RENDER_PERF === '1' ? describe : describe.skip;

const POINT_COUNT = 200;
const ITERATIONS = 2000;
const ROUNDS = 9;

function createNoopContext() {
  const noop = (): void => undefined;
  return {
    beginPath: noop,
    closePath: noop,
    moveTo: noop,
    lineTo: noop,
    stroke: noop,
    fill: noop,
    setCommonStyle: noop,
    setStrokeStyle: noop,
    setShadowBlendStyle: noop
  };
}

function createBenchmarkLine() {
  const points: { x: number; y: number }[] = [];
  for (let i = 0; i < POINT_COUNT; i++) {
    points.push({ x: i, y: (i * 7) % 100 });
  }
  return createLine({ points, stroke: '#1664ff', lineWidth: 1, curveType: 'linear' });
}

/** 把两个钩子改成空实现，用来隔离「多出来的那点活」到底值多少 */
class NoHookLineRender extends DefaultCanvasLineRender {
  beforeRenderStep(): void {
    return undefined;
  }
  afterRenderStep(): void {
    return undefined;
  }
}

function warmUp(render: DefaultCanvasLineRender): void {
  const line = createBenchmarkLine();
  const context = createNoopContext();
  for (let i = 0; i < 500; i++) {
    render.drawShape(line as any, context as any, 0, 0, {} as any);
  }
}

function measure(render: DefaultCanvasLineRender): number {
  const line = createBenchmarkLine();
  const context = createNoopContext();
  const start = performance.now();
  for (let i = 0; i < ITERATIONS; i++) {
    render.drawShape(line as any, context as any, 0, 0, {} as any);
  }
  return performance.now() - start;
}

/**
 * 两个变体交替测、各取最小值。
 * 顺序测会把 JIT 预热成本算到先测的那个头上，实测能让开销算出负数。
 */
function compare(a: DefaultCanvasLineRender, b: DefaultCanvasLineRender): { a: number; b: number } {
  warmUp(a);
  warmUp(b);
  let bestA = Infinity;
  let bestB = Infinity;
  for (let round = 0; round < ROUNDS; round++) {
    bestA = Math.min(bestA, measure(a));
    bestB = Math.min(bestB, measure(b));
  }
  return { a: bestA, b: bestB };
}

runPerf('line render contribution overhead on the high-performance path', () => {
  it('measures the cost added by the render contribution hooks', () => {
    const emptyProvider = { getContributions: (): any[] => [] } as any;
    // init() 无条件塞两个内置裁剪贡献，所以「没有自定义贡献」并不是空列表
    const withHooks = new DefaultCanvasLineRender(emptyProvider);
    const withoutHooks = new NoHookLineRender(emptyProvider);

    expect((withHooks as any)._beforeRenderContribitions.length).toBe(1);
    expect((withHooks as any)._afterRenderContribitions.length).toBe(1);

    const { a: baseline, b: actual } = compare(withoutHooks, withHooks);

    process.stdout.write(
      JSON.stringify({
        benchmark: 'line-render-contribution-overhead',
        pointCount: POINT_COUNT,
        iterations: ITERATIONS,
        rounds: ROUNDS,
        hooksStubbedMinMs: Number(baseline.toFixed(3)),
        hooksActiveMinMs: Number(actual.toFixed(3)),
        overheadPerDrawUs: Number((((actual - baseline) / ITERATIONS) * 1000).toFixed(4)),
        overheadPct: Number((((actual - baseline) / baseline) * 100).toFixed(2))
      }) + '\n'
    );

    expect(actual).toBeGreaterThan(0);
  });
});
