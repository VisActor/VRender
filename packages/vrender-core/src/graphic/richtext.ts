import type { IAABBBounds } from '@visactor/vutils';
import { isNumber, isString } from '@visactor/vutils';
import type {
  IRichText,
  IRichTextCharacter,
  RichTextGlobalAlignType,
  RichTextGlobalBaselineType,
  RichTextVerticalDirection,
  RichTextWordBreak,
  IRichTextGraphicAttribute,
  IRichTextImageCharacter,
  IRichTextParagraphCharacter,
  IStage,
  ILayer,
  IRichTextIcon,
  EventPoint,
  IRichTextFrame,
  ISetAttributeContext
} from '../interface';
import { Graphic, GRAPHIC_UPDATE_TAG_KEY, NOWORK_ANIMATE_ATTR } from './graphic';
import { DefaultRichTextAttribute } from './config';
import Frame from './richtext/frame';
import Paragraph from './richtext/paragraph';
import Wrapper from './richtext/wrapper';
import { getTheme } from './theme';
import { RichTextIcon } from './richtext/icon';
import type { FederatedMouseEvent } from '../event';
import { application } from '../application';
import { RICHTEXT_NUMBER_TYPE } from './constants';

let supportIntl = false;
try {
  supportIntl = Intl && typeof (Intl as any).Segmenter === 'function';
} catch (e) {
  supportIntl = false;
}

const RICHTEXT_UPDATE_TAG_KEY = [
  'width',
  'height',
  'ellipsis',
  'wordBreak',
  'verticalDirection',
  'maxHeight',
  'maxWidth',
  'textAlign',
  'textBaseline',
  'textConfig',
  'layoutDirection',
  'fill',
  'stroke',
  'fontSize',
  'fontFamily',
  'fontStyle',
  'fontWeight',
  'lineWidth',
  'opacity',
  'fillOpacity',
  'strokeOpacity',
  ...GRAPHIC_UPDATE_TAG_KEY
];

export class RichText extends Graphic<IRichTextGraphicAttribute> implements IRichText {
  type: 'richtext' = 'richtext';

  _frameCache: Frame; // 富文本布局画布
  _currentHoverIcon: IRichTextIcon | null = null;

  static NOWORK_ANIMATE_ATTR = {
    ellipsis: 1,
    wordBreak: 1,
    verticalDirection: 1,
    textAlign: 1,
    textBaseline: 1,
    textConfig: 1,
    layoutDirection: 1,
    ...NOWORK_ANIMATE_ATTR
  };

  constructor(params?: IRichTextGraphicAttribute) {
    super(params);
    this.numberType = RICHTEXT_NUMBER_TYPE;

    this.onBeforeAttributeUpdate = ((val: any, attributes: any, key: null | string | string[]) => {
      for (const key in val) {
        if (key === 'hoverIconId') {
          if (val[key] === attributes[key]) {
            continue;
          }
          const icon = this._frameCache.icons.get(val[key]);
          this.updateHoverIconState(icon);
        }
      }
    }) as any;
  }

