const CanvasPkg = require('canvas');
const path = require('path');
const { vglobal, createStage, createImage } = require('../../../cjs/index.js');
const { ensureDir, renderAndExportPNG } = require('../export-image/utils');

function main() {
  vglobal.setEnv('node', CanvasPkg);
  const outDir = path.resolve(__dirname, '../export-image');
  ensureDir(outDir);

  const stage = createStage({ width: 600, height: 400, autoRender: false });

  const localImgPath = path.resolve(__dirname, '../../browser/src/node/image.png');

  const img = createImage({
    x: 60,
    y: 60,
    width: 200,
    height: 200,
    image: localImgPath
  });

  img.successCallback = () => {
    stage.render();
    renderAndExportPNG(stage, outDir + '/image.png');
  };

  stage.defaultLayer.add(img);
  stage.render();
}

main();