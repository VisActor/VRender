declare const require: any;
export {};

const path = require('path');
const process = require('process');

const packageRoot = process.cwd();

describe('vrender-core container compatibility', () => {
  test('application should use realm-level shared state for duplicated ESM entry evaluation', () => {
    const { application } = require(path.join(packageRoot, 'src/application'));
    const state = (globalThis as any)[Symbol.for('@visactor/vrender-core/application-state')];

    expect(state).toBeDefined();
    expect(state.application).toBe(application);
  });
});