  get width(): number {
    return this.attribute.width ?? DefaultRichTextAttribute.width;
  }
  set width(w: number) {
    if (this.attribute.width === w) {
      return;
    }
    this.attribute.width = w;
    this.addUpdateShapeAndBoundsTag();
  }
  get height(): number {
    return this.attribute.height ?? DefaultRichTextAttribute.height;
  }
  set height(h: number) {
    if (this.attribute.height === h) {
      return;
    }
    this.attribute.height = h;
    this.addUpdateShapeAndBoundsTag();
  }
  get maxWidth(): number | undefined {
    return this.attribute.maxWidth;
  }
  set maxWidth(mw: number | undefined) {
    if (this.attribute.maxWidth === mw) {
      return;
    }
    this.attribute.maxWidth = mw;
    this.addUpdateShapeAndBoundsTag();
  }
  get maxHeight(): number | undefined {
    return this.attribute.maxHeight;
  }
  set maxHeight(mh: number | undefined) {
    if (this.attribute.maxHeight === mh) {
      return;
    }
    this.attribute.maxHeight = mh;
    this.addUpdateShapeAndBoundsTag();
  }
  get ellipsis(): boolean | string {
    return this.attribute.ellipsis ?? DefaultRichTextAttribute.ellipsis;
  }
  set ellipsis(e: boolean | string) {
    if (this.attribute.ellipsis === e) {
      return;
    }
    this.attribute.ellipsis = e;
    this.addUpdateShapeAndBoundsTag();
  }
  get wordBreak(): RichTextWordBreak {
    return this.attribute.wordBreak ?? DefaultRichTextAttribute.wordBreak;
  }
  set wordBreak(wb: RichTextWordBreak) {
    if (this.attribute.wordBreak === wb) {
      return;
    }
    this.attribute.wordBreak = wb;
    this.addUpdateShapeAndBoundsTag();
  }
  get verticalDirection(): RichTextVerticalDirection {
    return this.attribute.verticalDirection ?? DefaultRichTextAttribute.verticalDirection;
  }
  set verticalDirection(vd: RichTextVerticalDirection) {
    if (this.attribute.verticalDirection === vd) {
      return;
    }
    this.attribute.verticalDirection = vd;
    this.addUpdateShapeAndBoundsTag();
  }
  get textAlign(): RichTextGlobalAlignType {
    return this.attribute.textAlign ?? DefaultRichTextAttribute.textAlign;
  }
  set textAlign(align: RichTextGlobalAlignType) {
    if (this.attribute.textAlign === align) {
      return;
    }
    this.attribute.textAlign = align;
    this.addUpdateShapeAndBoundsTag();
  }
  get textBaseline(): RichTextGlobalBaselineType {
    return this.attribute.textBaseline ?? DefaultRichTextAttribute.textBaseline;
  }
  set textBaseline(baseline: RichTextGlobalBaselineType) {
    if (this.attribute.textBaseline === baseline) {
      return;
    }
    this.attribute.textBaseline = baseline;
    this.addUpdateShapeAndBoundsTag();
  }
  get textConfig(): IRichTextCharacter[] {
    return this.attribute.textConfig ?? DefaultRichTextAttribute.textConfig;
  }
  set textConfig(config: IRichTextCharacter[]) {
    this.attribute.textConfig = config;
    this.addUpdateShapeAndBoundsTag();
  }

  getGraphicTheme(): Required<IRichTextGraphicAttribute> {
    return getTheme(this).richtext;
  }

  static AllSingleCharacter(cache: IRichTextFrame | IRichTextGraphicAttribute['textConfig']) {
    if ((cache as IRichTextFrame).lines) {
      const frame = cache as IRichTextFrame;
      return frame.lines.every(line =>
        line.paragraphs.every(item => !(item.text && isString(item.text) && RichText.splitText(item.text).length > 1))
      );
    }
    // isComposing的不算
    const tc = cache as IRichTextGraphicAttribute['textConfig'];
    return tc.every(
      item =>
        (item as any).isComposing ||
        !((item as any).text && isString((item as any).text) && RichText.splitText((item as any).text).length > 1)
    );
  }

  static splitText(text: string) {
    if (supportIntl) {
      // 不传入具体语言标签，使用默认设置
      const segmenter = new (Intl as any).Segmenter(undefined, { granularity: 'grapheme' });
      const segments = [];
      for (const { segment } of segmenter.segment(text)) {
        segments.push(segment);
      }
      return segments;
    }
    // 如果不支持 Intl.Segmenter，则使用旧方法
    return Array.from(text);
  }

  static TransformTextConfig2SingleCharacter(textConfig: IRichTextGraphicAttribute['textConfig']) {
    const tc: IRichTextGraphicAttribute['textConfig'] = [];
    textConfig.forEach((item: IRichTextParagraphCharacter) => {
      const textList = RichText.splitText(item.text.toString());
      if (isString(item.text) && textList.length > 1) {
        // 拆分
        for (let i = 0; i < textList.length; i++) {
          const t = textList[i];
          tc.push({ ...item, text: t });
        }
      } else {
        tc.push(item);
      }
    });

    return tc;
  }

