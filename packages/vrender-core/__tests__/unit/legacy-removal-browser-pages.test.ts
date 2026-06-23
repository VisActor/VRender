// @ts-nocheck
import * as fs from 'fs';
import * as path from 'path';

const browserPages = [
  'arc.ts',
  'area.ts',
  'animate-3d.ts',
  'animate.ts',
  'bar3d.ts',
  'bin-tree.ts',
  'chart.ts',
  'circle.ts',
  'clip.ts',
  'editor.ts',
  'flex.ts',
  'glyph.ts',
  'graphic.ts',
  'group-perf.ts',
  'html.ts',
  'image.ts',
  'incremental.ts',
  'jsx.tsx',
  'line.ts',
  'morphing.ts',
  'path.ts',
  'pie3d.ts',
  'polygon.ts',
  'pyramid3d.ts',
  'rect.ts',
  'scatter3d.ts',
  'scroll.ts',
  'symbol.ts',
  'pick-test.ts',
  'richtext.ts',
  'stage.ts',
  'state.ts',
  'test-arc-path.ts',
  'text.ts',
  'texture.ts',
  'theme.ts',
  'wrap-text.ts',
  'wordcloud3d.ts'
];
const browserFixtures = [
  'core/stage.ts',
  'interactive/circle-drag.ts',
  'interactive/gesture.ts',
  'interactive/utils.ts',
  'render/utils.ts',
  'node/index.js'
];

describe('legacy removal vrender-core browser pages', () => {
  test.each(browserPages)('%s should not use deprecated root createStage', fileName => {
    const filePath = path.resolve(__dirname, '../browser/src/pages', fileName);
    const source = fs.readFileSync(filePath, 'utf8');

    expect(source).not.toMatch(/(^|[^\w.])createStage\s*\(/m);
    expect(source).not.toMatch(/import\s*\{[^}]*\bcreateStage\b[^}]*\}\s*from\s*['"]@visactor\/vrender['"]/);
    expect(source).not.toMatch(/import\s*\{[^}]*\bcreateStage\b[^}]*\}\s*from\s*['"]@visactor\/vrender-core['"]/);
  });
});

describe('legacy removal vrender-core browser fixtures', () => {
  test.each(browserFixtures)('%s should not use deprecated root createStage', fileName => {
    const filePath = path.resolve(__dirname, '../browser/src', fileName);
    const source = fs.readFileSync(filePath, 'utf8');

    expect(source).not.toMatch(/(^|[^\w.])createStage\s*\(/m);
    expect(source).not.toMatch(/import\s*\{[^}]*\bcreateStage\b[^}]*\}\s*from\s*['"]@visactor\/vrender['"]/);
    expect(source).not.toMatch(/import\s*\{[^}]*\bcreateStage\b[^}]*\}\s*from\s*['"]@visactor\/vrender-core['"]/);
  });
});
