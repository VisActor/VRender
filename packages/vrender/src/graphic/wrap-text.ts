import { isArray } from '@visactor/vutils';
import { CanvasTextLayout } from '../core/contributions/textMeasure/layout';
import type { IWrapTextGraphicAttribute, LayoutItemType } from '../interface';
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
  declare attribute: IWrapTextGraphicAttribute;

  protected _isValid(): boolean {
    const { text } = this.attribute;
    if (isArray(text)) {
      return !(text as any[]).every((t: any) => t == null || t === '');
    }
    return text != null && text !== '';
  }

  /**
   * 计算多行文字的bounds，缓存每行文字的布局位置
   * 自动折行params.text是数组，因此只重新updateMultilineAABBBounds
   * @param text
   */
  updateMultilineAABBBounds(text: (number | string)[]) {
    const textTheme = getTheme(this).text;
    const {
      fontFamily = textTheme.fontFamily,
      textAlign = textTheme.textAlign,
      textBaseline = textTheme.textBaseline,
      fontSize = textTheme.fontSize,
      lineHeight = this.attribute.lineHeight || this.attribute.fontSize || textTheme.fontSize,
      ellipsis = textTheme.ellipsis,
      maxLineWidth,
      stroke = textTheme.stroke,
      lineWidth = textTheme.lineWidth,
      // widthLimit,
      heightLimit = 0,
      lineClamp
    } = this.attribute;
    const buf = 2;
    if (!this.shouldUpdateShape() && this.cache?.layoutData) {
      const bbox = this.cache.layoutData.bbox;
      this._AABBBounds.set(bbox.xOffset, bbox.yOffset, bbox.xOffset + bbox.width, bbox.yOffset + bbox.height);
      if (stroke) {
        this._AABBBounds.expand(lineWidth / 2);
      }
      return this._AABBBounds;
    }

    const textMeasure = application.graphicUtil.textMeasure;
    const layoutObj = new CanvasTextLayout(fontFamily, { fontSize }, textMeasure as any) as any;

    // layoutObj内逻辑
    const lines = text.map(l => l.toString()) as string[];
    const linesLayout: LayoutItemType[] = [];
    const bboxWH: [number, number] = [0, 0];

    let lineCountLimit = Infinity;
    if (heightLimit > 0) {
      lineCountLimit = Math.max(Math.floor(heightLimit / lineHeight), 1);
    }
    if (lineClamp) {
      // 处理行数限制
      lineCountLimit = Math.min(lineCountLimit, lineClamp);
    }

    if (typeof maxLineWidth === 'number' && maxLineWidth !== Infinity) {
      // widthLimit > 0
      if (maxLineWidth > 0) {
        for (let i = 0; i < lines.length; i++) {
          const str = lines[i] as string;
          // // 测量当前行宽度
          // width = Math.min(
          //   layoutObj.textMeasure.measureTextWidth(str, layoutObj.textOptions),
          //   maxLineWidth
          // );

          // 判断是否超过高度限制
          if (i === lineCountLimit - 1) {
            // 当前行为最后一行
            const clip = layoutObj.textMeasure.clipTextWithSuffix(str, layoutObj.textOptions, maxLineWidth, ellipsis);
            linesLayout.push({
              str: clip.str,
              width: clip.width
            });
            break; // 不处理后续行
          }

          // 测量截断位置
          const clip = layoutObj.textMeasure.clipText(str, layoutObj.textOptions, maxLineWidth);
          if (str !== '' && clip.str === '') {
            if (ellipsis) {
              const clipEllipsis = layoutObj.textMeasure.clipTextWithSuffix(
                str,
                layoutObj.textOptions,
                maxLineWidth,
                ellipsis
              );
              clip.str = clipEllipsis.str ?? '';
              clip.width = 0;
            } else {
              // 宽度限制不足一个字符，不显示
              clip.str = '';
              clip.width = 0;
            }
          }

          linesLayout.push({
            str: clip.str,
            width: clip.width
          });
          if (clip.str.length === str.length) {
            // 不需要截断
          } else {
            const newStr = str.substring(clip.str.length);
            lines.splice(i + 1, 0, newStr);
          }
        }
      }
      // bboxWH[0] = maxLineWidth;
      let maxWidth = 0;
      linesLayout.forEach(layout => {
        maxWidth = Math.max(maxWidth, layout.width);
      });
      bboxWH[0] = maxWidth;
    } else {
      // 使用所有行中最长的作为lineWidth
      let lineWidth = 0;
      let width: number;
      let text: string;
      for (let i = 0, len = lines.length; i < len; i++) {
        // 判断是否超过高度限制
        if (i === lineCountLimit - 1) {
          // 当前行为最后一行
          const clip = layoutObj.textMeasure.clipTextWithSuffix(
            lines[i],
            layoutObj.textOptions,
            maxLineWidth,
            ellipsis
          );
          linesLayout.push({
            str: clip.str,
            width: clip.width
          });
          lineWidth = Math.max(lineWidth, clip.width);
          break; // 不处理后续行
        }

        text = lines[i] as string;
        width = layoutObj.textMeasure.measureTextWidth(text, layoutObj.textOptions);
        lineWidth = Math.max(lineWidth, width);
        linesLayout.push({ str: text, width });
      }
      bboxWH[0] = lineWidth;
    }
    bboxWH[1] = linesLayout.length * (lineHeight + buf);

    const bbox = {
      xOffset: 0,
      yOffset: 0,
      width: bboxWH[0],
      height: bboxWH[1]
    };

    layoutObj.LayoutBBox(bbox, textAlign, textBaseline as any);

    const layoutData = layoutObj.layoutWithBBox(bbox, linesLayout, textAlign, textBaseline as any, lineHeight);

    // const layoutData = layoutObj.GetLayoutByLines(
    //   text,
    //   textAlign,
    //   textBaseline as any,
    //   lineHeight,
    //   ellipsis === true ? (DefaultTextAttribute.ellipsis as string) : ellipsis || undefined,
    //   maxLineWidth
    // );
    // const { bbox } = layoutData;
    this.cache.layoutData = layoutData;
    this.clearUpdateShapeTag();
    this._AABBBounds.set(bbox.xOffset, bbox.yOffset, bbox.xOffset + bbox.width, bbox.yOffset + bbox.height);

    if (stroke) {
      this._AABBBounds.expand(lineWidth / 2);
    }

    return this._AABBBounds;
  }

  needUpdateTags(keys: string[]): boolean {
    for (let i = 0; i < WRAP_TEXT_UPDATE_TAG_KEY.length; i++) {
      const attrKey = WRAP_TEXT_UPDATE_TAG_KEY[i];
      if (keys.indexOf(attrKey) !== -1) {
        return true;
      }
    }
    return super.needUpdateTags(keys);
  }

  needUpdateTag(key: string): boolean {
    for (let i = 0; i < WRAP_TEXT_UPDATE_TAG_KEY.length; i++) {
      const attrKey = WRAP_TEXT_UPDATE_TAG_KEY[i];
      if (key === attrKey) {
        return true;
      }
    }
    return super.needUpdateTag(key);
  }
}