  protected updateAABBBounds(
    attribute: IRichTextGraphicAttribute,
    richtextTheme: Required<IRichTextGraphicAttribute>,
    aabbBounds: IAABBBounds
  ) {
    const {
      width = richtextTheme.width,
      height = richtextTheme.height,
      maxWidth = richtextTheme.maxWidth,
      maxHeight = richtextTheme.maxHeight,
      textAlign = richtextTheme.textAlign,
      verticalDirection = attribute.textBaseline ?? richtextTheme.textBaseline ?? richtextTheme.verticalDirection,
      editOptions
    } = attribute;

    if (width > 0 && height > 0) {
      // 外部设置宽高
      aabbBounds.set(0, 0, width, height);
    } else {
      // 获取内容宽高
      const frameCache = this.getFrameCache();
      const { width: actualWidth, height: actualHeight } = frameCache.getActualSize();
      let contentWidth = width || actualWidth || 0;
      let contentHeight = height || actualHeight || 0;

      contentHeight = typeof maxHeight === 'number' && contentHeight > maxHeight ? maxHeight : contentHeight || 0;
      contentWidth = typeof maxWidth === 'number' && contentWidth > maxWidth ? maxWidth : contentWidth || 0;

      aabbBounds.set(0, 0, contentWidth, contentHeight);
    }

    // 如果是可编辑状态，且没有设置高度，就用fontSize，否则就完全选不到了
    if (editOptions && editOptions.keepHeightWhileEmpty && !aabbBounds.height() && !attribute.textConfig?.length) {
      aabbBounds.y2 = aabbBounds.y1 + (attribute.fontSize ?? 12);
      aabbBounds.x2 = aabbBounds.x1 + 2;
    }

    // 调整对齐方式
    let deltaY = 0;
    switch (verticalDirection) {
      case 'top':
        deltaY = 0;
        break;
      case 'middle':
        deltaY = -aabbBounds.height() / 2;
        break;
      case 'bottom':
        deltaY = -aabbBounds.height();
        break;
      default:
        break;
    }
    let deltaX = 0;
    switch (textAlign) {
      case 'left':
        deltaX = 0;
        break;
      case 'center':
        deltaX = -aabbBounds.width() / 2;
        break;
      case 'right':
        deltaX = -aabbBounds.width();
        break;
      default:
        break;
    }
    aabbBounds.translate(deltaX, deltaY);

    application.graphicService.updateTempAABBBounds(aabbBounds);

    if (attribute.forceBoundsHeight != null || attribute.forceBoundsWidth != null) {
      application.graphicService.updateHTMLTextAABBBounds(attribute, richtextTheme, aabbBounds);
    }
    application.graphicService.transformAABBBounds(attribute, aabbBounds, richtextTheme, false, this);
    // 都为0的话，就直接clear
    if (aabbBounds.width() === 0 && aabbBounds.height() === 0) {
      aabbBounds.clear();
    }
    return aabbBounds;
  }

  protected needUpdateTags(keys: string[]): boolean {
    return super.needUpdateTags(keys, RICHTEXT_UPDATE_TAG_KEY);
  }
  protected needUpdateTag(key: string): boolean {
    return super.needUpdateTag(key, RICHTEXT_UPDATE_TAG_KEY);
  }
  getFrameCache(): IRichTextFrame {
    if (this.shouldUpdateShape()) {
      this.doUpdateFrameCache();
      this.clearUpdateShapeTag();
    }
    return this._frameCache as IRichTextFrame;
  }

