/**
 * @description 指标卡组件
 */
import type { IGroup, INode, IText, ITextGraphicAttribute } from '@visactor/vrender-core';
import { merge, isValid, array, isValidNumber, get } from '@visactor/vutils';
import { AbstractComponent } from '../core/base';
import { isRichText, measureTextSize, richTextAttributeTransform } from '../util';
import type { IndicatorAttributes, IndicatorItemSpec } from './type';
import { DEFAULT_INDICATOR_THEME } from './config';
import { loadIndicatorComponent } from './register';

loadIndicatorComponent();
export class Indicator extends AbstractComponent<Required<IndicatorAttributes>> {
  name = 'indicator';

  private _title?: IText;
  private _content?: IText | IText[];

  protected render() {
    const { visible, title = {}, content, size, limitRatio = Infinity } = this.attribute as IndicatorAttributes;

    const limit = Math.min(size.width, size.height) * limitRatio;

    const group = this.createOrUpdateChild('indicator-container', { x: 0, y: 0, zIndex: 1 }, 'group') as IGroup;

    // 指标卡全部隐藏
    if (visible !== true) {
      group && group.hideAll();
      return;
    }

    if (isValid(title)) {
      if (title.visible !== false) {
        const titleStyle = merge({}, get(DEFAULT_INDICATOR_THEME, 'title.style'), title.style);
        if (isRichText(titleStyle)) {
          this._title = group.createOrUpdateChild(
            'indicator-title',
            {
              ...richTextAttributeTransform(titleStyle),
              visible: title.visible,
              x: 0,
              y: 0
            },
            'richtext'
          ) as IText;
        } else {
          this._title = group.createOrUpdateChild(
            'indicator-title',
            {
              ...titleStyle,
              /**
               * 加入以下逻辑：如果没有声明lineHeight，默认 lineHeight 等于 fontSize
               * 因为如果不声明 vrender 底层会默认给文本加上 2px 的高度，会影响布局计算
               * 注意：在autoFit改变fontsize时，lineHeight也要同步修改
               */
              lineHeight: isValid(titleStyle.lineHeight) ? titleStyle.lineHeight : titleStyle.fontSize,
              visible: title.visible,
              x: 0,
              y: 0
            },
            'text'
          ) as IText;
        }

        // auto-fit
        if (title.autoFit && isValidNumber(limit)) {
          this._setLocalAutoFit(limit, this._title, title);
        }

        //auto-limit
        if (title.autoLimit && isValidNumber(limitRatio)) {
          this._title.setAttribute('maxLineWidth', limit);
        }
      } else {
        /**
         * indicator部分隐藏
         * 例如title隐藏了，content还保留。直接设置visible:false 计算group.AABBounts是错的，影响上下居中。
         * 这里把隐藏的nodes删除后，group.AABBounts计算才正确。
         */
        const titleNode = group.find(node => node.name === 'indicator-title', false);
        titleNode && group.removeChild(titleNode as INode);
        this._title = undefined;
      }
    }

    if (isValid(content)) {
      const contents: IndicatorItemSpec[] = array(content);
      const contentComponents: IText[] = [];
      contents.forEach((contentItem, i) => {
        if (contentItem.visible !== false) {
          const contentStyle = merge({}, get(DEFAULT_INDICATOR_THEME, 'content.style'), contentItem.style);
          let contentComponent;
          if (isRichText(contentStyle)) {
            contentComponent = group.createOrUpdateChild(
              'indicator-content-' + i,
              {
                ...richTextAttributeTransform(contentStyle),
                visible: title.visible,
                x: 0,
                y: 0
              },
              'richtext'
            ) as IText;
          } else {
            contentComponent = group.createOrUpdateChild(
              'indicator-content-' + i,
              {
                ...contentStyle,
                lineHeight: isValid(contentStyle.lineHeight) ? contentStyle.lineHeight : contentStyle.fontSize,
                visible: contentItem.visible,
                x: 0,
                y: 0
              },
              'text'
            ) as IText;
          }

          // auto-fit
          if (contentItem.autoFit && isValidNumber(limit)) {
            this._setLocalAutoFit(limit, contentComponent, contentItem);
          }

          //auto-limit
          if (contentItem.autoLimit && isValidNumber(limitRatio)) {
            contentComponent.setAttribute('maxLineWidth', limit);
          }

          contentComponents.push(contentComponent);
        } else {
          /**
           * indicator部分隐藏
           */
          const contentItemNode = group.find(node => node.name === 'indicator-content-' + i, false);
          contentItemNode && group.removeChild(contentItemNode as INode);
        }
      });
      this._content = contentComponents;
    }

    this._setGlobalAutoFit(limit);
    this._setYPosition();

    const totalHeight = group?.AABBBounds.height() ?? 0;
    group.setAttribute('y', size.height / 2 - totalHeight / 2);
    group.setAttribute('x', size.width / 2);
  }

