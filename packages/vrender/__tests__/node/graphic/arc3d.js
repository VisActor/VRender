const path = require('path');
const { createArc3d } = require('../../../cjs/index.js');
const { createNodeTestStage } = require('../create-stage');
const { ensureDir, renderAndExportPNG } = require('../export-image/utils');

function main() {
  const outDir = path.resolve(__dirname, '../export-image');
  ensureDir(outDir);

  const stage = createNodeTestStage({ width: 600, height: 400, autoRender: false });

  const samples = [
    { x: 120, y: 140, innerRadius: 20, outerRadius: 60, startAngle: 0, endAngle: Math.PI, height: 20, fill: '#4a90e2' },
    { x: 320, y: 140, innerRadius: 10, outerRadius: 50, startAngle: Math.PI / 4, endAngle: (3 * Math.PI) / 2, height: 30, fill: '#50e3c2' }
  ];

  samples.forEach(attrs => stage.defaultLayer.add(createArc3d(attrs)));

  renderAndExportPNG(stage, outDir + '/arc3d.png');
}

main();