  get cliped() {
    const frameCache = this.getFrameCache();
    if (frameCache.actualHeight > frameCache.height) {
      return true;
    }
    const { disableAutoWrapLine } = this.attribute;
    if (disableAutoWrapLine) {
      for (let i = 0; i < frameCache.lines.length; i++) {
        const l = frameCache.lines[i];
        for (let j = 0; j < l.paragraphs.length; j++) {
          const p = l.paragraphs[j];
          if ((p as any).overflow && (p as any).text !== '') {
            return true;
          }
        }
      }
    }
    return false;
    // if (height < this.attribute.height || )
  }
  combinedStyleToCharacter(config: IRichTextImageCharacter | IRichTextParagraphCharacter) {
    const {
      fill,
      stroke,
      fontSize,
      fontFamily,
      fontStyle,
      fontWeight,
      lineWidth,
      opacity,
      fillOpacity,
      lineHeight,
      strokeOpacity,
      upgradeAttrs
    } = this.attribute;
    const out = {
      fill,
      stroke,
      fontSize,
      fontFamily,
      fontStyle,
      fontWeight,
      lineWidth,
      opacity,
      fillOpacity,
      strokeOpacity,
      ...config
    };
    if (upgradeAttrs?.lineHeight) {
      out.lineHeight = lineHeight;
    }
    return out;
  }
  doUpdateFrameCache(tc?: IRichTextCharacter[]) {
    // 1. 测量，生成paragraph
    const {
      maxWidth,
      maxHeight,
      width,
      height,
      ellipsis,
      wordBreak,
      verticalDirection,
      textAlign,
      textBaseline,
      layoutDirection,
      singleLine,
      disableAutoWrapLine,
      editable,
      ascentDescentMode,
      upgradeAttrs
    } = this.attribute;

    const enableMultiBreakLine = upgradeAttrs && upgradeAttrs.multiBreakLine;

    let { textConfig: _tc = [] } = this.attribute;

    // 预处理editable，将textConfig中的text转换为单个字符
    if (editable && _tc.length > 0 && !RichText.AllSingleCharacter(_tc)) {
      _tc = RichText.TransformTextConfig2SingleCharacter(_tc);
      this.attribute.textConfig = _tc;
    }

    const paragraphs: (Paragraph | RichTextIcon)[] = [];

    const textConfig = tc ?? _tc;

    for (let i = 0; i < textConfig.length; i++) {
      if ('image' in textConfig[i]) {
        const config = this.combinedStyleToCharacter(
          textConfig[i] as IRichTextImageCharacter
        ) as IRichTextImageCharacter;
        (config as any).lineWidth = undefined; // for icon bounds
        // 直接创建icon Mark
        const iconCache =
          config.id && this._frameCache && this._frameCache.icons && this._frameCache.icons.get(config.id);
        if (iconCache) {
          paragraphs.push(iconCache as RichTextIcon);
        } else {
          const icon = new RichTextIcon(config);
          icon.successCallback = () => {
            this.addUpdateBoundTag();
            this.stage?.renderNextFrame();
          };
          icon.richtextId = config.id;
          paragraphs.push(icon);
        }
      } else {
        const richTextConfig = this.combinedStyleToCharacter(
          textConfig[i] as IRichTextParagraphCharacter
        ) as IRichTextParagraphCharacter;
        if (isNumber(richTextConfig.text)) {
          richTextConfig.text = `${richTextConfig.text}`;
        }
        if (richTextConfig.text && richTextConfig.text.includes('\n')) {
          // 如果有文字内有换行符，将该段文字切为多段，并在后一段加入newLine标记
          const textParts = richTextConfig.text.split('\n');
          for (let j = 0; j < textParts.length; j++) {
            if (j === 0) {
              paragraphs.push(new Paragraph(textParts[j], false, richTextConfig, ascentDescentMode));
            } else if (textParts[j] || i === textConfig.length - 1) {
              paragraphs.push(new Paragraph(textParts[j], true, richTextConfig, ascentDescentMode));
            } else {
              // 空行的话，config应该要和下一行对齐
              const nextRichTextConfig = this.combinedStyleToCharacter(
                textConfig[i + 1] as IRichTextParagraphCharacter
              ) as IRichTextParagraphCharacter;
              paragraphs.push(new Paragraph(textParts[j], true, nextRichTextConfig, ascentDescentMode));
            }
            // paragraphs.push(new Paragraph(textParts[j], j !== 0, richTextConfig, ascentDescentMode));
          }
        } else if (richTextConfig.text) {
          paragraphs.push(new Paragraph(richTextConfig.text, false, richTextConfig, ascentDescentMode));
        }
      }
    }

    // 2. 布局，生成frame
    // const frameHeight =
    //   typeof maxHeight === 'number' && (!height || height > maxHeight) // height = 0或height>maxHeight，使用maxHeight布局
    //     ? maxHeight
    //     : height;
    // const frameWidth =
    //   typeof maxWidth === 'number' && (!width || width > maxWidth) // height = 0或height>maxWidth，使用maxWidth布局
    //     ? maxWidth
    //     : width;

    const maxWidthFinite = typeof maxWidth === 'number' && Number.isFinite(maxWidth) && maxWidth > 0;
    const maxHeightFinite = typeof maxHeight === 'number' && Number.isFinite(maxHeight) && maxHeight > 0;

    const richTextWidthEnable =
      typeof width === 'number' &&
      Number.isFinite(width) &&
      width > 0 &&
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      (!maxWidthFinite || width <= maxWidth);
    const richTextHeightEnable =
      typeof height === 'number' &&
      Number.isFinite(height) &&
      height > 0 &&
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      (!maxHeightFinite || height <= maxHeight);

    const frameWidth = richTextWidthEnable ? width : maxWidthFinite ? maxWidth : 0;
    const frameHeight = richTextHeightEnable ? height : maxHeightFinite ? maxHeight : 0;

    const frame = new Frame(
      0,
      0,
      frameWidth || 0,
      frameHeight || 0,
      ellipsis,
      wordBreak,
      verticalDirection,
      textAlign,
      textBaseline,
      layoutDirection || 'horizontal',
      // typeof maxWidth === 'number' && (!width || width > maxWidth),
      // typeof maxHeight === 'number' && (!height || height > maxHeight),
      !richTextWidthEnable && maxWidthFinite,
      !richTextHeightEnable && maxHeightFinite,
      singleLine || false,
      this._frameCache?.icons
    );
    const wrapper = new Wrapper(frame);
    // @since 0.22.0
    // 如果可编辑的话，则支持多换行符
    wrapper.newLine = enableMultiBreakLine;
    if (disableAutoWrapLine) {
      let lineCount = 0;
      let skip = false;
      for (let i = 0; i < paragraphs.length; i++) {
        const p = paragraphs[i];
        if (skip) {
          (p as Paragraph).overflow = true;
          (p as Paragraph).left = Infinity;
          (p as Paragraph).top = Infinity;
          !(p as Paragraph).newLine && frame.lines[frame.lines.length - 1].paragraphs.push(p);
        } else {
          wrapper.deal(p, true);
        }
        if (frame.lines.length !== lineCount) {
          lineCount = frame.lines.length;
          wrapper.lineBuffer.length = 0;
          (p as Paragraph).overflow = true;
          (p as Paragraph).left = 1000;
          (p as Paragraph).top = 1000;
          frame.lines[frame.lines.length - 1].paragraphs.push(p);
          skip = true;
        }
        if ((p as Paragraph).newLine) {
          skip = false;
          wrapper.lineWidth = 0;
        }
        wrapper.send();
      }
    } else {
      for (let i = 0; i < paragraphs.length; i++) {
        wrapper.deal(paragraphs[i]);
      }
    }

    wrapper.send(); // 最后一行手动输出

    // 如果对应的配置宽度不可用，那么需要额外进行一次对齐
    const directionEnable = frame.layoutDirection === 'horizontal' ? richTextWidthEnable : richTextHeightEnable;
    if (!directionEnable) {
      // 使用实际宽度
      const frameSize = frame.getActualSizeWidthEllipsis();
      let offsetSize = frame.layoutDirection === 'horizontal' ? frameSize.width : frameSize.height;
      // 如果最大值可用
      if (frame.layoutDirection === 'horizontal' ? maxWidthFinite : maxHeightFinite) {
        // 取2者中的较小值
        offsetSize = Math.min(
          offsetSize,
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          frame.layoutDirection === 'horizontal' ? maxWidth : maxHeight
        );
      }

      frame.lines.forEach(function (l) {
        l.calcOffset(offsetSize, false);
      });
    }

    // 处理空行
    if (enableMultiBreakLine) {
      frame.lines.forEach(item => {
        const lastParagraphs = item.paragraphs;
        item.paragraphs = item.paragraphs.filter(p => (p as any).text !== '');
        if (item.paragraphs.length === 0 && lastParagraphs.length) {
          (lastParagraphs[0] as any).text = '\n';
          item.paragraphs.push(lastParagraphs[0]);
        }
      });
    }

    this._frameCache = frame;

    // this.bindIconEvent();
  }

