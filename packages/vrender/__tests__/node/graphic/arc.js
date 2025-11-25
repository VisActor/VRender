const CanvasPkg = require('canvas');
const path = require('path');
const { vglobal, createStage, createArc } = require('../../../cjs/index.js');
const { ensureDir, renderAndExportPNG } = require('../export-image/utils');

function main() {
  vglobal.setEnv('node', CanvasPkg);
  const outDir = path.resolve(__dirname, '../export-image');
  ensureDir(outDir);

  const stage = createStage({ width: 600, height: 400, autoRender: false });

  const samples = [
    { x: 100, y: 100, innerRadius: 20, outerRadius: 40, startAngle: 0, endAngle: Math.PI, fill: '#4a90e2' },
    { x: 240, y: 100, innerRadius: 10, outerRadius: 50, startAngle: Math.PI / 4, endAngle: (3 * Math.PI) / 2, fill: '#50e3c2' },
    { x: 380, y: 100, innerRadius: 30, outerRadius: 60, startAngle: 0, endAngle: Math.PI * 2, stroke: '#333', lineWidth: 4 },
    { x: 100, y: 220, innerRadius: 30, outerRadius: 80, startAngle: 0, endAngle: Math.PI * 2, fill: '#f5a623' },
    { x: 260, y: 220, innerRadius: 40, outerRadius: 70, startAngle: 0, endAngle: Math.PI, stroke: '#d0021b', lineWidth: 6 },
    { x: 420, y: 220, innerRadius: 20, outerRadius: 80, startAngle: Math.PI / 2, endAngle: Math.PI * 2, fill: '#7ed321', stroke: '#000', lineWidth: 2 }
  ];

  samples.forEach(attrs => stage.defaultLayer.add(createArc(attrs)));

  renderAndExportPNG(stage, outDir + '/arc.png');
}

main();