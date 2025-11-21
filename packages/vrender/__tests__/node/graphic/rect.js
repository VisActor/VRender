const CanvasPkg = require('canvas');
const path = require('path');
const { vglobal, createStage, createRect } = require('../../../cjs/index.js');
const { ensureDir, renderAndExportPNG } = require('../export-image/utils');

function main() {
  vglobal.setEnv('node', CanvasPkg);
  const outDir = path.resolve(__dirname, '../export-image');
  ensureDir(outDir);

  const stage = createStage({ width: 600, height: 400, autoRender: false });

  const samples = [
    { x: 40, y: 40, width: 120, height: 80, fill: '#4a90e2' },
    { x: 200, y: 40, width: 120, height: 80, fill: '#50e3c2', cornerRadius: 12 },
    { x: 360, y: 40, width: 120, height: 80, fill: '#f5a623', stroke: '#333', lineWidth: 4 },
    { x: 40, y: 160, width: 120, height: 120, fill: '#9013fe', cornerRadius: 24 },
    { x: 200, y: 160, width: 120, height: 120, stroke: '#d0021b', lineWidth: 6 },
    { x: 360, y: 160, width: 120, height: 120, fill: '#7ed321', stroke: '#000', lineWidth: 2 }
  ];

  samples.forEach(attrs => stage.defaultLayer.add(createRect(attrs)));

  renderAndExportPNG(stage, outDir + '/rect.png');
}

main();