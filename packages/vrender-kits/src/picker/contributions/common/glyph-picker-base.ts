import type { IPoint } from '@visactor/vutils';
import { GLYPH_NUMBER_TYPE } from '@visactor/vrender-core';
import type { IGlyph, IPickParams } from '@visactor/vrender-core';

export class GlyphPickerBase {
  type: string = 'glyph';
  numberType: number = GLYPH_NUMBER_TYPE;

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
        const data = pickerService.pickItem(g, point, null, params);
        picked = !!(data && data.graphic);
      });
      return picked;
    }
    return false;
  }
}
