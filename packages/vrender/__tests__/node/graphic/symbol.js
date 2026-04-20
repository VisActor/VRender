const path = require('path');
const { createSymbol } = require('../../../cjs/index.js');
const { createNodeTestStage } = require('../create-stage');
const { ensureDir, renderAndExportPNG } = require('../export-image/utils');

function main() {
  const outDir = path.resolve(__dirname, '../export-image');
  ensureDir(outDir);

  const stage = createNodeTestStage({ width: 600, height: 400, autoRender: false });

  const samples = [
    { x: 80, y: 80, symbolType: 'circle', size: 60, fill: '#4a90e2' },
    { x: 180, y: 80, symbolType: 'cross', size: 60, stroke: '#d0021b', lineWidth: 4 },
    { x: 280, y: 80, symbolType: 'diamond', size: 60, fill: '#50e3c2' },
    { x: 380, y: 80, symbolType: 'square', size: 60, fill: '#f5a623' }
  ];

  samples.forEach(attrs => stage.defaultLayer.add(createSymbol(attrs)));

  renderAndExportPNG(stage, outDir + '/symbol.png');
}

main();
