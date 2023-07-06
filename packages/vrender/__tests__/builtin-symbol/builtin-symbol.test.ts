/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import { AABBBounds } from '@visactor/vutils';
import arrow from '../../src/graphic/builtin-symbol/arrow';
import arrow2Left from '../../src/graphic/builtin-symbol/arrow2-left';
import arrow2Right from '../../src/graphic/builtin-symbol/arrow2-right';
import circle from '../../src/graphic/builtin-symbol/circle';
import cross from '../../src/graphic/builtin-symbol/cross';
import diamond from '../../src/graphic/builtin-symbol/diamond';
import rect from '../../src/graphic/builtin-symbol/rect';
import square from '../../src/graphic/builtin-symbol/square';
import star from '../../src/graphic/builtin-symbol/star';
import stroke from '../../src/graphic/builtin-symbol/stroke';
import thinTriangle from '../../src/graphic/builtin-symbol/thin-triangle';
import triangle from '../../src/graphic/builtin-symbol/triangle';
import triangleDown from '../../src/graphic/builtin-symbol/triangle-down';
import triangleLeft from '../../src/graphic/builtin-symbol/triangle-left';
import triangleRight from '../../src/graphic/builtin-symbol/triangle-right';
import triangleUp from '../../src/graphic/builtin-symbol/triangle-up';

describe('builtin-symbol', () => {
  it('builtin-symbol bounds', () => {
    const bounds = new AABBBounds();
    const testBounds = new AABBBounds();
    testBounds.set(-5, -5, 5, 5);

    arrow.bounds(10, bounds);
    expect(bounds).toEqual(testBounds);

    arrow2Left.bounds(10, bounds);
    expect(bounds).toEqual(testBounds);

    arrow2Right.bounds(10, bounds);
    expect(bounds).toEqual(testBounds);

    arrow2Left.bounds(10, bounds);
    expect(bounds).toEqual(testBounds);

    circle.bounds(10, bounds);
    expect(bounds).toEqual(testBounds);

    cross.bounds(10, bounds);
    expect(bounds).toEqual(testBounds);

    diamond.bounds(10, bounds);
    expect(bounds).toEqual(testBounds);

    rect.bounds(10, bounds);
    expect(bounds).toEqual(testBounds);

    square.bounds(10, bounds);
    expect(bounds).toEqual(testBounds);

    star.bounds(10, bounds);
    expect(bounds).toEqual(testBounds);

    stroke.bounds(10, bounds);
    expect(bounds).toEqual(testBounds);

    thinTriangle.bounds(10, bounds);
    expect(bounds).toEqual(testBounds);

    triangle.bounds(10, bounds);
    expect(bounds).toEqual(testBounds);

    triangleDown.bounds(10, bounds);
    expect(bounds).toEqual(testBounds);

    triangleLeft.bounds(10, bounds);
    expect(bounds).toEqual(testBounds);

    triangleRight.bounds(10, bounds);
    expect(bounds).toEqual(testBounds);

    triangleUp.bounds(10, bounds);
    expect(bounds).toEqual(testBounds);
  });
});