  private _setLocalAutoFit(limit: number, indicatorItem: IText, indicatorItemSpec: IndicatorItemSpec) {
    // only apply local auto fit for default auto fit text
    if ((indicatorItemSpec.fitStrategy ?? 'default') !== 'default') {
      return;
    }
    const originWidth = measureTextSize(
      (indicatorItemSpec.style?.text ?? '') as string | number | number[] | string[],
      (indicatorItemSpec.style ?? {}) as Partial<ITextGraphicAttribute>,
      this.stage?.getTheme().text.fontFamily
    ).width;
    if (originWidth > 0) {
      const ratio = (limit * (indicatorItemSpec.fitPercent ?? 0.5)) / originWidth;
      const fontSize = Math.floor((indicatorItemSpec.style?.fontSize ?? 20) * ratio);
      indicatorItem.setAttribute('fontSize', fontSize);
      indicatorItem.setAttribute(
        'lineHeight',
        isValid(indicatorItemSpec.style.lineHeight) ? indicatorItemSpec.style.lineHeight : fontSize
      );
    }
  }

  private _setGlobalAutoFit(limit: number) {
    // compute the inscribed rect width & height for all texts
    // the font size will be determined by the longest text
    // 1. hx^2 + hy^2 = r^2
    // 2. hy = ra * hx + h
    // -> (ra^2 + 1) * x^2 + (2 * h * ra) * x + (h^2 - r^2) = 0

    const r = limit / 2;

    // unify the initial font size for auto fit texts
    const singleHeight = 12;
    const autoFitTexts: { text: IText; spec: IndicatorItemSpec }[] = [];
    // other text height
    let otherHeight = 0;
    // non auto fit title height
    const titleSpec = this.attribute.title ?? {};
    if (titleSpec.autoFit && titleSpec.fitStrategy === 'inscribed') {
      this._title.setAttribute('fontSize', singleHeight);
      autoFitTexts.push({ text: this._title, spec: this.attribute.title ?? {} });
    } else {
      otherHeight += this._title?.AABBBounds?.height?.() ?? 0;
    }
    const titleSpace = titleSpec.space ?? 0;
    otherHeight += titleSpace;
    // non auto fit content height
    array(this.attribute.content)
      .filter(contentSpec => contentSpec.visible !== false)
      .forEach((contentSpec, index) => {
        const contentText = this._content[index];
        if (contentSpec.autoFit && contentSpec.fitStrategy === 'inscribed') {
          contentText.setAttribute('fontSize', singleHeight);
          autoFitTexts.push({ text: contentText, spec: contentSpec });
        } else {
          otherHeight += contentText?.AABBBounds?.height?.() ?? 0;
        }
        const contentSpace = contentSpec.space ?? 0;
        otherHeight += contentSpace;
      });
    if (autoFitTexts.length <= 0) {
      return;
    }

    // max width for all auto fit texts
    const maxWidth = autoFitTexts.reduce((width, textItem) => {
      return Math.max(width, textItem.text.AABBBounds.width());
    }, 0);

    // y = x * (singleHeight / maxWidth * textCount) + otherHeight
    // hy = hx * (singleHeight / maxWidth * textCount) + otherHeight / 2
    const ra = (singleHeight / maxWidth) * autoFitTexts.length;
    const h = otherHeight / 2;
    const a = ra ** 2 + 1;
    const b = 2 * h * ra;
    const c = h ** 2 - r ** 2;
    const hx = (-b + Math.sqrt(b ** 2 - 4 * a * c)) / (2 * a);
    const hy = ra * hx + h;
    const y = 2 * hy;
    const lineHeight = (y - otherHeight) / autoFitTexts.length;
    if (isValidNumber(y)) {
      autoFitTexts.forEach(textItem => {
        const specLineHeight = textItem.spec.style?.lineHeight;
        textItem.text.setAttribute('fontSize', lineHeight);
        textItem.text.setAttribute('lineHeight', isValid(specLineHeight) ? specLineHeight : lineHeight);
      });
    }
  }

  private _setYPosition() {
    let lastContentHeight = 0;

    const titleHeight = this._title?.AABBBounds?.height?.() ?? 0;
    const titleSpace = this.attribute.title?.space ?? 0;
    array(this.attribute.content)
      .filter(contentSpec => contentSpec.visible !== false)
      .forEach((contentSpec, index) => {
        const contentText = this._content[index];
        contentText.setAttribute('y', titleHeight + titleSpace + lastContentHeight);
        const contentSpace = contentSpec.space ?? 0;
        lastContentHeight += contentText.AABBBounds.height() + contentSpace;
      });
  }
}
