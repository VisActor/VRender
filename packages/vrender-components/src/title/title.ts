/**
 * @description 标题组件
 */
import type { IGroup, IText, IRichText, IRichTextCharacter } from '@visactor/vrender-core';
import { merge, isValid, normalizePadding } from '@visactor/vutils';
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

    if (this.attribute.visible !== false && textStyle.visible !== false) {
      if (textType === 'rich' || isValid(textStyle.character)) {
        const attr = {
          x: textStyle.x ?? 0,
          y: textStyle.y ?? 0,
          width: textStyle.width ?? width ?? 0,
          height: textStyle.height ?? height ?? 0,
          ellipsis: textStyle.ellipsis ?? true,
          wordBreak: textStyle.wordBreak ?? 'break-word',
          maxHeight: textStyle.maxHeight,
          maxWidth: textStyle.maxWidth,
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
          x: textStyle.x ?? 0,
          y: textStyle.y ?? 0,
          width: textStyle.width ?? width ?? 0,
          height: textStyle.height ?? height ?? 0,
          ellipsis: textStyle.ellipsis ?? true,
          wordBreak: textStyle.wordBreak ?? 'break-word',
          maxHeight: textStyle.maxHeight,
          maxWidth: textStyle.maxWidth,
          textConfig: [] as any[],
          ...textStyle
        };
        this._mainTitle = group.createOrUpdateChild('mainTitle', attr, 'richtext') as IRichText;
      } else if (isValid(text)) {
        this._mainTitle = group.createOrUpdateChild(
          'mainTitle',
          {
            text: [text as string],
            ...textStyle,
            maxLineWidth: textStyle.maxLineWidth ?? width,
            heightLimit: textStyle.heightLimit,
            lineClamp: textStyle.lineClamp,
            ellipsis: textStyle.ellipsis ?? true,
            x: 0,
            y: 0
          },
          'wrapText'
        ) as IText;
      }
    }

    const maintextHeight = this._mainTitle ? this._mainTitle.AABBBounds.height() : 0;
    const maintextWidth = this._mainTitle ? this._mainTitle.AABBBounds.width() : 0;

    if (this.attribute.visible !== false && subtextStyle.visible !== false) {
      if (subtextType === 'rich' || isValid(subtextStyle.character)) {
        const attr: any = {
          x: subtextStyle.x ?? 0,
          y: subtextStyle.y ?? 0,
          width: subtextStyle.width ?? width ?? 0,
          height: subtextStyle.height ?? height ?? 0,
          ellipsis: subtextStyle.ellipsis ?? true,
          wordBreak: subtextStyle.wordBreak ?? 'break-word',
          maxHeight: subtextStyle.maxHeight,
          maxWidth: subtextStyle.maxWidth,
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
          x: subtextStyle.x ?? 0,
          y: subtextStyle.y ?? 0,
          width: subtextStyle.width ?? width ?? 0,
          height: subtextStyle.height ?? height ?? 0,
          ellipsis: subtextStyle.ellipsis ?? true,
          wordBreak: subtextStyle.wordBreak ?? 'break-word',
          maxHeight: subtextStyle.maxHeight,
          maxWidth: subtextStyle.maxWidth,
          textConfig: [] as any[],
          ...subtextStyle
        };
        this._subTitle = group.createOrUpdateChild('subTitle', attr, 'richtext') as IRichText;
      } else if (isValid(subtext)) {
        this._subTitle = group.createOrUpdateChild(
          'subTitle',
          {
            text: [subtext as string],
            ...subtextStyle,
            maxLineWidth: subtextStyle.maxLineWidth ?? width,
            heightLimit: subtextStyle.heightLimit,
            lineClamp: subtextStyle.lineClamp,
            ellipsis: subtextStyle.ellipsis ?? true,
            x: 0,
            y: maintextHeight
          },
          'wrapText'
        ) as IText;
      }
    }

    const subtextHeight = this._subTitle ? this._subTitle.AABBBounds.height() : 0;
    const subtextWidth = this._subTitle ? this._subTitle.AABBBounds.width() : 0;

    // 设置宽高
    let titleWidth = Math.max(maintextWidth, subtextWidth);
    let titleHeight = maintextHeight + (subtextStyle.height ?? subtextHeight);

    if (isValid(width)) {
      titleWidth = width;
      this._mainTitle && this._mainTitle.setAttribute('maxLineWidth', width);
      this._subTitle && this._subTitle.setAttribute('maxLineWidth', width);
    }

    if (isValid(height)) {
      titleHeight = height;
    }

    if (isValid(minWidth) && titleWidth < minWidth) {
      titleWidth = minWidth;
    }
    if (isValid(maxWidth)) {
      this._mainTitle && this._mainTitle.setAttribute('maxLineWidth', maxWidth);
      this._subTitle && this._subTitle.setAttribute('maxLineWidth', maxWidth);
      this._mainTitle && this._mainTitle.setAttribute('maxWidth', maxWidth);
      this._subTitle && this._subTitle.setAttribute('maxWidth', maxWidth);
      if (titleWidth > maxWidth) {
        titleWidth = maxWidth;
      }
    }

    if (isValid(minHeight) && titleHeight < minHeight) {
      titleHeight = minHeight;
    }
    if (isValid(maxHeight)) {
      this._mainTitle && this._mainTitle.setAttribute('maxHeight', maxHeight);
      this._subTitle && this._subTitle.setAttribute('maxHeight', maxHeight - maintextHeight);
      if (titleHeight > maxHeight) {
        titleHeight = maxHeight;
      }
    }

    group.attribute.width = titleWidth;
    group.attribute.height = titleHeight;
    group.attribute.boundsPadding = parsedPadding;

    // 设置对齐
    if (this._mainTitle) {
      if (isValid(align) || isValid(textStyle.align)) {
        const mainTitleAlign = textStyle.align ? textStyle.align : align;
        const mainTitleWidth = textStyle.width ?? maintextWidth;
        if (mainTitleAlign === 'left') {
          this._mainTitle.setAttribute('x', 0);
          this._mainTitle.setAttribute('textAlign', 'left');
        } else if (mainTitleAlign === 'center') {
          this._mainTitle.setAttribute('x', mainTitleWidth / 2);
          this._mainTitle.setAttribute('textAlign', 'center');
        } else if (mainTitleAlign === 'right') {
          this._mainTitle.setAttribute('x', mainTitleWidth);
          this._mainTitle.setAttribute('textAlign', 'right');
        }
      }

      if (isValid(verticalAlign) || isValid(textStyle.verticalAlign)) {
        const mainTitleVerticalAlign = textStyle.verticalAlign ? textStyle.verticalAlign : verticalAlign;
        const mainTitleHeight = textStyle.height ? textStyle.height : titleHeight;
        if (mainTitleVerticalAlign === 'top') {
          this._mainTitle.setAttribute('y', 0);
          this._mainTitle.setAttribute('textBaseline', 'top');
        } else if (mainTitleVerticalAlign === 'middle') {
          this._mainTitle.setAttribute('y', mainTitleHeight / 2);
          this._mainTitle.setAttribute('textBaseline', 'middle');
        } else if (mainTitleVerticalAlign === 'bottom') {
          this._mainTitle.setAttribute('y', mainTitleHeight);
          this._mainTitle.setAttribute('textBaseline', 'bottom');
        }
      }
    }

    if (this._subTitle) {
      if (isValid(align) || isValid(subtextStyle.align)) {
        const subTitleAlign = subtextStyle.align ? subtextStyle.align : align;
        const subTitleWidth = subtextStyle.width ?? subtextWidth;
        if (subTitleAlign === 'left') {
          this._subTitle.setAttribute('x', 0);
          this._subTitle.setAttribute('textAlign', 'left');
        } else if (subTitleAlign === 'center') {
          this._subTitle.setAttribute('x', subTitleWidth / 2);
          this._subTitle.setAttribute('textAlign', 'center');
        } else if (subTitleAlign === 'right') {
          this._subTitle.setAttribute('x', subTitleWidth);
          this._subTitle.setAttribute('textAlign', 'right');
        }
      }

      if (isValid(verticalAlign) || isValid(textStyle.verticalAlign)) {
        const subTitleVerticalAlign = subtextStyle.verticalAlign ? subtextStyle.verticalAlign : verticalAlign;
        const subTitleYStart = maintextHeight;
        const subTitleHeight = subtextStyle.height ?? 0;
        if (subTitleVerticalAlign === 'top') {
          this._subTitle.setAttribute('y', subTitleYStart);
          this._subTitle.setAttribute('textBaseline', 'top');
        } else if (subTitleVerticalAlign === 'middle') {
          this._subTitle.setAttribute('y', subTitleYStart + subTitleHeight / 2);
          this._subTitle.setAttribute('textBaseline', 'middle');
        } else if (subTitleVerticalAlign === 'bottom') {
          this._subTitle.setAttribute('y', subTitleYStart + subTitleHeight);
          this._subTitle.setAttribute('textBaseline', 'bottom');
        }
      }
    }
  }
}
