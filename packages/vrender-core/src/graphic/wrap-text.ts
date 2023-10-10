import { isArray } from '@visactor/vutils';
import { CanvasTextLayout } from '../core/contributions/textMeasure/layout';
import type { ITextGraphicAttribute, IWrapTextGraphicAttribute, LayoutItemType } from '../interface';
import { application } from '../application';
import { Text } from './text';
import { getTheme } from './theme';

const WRAP_TEXT_UPDATE_TAG_KEY = ['heightLimit', 'lineClamp'];

/* WrapText功能
 * 1. 按照宽度限制自动折行或显示省略号(maxLineWidth)
 * 2. 高度限制控制显示内容及省略号(heightLimit)
 * 3. 按照行数限制显示内容及省略号(lineClamp)
 */
export class WrapText extends Text {
  constructor(params: ITextGraphicAttribute) {
    super({ ...params, wrap: true });
  }
}
