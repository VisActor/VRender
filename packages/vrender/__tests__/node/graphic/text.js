const CanvasPkg = require('canvas');
const path = require('path');
const { vglobal, createStage, createText } = require('../../../cjs/index.js');
const { ensureDir, renderAndExportPNG } = require('../export-image/utils');

function main() {
  vglobal.setEnv('node', CanvasPkg);
  const outDir = path.resolve(__dirname, '../export-image');
  ensureDir(outDir);

  const stage = createStage({ width: 600, height: 400, autoRender: false });

  const samples = [
    { x: 100, y: 60, text: 'Left/Top', textAlign: 'left', textBaseline: 'top', fontSize: 40, fill: '#333' }
    { x: 300, y: 60, text: 'Center/Middle', textAlign: 'center', textBaseline: 'middle', fontSize: 24, fill: '#4a90e2' },
    { x: 500, y: 60, text: 'Right/Bottom', textAlign: 'right', textBaseline: 'bottom', fontSize: 18, fill: '#d0021b' },
    { x: 100, y: 200, text: '宽度限制\\n自动换行', textAlign: 'left', textBaseline: 'top', fontSize: 16, maxWidth: 140, fill: '#50e3c2' }
  ];

  samples.forEach(attrs => stage.defaultLayer.add(createText(attrs)));

  renderAndExportPNG(stage, outDir + '/text.png');
}

main();
