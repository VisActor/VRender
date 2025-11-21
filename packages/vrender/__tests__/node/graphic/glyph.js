const CanvasPkg = require('canvas');
const path = require('path');
const { vglobal, createStage, createGlyph, createRect, createCircle, createText } = require('../../../cjs/index.js');
const { ensureDir, renderAndExportPNG } = require('../export-image/utils');

function main() {
  vglobal.setEnv('node', CanvasPkg);
  const outDir = path.resolve(__dirname, '../export-image');
  ensureDir(outDir);

  const stage = createStage({ width: 600, height: 400, autoRender: false });

  const glyph = createGlyph({ x: 100, y: 100 });
  const rect = createRect({ x: 0, y: 0, width: 120, height: 80, fill: '#4a90e2' });
  const circle = createCircle({ x: 60, y: 40, radius: 20, startAngle: 0, endAngle: Math.PI * 2, fill: '#f5a623' });
  const label = createText({ x: 60, y: 70, text: 'Glyph', textAlign: 'center', textBaseline: 'top', fontSize: 14, fill: '#fff' });
  glyph.setSubGraphic([rect, circle, label]);

  stage.defaultLayer.add(glyph);

  renderAndExportPNG(stage, outDir + '/glyph.png');
}

main();