const CanvasPkg = require('canvas');
const path = require('path');
const { vglobal, createStage, createPolygon } = require('../../../cjs/index.js');
const { ensureDir, renderAndExportPNG } = require('../export-image/utils');

function main() {
  vglobal.setEnv('node', CanvasPkg);
  const outDir = path.resolve(__dirname, '../export-image');
  ensureDir(outDir);

  const stage = createStage({ width: 600, height: 400, autoRender: false });

  const samples = [
    {
      points: [ { x: 40, y: 40 }, { x: 140, y: 40 }, { x: 90, y: 120 } ],
      fill: '#4a90e2'
    },
    {
      points: [ { x: 220, y: 60 }, { x: 300, y: 40 }, { x: 360, y: 100 }, { x: 280, y: 140 } ],
      fill: '#50e3c2',
      stroke: '#333',
      lineWidth: 2
    }
  ];

  samples.forEach(attrs => stage.defaultLayer.add(createPolygon(attrs)));

  renderAndExportPNG(stage, outDir + '/polygon.png');
}

main();