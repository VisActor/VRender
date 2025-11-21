const CanvasPkg = require('canvas');
const path = require('path');
const { vglobal, createStage, createCircle } = require('../../../cjs/index.js');
const { ensureDir, renderAndExportPNG } = require('../export-image/utils');

function main() {
  vglobal.setEnv('node', CanvasPkg);
  const outDir = path.resolve(__dirname, '../export-image');
  ensureDir(outDir);

  const stage = createStage({ width: 600, height: 400, autoRender: false });

  const samples = [
    { x: 80, y: 80, radius: 40, startAngle: 0, endAngle: Math.PI * 2, fill: '#4a90e2' },
    { x: 200, y: 80, radius: 40, startAngle: 0, endAngle: Math.PI, fill: '#50e3c2' },
    { x: 320, y: 80, radius: 40, startAngle: Math.PI / 4, endAngle: (3 * Math.PI) / 2, stroke: '#333', lineWidth: 4 },
    { x: 80, y: 200, radius: 60, startAngle: 0, endAngle: Math.PI * 2, fill: '#f5a623' },
    { x: 220, y: 220, radius: 30, startAngle: 0, endAngle: Math.PI * 2, stroke: '#d0021b', lineWidth: 6 },
    { x: 340, y: 220, radius: 50, startAngle: 0, endAngle: Math.PI * 2, fill: '#7ed321', stroke: '#000', lineWidth: 2 }
  ];

  samples.forEach(attrs => stage.defaultLayer.add(createCircle(attrs)));

  renderAndExportPNG(stage, outDir + '/circle.png');
}

main();