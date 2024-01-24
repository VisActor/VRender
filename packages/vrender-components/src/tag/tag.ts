/**
 * @description 标签组件
 */
import type {
  IGroup,
  IRect,
  ISymbol,
  IText,
  ITextAttribute,
  ITextGraphicAttribute,
  IRichTextGraphicAttribute,
  IRichText,
  IRichTextCharacter
} from '@visactor/vrender-core';
import { isBoolean, isEmpty, isNil, isNumber, isValid, merge, normalizePadding } from '@visactor/vutils';
import { AbstractComponent } from '../core/base';
import { measureTextSize } from '../util';
import type { BackgroundAttributes, ComponentOptions } from '../interface';
import type { TagAttributes, TagShapeAttributes } from './type';
import { DEFAULT_HTML_TEXT_SPEC } from '../constant';
import { loadTagComponent } from './register';

loadTagComponent();
export class Tag extends AbstractComponent<Required<TagAttributes>> {
  name = 'tag';

  static defaultAttributes: Partial<TagAttributes> = {
    visible: true,
    textStyle: {
      fontSize: 12,
      fill: '#000',
      textAlign: 'left',
      textBaseline: 'top'
    },
    space: 4,
    padding: 4,
    // @ts-ignore
    shape: {
      fill: '#000'
    }
  };

  constructor(attributes: TagAttributes, options?: ComponentOptions) {
    super(options?.skipDefault ? attributes : merge({}, Tag.defaultAttributes, attributes));
  }

