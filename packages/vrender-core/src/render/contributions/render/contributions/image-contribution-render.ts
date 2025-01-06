import type {
  IGraphicAttribute,
  IContext2d,
  IImage,
  IThemeAttribute,
  IImageRenderContribution,
  IDrawContext,
  IBackgroundConfig,
  IGraphic,
  IMarkAttribute
} from '../../../../interface';
import { getTheme } from '../../../../graphic/theme';
import {
  defaultBaseBackgroundRenderContribution,
  DefaultBaseBackgroundRenderContribution
} from './base-contribution-render';
import { BaseRenderContributionTime } from '../../../../common/enums';
import { isNumber, isObject } from '@visactor/vutils';
import { parsePadding } from '../../../../common/utils';
import { createRectPath } from '../../../../common/shape/rect';
import { DefaultRectRenderContribution } from './rect-contribution-render';

// export class DefaultImageBackgroundRenderContribution
//   extends DefaultBaseBackgroundRenderContribution
//   implements IImageRenderContribution
// {
//   time: BaseRenderContributionTime = BaseRenderContributionTime.beforeFillStroke;

//   drawShape(
//     graphic: IImage,
//     context: IContext2d,
//     x: number,
//     y: number,
//     doFill: boolean,
//     doStroke: boolean,
//     fVisible: boolean,
//     sVisible: boolean,
//     graphicAttribute: Required<IGraphicAttribute>,
//     drawContext: IDrawContext,
//     fillCb?: (ctx: IContext2d, markAttribute: Partial<IGraphicAttribute>, themeAttribute: IThemeAttribute) => boolean,
//     strokeCb?: (ctx: IContext2d, markAttribute: Partial<IGraphicAttribute>, themeAttribute: IThemeAttribute) => boolean
//   ) {
//     const {
//       background,
//       backgroundMode = graphicAttribute.backgroundMode,
//       backgroundFit = graphicAttribute.backgroundFit,
//       width,
//       height
//     } = graphic.attribute;
//     if (!background) {
//       return;
//     }

//     if (!graphic.backgroundImg) {
//       if (isObject(background)) {
//         const {
//           stroke,
//           fill,
//           lineWidth = 1,
//           cornerRadius = 0,
//           expandX = 0,
//           expandY = 0
//         } = background as IBackgroundConfig;

//         if (!stroke && !fill) {
//           return;
//         }

//         context.beginPath();
//         const { x, y, width, height } = getActualPosition(graphic);
//         if (cornerRadius) {
//           createRectPath(context, x - expandX, y - expandY, width + expandX * 2, height + expandY * 2, cornerRadius);
//         } else {
//           context.rect(x - expandX, y - expandY, width + expandX * 2, height + expandY * 2);
//         }

//         context.globalAlpha = 1;
//         if (fill) {
//           context.fillStyle = fill as string;
//           context.fill();
//         }

//         if (stroke && lineWidth > 0) {
//           context.lineWidth = lineWidth;
//           context.strokeStyle = stroke as string;
//           context.stroke();
//         }
//       } else {
//         context.beginPath();
//         // const b = graphic.AABBBounds;
//         // image的背景不包括Bounds了
//         context.rect(x, y, width || 0, height || 0);
//         context.fillStyle = background as string;
//         context.globalAlpha = 1;
//         context.fill();
//       }
//     } else {
//       const res = graphic.resources.get(background as any);
//       if (res.state !== 'success' || !res.data) {
//         return;
//       }
//       context.save();
//       if (graphic.parent && !graphic.transMatrix.onlyTranslate()) {
//         const groupAttribute = getTheme(graphic.parent).group;
//         const { scrollX = groupAttribute.scrollX, scrollY = groupAttribute.scrollY } = graphic.parent.attribute;
//         context.setTransformFromMatrix(graphic.parent.globalTransMatrix, true);
//         context.translate(scrollX, scrollY);
//       }
//       // context.clip();
//       const b = graphic.AABBBounds;
//       this.doDrawImage(context, res.data, b, backgroundMode, backgroundFit);
//       context.restore();
//       if (!graphic.transMatrix.onlyTranslate()) {
//         context.setTransformForCurrent();
//       }
//     }
//   }
// }

// function getActualPosition(graphic: IGraphic) {
//   const boundsPadding = parsePadding(graphic.attribute.boundsPadding);
//   const bounds = graphic.AABBBounds;
//   let x = bounds.x1;
//   let y = bounds.y1;
//   let width = bounds.width();
//   let height = bounds.height();

//   if (isNumber(boundsPadding)) {
//     x += boundsPadding;
//     y += boundsPadding;
//     width -= boundsPadding * 2;
//     height -= boundsPadding * 2;
//   } else {
//     x += boundsPadding[3];
//     y += boundsPadding[0];
//     width -= boundsPadding[1] + boundsPadding[3];
//     height -= boundsPadding[0] + boundsPadding[2];
//   }

//   return {
//     x,
//     y,
//     width,
//     height
//   };
// }

export class DefaultImageRenderContribution extends DefaultRectRenderContribution implements IImageRenderContribution {
  time: BaseRenderContributionTime = BaseRenderContributionTime.afterFillStroke;
  useStyle: boolean = true;
  order: number = 0;
  drawShape(
    image: any,
    context: IContext2d,
    x: number,
    y: number,
    doFill: boolean,
    doStroke: boolean,
    fVisible: boolean,
    sVisible: boolean,
    rectAttribute: any,
    drawContext: IDrawContext,
    fillCb?: (
      ctx: IContext2d,
      markAttribute: Partial<IMarkAttribute & IGraphicAttribute>,
      themeAttribute: IThemeAttribute
    ) => boolean,
    strokeCb?: (
      ctx: IContext2d,
      markAttribute: Partial<IMarkAttribute & IGraphicAttribute>,
      themeAttribute: IThemeAttribute
    ) => boolean
  ) {
    return super.drawShape(
      image,
      context,
      x,
      y,
      doFill,
      doStroke,
      fVisible,
      sVisible,
      rectAttribute,
      drawContext,
      fillCb,
      strokeCb
    );
  }
}

export const defaultImageRenderContribution = new DefaultImageRenderContribution();
export const defaultImageBackgroundRenderContribution = defaultBaseBackgroundRenderContribution;
