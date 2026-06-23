export {};

declare const require: (id: string) => any;

describe('util/event', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  test('browser env uses pointercancel', () => {
    jest.isolateModules(() => {
      jest.doMock('@visactor/vrender-core/global', () => ({
        vglobal: { env: 'browser' }
      }));

      const { getEndTriggersOfDrag } = require('../../../src/util/event');
      expect(getEndTriggersOfDrag()).toEqual(['pointerup', 'pointerleave', 'pointercancel']);
    });
  });

  test('non-browser env uses pointerupoutside', () => {
    jest.isolateModules(() => {
      jest.doMock('@visactor/vrender-core/global', () => ({
        vglobal: { env: 'node' }
      }));

      const { getEndTriggersOfDrag } = require('../../../src/util/event');
      expect(getEndTriggersOfDrag()).toEqual(['pointerup', 'pointerleave', 'pointerupoutside']);
    });
  });
});