  clone() {
    return new RichText({ ...this.attribute });
  }

  setStage(stage?: IStage, layer?: ILayer) {
    super.setStage(stage, layer);
    const frameCache = this.getFrameCache();
    // for (let i = 0; i < frameCache.icons.length; i++) {
    //   const icon = frameCache.icons[i];
    //   icon.setStage(stage, layer);
    // }
    frameCache.icons.forEach(icon => {
      icon.setStage(stage, layer);
    });
  }

  // richtext绑定icon交互事件，供外部调用
  bindIconEvent() {
    this.addEventListener('pointermove', (e: FederatedMouseEvent) => {
      const pickedIcon = this.pickIcon(e.global);
      if (pickedIcon && pickedIcon === this._currentHoverIcon) {
        // do nothing
      } else if (pickedIcon) {
        this.setAttribute('hoverIconId', pickedIcon.richtextId);

        // this._currentHoverIcon?.setHoverState(false);
        // this._currentHoverIcon = pickedIcon;
        // this._currentHoverIcon.setHoverState(true);
        // this.stage?.setCursor(pickedIcon.attribute.cursor);
        // this.stage?.renderNextFrame();
      } else if (!pickedIcon && this._currentHoverIcon) {
        this.setAttribute('hoverIconId', undefined);

        // this._currentHoverIcon.setHoverState(false);
        // this._currentHoverIcon = null;
        // this.stage?.setCursor();
        // this.stage?.renderNextFrame();
      }
    });

    this.addEventListener('pointerleave', (e: FederatedMouseEvent) => {
      if (this._currentHoverIcon) {
        this.setAttribute('hoverIconId', undefined);

        // this._currentHoverIcon.setHoverState(false);
        // this._currentHoverIcon = null;
        // this.stage?.setCursor();
        // this.stage?.renderNextFrame();
      }
    });
  }

