const CanvasPkg = require('canvas');
const path = require('path');
const { vglobal, createStage, createArc3d } = require('../../../cjs/index.js');
const { ensureDir, renderAndExportPNG } = require('../export-image/utils');

function main() {
  vglobal.setEnv('node', CanvasPkg);
  const outDir = path.resolve(__dirname, '../export-image');
  ensureDir(outDir);

  const stage = createStage({ width: 600, height: 400, autoRender: false });

  const samples = [
    { x: 120, y: 140, innerRadius: 20, outerRadius: 60, startAngle: 0, endAngle: Math.PI, height: 20, fill: '#4a90e2' },
    { x: 320, y: 140, innerRadius: 10, outerRadius: 50, startAngle: Math.PI / 4, endAngle: (3 * Math.PI) / 2, height: 30, fill: '#50e3c2' }
  ];

  samples.forEach(attrs => stage.defaultLayer.add(createArc3d(attrs)));

  renderAndExportPNG(stage, outDir + '/arc3d.png');
}

main();