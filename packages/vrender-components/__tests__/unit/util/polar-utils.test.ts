import { deltaXYToAngle, tan2AngleToAngle } from '../../../src/util/polar';

describe('util/polar', () => {
  test('deltaXYToAngle maps atan2 to [0, 2pi)', () => {
    expect(deltaXYToAngle(0, 1)).toBeCloseTo(0);
    expect(deltaXYToAngle(1, 0)).toBeCloseTo(Math.PI / 2);
    expect(deltaXYToAngle(0, -1)).toBeCloseTo(Math.PI);
    expect(deltaXYToAngle(-1, 0)).toBeCloseTo((Math.PI * 3) / 2);
  });

  test('tan2AngleToAngle normalizes negative angles', () => {
    expect(tan2AngleToAngle(-0.1)).toBeCloseTo(Math.PI * 2 - 0.1);
    expect(tan2AngleToAngle(0.2)).toBeCloseTo(0.2);
  });
});
