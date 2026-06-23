import { WxEnvContribution } from '../../src/env/contributions/wx-contribution';
import { WxWindowHandlerContribution } from '../../src/window/contributions/wx-contribution';

describe('wx window event contribution', () => {
  test('normalizes forwarded miniapp event target to native canvas', () => {
    const nativeCanvas = { id: 'vrender-main' };
    const handler = new WxWindowHandlerContribution();
    (handler as any).canvas = { nativeCanvas };

    const listener = jest.fn();
    handler.addEventListener('touchmove', listener);

    const event = {
      type: 'touchmove',
      target: { id: 'wx-event-target' },
      currentTarget: { id: 'wx-current-target' },
      touches: [{ x: 12, y: 24 }],
      changedTouches: [{ x: 12, y: 24 }]
    };

    expect(handler.dispatchEvent(event)).toBe(true);
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener.mock.calls[0][0].target).toBe(nativeCanvas);
    expect(listener.mock.calls[0][0].currentTarget).toBe(nativeCanvas);
    expect(listener.mock.calls[0][0].offsetX).toBe(12);
    expect(listener.mock.calls[0][0].changedTouches[0].clientY).toBe(24);
  });

  test('reports unsupported svg loading as a failed result', async () => {
    const env = new WxEnvContribution();

    await expect(env.loadSvg('<svg></svg>')).resolves.toEqual({
      data: null,
      loadState: 'fail'
    });
  });
});
