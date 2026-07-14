import type { IGraphic, Stage } from '@visactor/vrender-core';
import { DiscreteLegend } from '../../src';
import { createCanvas } from '../util/dom';
import { createTestStage } from '../util/vrender';

describe('DiscreteLegend pager.hugContent', () => {
  let stage: Stage;
  beforeAll(() => {
    createCanvas(document.body, 'main');
    stage = createTestStage('main');
  });

  afterAll(() => {
    stage.release();
  });

  it('horizontal pager should hug content and shrink clip viewport when pager.hugContent is true', () => {
    const items = new Array(6).fill(0).map((_, i) => ({
      label: `long-legend-item-label-${i}`,
      shape: { fill: 'red', symbolType: 'circle' }
    }));
    const createLegend = (pager?: any) =>
      new DiscreteLegend({
        layout: 'horizontal',
        maxWidth: 400,
        maxRow: 1,
        items,
        pager
      });

    const defaultLegend = createLegend();
    stage.defaultLayer.add(defaultLegend as unknown as IGraphic);
    stage.render();
    const hugLegend = createLegend({ hugContent: true, space: 10 });
    stage.defaultLayer.add(hugLegend as unknown as IGraphic);
    stage.render();

    // 默认行为不变：翻页器钉在图例可用空间末端
    const defaultPager = (defaultLegend as any)._pagerComponent;
    expect(defaultPager.attribute.x).toBeCloseTo(400 - defaultPager.AABBBounds.width(), 4);

    // hugContent：翻页器紧跟内容右缘（间距为 pager.space），分页视口收缩到实际内容宽
    const hugPager = (hugLegend as any)._pagerComponent;
    const contentWidth = (hugLegend as any)._itemsContainer.AABBBounds.width();
    expect(contentWidth).toBeLessThan(400 - hugPager.AABBBounds.width() - 10);
    expect(hugPager.attribute.x).toBeCloseTo(contentWidth + 10, 4);
    expect((hugLegend as any)._itemContext.clipContainer.attribute.width).toBeCloseTo(contentWidth, 4);

    // 整体包围盒随内容收缩
    expect(hugLegend.AABBBounds.width()).toBeLessThan(defaultLegend.AABBBounds.width());
  });

  it('vertical pager should hug content and shrink clip viewport when pager.hugContent is true', () => {
    const items = new Array(8).fill(0).map((_, i) => ({
      label: `item-${i}`,
      shape: { fill: 'red', symbolType: 'circle' }
    }));
    const createLegend = (pager?: any) =>
      new DiscreteLegend({
        layout: 'vertical',
        maxHeight: 100,
        maxCol: 1,
        items,
        pager
      });

    const defaultLegend = createLegend();
    stage.defaultLayer.add(defaultLegend as unknown as IGraphic);
    stage.render();
    const hugLegend = createLegend({ hugContent: true, space: 10 });
    stage.defaultLayer.add(hugLegend as unknown as IGraphic);
    stage.render();

    // 默认行为不变：翻页器钉在图例可用空间末端
    const defaultPager = (defaultLegend as any)._pagerComponent;
    const defaultMaxHeight = (defaultLegend as any)._contentMaxHeight;
    expect(defaultPager.attribute.y).toBeCloseTo(defaultMaxHeight - defaultPager.AABBBounds.height(), 4);

    // hugContent：翻页器紧贴内容下缘，分页视口收缩到实际内容高
    const hugPager = (hugLegend as any)._pagerComponent;
    const contentHeight = (hugLegend as any)._itemsContainer.AABBBounds.height();
    expect(hugPager.attribute.y).toBeCloseTo(contentHeight + 10, 4);
    expect((hugLegend as any)._itemContext.clipContainer.attribute.height).toBeCloseTo(contentHeight, 4);

    // 整体包围盒随内容收缩
    expect(hugLegend.AABBBounds.height()).toBeLessThan(defaultLegend.AABBBounds.height());
  });
});
