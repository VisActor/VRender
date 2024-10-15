/**
 * @description 标签组件
 */
import {
  type IGroup,
  type IRect,
  type ISymbol,
  type IText,
  type ITextAttribute,
  type ITextGraphicAttribute,
  type IRichTextGraphicAttribute,
  type IRichText,
  type IGraphicAttribute,
  CustomPath2D
} from '@visactor/vrender-core';
import { isBoolean, isEmpty, isNil, isNumber, isObject, isValid, merge, normalizePadding } from '@visactor/vutils';
import { AbstractComponent } from '../core/base';
import { isRichText, measureTextSize, richTextAttributeTransform } from '../util';
import type { BackgroundAttributes, ComponentOptions } from '../interface';
import type { TagAttributes, TagShapeAttributes } from './type';
import { loadTagComponent } from './register';
import type { TextContent } from '../core/type';

loadTagComponent();
export class Tag extends AbstractComponent<Required<TagAttributes>> {
  name = 'tag';

  private _bgRect!: IRect;
  private _textShape!: IText | IRichText;
  private _symbol!: ISymbol;
  private _tagStates: string[] = [];
  private _rectStates: string[] = [];
  private _symbolStates: string[] = [];
  private _textStates: string[] = [];

  getBgRect() {
    return this._bgRect;
  }

