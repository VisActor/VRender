import type { IPoint } from '@visactor/vutils';
import { inject, injectable } from '../../../common/inversify-lite';
import { GLYPH_NUMBER_TYPE } from '../../../graphic/constants';
import type { IGlyph, IGraphicPicker, IGraphicRender, IPickParams } from '../../../interface';
import { GlyphRender } from '../../../render';

@injectable()
export class DefaultCanvasGlyphPicker implements IGraphicPicker {
  type: string = 'glyph';
  numberType: number = GLYPH_NUMBER_TYPE;

  constructor(@inject(GlyphRender) public readonly canvasRenderer: IGraphicRender) {}

  contains(glyph: IGlyph, point: IPoint, params?: IPickParams): boolean {
    if (!glyph.AABBBounds.containsPoint(point)) {
      return false;
    }
    if (glyph.attribute.pickMode === 'imprecise') {
      return true;
    }

    const { pickContext } = params ?? {};
    if (!pickContext) {
      return false;
    }

    const pickerService = params?.pickerService;
    if (pickerService) {
      // 遍历所有的子元素pick
      let picked = false;
      glyph.getSubGraphic().forEach(g => {
        if (picked) {
          return;
        }
        picked = !!pickerService.pickItem(g, point, null, params);
      });
      return picked;
    }
    return false;

    // const { rectAttribute } = graphicService.themeService.getCurrentTheme();
    // const glyphAttribute = getTheme(glyph).glyph;
    // let { x = glyphAttribute.x, y = glyphAttribute.y } = glyph.attribute;

    // pickContext.highPerformanceSave();
    // if (!glyph.transMatrix.onlyTranslate()) {
    //   // 性能较差
    //   x = 0;
    //   y = 0;
    //   pickContext.transformFromMatrix(glyph.transMatrix, true);
    // } else {
    //   const { dx = glyphAttribute.dx, dy = glyphAttribute.dy } = glyph.attribute;
    //   x += dx;
    //   y += dy;
    //   // 当前context有rotate/scale，重置matrix
    //   pickContext.setTransformForCurrent();
    // }
    // // 详细形状判断
    // let picked = false;
    // this.canvasRenderer.drawShape(
    //   glyph,
    //   pickContext,
    //   x,
    //   y,
    //   {
    //     drawContribution: params.pickerService?.drawContribution
    //   } as any,
    //   null,
    //   context => {
    //     // 选中后面就不需要再走逻辑了
    //     if (picked) {
    //       return true;
    //     }
    //     picked = context.isPointInPath(point.x, point.y);
    //     return picked;
    //   }
    // );

    // pickContext.highPerformanceRestore();
    // return picked; // 无圆角形状判断通过
  }
}
