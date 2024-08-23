/**
 * @description 指标卡组件
 */
import type { IGroup, IRichText, IText, ITextGraphicAttribute } from '@visactor/vrender-core';
import { merge, isValid, array, isValidNumber, get } from '@visactor/vutils';
import { AbstractComponent } from '../core/base';
import { createTextGraphicByType, measureTextSize } from '../util';
import type { IndicatorAttributes, IndicatorItemSpec } from './type';
import { DEFAULT_INDICATOR_THEME } from './config';
import { loadIndicatorComponent } from './register';

loadIndicatorComponent();
export class Indicator extends AbstractComponent<Required<IndicatorAttributes>> {
  name = 'indicator';

  private _title?: IText | IRichText;
  private _content?: (IText | IRichText)[];

  protected _renderText(
    group: IGroup,
    title: IndicatorItemSpec,
    limit: number,
    limitRatio: number,
    themePath: string,
    graphicName: string
  ) {
    if (title.visible !== false) {
      const titleStyle = merge({}, get(DEFAULT_INDICATOR_THEME, themePath), title.style, {
        visible: title.visible
      });
      titleStyle.lineHeight = isValid(titleStyle.lineHeight) ? titleStyle.lineHeight : titleStyle.fontSize;

      if (title.formatMethod) {
        titleStyle._originText = titleStyle.text;
        titleStyle.text = title.formatMethod(titleStyle.text, titleStyle);
      }
      const textGraphic = createTextGraphicByType(titleStyle);
      textGraphic.name = graphicName;
      group.appendChild(textGraphic);

      // auto-fit
      if (title.autoFit && isValidNumber(limit)) {
        this._setLocalAutoFit(limit, textGraphic as IText, title);
      }

      //auto-limit
      if (title.autoLimit && isValidNumber(limitRatio)) {
        textGraphic.setAttribute('maxLineWidth', limit);
      }

      return textGraphic;
    }

    return undefined;
  }

  protected render() {
    this.removeAllChild(true);

    if (this.attribute.visible !== true) {
      return;
    }
    const { title = {}, content, size, limitRatio = Infinity } = this.attribute as IndicatorAttributes;

    const limit = Math.min(size.width, size.height) * limitRatio;

    const group = this.createOrUpdateChild(
      'indicator-container',
      { x: 0, y: 0, zIndex: 1, pickable: this.attribute.pickable ?? true },
      'group'
    ) as IGroup;
    if (isValid(title)) {
      this._title = this._renderText(group, title, limit, limitRatio, 'title.style', 'indicator-title');
    }

    if (isValid(content)) {
      const contents: IndicatorItemSpec[] = array(content);
      const contentComponents: (IText | IRichText)[] = [];
      contents.forEach((contentItem, i) => {
        if (contentItem.visible !== false) {
          contentComponents.push(
            this._renderText(group, contentItem, limit, limitRatio, 'content.style', 'indicator-content-' + i)
          );
        } else {
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
      this.stage?.getTheme()?.text
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
      autoFitTexts.push({ text: this._title as IText, spec: this.attribute.title ?? {} });
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
          autoFitTexts.push({ text: contentText as IText, spec: contentSpec });
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
