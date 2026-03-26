import { renderCommandList } from '../../../src/common/render-command-list';

describe('common/render-command-list', () => {
  test('applies transform (x/y/sx/sy) and z for supported commands', () => {
    const calls: Array<{ method: string; args: any[] }> = [];
    const ctx = {
      arc: (...args: any[]) => calls.push({ method: 'arc', args }),
      arcTo: (...args: any[]) => calls.push({ method: 'arcTo', args }),
      lineTo: (...args: any[]) => calls.push({ method: 'lineTo', args }),
      moveTo: (...args: any[]) => calls.push({ method: 'moveTo', args }),
      rect: (...args: any[]) => calls.push({ method: 'rect', args }),
      closePath: (...args: any[]) => calls.push({ method: 'closePath', args })
    };

    const commandList: any[] = [
      // moveTo
      [6, 1, 2],
      // lineTo
      [5, 3, 4],
      // arc
      [0, 5, 6, 2, 0, Math.PI, false],
      // arcTo
      [1, 7, 8, 9, 10, 4],
      // rect
      [8, 11, 12, 13, 14],
      // closePath
      [3]
    ];

    renderCommandList(commandList as any, ctx as any, 10, 20, 2, 3, 7);

    expect(calls[0]).toEqual({ method: 'moveTo', args: [1 * 2 + 10, 2 * 3 + 20, 7] });
    expect(calls[1]).toEqual({ method: 'lineTo', args: [3 * 2 + 10, 4 * 3 + 20, 7] });

    const arcArgs = calls.find(c => c.method === 'arc')!.args;
    expect(arcArgs[0]).toBe(5 * 2 + 10);
    expect(arcArgs[1]).toBe(6 * 3 + 20);
    expect(arcArgs[2]).toBe((2 * (2 + 3)) / 2);
    expect(arcArgs[5]).toBe(false);
    expect(arcArgs[6]).toBe(7);

    const arcToArgs = calls.find(c => c.method === 'arcTo')!.args;
    expect(arcToArgs).toEqual([
      7 * 2 + 10,
      8 * 3 + 20,
      9 * 2 + 10,
      10 * 3 + 20,
      (4 * (2 + 3)) / 2,
      7
    ]);

    expect(calls.find(c => c.method === 'rect')!.args).toEqual([11 * 2 + 10, 12 * 3 + 20, 13 * 2, 14 * 3, 7]);
    expect(calls[calls.length - 1]).toEqual({ method: 'closePath', args: [] });
  });
});
