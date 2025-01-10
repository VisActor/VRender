import type { IGraphic, Stage, ISymbol } from '@visactor/vrender-core';
import { Pager } from '../../src';
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
    expect(pager.AABBBounds.width()).toBeCloseTo(86.20799255371094);
    expect(pager.AABBBounds.height()).toBeCloseTo(35);
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
    expect(pager.AABBBounds.width()).toBeCloseTo(20.087982177734375);
    expect(pager.AABBBounds.height()).toBeCloseTo(58);
  });
});
