/**
 * @description 标题组件
 */
import type { IGroup, IText, IRichText, IRichTextCharacter } from '@visactor/vrender-core';
import { merge, isValid, normalizePadding, isArray } from '@visactor/vutils';
import { AbstractComponent } from '../core/base';
import type { TitleAttrs } from './type';
import type { ComponentOptions } from '../interface';
import { DEFAULT_HTML_TEXT_SPEC } from '../constant';
import { loadTitleComponent } from './register';

loadTitleComponent();
export class Title extends AbstractComponent<Required<TitleAttrs>> {
  name = 'title';

  private _mainTitle?: IText | IRichText;
  private _subTitle?: IText | IRichText;

  static defaultAttributes: Partial<TitleAttrs> = {
    textStyle: {
      ellipsis: '...',
      fill: '#333',
      fontSize: 20,
      fontWeight: 'bold',
      textAlign: 'left',
      textBaseline: 'top'
    },
    subtextStyle: {
      ellipsis: '...',
      fill: '#6F6F6F',
      fontSize: 16,
      fontWeight: 'normal',
      textAlign: 'left',
      textBaseline: 'top'
    }
  };

  constructor(attributes: TitleAttrs, options?: ComponentOptions) {
    super(options?.skipDefault ? attributes : merge({}, Title.defaultAttributes, attributes));
  }

