import { Matrix } from '@visactor/vutils';
import type { IDrawContext, IDrawItemInterceptorContribution, IGraphic, IGraphicRender, IGroup } from '../../../src';
import { application } from '../../../src/application';
import { DefaultGraphicService } from '../../../src/graphic/graphic-service/graphic-service';
import { createGroup } from '../../../src/graphic/group';
import { DefaultDrawContribution } from '../../../src/render/contributions/render/draw-contribution';

describe('draw context scroll compatibility', () => {
  let previousGraphicService: typeof application.graphicService;

  beforeEach(() => {
    previousGraphicService = application.graphicService;
    application.graphicService = new DefaultGraphicService();
  });

  afterEach(() => {
    application.graphicService = previousGraphicService;
  });

  test.each([false, true])('exposes the current group scroll flag (dirty bounds: %s)', useDirtyBounds => {
    const bounds = { width: 20, height: 20, clip: true };
    const regular = createGroup(bounds);
    const horizontal = createGroup({ ...bounds, scrollX: -4 });
    const vertical = createGroup({ ...bounds, scrollY: -5 });
    const nested = createGroup({ ...bounds, x: 4 });
    horizontal.add(nested);

    const seen = new Map<IGraphic, boolean | undefined>();
    const interceptor: IDrawItemInterceptorContribution = {
      order: 0,
      beforeDrawItem(graphic, _service, context) {
        seen.set(graphic, context.isGroupScroll);
        return false;
      }
    };
    const groupRenderer: IGraphicRender = {
      type: 'group',
      numberType: regular.numberType,
      draw(group, _service, context, { renderInGroup, renderInGroupParams }) {
        renderInGroup(true, group as IGroup, context, renderInGroupParams.nextM);
      },
      reInit: jest.fn()
    };
    const draw = new DefaultDrawContribution([groupRenderer], { getContributions: () => [interceptor] });
    draw.useDirtyBounds = useDirtyBounds;
    draw.dirtyBounds.setValue(0, 0, 100, 100);
    draw.backupDirtyBounds.copy(draw.dirtyBounds);

    const context = {} as IDrawContext;
    const matrix = new Matrix();
    [regular, horizontal, vertical].forEach(group => draw.renderGroup(group, context, matrix));

    expect([...seen]).toEqual([
      [regular, false],
      [horizontal, true],
      [nested, false],
      [vertical, true]
    ]);
  });
});
