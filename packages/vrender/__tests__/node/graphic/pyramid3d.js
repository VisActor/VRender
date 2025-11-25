const CanvasPkg = require('canvas');
const path = require('path');
const { vglobal, createStage, createPyramid3d } = require('../../../cjs/index.js');
const { ensureDir, renderAndExportPNG } = require('../export-image/utils');

function main() {
  vglobal.setEnv('node', CanvasPkg);
  const outDir = path.resolve(__dirname, '../export-image');
  ensureDir(outDir);

  const stage = createStage({ width: 600, height: 400, autoRender: false });

  const samples = [
    {
      points: [ { x: 80, y: 80 }, { x: 160, y: 60 }, { x: 180, y: 140 }, { x: 100, y: 160 } ],
      fill: '#4a90e2'
    },
    {
      points: [ { x: 260, y: 100 }, { x: 340, y: 80 }, { x: 360, y: 160 }, { x: 280, y: 180 } ],
      fill: '#50e3c2'
    }
  ];

  samples.forEach(attrs => stage.defaultLayer.add(createPyramid3d(attrs)));

  renderAndExportPNG(stage, outDir + '/pyramid3d.png');
}

main();