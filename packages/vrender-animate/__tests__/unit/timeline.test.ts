import { AnimateStatus } from '@visactor/vrender-core';
import { DefaultTimeline } from '../../src/timeline';

type TestAnimate = {
  status: AnimateStatus;
  getStartTime: jest.Mock<number, []>;
  getDuration: jest.Mock<number, []>;
  advance: jest.Mock<void, [number]>;
  release: jest.Mock<void, []>;
  _onRemove?: Array<() => void>;
};

function createAnimate(partial?: Partial<TestAnimate>): TestAnimate {
  return {
    status: AnimateStatus.INITIAL,
    getStartTime: jest.fn(() => 0),
    getDuration: jest.fn(() => 100),
    advance: jest.fn(),
    release: jest.fn(),
    _onRemove: [jest.fn()],
    ...partial
  };
}

describe('vrender-animate DefaultTimeline', () => {
  test('addAnimate + tick + removeAnimate + totalDuration', () => {
    const timeline = new DefaultTimeline();

    const animationStart = jest.fn();
    const animationEnd = jest.fn();
    timeline.on('animationStart', animationStart);
    timeline.on('animationEnd', animationEnd);

    const animate1 = createAnimate({
      getStartTime: jest.fn(() => 0),
      getDuration: jest.fn(() => 100)
    });
    const animate2 = createAnimate({
      getStartTime: jest.fn(() => 50),
      getDuration: jest.fn(() => 200)
    });

    expect(timeline.animateCount).toBe(0);
    expect(timeline.isRunning()).toBe(false);

    timeline.addAnimate(animate1 as any);
    timeline.addAnimate(animate2 as any);

    expect(timeline.animateCount).toBe(2);
    expect(timeline.getTotalDuration()).toBe(250);
    expect(timeline.isRunning()).toBe(true);

    timeline.tick(10);
    expect(animationStart).toHaveBeenCalledTimes(1);
    expect(animate1.advance).toHaveBeenCalledWith(10);
    expect(animate2.advance).toHaveBeenCalledWith(10);

    // 移除一个动画
    timeline.removeAnimate(animate1 as any);
    expect(timeline.animateCount).toBe(1);
    expect(animate1.release).toHaveBeenCalledTimes(1);

    // 让剩余动画结束：tick 会触发 removeAnimate(animate, true)
    animate2.status = AnimateStatus.END;
    timeline.tick(10);

    expect(timeline.animateCount).toBe(0);
    expect(animationEnd).toHaveBeenCalledTimes(1);
    expect(animate2.release).toHaveBeenCalledTimes(1);
  });

  test('playSpeed scales delta; pause blocks tick', () => {
    const timeline = new DefaultTimeline();
    const animate = createAnimate({ status: AnimateStatus.RUNNING });
    timeline.addAnimate(animate as any);

    timeline.setPlaySpeed(2);
    timeline.tick(10);
    expect(animate.advance).toHaveBeenCalledWith(20);

    timeline.pause();
    timeline.tick(10);
    expect(animate.advance).toHaveBeenCalledTimes(1);

    timeline.resume();
    timeline.tick(5);
    expect(animate.advance).toHaveBeenCalledWith(10);
  });
});