  updateHoverIconState(pickedIcon?: IRichTextIcon) {
    if (pickedIcon) {
      this._currentHoverIcon?.setHoverState(false);
      this._currentHoverIcon = pickedIcon;
      this._currentHoverIcon.setHoverState(true);
      this.stage?.setCursor(pickedIcon.attribute.cursor);
      this.stage?.renderNextFrame();
    } else {
      this._currentHoverIcon.setHoverState(false);
      this._currentHoverIcon = null;
      this.stage?.setCursor();
      this.stage?.renderNextFrame();
    }
  }

  pickIcon(point: EventPoint): IRichTextIcon | undefined {
    const frameCache = this.getFrameCache();
    const { e: x, f: y } = this.globalTransMatrix;
    // for (let i = 0; i < frameCache.icons.length; i++) {
    //   const icon = frameCache.icons[i];
    //   if (icon.containsPoint(point.x - x, point.y - y)) {
    //     return icon;
    //   }
    // }
    let pickIcon: IRichTextIcon | undefined;
    frameCache.icons.forEach((icon, key) => {
      const bounds = icon.AABBBounds.clone();
      bounds.translate(icon._marginArray[3], icon._marginArray[0]);
      if (bounds.containsPoint({ x: point.x - x, y: point.y - y })) {
        pickIcon = icon;

        pickIcon.globalX = (pickIcon.attribute.x ?? 0) + x + icon._marginArray[3];
        pickIcon.globalY = (pickIcon.attribute.y ?? 0) + y + icon._marginArray[0];
      }
    });

    return pickIcon;
  }

  getNoWorkAnimateAttr(): Record<string, number> {
    return RichText.NOWORK_ANIMATE_ATTR;
  }
}

export function createRichText(attributes: IRichTextGraphicAttribute): IRichText {
  return new RichText(attributes);
}