  protected render() {
    const {
      text = '',
      textStyle = {} as ITextGraphicAttribute | IRichTextGraphicAttribute,
      shape = {} as TagShapeAttributes,
      panel = {} as BackgroundAttributes,
      space = 4,
      minWidth,
      maxWidth,
      padding = 4,
      visible,
      state,
      type,
      textAlwaysCenter
    } = this.attribute as TagAttributes;
    const parsedPadding = normalizePadding(padding);

    const group = this.createOrUpdateChild('tag-content', { x: 0, y: 0, zIndex: 1 }, 'group') as IGroup;

    let symbol;
    let tagWidth = parsedPadding[1] + parsedPadding[3];
    let tagHeight = parsedPadding[0] + parsedPadding[2];
    let textX = 0;
    let symbolPlaceWidth = 0;
    const { visible: shapeVisible, ...shapeStyle } = shape;
    if (isBoolean(shapeVisible)) {
      const size = shapeStyle?.size || 10;
      const maxSize = isNumber(size) ? size : Math.max(size[0], size[1]);

      symbol = group.createOrUpdateChild(
        'tag-shape',
        {
          symbolType: 'circle',
          size,
          strokeBoundsBuffer: 0,
          ...shapeStyle,
          visible: shapeVisible,
          x: maxSize / 2,
          y: maxSize / 2
        },
        'symbol'
      ) as ISymbol;
      if (!isEmpty(state?.shape)) {
        symbol.states = state.shape;
      }

      if (shapeVisible) {
        symbolPlaceWidth = maxSize + space;
      }
    }

    tagWidth += symbolPlaceWidth;
    textX += symbolPlaceWidth;

    let textShape;
    if (type === 'rich') {
      const richTextAttrs = {
        textConfig: text as IRichTextCharacter[],
        visible: isValid(text) && visible !== false,
        ...(textStyle as IRichTextGraphicAttribute),
        x: textX,
        y: 0,
        width: (textStyle as IRichTextGraphicAttribute).width ?? 0,
        height: (textStyle as IRichTextGraphicAttribute).height ?? 0
      };
      textShape = group.createOrUpdateChild('tag-text', richTextAttrs, 'richtext') as IRichText;

      // 绘制背景层
      const { visible: bgVisible, ...backgroundStyle } = panel;
      if (visible && isBoolean(bgVisible)) {
        const bgRect = this.createOrUpdateChild(
          'tag-panel',
          {
            ...backgroundStyle,
            visible: bgVisible && !!text,
            x: textShape.AABBBounds.x1,
            y: textShape.AABBBounds.y1,
            width: textShape.AABBBounds.width(),
            height: textShape.AABBBounds.height()
          },
          'rect'
        ) as IRect;
        if (!isEmpty(state?.panel)) {
          bgRect.states = state.panel;
        }
      }
    } else if (type === 'html') {
      const richTextAttrs = {
        textConfig: [] as IRichTextCharacter[],
        visible: isValid(text) && visible !== false,
        html: {
          dom: text as string,
          ...DEFAULT_HTML_TEXT_SPEC,
          ...textStyle
        },
        ...(textStyle as IRichTextGraphicAttribute),
        x: textX,
        y: 0
      };
      textShape = group.createOrUpdateChild('tag-text', richTextAttrs, 'richtext') as IRichText;

      // 绘制背景层
      const { visible: bgVisible, ...backgroundStyle } = panel;
      if (visible && isBoolean(bgVisible)) {
        const bgRect = this.createOrUpdateChild(
          'tag-panel',
          {
            ...backgroundStyle,
            visible: bgVisible && !!text,
            x: textShape.AABBBounds.x1,
            y: textShape.AABBBounds.y1,
            width: textShape.AABBBounds.width(),
            height: textShape.AABBBounds.height()
          },
          'rect'
        ) as IRect;
        if (!isEmpty(state?.panel)) {
          bgRect.states = state.panel;
        }
      }
    } else {
      const textAttrs = {
        text: text as string | number | string[] | number[],
        visible: isValid(text) && visible !== false,
        lineHeight: (textStyle as ITextGraphicAttribute)?.fontSize,
        ...(textStyle as ITextGraphicAttribute),
        x: textX,
        y: 0
      };
      if (isNil(textAttrs.lineHeight)) {
        textAttrs.lineHeight = (textStyle as ITextGraphicAttribute).fontSize;
      }
      textShape = group.createOrUpdateChild('tag-text', textAttrs, 'text') as IText;
      if (!isEmpty(state?.text)) {
        textShape.states = state.text;
      }

      // 因为文本可能发生旋转，所以需要使用 measureTextSize 方法
      const textBounds = measureTextSize(textAttrs.text as string, textStyle, this.stage?.getTheme().text.fontFamily);
      const textWidth = textBounds.width;
      const textHeight = textBounds.height;
      tagWidth += textWidth;
      const size = shape.size ?? 10;
      const maxSize = isNumber(size) ? size : Math.max(size[0], size[1]);
      tagHeight += Math.max(textHeight, shape.visible ? maxSize : 0);

      const { textAlign, textBaseline } = textStyle as ITextAttribute;

      if (isValid(minWidth) || isValid(maxWidth)) {
        if (isValid(minWidth) && tagWidth < minWidth) {
          tagWidth = minWidth;
        }
        if (isValid(maxWidth) && tagWidth > maxWidth) {
          tagWidth = maxWidth;
          textShape.setAttribute('maxLineWidth', maxWidth - parsedPadding[1] - parsedPadding[2]);
        }
      }

      let x = 0;
      let y = 0;
      let flag = 0;
      if (textAlign === 'left' || textAlign === 'start') {
        flag = 1;
      } else if (textAlign === 'right' || textAlign === 'end') {
        flag = -1;
      } else if (textAlign === 'center') {
        flag = 0;
      }
      if (!flag) {
        x -= tagWidth / 2;
        if (symbol) {
          symbol.setAttribute('x', (symbol.attribute.x || 0) - textWidth / 2);
        }

        group.setAttribute('x', -symbolPlaceWidth / 2);
      } else if (flag < 0) {
        x -= tagWidth;
        if (symbol) {
          symbol.setAttribute('x', (symbol.attribute.x || 0) - textWidth);
        }

        group.setAttribute('x', -parsedPadding[1] - symbolPlaceWidth);
      } else if (flag > 0) {
        group.setAttribute('x', parsedPadding[3]);
      }

      if (textAlwaysCenter) {
        // for flex layout
        const textPaddingWidth = symbolPlaceWidth - parsedPadding[flag > 0 ? 3 : 1];
        const contentWidth = textPaddingWidth + textWidth;
        textShape.setAttributes({
          x: (tagWidth / 2 - textPaddingWidth / 2) * flag,
          textAlign: 'center'
        });
        symbol.setAttributes({
          x: ((tagWidth - contentWidth) / 2) * flag + (flag < 0 ? textPaddingWidth : 0)
        });
      }

      if (textBaseline === 'middle') {
        y -= tagHeight / 2;
        if (symbol) {
          symbol.setAttribute('y', 0);
        }
      } else if (textBaseline === 'bottom') {
        y -= tagHeight;
        if (symbol) {
          symbol.setAttribute('y', -textHeight / 2);
        }

        group.setAttribute('y', -parsedPadding[2]);
      } else if (textBaseline === 'top') {
        group.setAttribute('y', parsedPadding[0]);
        if (symbol) {
          symbol.setAttribute('y', textHeight / 2);
        }
      }

      // 绘制背景层
      const { visible: bgVisible, ...backgroundStyle } = panel;
      if (visible && isBoolean(bgVisible)) {
        const bgRect = this.createOrUpdateChild(
          'tag-panel',
          {
            ...backgroundStyle,
            visible: bgVisible && !!text,
            x,
            y,
            width: tagWidth,
            height: tagHeight
          },
          'rect'
        ) as IRect;
        if (!isEmpty(state?.panel)) {
          bgRect.states = state.panel;
        }
      }
    }
  }
}
