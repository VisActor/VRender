import type { IGraphic, IText, Stage, ISymbol } from '@visactor/vrender-core';
import { normalizePadding } from '@visactor/vutils';
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
    expect((pager.text as IText).attribute.text).toBe('1/9');
    const minX = Math.min(
      (pager.preHandler as ISymbol).AABBBounds.x1,
      (pager.text as IText).AABBBounds.x1,
      (pager.nextHandler as ISymbol).AABBBounds.x1
    );
    const maxX = Math.max(
      (pager.preHandler as ISymbol).AABBBounds.x2,
      (pager.text as IText).AABBBounds.x2,
      (pager.nextHandler as ISymbol).AABBBounds.x2
    );
    const minY = Math.min(
      (pager.preHandler as ISymbol).AABBBounds.y1,
      (pager.text as IText).AABBBounds.y1,
      (pager.nextHandler as ISymbol).AABBBounds.y1
    );
    const maxY = Math.max(
      (pager.preHandler as ISymbol).AABBBounds.y2,
      (pager.text as IText).AABBBounds.y2,
      (pager.nextHandler as ISymbol).AABBBounds.y2
    );
    const parsedPadding = normalizePadding(pager.attribute.padding ?? 0);
    expect(pager.AABBBounds.width()).toBeCloseTo(maxX - minX + parsedPadding[1] + parsedPadding[3]);
    expect(pager.AABBBounds.height()).toBeCloseTo(maxY - minY + parsedPadding[0] + parsedPadding[2]);
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
    expect((pager.text as IText).attribute.text).toBe('3/9');
    const minX = Math.min(
      (pager.preHandler as ISymbol).AABBBounds.x1,
      (pager.text as IText).AABBBounds.x1,
      (pager.nextHandler as ISymbol).AABBBounds.x1
    );
    const maxX = Math.max(
      (pager.preHandler as ISymbol).AABBBounds.x2,
      (pager.text as IText).AABBBounds.x2,
      (pager.nextHandler as ISymbol).AABBBounds.x2
    );
    const minY = Math.min(
      (pager.preHandler as ISymbol).AABBBounds.y1,
      (pager.text as IText).AABBBounds.y1,
      (pager.nextHandler as ISymbol).AABBBounds.y1
    );
    const maxY = Math.max(
      (pager.preHandler as ISymbol).AABBBounds.y2,
      (pager.text as IText).AABBBounds.y2,
      (pager.nextHandler as ISymbol).AABBBounds.y2
    );
    const parsedPadding = normalizePadding(pager.attribute.padding ?? 0);
    expect(pager.AABBBounds.width()).toBeCloseTo(maxX - minX + parsedPadding[1] + parsedPadding[3]);
    expect(pager.AABBBounds.height()).toBeCloseTo(maxY - minY + parsedPadding[0] + parsedPadding[2]);
  });
});
