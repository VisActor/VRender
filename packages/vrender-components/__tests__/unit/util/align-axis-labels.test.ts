import { alignAxisLabels } from '../../../src/util/align';

describe('vrender-components util/align', () => {
  test('alignAxisLabels updates dx for left/right orient', () => {
    const label: any = {
      attribute: { dx: 1 },
      AABBBounds: { x1: 10, x2: 30 },
      setAttributes: jest.fn()
    };

    alignAxisLabels([label], 100, 50, 'left', 'left');
    expect(label.setAttributes).toHaveBeenLastCalledWith({ dx: 1 + 100 - 10 });

    alignAxisLabels([label], 100, 50, 'left', 'right');
    expect(label.setAttributes).toHaveBeenLastCalledWith({ dx: 1 + 100 + 50 - 30 });

    alignAxisLabels([label], 100, 50, 'right', 'center');
    expect(label.setAttributes).toHaveBeenLastCalledWith({ dx: 1 + 100 + 25 - (10 + 30) / 2 });
  });

  test('alignAxisLabels updates dy for top/bottom orient', () => {
    const label: any = {
      attribute: { dy: 2 },
      AABBBounds: { y1: 5, y2: 25 },
      setAttributes: jest.fn()
    };

    alignAxisLabels([label], 10, 40, 'top', 'top');
    expect(label.setAttributes).toHaveBeenLastCalledWith({ dy: 2 + 10 - 5 });

    alignAxisLabels([label], 10, 40, 'bottom', 'bottom');
    expect(label.setAttributes).toHaveBeenLastCalledWith({ dy: 2 + 10 + 40 - 25 });

    alignAxisLabels([label], 10, 40, 'bottom', 'middle');
    expect(label.setAttributes).toHaveBeenLastCalledWith({ dy: 2 + 10 + 20 - (5 + 25) / 2 });
  });
});
