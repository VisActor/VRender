import { flattenPages, resolveInitialPath } from '../browser/src/harness';

describe('browser smoke harness helpers', () => {
  test('flattenPages should flatten grouped page entries and preserve menu category', () => {
    const result = flattenPages([
      {
        menu: 'graphic',
        children: [
          { name: 'graphic', path: 'graphic' },
          { name: 'state', path: 'state', type: 'tsx' }
        ]
      },
      {
        name: 'react',
        path: 'react'
      }
    ] as any);

    expect(result).toEqual([
      { category: 'graphic', name: 'graphic', path: 'graphic', type: 'ts' },
      { category: 'graphic', name: 'state', path: 'state', type: 'tsx' },
      { category: 'ungrouped', name: 'react', path: 'react', type: 'ts' }
    ]);
  });

  test('resolveInitialPath should prefer query route over previous path', () => {
    const allPages = flattenPages([
      {
        menu: 'graphic',
        children: [{ name: 'graphic', path: 'graphic' }]
      },
      {
        menu: 'state',
        children: [{ name: 'state', path: 'state' }]
      }
    ] as any);

    const result = resolveInitialPath('?route=state&smoke=1', 'graphic', allPages);

    expect(result).toEqual({
      isSmokeMode: true,
      requestedPath: 'state',
      path: 'state'
    });
  });

  test('resolveInitialPath should fall back to the first known page when route is invalid', () => {
    const allPages = flattenPages([
      {
        menu: 'graphic',
        children: [{ name: 'graphic', path: 'graphic' }]
      },
      {
        menu: 'state',
        children: [{ name: 'state', path: 'state' }]
      }
    ] as any);

    const result = resolveInitialPath('?route=missing', 'missing', allPages);

    expect(result).toEqual({
      isSmokeMode: false,
      requestedPath: 'missing',
      path: 'graphic'
    });
  });
});
