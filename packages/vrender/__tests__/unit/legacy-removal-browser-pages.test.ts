// @ts-nocheck
import * as fs from 'fs';
import * as path from 'path';

const browserPages = [
  'arc.ts',
  'anxu-picker.ts',
  'area.ts',
  'bin-tree.ts',
  'chart.ts',
  'circle.ts',
  'clip.ts',
  'animate.ts',
  'animate-next.ts',
  'animate-tick.ts',
  'animate-ticker.ts',
  'animate-3d.ts',
  'bar3d.ts',
  'custom-animate.ts',
  'flex.ts',
  'graphic.ts',
  'glyph.ts',
  'globalCompositeOperation.ts',
  'html.ts',
  'image-cloud.ts',
  'image.ts',
  'incremental.ts',
  'layer.ts',
  'line.ts',
  'lottie.ts',
  'memory.ts',
  'modal.ts',
  'morphing.ts',
  'path.ts',
  'pie3d.ts',
  'polygon.ts',
  'pyramid3d.ts',
  'scroll.ts',
  'scatter3d.ts',
  'stage.ts',
  'symbol.ts',
  'star.ts',
  'story-animate.ts',
  'text.ts',
  'text-fly-in.ts',
  'test-arc-path.ts',
  'theme.ts',
  'wrap-text.ts',
  'group-perf.ts',
  'gif-image.ts',
  'pick-test.ts',
  'points3d.ts',
  'richtext.ts',
  'richtext-editor.ts',
  'texture.ts',
  'offscreen.ts',
  'vchart.ts',
  'vtable.ts',
  'window-event.ts',
  'wordcloud3d.ts',
  'dynamic-texture.ts',
  'jsx.tsx'
];

const browserFixtures = ['node/index.js'];

describe('legacy removal browser pages', () => {
  test.each(browserPages)('%s should not use deprecated root createStage', fileName => {
    const filePath = path.resolve(__dirname, '../browser/src/pages', fileName);
    const source = fs.readFileSync(filePath, 'utf8');

    expect(source).not.toMatch(/(^|[^\w.])createStage\s*\(/m);
    expect(source).not.toMatch(/import\s*\{[^}]*\bcreateStage\b[^}]*\}\s*from\s*['"]@visactor\/vrender['"]/);
  });
});

describe('legacy removal browser fixtures', () => {
  test.each(browserFixtures)('%s should not use deprecated root createStage', fileName => {
    const filePath = path.resolve(__dirname, '../browser/src', fileName);
    const source = fs.readFileSync(filePath, 'utf8');

    expect(source).not.toMatch(/(^|[^\w.])createStage\s*\(/m);
    expect(source).not.toMatch(/import\s*\{[^}]*\bcreateStage\b[^}]*\}\s*from\s*['"]@visactor\/vrender['"]/);
  });
});
