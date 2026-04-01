import type { IGraphic, IText, Stage, ISymbol } from '@visactor/vrender-core';
import { Pager } from '../../src';
import { measureTextSize } from '../../src/util';
import { createCanvas } from '../util/dom';
import { createStage } from '../util/vrender';
import { initBrowserEnv } from '@visactor/vrender-kits';
initBrowserEnv();

describe('Pager', () => {
  let stage: Stage;
  beforeAll(() => {
    createCanvas(document.body, 'main');
    stage = createStage('main');
  });

  afterAll(() => {
    stage.release();
  });
  it('Pager in horizontal should be render correctly', () => {
    const pager = new Pager({
      x: 100,
      y: 100,
      fill: 'yellow',
      cornerRadius: 45,
      total: 9,
      padding: 10
    });

    stage.defaultLayer.add(pager as unknown as IGraphic);
    stage.render();

    // pager.addEventListener('toPrev', e => {
    //   console.log(e.detail);
    // });

    // pager.addEventListener('toNext', e => {
    //   console.log(e.detail);
    // });

    expect((pager.preHandler as ISymbol).hasState('disable')).toBeTruthy();
    expect((pager.nextHandler as ISymbol).hasState('disable')).toBeFalsy();
    const { width: maxTextWidth, height: maxTextHeight } = measureTextSize(
      '9/9',
      {
        textAlign: 'center',
        textBaseline: 'middle',
        ...pager.attribute.textStyle
      },
      stage.getTheme()?.text
    );
    expect((pager.text as IText).attribute.text).toBe('1/9');
    expect(pager.AABBBounds.width()).toBeCloseTo(maxTextWidth + 66);
    expect(pager.AABBBounds.height()).toBeCloseTo(Math.max(maxTextHeight, 15) + 20);
  });

  it('Pager in vertical should be render correctly', () => {
    const pager = new Pager({
      layout: 'vertical',
      x: 300,
      y: 100,
      total: 9,
      fill: 'yellow',
      defaultCurrent: 3
    });

    stage.defaultLayer.add(pager as unknown as IGraphic);
    stage.render();

    expect((pager.preHandler as ISymbol).hasState('disable')).toBeFalsy();
    expect((pager.nextHandler as ISymbol).hasState('disable')).toBeFalsy();
    const { width: maxTextWidth, height: maxTextHeight } = measureTextSize(
      '9/9',
      {
        textAlign: 'center',
        textBaseline: 'middle',
        ...pager.attribute.textStyle
      },
      stage.getTheme()?.text
    );
    expect((pager.text as IText).attribute.text).toBe('3/9');
    expect(pager.AABBBounds.width()).toBeCloseTo(Math.max(maxTextWidth, 15));
    expect(pager.AABBBounds.height()).toBeCloseTo(maxTextHeight + 46);
  });
});
