import {
  canPlay,
  checkIndex,
  forwardStep,
  isHorizontal,
  isReachEnd,
  isReachStart,
  isVertical
} from '../../../src/player/utils';
import { DirectionEnum } from '../../../src/player/type';

describe('player/utils', () => {
  test('checkIndex/canPlay respects direction', () => {
    expect(
      checkIndex({ direction: DirectionEnum.Default, maxIndex: 10, minIndex: 0, dataIndex: 9 } as any)
    ).toBe(true);
    expect(
      checkIndex({ direction: DirectionEnum.Default, maxIndex: 10, minIndex: 0, dataIndex: 10 } as any)
    ).toBe(false);

    expect(
      checkIndex({ direction: DirectionEnum.Reverse, maxIndex: 10, minIndex: 0, dataIndex: 1 } as any)
    ).toBe(true);
    expect(
      checkIndex({ direction: DirectionEnum.Reverse, maxIndex: 10, minIndex: 0, dataIndex: 0 } as any)
    ).toBe(false);

    expect(canPlay({ direction: DirectionEnum.Default, maxIndex: 1, minIndex: 0, dataIndex: 0 } as any)).toBe(true);
  });

  test('isReachEnd/isReachStart', () => {
    expect(isReachEnd({ direction: DirectionEnum.Default, maxIndex: 3, minIndex: 0, dataIndex: 3 } as any)).toBe(true);
    expect(isReachEnd({ direction: DirectionEnum.Reverse, maxIndex: 3, minIndex: 0, dataIndex: 0 } as any)).toBe(true);

    expect(isReachStart({ direction: DirectionEnum.Default, maxIndex: 3, minIndex: 0, dataIndex: 0 } as any)).toBe(true);
    expect(isReachStart({ direction: DirectionEnum.Reverse, maxIndex: 3, minIndex: 0, dataIndex: 3 } as any)).toBe(true);
  });

  test('forwardStep clamps', () => {
    expect(forwardStep('default' as any, 1, 0, 3)).toBe(2);
    expect(forwardStep('default' as any, 3, 0, 3)).toBe(3);
    expect(forwardStep('reverse' as any, 2, 0, 3)).toBe(1);
    expect(forwardStep('reverse' as any, 0, 0, 3)).toBe(0);
  });

  test('isVertical/isHorizontal', () => {
    expect(isVertical('left' as any)).toBe(true);
    expect(isVertical('right' as any)).toBe(true);
    expect(isVertical('top' as any)).toBe(false);

    expect(isHorizontal('top' as any)).toBe(true);
    expect(isHorizontal('bottom' as any)).toBe(true);
    expect(isHorizontal('left' as any)).toBe(false);
  });
});
