// @ts-nocheck
import * as fs from 'fs';
import * as path from 'path';

const browserExamples = ['axis-label-limit.ts', 'axis-labels.ts', 'axis-autoWrap.ts', 'tag-flex.ts', 'pick-test.ts'];

describe('legacy removal browser examples', () => {
  test.each(browserExamples)('%s should not use deprecated root createStage', fileName => {
    const filePath = path.resolve(__dirname, '../browser/examples', fileName);
    const source = fs.readFileSync(filePath, 'utf8');

    expect(source).not.toMatch(/(^|[^\w.])createStage\s*\(/m);
    expect(source).not.toMatch(/import\s*\{[^}]*\bcreateStage\b[^}]*\}\s*from\s*['"]@visactor\/vrender['"]/);
    expect(source).not.toMatch(/import\s*\{[^}]*\bcreateStage\b[^}]*\}\s*from\s*['"]@visactor\/vrender-core['"]/);
  });
});