  protected render() {
    const {
      textType,
      text,
      subtextType,
      textStyle = {},
      subtext,
      subtextStyle = {},
      width,
      height,
      minWidth,
      maxWidth,
      minHeight,
      maxHeight,
      align,
      verticalAlign,
      padding = 0
    } = this.attribute as TitleAttrs;

    const parsedPadding = normalizePadding(padding);

    const group = this.createOrUpdateChild(
      'title-container',
      { x: parsedPadding[3], y: parsedPadding[0], zIndex: 1 },
      'group'
    ) as IGroup;

    const fixedMainTitleHeight = textStyle.height ?? height;
    if (this.attribute.visible !== false && textStyle.visible !== false) {
      const {
        width: mainTitleWidth,
        maxHeight: mainTitleMaxHeight,
        maxWidth: mainTitleMaxWidth,
        x = 0,
        y = 0,
        ellipsis = true,
        wordBreak = 'break-word',
        maxWidth,
        lineClamp
      } = textStyle;
      if (textType === 'rich' || isValid(textStyle.character)) {
        const attr = {
          x,
          y,
          width: mainTitleWidth ?? width ?? 0,
          height: fixedMainTitleHeight ?? 0,
          ellipsis: ellipsis ?? true,
          wordBreak: wordBreak ?? 'break-word',
          maxHeight: mainTitleMaxHeight ?? maxHeight,
          maxWidth: mainTitleMaxWidth ?? maxWidth,
          // 兼容旧版富文本配置，如果未设置textType === 'rich'，text内容为string 易报错
          textConfig: textStyle.character ?? (text as IRichTextCharacter[]),
          ...textStyle
        };
        this._mainTitle = group.createOrUpdateChild('mainTitle', attr, 'richtext') as IRichText;
      } else if (textType === 'html') {
        const attr = {
          html: {
            dom: text as string,
            ...DEFAULT_HTML_TEXT_SPEC,
            ...textStyle
          },
          x,
          y,
          width: mainTitleWidth ?? width ?? 0,
          height: fixedMainTitleHeight ?? 0,
          ellipsis,
          wordBreak,
          maxHeight: mainTitleMaxHeight ?? maxHeight,
          maxWidth: mainTitleMaxWidth ?? maxWidth,
          textConfig: [] as any[],
          ...textStyle
        };
        this._mainTitle = group.createOrUpdateChild('mainTitle', attr, 'richtext') as IRichText;
      } else if (isValid(text)) {
        this._mainTitle = group.createOrUpdateChild(
          'mainTitle',
          {
            text: isArray(text) ? (text as any) : [text as string],
            whiteSpace: 'normal',
            ...textStyle,
            maxLineWidth: textStyle.maxLineWidth ?? mainTitleWidth ?? width,
            heightLimit: textStyle.height ?? maxHeight,
            lineClamp,
            ellipsis,
            x,
            y
          },
          'text'
        ) as IText;
      }
    }

    const mainTextBoundsHeight = this._mainTitle ? this._mainTitle.AABBBounds.height() : 0;
    const mainTextBoundsWidth = this._mainTitle ? this._mainTitle.AABBBounds.width() : 0;

    // 目前 height 限制等于 0 时，相当于 Infinity，无限制

    if (this.attribute.visible !== false && subtextStyle.visible !== false) {
      const {
        width: subTitleWidth,
        height: subTitleHeight,
        maxWidth: subTitleMaxWidth,
        maxHeight: subTitleMaxHeight,
        x = 0,
        y = 0,
        ellipsis = true,
        wordBreak = 'break-word',
        lineClamp
      } = subtextStyle;
      const maxSubTextHeight = Math.max(Number.MIN_VALUE, maxHeight - mainTextBoundsHeight);

      if (subtextType === 'rich' || isValid(subtextStyle.character)) {
        const attr: any = {
          x,
          y,
          width: subTitleWidth ?? width ?? 0,
          height: subTitleHeight ?? height ?? 0,
          ellipsis,
          wordBreak,
          maxHeight: subTitleMaxHeight ?? maxSubTextHeight,
          maxWidth: subTitleMaxWidth ?? maxWidth,
          // 兼容旧版富文本配置，如果未设置textType === 'rich'，text内容为string 易报错
          textConfig: subtextStyle.character ?? (subtext as IRichTextCharacter[]),
          ...subtextStyle
        };
        this._subTitle = group.createOrUpdateChild('subTitle', attr, 'richtext') as IRichText;
      } else if (subtextType === 'html') {
        const attr: any = {
          html: {
            dom: subtext as string,
            ...DEFAULT_HTML_TEXT_SPEC,
            ...subtextStyle
          },
          x,
          y,
          width: subTitleWidth ?? width ?? 0,
          height: subTitleHeight ?? height ?? 0,
          ellipsis,
          wordBreak,
          maxHeight: subTitleMaxHeight ?? maxSubTextHeight,
          maxWidth: subTitleMaxWidth ?? maxWidth,
          textConfig: [] as any[],
          ...subtextStyle
        };
        this._subTitle = group.createOrUpdateChild('subTitle', attr, 'richtext') as IRichText;
      } else if (isValid(subtext)) {
        this._subTitle = group.createOrUpdateChild(
          'subTitle',
          {
            text: isArray(subtext) ? (subtext as any) : [subtext as string],
            whiteSpace: 'normal',
            ...subtextStyle,
            maxLineWidth: subtextStyle.maxLineWidth ?? width,
            heightLimit: subtextStyle.heightLimit ?? maxSubTextHeight,
            lineClamp,
            ellipsis,
            x: 0,
            y: mainTextBoundsHeight
          },
          'text'
        ) as IText;
      }
    }

    const subTextBoundsHeight = this._subTitle ? this._subTitle.AABBBounds.height() : 0;
    const subTextBoundsWidth = this._subTitle ? this._subTitle.AABBBounds.width() : 0;

    // 设置宽高
    let totalWidth = Math.max(mainTextBoundsWidth, subTextBoundsWidth);
    let totalHeight = mainTextBoundsHeight + (subtextStyle.height ?? subTextBoundsHeight);

    if (isValid(width)) {
      totalWidth = width;
    }

    if (isValid(height)) {
      totalHeight = height;
    }

    if (isValid(minWidth) && totalWidth < minWidth) {
      totalWidth = minWidth;
    }
    if (isValid(maxWidth)) {
      if (totalWidth > maxWidth) {
        totalWidth = maxWidth;
      }
    }

    if (isValid(minHeight) && totalHeight < minHeight) {
      totalHeight = minHeight;
    }

    if (isValid(maxHeight)) {
      if (totalHeight > maxHeight) {
        totalHeight = maxHeight;
      }
    }

    group.attribute.width = totalWidth;
    group.attribute.height = totalHeight;
    group.attribute.boundsPadding = parsedPadding;

    // 设置对齐
    if (this._mainTitle) {
      if (isValid(align) || isValid(textStyle.align)) {
        const mainTitleAlign = textStyle.align ? textStyle.align : align;
        const mainTitleWidth = textStyle.width ?? totalWidth;
        if (mainTitleAlign === 'center') {
          this._mainTitle.setAttribute('x', mainTitleWidth / 2);
          this._mainTitle.setAttribute('textAlign', 'center');
        } else if (mainTitleAlign === 'right') {
          this._mainTitle.setAttribute('x', mainTitleWidth);
          this._mainTitle.setAttribute('textAlign', 'right');
        } else {
          this._mainTitle.setAttribute('x', 0);
          this._mainTitle.setAttribute('textAlign', 'left');
        }
      }

      if (isValid(verticalAlign) || isValid(textStyle.verticalAlign)) {
        const mainTitleVerticalAlign = textStyle.verticalAlign ? textStyle.verticalAlign : verticalAlign;
        if (mainTitleVerticalAlign === 'middle' && isValid(fixedMainTitleHeight)) {
          this._mainTitle.setAttribute('y', fixedMainTitleHeight / 2);
          this._mainTitle.setAttribute('textBaseline', 'middle');
        } else if (mainTitleVerticalAlign === 'bottom' && isValid(fixedMainTitleHeight)) {
          this._mainTitle.setAttribute('y', fixedMainTitleHeight);
          this._mainTitle.setAttribute('textBaseline', 'bottom');
        } else {
          this._mainTitle.setAttribute('y', 0);
          this._mainTitle.setAttribute('textBaseline', 'top');
        }
      }
    }

    if (this._subTitle) {
      if (isValid(align) || isValid(subtextStyle.align)) {
        const subTitleAlign = subtextStyle.align ? subtextStyle.align : align;
        // 当subText没有设置显示的宽度，但是mainText设置了显示的宽度的时候，为mainText为主，因为默认subText要和mainText对齐
        const subTitleWidth = subtextStyle.width ?? textStyle.width ?? totalWidth;
        if (subTitleAlign === 'center') {
          this._subTitle.setAttribute('x', subTitleWidth / 2);
          this._subTitle.setAttribute('textAlign', 'center');
        } else if (subTitleAlign === 'right') {
          this._subTitle.setAttribute('x', subTitleWidth);
          this._subTitle.setAttribute('textAlign', 'right');
        } else {
          this._subTitle.setAttribute('x', 0);
          this._subTitle.setAttribute('textAlign', 'left');
        }
      }

      if (isValid(verticalAlign) || isValid(textStyle.verticalAlign)) {
        const subTitleVerticalAlign = subtextStyle.verticalAlign ? subtextStyle.verticalAlign : verticalAlign;
        const subTitleYStart = this._mainTitle
          ? isValid(fixedMainTitleHeight)
            ? // 如果是用户指定的高度，根据bounds的height 和指定高度求最大值
              this._mainTitle.AABBBounds.y1 + Math.max(this._mainTitle.AABBBounds.height(), fixedMainTitleHeight)
            : this._mainTitle.AABBBounds.y2
          : 0;
        const subTitleHeight = subtextStyle.height ?? height;
        if (subTitleVerticalAlign === 'middle' && isValid(subTitleHeight)) {
          this._subTitle.setAttribute('y', subTitleYStart + subTitleHeight / 2);
          this._subTitle.setAttribute('textBaseline', 'middle');
        } else if (subTitleVerticalAlign === 'bottom' && isValid(subTitleHeight)) {
          this._subTitle.setAttribute('y', subTitleYStart + subTitleHeight);
          this._subTitle.setAttribute('textBaseline', 'bottom');
        } else {
          this._subTitle.setAttribute('y', subTitleYStart);
          this._subTitle.setAttribute('textBaseline', 'top');
        }
      }
    }
  }
}
