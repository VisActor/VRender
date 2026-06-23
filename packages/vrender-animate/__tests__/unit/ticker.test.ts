import { DefaultTicker } from '../../src/ticker/default-ticker';
import { ManualTicker } from '../../src/ticker/manual-ticker';
import { defaultTicker, defaultTimeline } from '../../src/index';

describe('vrender-animate Ticker', () => {
  test('DefaultTicker interval/FPS setters', () => {
    const randomSpy = jest.spyOn(Math, 'random').mockReturnValue(0.5);

    const ticker = new DefaultTicker();

    ticker.setInterval(20);
    expect(ticker.getInterval()).toBe(20);
    expect(ticker.getFPS()).toBeCloseTo(50);

    ticker.setFPS(25);
    expect(ticker.getFPS()).toBeCloseTo(25);

    ticker.release();
    randomSpy.mockRestore();
  });

  test('ManualTicker advances time and start() is idempotent', () => {
    const ticker = new ManualTicker();
    // DefaultTicker 只有在 env 已设置的情况下才会自动创建 handler；这里显式初始化一次
    // @ts-ignore
    ticker.setupTickHandler();
    ticker.autoStop = false;

    ticker.tickAt(100);
    expect(ticker.getTime()).toBe(100);

    // already RUNNING
    expect(ticker.start()).toBe(false);

    ticker.release();
  });

  test('defaultTicker is exported and wired to defaultTimeline', () => {
    expect(defaultTicker).toBeInstanceOf(DefaultTicker);
    expect(defaultTicker.getTimelines()).toContain(defaultTimeline);
  });
});
