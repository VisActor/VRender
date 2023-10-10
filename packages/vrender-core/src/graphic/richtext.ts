import type { AABBBounds, IPoint, OBBBounds } from '@visactor/vutils';
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
  IRichTextIcon
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
import { parsePadding } from '../common/utils';
import { RICHTEXT_NUMBER_TYPE } from './constants';

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

  protected doUpdateAABBBounds(): AABBBounds {
    const richTextTheme = getTheme(this).richtext;
    this._AABBBounds.setValue(Infinity, Infinity, -Infinity, -Infinity);
    const attribute = this.attribute;
    const bounds = application.graphicService.updateRichTextAABBBounds(
      attribute,
      getTheme(this).richtext,
      this._AABBBounds,
      this
    ) as AABBBounds;

    const { boundsPadding = richTextTheme.boundsPadding } = attribute;
    const paddingArray = parsePadding(boundsPadding);
    if (paddingArray) {
      bounds.expand(paddingArray);
    }

    this.clearUpdateBoundTag();
    return bounds;
  }

  protected tryUpdateOBBBounds(): OBBBounds {
    throw new Error('暂不支持');
  }

  getDefaultAttribute(name: string) {
    return DefaultRichTextAttribute[name];
  }

  protected needUpdateTags(keys: string[]): boolean {
    return super.needUpdateTags(keys, RICHTEXT_UPDATE_TAG_KEY);
  }
  protected needUpdateTag(key: string): boolean {
    return super.needUpdateTag(key, RICHTEXT_UPDATE_TAG_KEY);
  }
  getFrameCache(): Frame {
    if (this.shouldUpdateShape()) {
      this.doUpdateFrameCache();
      this.clearUpdateShapeTag();
    }
    return this._frameCache;
  }
  doUpdateFrameCache() {
    // 1. 测量，生成paragraph
    const {
      textConfig,
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
      singleLine
    } = this.attribute;
    const paragraphs: (Paragraph | RichTextIcon)[] = [];
    for (let i = 0; i < textConfig.length; i++) {
      if ('image' in textConfig[i]) {
        const config = textConfig[i] as IRichTextImageCharacter;
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
      } else if ((textConfig[i] as IRichTextParagraphCharacter).text.includes('\n')) {
        // 如果有文字内有换行符，将该段文字切为多段，并在后一段加入newLine标记
        const textParts = (textConfig[i] as IRichTextParagraphCharacter).text.split('\n');
        for (let j = 0; j < textParts.length; j++) {
          paragraphs.push(new Paragraph(textParts[j], j !== 0, textConfig[i] as IRichTextParagraphCharacter));
        }
      } else {
        paragraphs.push(
          new Paragraph(
            (textConfig[i] as IRichTextParagraphCharacter).text,
            false,
            textConfig[i] as IRichTextParagraphCharacter
          )
        );
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
    for (let i = 0; i < paragraphs.length; i++) {
      wrapper.deal(paragraphs[i]);
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
        this._currentHoverIcon?.setHoverState(false);
        this._currentHoverIcon = pickedIcon;
        this._currentHoverIcon.setHoverState(true);
        this.stage?.setCursor(pickedIcon.attribute.cursor);
        this.stage?.renderNextFrame();
      } else if (!pickedIcon && this._currentHoverIcon) {
        this._currentHoverIcon.setHoverState(false);
        this._currentHoverIcon = null;
        this.stage?.setCursor();
        // console.log('setCursor()');

        this.stage?.renderNextFrame();
      }
    });

    this.addEventListener('pointerleave', (e: FederatedMouseEvent) => {
      if (this._currentHoverIcon) {
        this._currentHoverIcon.setHoverState(false);
        this._currentHoverIcon = null;
        this.stage?.setCursor();
        this.stage?.renderNextFrame();
      }
    });
  }

  pickIcon(point: IPoint): IRichTextIcon | undefined {
    const frameCache = this.getFrameCache();
    const { e: x, f: y } = this.globalTransMatrix;
    // for (let i = 0; i < frameCache.icons.length; i++) {
    //   const icon = frameCache.icons[i];
    //   if (icon.containsPoint(point.x - x, point.y - y)) {
    //     return icon;
    //   }
    // }
    let pickIcon: IRichTextIcon | undefined;
    frameCache.icons.forEach(icon => {
      if (icon.AABBBounds.containsPoint({ x: point.x - x, y: point.y - y })) {
        pickIcon = icon;

        pickIcon.globalX = (pickIcon.attribute.x ?? 0) + x;
        pickIcon.globalY = (pickIcon.attribute.y ?? 0) + y;
      }
    });

    return pickIcon;
  }

  getNoWorkAnimateAttr(): Record<string, number> {
    return RichText.NOWORK_ANIMATE_ATTR;
  }
}
