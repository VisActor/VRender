const path = require('path');
const { createImage } = require('../../../cjs/index.js');
const { createNodeTestStage } = require('../create-stage');
const { ensureDir, renderAndExportPNG } = require('../export-image/utils');

function main() {
  const outDir = path.resolve(__dirname, '../export-image');
  ensureDir(outDir);

  const stage = createNodeTestStage({ width: 600, height: 400, autoRender: false });

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
