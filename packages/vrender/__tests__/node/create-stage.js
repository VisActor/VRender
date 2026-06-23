const CanvasPkg = require('canvas');
const { createNodeVRenderApp, vglobal } = require('../../cjs/index.js');

function createNodeTestStage(params) {
  vglobal.setEnv('node', CanvasPkg);

  const app = createNodeVRenderApp();
  const stage = app.createStage(params);
  const release = stage.release.bind(stage);

  stage.release = () => {
    release();
    app.release();
  };

  return stage;
}

module.exports = { createNodeTestStage };
