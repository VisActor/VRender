const path = require('path');
const { createRect3d } = require('../../../cjs/index.js');
const { createNodeTestStage } = require('../create-stage');
const { ensureDir, renderAndExportPNG } = require('../export-image/utils');

function main() {
  const outDir = path.resolve(__dirname, '../export-image');
  ensureDir(outDir);

  const stage = createNodeTestStage({ width: 600, height: 400, autoRender: false });

  const samples = [
    { x: 80, y: 80, width: 120, height: 80, length: 40, fill: '#4a90e2' },
    { x: 260, y: 100, width: 160, height: 100, length: 60, fill: '#50e3c2' }
  ];

  samples.forEach(attrs => stage.defaultLayer.add(createRect3d(attrs)));

  renderAndExportPNG(stage, outDir + '/rect3d.png');
}

main();
