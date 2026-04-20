const path = require('path');
const { createGroup, createRect, createCircle, createText } = require('../../../cjs/index.js');
const { createNodeTestStage } = require('../create-stage');
const { ensureDir, renderAndExportPNG } = require('../export-image/utils');

function main() {
  const outDir = path.resolve(__dirname, '../export-image');
  ensureDir(outDir);

  const stage = createNodeTestStage({ width: 600, height: 400, autoRender: false });

  const group = createGroup({ x: 60, y: 60, width: 240, height: 180, stroke: '#333', lineWidth: 2 });
  const rect = createRect({ x: 20, y: 20, width: 100, height: 60, fill: '#4a90e2' });
  const circle = createCircle({ x: 160, y: 50, radius: 30, startAngle: 0, endAngle: Math.PI * 2, fill: '#f5a623' });
  const label = createText({ x: 120, y: 150, text: 'Group', textAlign: 'center', textBaseline: 'middle', fontSize: 16, fill: '#333' });

  group.add(rect);
  group.add(circle);
  group.add(label);

  stage.defaultLayer.add(group);

  renderAndExportPNG(stage, outDir + '/group.png');
}

main();
