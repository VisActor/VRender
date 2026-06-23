/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import { createBrowserStage } from '../util';

describe('stage', () => {
  it('resize', () => {
    let stage = createBrowserStage({
      width: 100,
      height: 300
    });
    stage.resize(200, 200);
    expect(stage.width).toEqual(200);
    expect(stage.height).toEqual(200);
    expect(stage.viewWidth).toEqual(200);
    expect(stage.viewHeight).toEqual(200);

    stage = createBrowserStage({
      width: 100,
      height: 200,
      viewBox: { x1: 0, y1: 0, x2: 100, y2: 200 }
    });
    stage.resize(300, 300);
    expect(stage.width).toEqual(300);
    expect(stage.height).toEqual(300);
    expect(stage.viewWidth).toEqual(300);
    expect(stage.viewHeight).toEqual(300);

    stage = createBrowserStage({
      width: 100,
      height: 110,
      viewBox: { x1: 0, y1: 0, x2: 60, y2: 60 }
    });
    stage.resize(300, 300);
    expect(stage.width).toEqual(300);
    expect(stage.height).toEqual(300);
    expect(stage.viewWidth).toEqual(60);
    expect(stage.viewHeight).toEqual(60);
    stage.resizeView(200, 200);
    expect(stage.width).toEqual(300);
    expect(stage.height).toEqual(300);
    expect(stage.viewWidth).toEqual(200);
    expect(stage.viewHeight).toEqual(200);
    stage.setViewBox(50, 50, 100, 100);
    expect(stage.width).toEqual(300);
    expect(stage.height).toEqual(300);
    expect(stage.viewWidth).toEqual(100);
    expect(stage.viewHeight).toEqual(100);
  });
});
