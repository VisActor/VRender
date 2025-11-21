const CanvasPkg = require('canvas');
const path = require('path');
const { vglobal, createStage, createPath } = require('../../../cjs/index.js');
const { ensureDir, renderAndExportPNG } = require('../export-image/utils');

function main() {
  vglobal.setEnv('node', CanvasPkg);
  const outDir = path.resolve(__dirname, '../export-image');
  ensureDir(outDir);

  const stage = createStage({ width: 600, height: 400, autoRender: false });

  const samples = [
    { x: 60, y: 60, path: 'M0,0 L100,0 L100,100 L0,100 Z', fill: '#4a90e2' },
    { x: 220, y: 60, path: 'M0,50 C40,-20 60,120 100,50', stroke: '#d0021b', lineWidth: 3 },
    { x: 380, y: 60, path: 'M0,0 A50,50 0 1,1 0,100 A50,50 0 1,1 0,0', fill: '#50e3c2', lineWidth: 2 }
  ];

  samples.forEach(attrs => stage.defaultLayer.add(createPath(attrs)));

  renderAndExportPNG(stage, outDir + '/path.png');
}

main();