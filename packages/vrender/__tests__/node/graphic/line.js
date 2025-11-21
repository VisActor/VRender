const CanvasPkg = require('canvas');
const path = require('path');
const { vglobal, createStage, createLine } = require('../../../cjs/index.js');
const { ensureDir, renderAndExportPNG } = require('../export-image/utils');

function main() {
  vglobal.setEnv('node', CanvasPkg);
  const outDir = path.resolve(__dirname, '../export-image');
  ensureDir(outDir);

  const stage = createStage({ width: 600, height: 400, autoRender: false });

  const samples = [
    {
      points: [
        { x: 40, y: 60 },
        { x: 120, y: 40 },
        { x: 180, y: 100 }
      ],
      stroke: '#4a90e2',
      lineWidth: 3
    },
    {
      points: [
        { x: 220, y: 60 },
        { x: 300, y: 40 },
        { x: 360, y: 100 },
        { x: 420, y: 60 }
      ],
      stroke: '#50e3c2',
      lineWidth: 2
    },
    {
      segments: [
        { points: [ { x: 40, y: 200 }, { x: 120, y: 220 }, { x: 180, y: 260 } ] },
        { points: [ { x: 40, y: 280 }, { x: 120, y: 300 }, { x: 180, y: 340 } ] }
      ],
      stroke: '#d0021b',
      lineWidth: 4
    }
  ];

  samples.forEach(attrs => stage.defaultLayer.add(createLine(attrs)));

  renderAndExportPNG(stage, outDir + '/line.png');
}

main();