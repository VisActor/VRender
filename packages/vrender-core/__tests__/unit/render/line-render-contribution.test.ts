import { createLine } from '../../../src/graphic/line';
import { DefaultCanvasLineRender } from '../../../src/render/contributions/render/line-render';
import { DefaultIncrementalCanvasLineRender } from '../../../src/render/contributions/render/incremental-line-render';
import { BaseRenderContributionTime } from '../../../src/common/enums';

type RecordingContext = ReturnType<typeof createRecordingContext>;

/** 记录画布调用序列，用来判「最后 stroke 的到底是折线还是裁剪形状」 */
function createRecordingContext() {
  const calls: string[] = [];
  const record = (name: string) => (): void => {
    calls.push(name);
  };
  return {
    calls,
    beginPath: record('beginPath'),
    closePath: record('closePath'),
    moveTo: record('moveTo'),
    lineTo: record('lineTo'),
    rect: record('rect'),
    clip: record('clip'),
    save: record('save'),
    restore: record('restore'),
    fill: record('fill'),
    stroke: record('stroke'),
    setCommonStyle: jest.fn(),
    setStrokeStyle: jest.fn(),
    setShadowBlendStyle: jest.fn(),
    nativeContext: {
      moveTo: record('moveTo'),
      lineTo: record('lineTo'),
      closePath: record('closePath')
    }
  };
}

function createRender(contributions: any[] = []) {
  return new DefaultCanvasLineRender({ getContributions: () => contributions } as any);
}

/** 画布调用序列里，最后一次 stroke 之前那一段路径指令 */
function pathBeforeLastStroke(context: RecordingContext) {
  const strokeAt = context.calls.lastIndexOf('stroke');
  const beginAt = context.calls.lastIndexOf('beginPath', strokeAt);
  return context.calls.slice(beginAt, strokeAt);
}

describe('line render contributions', () => {
  it('keeps the base drawing sequence when no contribution is registered', () => {
    const line = createLine({
      points: [
        { x: 0, y: 0 },
        { x: 10, y: 10 },
        { x: 20, y: 0 }
      ],
      stroke: '#000',
      lineWidth: 1
    });
    const context = createRecordingContext();

    createRender().drawShape(line as any, context as any, 0, 0, {} as any);

    expect(context.calls).toEqual(['beginPath', 'moveTo', 'lineTo', 'lineTo', 'stroke']);
    expect(context.calls).not.toContain('clip');
  });

  it('strokes the line itself, not the clip shape, when clipConfig is set', () => {
    const line = createLine({
      points: [
        { x: 0, y: 0 },
        { x: 10, y: 10 },
        { x: 20, y: 0 }
      ],
      stroke: '#000',
      lineWidth: 1,
      clipConfig: { shape: 'rect' }
    } as any);
    // 只关心内置裁剪贡献会 beginPath 冲掉图元路径这件事，裁剪形状本身用最小桩
    Object.defineProperty(line, 'AABBBounds', {
      get: () => ({ width: () => 20, height: () => 20 })
    });
    (line as any).getClipPath = () => ({
      draw: (ctx: any) => {
        ctx.rect(0, 0, 20, 20);
        return true;
      }
    });
    const context = createRecordingContext();

    createRender().drawShape(line as any, context as any, 0, 0, {} as any);

    expect(context.calls).toContain('clip');
    // 裁剪生效之后重建了折线路径，stroke 画的是折线而不是裁剪矩形
    expect(pathBeforeLastStroke(context)).toEqual(['beginPath', 'moveTo', 'lineTo', 'lineTo']);
    expect(pathBeforeLastStroke(context)).not.toContain('rect');
  });

  it('passes computed visibility booleans rather than opacity numbers', () => {
    const drawShape = jest.fn();
    const line = createLine({
      points: [
        { x: 0, y: 0 },
        { x: 10, y: 10 }
      ],
      fill: false,
      stroke: '#000',
      strokeOpacity: 0.5,
      lineWidth: 1
    });
    const context = createRecordingContext();

    createRender([
      { time: BaseRenderContributionTime.beforeFillStroke, useStyle: false, order: 1, drawShape }
    ]).drawShape(line as any, context as any, 0, 0, {} as any);

    expect(drawShape).toHaveBeenCalledTimes(1);
    const [, , , , doFill, doStroke, fVisible, sVisible] = drawShape.mock.calls[0];
    expect([doFill, doStroke, fVisible, sVisible]).toEqual([false, true, false, true]);
  });

  it('exposes the active segment attributes to per-segment contributions', () => {
    const drawShape = jest.fn();
    const line = createLine({
      stroke: '#000',
      lineWidth: 1,
      segments: [
        {
          points: [
            { x: 0, y: 0 },
            { x: 10, y: 10 }
          ],
          stroke: 'red'
        },
        {
          points: [
            { x: 10, y: 10 },
            { x: 20, y: 0 }
          ],
          stroke: 'blue'
        }
      ]
    } as any);
    const context = createRecordingContext();

    createRender([
      { time: BaseRenderContributionTime.beforeFillStroke, useStyle: false, order: 1, drawShape }
    ]).drawShape(line as any, context as any, 0, 0, {} as any);

    const strokes = drawShape.mock.calls.map(args => args[args.length - 1]?.attribute?.stroke);
    expect(strokes).toEqual(['red', 'blue']);
  });

  it('wires contributions through the incremental renderer', () => {
    const drawShape = jest.fn();
    const afterDrawShape = jest.fn();
    const render = new DefaultIncrementalCanvasLineRender({
      getContributions: () => [
        { time: BaseRenderContributionTime.beforeFillStroke, useStyle: false, order: 1, drawShape },
        {
          time: BaseRenderContributionTime.afterFillStroke,
          useStyle: false,
          order: 1,
          drawShape: afterDrawShape
        }
      ]
    } as any);
    const line = createLine({
      stroke: '#000',
      lineWidth: 1,
      segments: [
        {
          points: [
            { x: 0, y: 0 },
            { x: 10, y: 10 }
          ]
        },
        {
          points: [
            { x: 10, y: 10 },
            { x: 20, y: 0 }
          ]
        }
      ]
    } as any);
    (line as any).incremental = 1;
    const context = createRecordingContext();

    render.drawShape(line as any, context as any, 0, 0, {
      context,
      multiGraphicOptions: { startAtIdx: 1, length: 1 }
    } as any);

    expect(context.calls).toContain('stroke');
    expect(drawShape).toHaveBeenCalledTimes(1);
    expect(afterDrawShape).toHaveBeenCalledTimes(1);
    const [, , , , doFill, doStroke, fVisible, sVisible] = drawShape.mock.calls[0];
    expect([doFill, doStroke, fVisible, sVisible]).toEqual([false, true, false, true]);
  });
});
