const CanvasPkg = require('canvas');
const path = require('path');
const { vglobal, createStage, createStar } = require('../../../cjs/index.js');
const { ensureDir, renderAndExportPNG } = require('../export-image/utils');

function main() {
  vglobal.setEnv('node', CanvasPkg);
  const outDir = path.resolve(__dirname, '../export-image');
  ensureDir(outDir);

  const stage = createStage({ width: 600, height: 400, autoRender: false });

  const samples = [
    { x: 60, y: 60, width: 120, height: 120, spikes: 5, thickness: 0.4, fill: '#4a90e2' },
    { x: 220, y: 60, width: 160, height: 120, spikes: 7, thickness: 0.2, fill: '#50e3c2' },
    { x: 400, y: 60, width: 120, height: 160, spikes: 8, thickness: 0.3, stroke: '#333', lineWidth: 2 }
  ];

  samples.forEach(attrs => stage.defaultLayer.add(createStar(attrs)));

  renderAndExportPNG(stage, outDir + '/star.png');
}

main();