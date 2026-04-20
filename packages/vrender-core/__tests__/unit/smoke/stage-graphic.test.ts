declare const require: any;
export {};

describe('smoke: stage & graphic (app-scoped node helper)', () => {
  test('createStage + add rect + render does not throw', () => {
    jest.isolateModules(() => {
      const { createNodeSmokeStage } = require('./node-smoke-stage');
      const { createRect } = require('../../../src/graphic/rect');

      const stage = createNodeSmokeStage({
        width: 200,
        height: 100,
        autoRender: false,
        autoRefresh: false,
        disableDirtyBounds: true,
        background: 'transparent'
      });

      const rect = createRect({ x: 10, y: 20, width: 30, height: 40, fill: 'red' });
      stage.defaultLayer.add(rect);

      stage.render();
      stage.resize(300, 150);
      stage.release();
    });
  });
});
