import type { IAABBBounds, IMatrix } from '@visactor/vutils';
import { isObject } from '@visactor/vutils';
import { BaseRenderContributionTime } from '../../../../common/enums';
import type {
  IContext2d,
  IDrawContext,
  IGraphicAttribute,
  IText,
  ITextRenderContribution,
  IThemeAttribute
} from '../../../../interface';
import { DefaultBaseBackgroundRenderContribution } from './base-contribution-render';
import { boundsAllocate } from '../../../../allocator/bounds-allocate';
import { getTextBounds } from '../../../../graphic/bounds';
import { createRectPath } from '../../../../common/shape/rect';

export class DefaultTextBackgroundRenderContribution
  extends DefaultBaseBackgroundRenderContribution
  implements ITextRenderContribution
{
  time: BaseRenderContributionTime = BaseRenderContributionTime.beforeFillStroke;

  drawShape(
    graphic: IText,
    context: IContext2d,
    x: number,
    y: number,
    doFill: boolean,
    doStroke: boolean,
    fVisible: boolean,
    sVisible: boolean,
    graphicAttribute: Required<IGraphicAttribute>,
    drawContext: IDrawContext,
    fillCb?: (ctx: IContext2d, markAttribute: Partial<IGraphicAttribute>, themeAttribute: IThemeAttribute) => boolean,
    strokeCb?: (ctx: IContext2d, markAttribute: Partial<IGraphicAttribute>, themeAttribute: IThemeAttribute) => boolean
  ) {
    const { backgroundMode = graphicAttribute.backgroundMode, backgroundFit = graphicAttribute.backgroundFit } =
      graphic.attribute;
    let { background } = graphic.attribute;
    if (!background) {
      return;
    }
    let matrix: IMatrix;
    const save = () => {
      if (graphic.type === 'richtext') {
        matrix = context.currentMatrix.clone();
        context.restore();
        context.save();
        context.setTransformForCurrent();
      }
    };
    const restore = () => {
      if (graphic.type === 'richtext') {
        context.restore();
        context.save();
        matrix && context.setTransformFromMatrix(matrix, true, 1);
      }
    };
    save();
    let b: IAABBBounds;
    const shouldReCalBounds = isObject(background) && (background as any).background;
    const onlyTranslate = graphic.transMatrix.onlyTranslate();
    if (shouldReCalBounds) {
      const _b = graphic.AABBBounds;
      const x = ((background as any).x ?? _b.x1) + ((background as any).dx ?? 0);
      const y = ((background as any).y ?? _b.y1) + ((background as any).dy ?? 0);
      const w = (background as any).width ?? _b.width();
      const h = (background as any).height ?? _b.height();
      b = boundsAllocate.allocate(x, y, x + w, y + h);
      background = (background as any).background;
      if (!onlyTranslate) {
        const w = b.width();
        const h = b.height();
        b.set(
          ((background as any).x ?? 0) + ((background as any).dx ?? 0),
          ((background as any).y ?? 0) + ((background as any).dy ?? 0),
          w,
          h
        );
      }
    } else {
      b = graphic.AABBBounds;
      if (!onlyTranslate) {
        b = getTextBounds({ ...graphic.attribute, angle: 0, scaleX: 1, scaleY: 1, x: 0, y: 0, dx: 0, dy: 0 }).clone();
      }
    }

    if (graphic.backgroundImg && graphic.resources) {
      const res = graphic.resources.get(background as any);
      if (res.state !== 'success' || !res.data) {
        restore();
        return;
      }

      context.highPerformanceSave();
      // 默认应用旋转
      if (!onlyTranslate) {
        // TODO 性能优化
        // const _b = getTextBounds({ ...graphic.attribute, angle: 0, scaleX: 1, scaleY: 1, x: 0, y: 0, dx: 0, dy: 0 });
        // b.copy(_b);
      } else {
        context.setTransformFromMatrix(graphic.parent.globalTransMatrix, true);
      }

      context.setCommonStyle(graphic, graphic.attribute, x, y, graphicAttribute);
      this.doDrawImage(context, res.data, b, backgroundMode, backgroundFit);
      context.highPerformanceRestore();
      context.setTransformForCurrent();
    } else {
      const { backgroundCornerRadius } = graphic.attribute;
      context.highPerformanceSave();
      context.setCommonStyle(graphic, graphic.attribute, x, y, graphicAttribute);
      context.fillStyle = background as string;
      if (backgroundCornerRadius) {
        // 测试后，cache对于重绘性能提升不大，但是在首屏有一定性能损耗，因此rect不再使用cache
        createRectPath(context, b.x1, b.y1, b.width(), b.height(), backgroundCornerRadius);
        context.fill();
      } else {
        context.fillRect(b.x1, b.y1, b.width(), b.height());
      }
      context.highPerformanceRestore();
    }

    if (shouldReCalBounds) {
      boundsAllocate.free(b);
    }
    restore();
  }
}

export const defaultTextBackgroundRenderContribution = new DefaultTextBackgroundRenderContribution();

// @injectable()
// export class DefaultTextPopTipRenderContribution
//   extends DefaultBasePopTipRenderContribution
//   implements ITextRenderContribution
// {
//   time: BaseRenderContributionTime = BaseRenderContributionTime.afterFillStroke;
// }
