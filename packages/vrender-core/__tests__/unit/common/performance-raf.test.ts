declare var require: any;

describe('common/performance-raf', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  test('dedup schedule and run callbacks next frame', () => {
    jest.isolateModules(() => {
      const scheduled: FrameRequestCallback[] = [];
      const raf = jest.fn((cb: FrameRequestCallback) => {
        scheduled.push(cb);
        return 100;
      });

      const app = {
        global: {
          getRequestAnimationFrame: () => raf
        }
      };

      jest.doMock('../../../src/application', () => ({ application: app }));

      const { PerformanceRAF } = require('../../../src/common/performance-raf');
      const { application } = require('../../../src/application');

      const pr = new PerformanceRAF();
      const cb1 = jest.fn();
      const cb2 = jest.fn();

      pr.addAnimationFrameCb(cb1);
      pr.addAnimationFrameCb(cb2);

      expect(application.global.getRequestAnimationFrame()).toBe(raf);
      expect(raf).toHaveBeenCalledTimes(1);

      scheduled[0](16);
      expect(cb1).toHaveBeenCalledWith(16);
      expect(cb2).toHaveBeenCalledWith(16);

      pr.addAnimationFrameCb(jest.fn());
      expect(raf).toHaveBeenCalledTimes(2);
    });
  });

  test('removeAnimationFrameCb returns boolean', () => {
    jest.isolateModules(() => {
      const raf = jest.fn(() => 1);
      const app = {
        global: {
          getRequestAnimationFrame: () => raf
        }
      };
      jest.doMock('../../../src/application', () => ({ application: app }));

      const { PerformanceRAF } = require('../../../src/common/performance-raf');

      const pr = new PerformanceRAF();
      const id = pr.addAnimationFrameCb(jest.fn());

      expect(pr.removeAnimationFrameCb(id)).toBe(true);
      expect(pr.removeAnimationFrameCb(id)).toBe(false);
    });
  });

  test('tryRunAnimationFrameNextFrame does nothing when queue empty', () => {
    jest.isolateModules(() => {
      const raf = jest.fn(() => 1);
      const app = {
        global: {
          getRequestAnimationFrame: () => raf
        }
      };
      jest.doMock('../../../src/application', () => ({ application: app }));

      const { PerformanceRAF } = require('../../../src/common/performance-raf');

      const pr = new PerformanceRAF();
      (pr as any).tryRunAnimationFrameNextFrame();
      expect(raf).not.toHaveBeenCalled();
    });
  });
});