  getTextShape() {
    return this._textShape;
  }

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
    this.cacheStates();
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
      textAlwaysCenter,
      containerTextAlign
    } = this.attribute as TagAttributes;
    const parsedPadding = normalizePadding(padding);

    const group = this.createOrUpdateChild('tag-content', { x: 0, y: 0, zIndex: 1 }, 'group') as IGroup;

    let symbol;
    let tagX = -parsedPadding[3];
    let tagY = -parsedPadding[0];
    let tagWidth = parsedPadding[1] + parsedPadding[3];
    let tagHeight = parsedPadding[0] + parsedPadding[2];
    let textX = 0;
    let symbolPlaceWidth = 0;
    const { visible: shapeVisible, ...shapeStyle } = shape;
    if (isBoolean(shapeVisible)) {
      const size = shapeStyle?.size || 10;
      const maxSize = (isNumber(size) ? size : Math.max(size[0], size[1])) as number;

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

    let textShape: IRichText | IText;
    const isRich = isRichText({ text } as TextContent) || type === 'rich';
    if (isRich) {
      const richTextAttrs = {
        ...richTextAttributeTransform({ type, text, ...textStyle } as any),
        ...(textStyle as IRichTextGraphicAttribute),
        visible: isValid(text) && visible !== false,
        x: textX,
        y: 0
      };
      textShape = group.createOrUpdateChild('tag-text', richTextAttrs, 'richtext') as IRichText;
      tagWidth += textShape.AABBBounds.width();
      tagHeight += textShape.AABBBounds.height();
      tagX += textShape.AABBBounds.x1;
      tagY += textShape.AABBBounds.y1;
    } else {
      const textAttrs = {
        text: isObject(text) && 'type' in text && text.type === 'text' ? text.text : text,
        visible: isValid(text) && visible !== false,
        lineHeight: (textStyle as ITextGraphicAttribute)?.fontSize,
        ...(textStyle as ITextGraphicAttribute),
        x: textX,
        y: 0
      };
      if (isNil(textAttrs.lineHeight)) {
        textAttrs.lineHeight = (textStyle as ITextGraphicAttribute).fontSize;
      }
      textShape = group.createOrUpdateChild('tag-text', textAttrs as ITextGraphicAttribute, 'text') as IText;
      if (!isEmpty(state?.text)) {
        textShape.states = state.text;
      }

      // 因为文本可能发生旋转，所以需要使用 measureTextSize 方法
      const textBounds = measureTextSize(textAttrs.text as string, textStyle, this.stage?.getTheme()?.text);
      const textWidth = textBounds.width;
      const textHeight = textBounds.height;
      tagWidth += textWidth;
      const size = shape.size ?? 10;
      const maxSize = (isNumber(size) ? size : Math.max(size[0], size[1])) as number;
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

      tagX = 0;
      tagY = 0;
      let flag = 0;
      if (textAlign === 'left' || textAlign === 'start') {
        flag = 1;
      } else if (textAlign === 'right' || textAlign === 'end') {
        flag = -1;
      } else if (textAlign === 'center') {
        flag = 0;
      }
      if (!flag) {
        tagX -= tagWidth / 2;
        if (symbol) {
          symbol.setAttribute('x', (symbol.attribute.x || 0) - textWidth / 2);
        }

        group.setAttribute('x', -symbolPlaceWidth / 2);
      } else if (flag < 0) {
        tagX -= tagWidth;
        if (symbol) {
          symbol.setAttribute('x', (symbol.attribute.x || 0) - textWidth);
        }

        group.setAttribute('x', -parsedPadding[1] - symbolPlaceWidth);
      } else if (flag > 0) {
        group.setAttribute('x', parsedPadding[3]);
      }

      const shouldCenter = containerTextAlign ? containerTextAlign === 'center' : textAlwaysCenter;
      const shouldRight = containerTextAlign === 'right' || containerTextAlign === 'end';
      const shouldLeft = containerTextAlign === 'left' || containerTextAlign === 'start';

      if (shouldCenter && flag) {
        // 文本容器内居中
        // 剔除padding后的内宽度
        const containerWidth = tagWidth - parsedPadding[1] - parsedPadding[3];
        const tsWidth = textWidth + symbolPlaceWidth;
        const textX =
          flag === 1
            ? (containerWidth - tsWidth) / 2 + symbolPlaceWidth + textWidth / 2
            : parsedPadding[0] + symbolPlaceWidth - (tagWidth / 2 + tsWidth / 2 - symbolPlaceWidth) + textWidth / 2;

        textShape.setAttributes({
          x: textX,
          textAlign: 'center'
        });
        if (symbol) {
          const symbolX = textX - textWidth / 2 - symbolPlaceWidth + maxSize / 2;
          symbol.setAttributes({
            x: symbolX
          });
        }
      }

      if (shouldLeft && flag !== 1) {
        // 文本容器内朝左展示
        const containerWidth = tagWidth - parsedPadding[1] - parsedPadding[3];
        const offset =
          flag === 0
            ? -containerWidth / 2 + symbolPlaceWidth / 2
            : -tagWidth + parsedPadding[3] + parsedPadding[1] + symbolPlaceWidth;
        const textX = offset + symbolPlaceWidth;

        textShape.setAttributes({
          x: textX,
          textAlign: 'left'
        });

        if (symbol) {
          const symbolX = offset + maxSize / 2;
          symbol.setAttributes({
            x: symbolX
          });
        }
      }

      if (shouldRight && flag !== -1) {
        // 文本容器内朝右展示
        const containerWidth = tagWidth - parsedPadding[1] - parsedPadding[3];
        const textX = flag === 0 ? containerWidth / 2 + symbolPlaceWidth / 2 : containerWidth;

        textShape.setAttributes({
          x: textX,
          textAlign: 'right'
        });
        if (symbol) {
          const symbolX = textX - textWidth - symbolPlaceWidth + maxSize / 2;
          symbol.setAttributes({
            x: symbolX
          });
        }
      }

      if (textBaseline === 'middle') {
        tagY -= tagHeight / 2;
        if (symbol) {
          symbol.setAttribute('y', 0);
        }
      } else if (textBaseline === 'bottom') {
        tagY -= tagHeight;
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
    }
    // 绘制背景层
    const { visible: bgVisible, ...backgroundStyle } = panel;
    if (visible && isBoolean(bgVisible)) {
      const bgRect = this.createOrUpdateChild(
        'tag-panel',
        {
          ...backgroundStyle,
          visible: bgVisible && !!text,
          width: tagWidth,
          height: tagHeight,
          x: tagX,
          y: tagY
        },
        'rect'
      ) as IRect;
      if (!isEmpty(state?.panel)) {
        bgRect.states = state.panel;
      }
      if (backgroundStyle.customShape) {
        const customShape = backgroundStyle.customShape;
        bgRect.pathProxy = (attrs: Partial<IGraphicAttribute>) => {
          return customShape(this, attrs, new CustomPath2D());
        };
      }
      this._bgRect = bgRect;
    }
    this._textShape = textShape;
    this._symbol = symbol;

    this.resetStates();
  }

  initAttributes(params: TagAttributes, options?: ComponentOptions) {
    params = options?.skipDefault ? params : merge({}, Tag.defaultAttributes, params);
    super.initAttributes(params);
    this.render();
  }

  addState(stateName: string, keepCurrentStates?: boolean, hasAnimation?: boolean): void {
    super.addState(stateName, keepCurrentStates, hasAnimation);
    if (this._textShape) {
      this._textShape.addState(stateName, keepCurrentStates, hasAnimation);
    }
    if (this._bgRect) {
      this._bgRect.addState(stateName, keepCurrentStates, hasAnimation);
    }
    if (this._symbol) {
      this._symbol.addState(stateName, keepCurrentStates, hasAnimation);
    }
  }

  removeState(stateName: string, hasAnimation?: boolean): void {
    super.removeState(stateName, hasAnimation);
    if (this._textShape) {
      this._textShape.removeState(stateName, hasAnimation);
    }
    if (this._bgRect) {
      this._bgRect.removeState(stateName, hasAnimation);
    }
    if (this._symbol) {
      this._symbol.removeState(stateName, hasAnimation);
    }
  }

  cacheStates() {
    this._tagStates = this.currentStates?.slice() ?? [];
    this._rectStates = this._bgRect?.currentStates?.slice() ?? [];
    this._symbolStates = this._symbol?.currentStates?.slice() ?? [];
    this._textStates = this._textShape?.currentStates?.slice() ?? [];
    this.clearStates();
    this._bgRect?.clearStates();
    this._symbol?.clearStates();
    this._textShape?.clearStates();
  }
  resetStates() {
    this._tagStates.length && this.useStates(this._tagStates);
    this._rectStates.length && this._bgRect?.useStates(this._rectStates);
    this._symbolStates.length && this._symbol?.useStates(this._symbolStates);
    this._textStates.length && this._textShape?.useStates(this._textStates);
  }
}
