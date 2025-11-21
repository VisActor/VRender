const CanvasPkg = require('canvas');
const path = require('path');
const { vglobal, createStage, createArea } = require('../../../cjs/index.js');
const { ensureDir, renderAndExportPNG } = require('../export-image/utils');

function main() {
  vglobal.setEnv('node', CanvasPkg);
  const outDir = path.resolve(__dirname, '../export-image');
  ensureDir(outDir);

  const stage = createStage({ width: 600, height: 400, autoRender: false });

  const samples = [
    {
      points: [
        { x: 40, y: 100, x1: 40, y1: 180 },
        { x: 120, y: 80, x1: 120, y1: 180 },
        { x: 180, y: 140, x1: 180, y1: 180 }
      ],
      fill: '#4a90e2'
    },
    {
      points: [
        { x: 260, y: 120, x1: 260, y1: 220 },
        { x: 320, y: 60, x1: 320, y1: 220 },
        { x: 380, y: 160, x1: 380, y1: 220 }
      ],
      fill: '#50e3c2',
      stroke: '#333',
      lineWidth: 2
    }
  ];

  samples.forEach(attrs => stage.defaultLayer.add(createArea(attrs)));

  renderAndExportPNG(stage, outDir + '/area.png');
}

main();