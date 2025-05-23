/**
 * @description slider 滑块组件
 * TODO:
 * 3. step 功能开发
 * 4. tooltip 功能开发
 */
import type {
  IGroup,
  ISymbol,
  IGraphic,
  ISymbolGraphicAttribute,
  IText,
  ITextGraphicAttribute,
  FederatedPointerEvent,
  Cursor
} from '@visactor/vrender-core';
import { isNil, merge, clamp, isValid, array, isObject, isArray, clampRange, debounce } from '@visactor/vutils';
import { graphicCreator, vglobal, CustomEvent } from '@visactor/vrender-core';
import { AbstractComponent } from '../core/base';
import { SLIDER_ELEMENT_NAME } from './constant';

import type { SliderAttributes } from './type';
import type { ComponentOptions } from '../interface';
import { loadSliderComponent } from './register';
import { getEndTriggersOfDrag } from '../util/event';

function convertValueToRange(value: number | [number, number]) {
  if (isArray(value)) {
    return value;
  }
  return [value, value];
}

function getDefaultCursor(isHorizontal: boolean) {
  return isHorizontal ? 'ew-resize' : 'ns-resize';
}

loadSliderComponent();

export class Slider extends AbstractComponent<Required<SliderAttributes>> {
  name = 'slider';

  static defaultAttributes = {
    slidable: true,
    layout: 'horizontal',
    align: 'bottom',
    height: 8,
    showHandler: true,
    handlerSize: 14,
    handlerStyle: {
      symbolType: 'circle',
      fill: '#fff',
      stroke: '#91caff',
      lineWidth: 2
    },
    tooltip: {
      shapeStyle: {
        symbolType: 'circle',
        fill: '#fff',
        stroke: '#91caff',
        lineWidth: 2
      },
      text: {
        style: {
          fill: '#2C3542',
          fontSize: 12
        }
      }
    },
    railStyle: {
      fill: 'rgba(0,0,0,.04)'
    },
    trackStyle: {
      fill: '#91caff'
    },
    showValue: true,
    valueStyle: {
      fill: '#2C3542',
      fontSize: 12
    },
    startText: {
      style: {
        fill: '#2C3542',
        fontSize: 12
      }
    },
    endText: {
      style: {
        fill: '#2C3542',
        fontSize: 12
      }
    },
    handlerText: {
      visible: true,
      space: 4,
      precision: 0,
      style: {
        fill: '#2C3542',
        fontSize: 12
      }
    }
  };

  protected _isHorizontal = true;
  protected _innerView!: IGroup;
  protected _mainContainer!: IGroup;
  protected _startHandler: ISymbol | null = null;
  protected _endHandler: ISymbol | null = null;
  protected _startHandlerText: IText | null = null;
  protected _endHandlerText: IText | null = null;
  protected _railContainer!: IGroup;
  protected _rail!: IGraphic;
  protected _track!: IGraphic;
  // 保留滑块上一次的位置
  private _prePos!: number;
  // 存储当前正在操作的滑块
  private _currentHandler: IGraphic | null = null;
  private _currentValue: { startValue?: number; endValue?: number; startPos?: number; endPos?: number } = {};
  private _tooltipState: {
    isActive?: boolean;
    pos?: number;
    value?: number;
  };
  private _isChanging?: boolean;

  protected _tooltipShape?: ISymbol;
  protected _tooltipText?: IText;

  get track() {
    return this._track;
  }

  get currentValue() {
    return this._currentValue;
  }

  get startHandler() {
    return this._startHandler;
  }

  get endHandler() {
    return this._endHandler;
  }

  get tooltipShape() {
    return this._tooltipShape;
  }

  constructor(attributes: SliderAttributes, options?: ComponentOptions) {
    super(options?.skipDefault ? attributes : merge({}, Slider.defaultAttributes, attributes));
  }

  protected calculatePosByValue(value: number, pos?: 'start' | 'end') {
    const { layout, railWidth, railHeight, min, max, inverse } = this.attribute as SliderAttributes;
    let ratio = 0;

    if (min === max) {
      ratio = pos === 'start' ? 0 : pos === 'end' ? 1 : 0;
    } else {
      ratio = (value - min) / (max - min);
    }
    const railLen = layout === 'vertical' ? railHeight : railWidth;

    return (inverse ? 1 - ratio : ratio) * railLen;
  }

  protected calculateValueByPos(pos: number) {
    const { layout, railWidth, railHeight, min, max, inverse } = this.attribute as SliderAttributes;

    const railLen = layout === 'vertical' ? railHeight : railWidth;

    return min + (max - min) * (inverse ? 1 - pos / railLen : pos / railLen);
  }

  /**
   * 更新值域
   */
  setValue(value: number | number[]) {
    const { min, max } = this.attribute as SliderAttributes;
    if (max === min) {
      return;
    }

    const [startValue, endValue] = array(value);

    const { startHandler, endHandler } = this._getHandlers();
    if (startHandler) {
      this._updateHandler(startHandler, this.calculatePosByValue(startValue), startValue);
    }

    if (endHandler) {
      this._updateHandler(endHandler, this.calculatePosByValue(endValue), endValue);
    }

    this._updateTrack();
  }

  render() {
    this.removeAllChild(true);
    const {
      layout = 'horizontal',
      railWidth,
      railHeight,
      startText,
      endText,
      min,
      max,
      showHandler = true,
      showTooltip
    } = this.attribute as SliderAttributes;
    let { value } = this.attribute as SliderAttributes;
    if (isNil(value)) {
      value = [min, max];
    }

    this._currentValue = {
      startValue: convertValueToRange(value)[0],
      endValue: convertValueToRange(value)[1]
    };
    const isHorizontal = layout === 'horizontal';
    this._isHorizontal = isHorizontal;

    const innerView = graphicCreator.group({
      x: 0,
      y: 0
    });
    innerView.name = SLIDER_ELEMENT_NAME.innerView;
    this.add(innerView);
    this._innerView = innerView;

    let startLen = 0;
    let startTextShape;
    if (startText && startText.visible) {
      // 渲染首部文本
      startTextShape = graphicCreator.text({
        x: isHorizontal ? 0 : railWidth / 2,
        y: isHorizontal ? (railHeight as number) / 2 : 0,
        textAlign: isHorizontal ? 'start' : 'center',
        textBaseline: isHorizontal ? 'middle' : 'top',
        text: startText.text,
        lineHeight: startText.style?.fontSize,
        ...startText.style
      });
      startTextShape.name = SLIDER_ELEMENT_NAME.startText;
      innerView.add(startTextShape);
      const space = isValid(startText.space) ? startText.space : 0;
      startLen += (isHorizontal ? startTextShape.AABBBounds.width() : startTextShape.AABBBounds.height()) + space;
    }
    const mainContainer = graphicCreator.group({
      x: isHorizontal ? startLen : 0,
      y: isHorizontal ? 0 : startLen
    });
    innerView.add(mainContainer);

    const railContainer = graphicCreator.group({
      x: 0,
      y: 0
    });
    railContainer.name = SLIDER_ELEMENT_NAME.railContainer;
    this._railContainer = railContainer;
    mainContainer.add(railContainer);

    this._mainContainer = mainContainer;

    this._renderRail(railContainer);

    startLen += isHorizontal ? (railWidth as number) : (railHeight as number);

    let endTextShape;
    if (endText && endText.visible) {
      const space = isValid(endText.space) ? endText.space : 0;

      // 渲染首部文本
      endTextShape = graphicCreator.text({
        x: isHorizontal ? startLen + space : railWidth / 2,
        y: isHorizontal ? (railHeight as number) / 2 : startLen + space,
        textAlign: isHorizontal ? 'start' : 'center',
        textBaseline: isHorizontal ? 'middle' : 'top',
        text: endText.text,
        lineHeight: endText.style?.fontSize,
        ...endText.style
      });
      endTextShape.name = SLIDER_ELEMENT_NAME.endText;
      innerView.add(endTextShape);
    }

    this._renderTrack(railContainer);

    if (showHandler) {
      this._renderHandlers(mainContainer);
      this._bindEvents();
    }

    if (showTooltip) {
      this._renderTooltip();
      this._bindTooltipEvents();
    }
  }

  // 渲染滑块轨道
  protected _renderRail(container: IGroup) {
    const { railWidth, railHeight, railStyle, slidable } = this.attribute;

    let cursor: Cursor = 'default';
    if (slidable !== false) {
      cursor = 'pointer';
    }

    const railShape = graphicCreator.rect({
      x: 0,
      y: 0,
      width: railWidth,
      height: railHeight,
      cursor,
      ...railStyle
    });
    railShape.name = SLIDER_ELEMENT_NAME.rail;
    container.add(railShape);
    this._rail = railShape;

    return railShape;
  }

  // 渲染 handler
  protected _renderHandlers(container: IGroup) {
    const {
      range,
      min,
      max,
      handlerSize = 14,
      handlerStyle,
      handlerText,
      railHeight,
      railWidth,
      slidable
    } = this.attribute as SliderAttributes;
    let { value } = this.attribute as SliderAttributes;
    if (isNil(value)) {
      value = [min, max];
    }

    const handlerTextVisible = handlerText && handlerText.visible;
    const isHorizontal = this._isHorizontal;

    const [startValue, endValue] = convertValueToRange(value);
    // 单滑块
    const startPos = this.calculatePosByValue(startValue, range ? 'start' : 'end');
    const startHandler = this._renderHandler({
      x: isHorizontal ? startPos : railWidth / 2,
      y: isHorizontal ? railHeight / 2 : startPos,
      size: handlerSize,
      strokeBoundsBuffer: 0,
      cursor: slidable === false ? 'default' : getDefaultCursor(isHorizontal),
      ...handlerStyle
    });
    startHandler.name = SLIDER_ELEMENT_NAME.startHandler;
    this._startHandler = startHandler;
    container.add(startHandler);
    this._currentValue.startPos = startPos;

    if (handlerTextVisible) {
      const startHandlerText = this._renderHandlerText(startValue, range ? 'start' : 'end');
      startHandlerText.name = SLIDER_ELEMENT_NAME.startHandlerText;
      container.add(startHandlerText);

      this._startHandlerText = startHandlerText;
    }

    if (range) {
      // 绘制第二个滑块
      // 单滑块
      const endPos = this.calculatePosByValue(endValue, 'end');
      const endHandler = this._renderHandler({
        x: isHorizontal ? endPos : railWidth / 2,
        y: isHorizontal ? railHeight / 2 : endPos,
        size: handlerSize,
        strokeBoundsBuffer: 0,
        cursor: slidable === false ? 'default' : getDefaultCursor(isHorizontal),
        ...handlerStyle
      });
      endHandler.name = SLIDER_ELEMENT_NAME.endHandler;
      this._endHandler = endHandler;
      container.add(endHandler);
      this._currentValue.endPos = endPos;

      if (handlerTextVisible) {
        const endHandlerText = this._renderHandlerText(endValue, 'end');
        endHandlerText.name = SLIDER_ELEMENT_NAME.endHandlerText;
        container.add(endHandlerText);

        this._endHandlerText = endHandlerText;
      }
    }
  }

  // 渲染选中区域
  protected _renderTrack(container: IGroup) {
    const { range, min, max, railHeight, railWidth, trackStyle, railStyle, slidable, value } = this
      .attribute as SliderAttributes;

    let startValue;
    let endValue;

    if (isNil(value)) {
      if (range) {
        startValue = min;
        endValue = max;
      } else {
        startValue = endValue = min;
      }
    } else {
      if (range) {
        const clampValue = clampRange(value as [number, number], min, max);
        startValue = clampValue[0];
        endValue = clampValue[1];
      } else {
        startValue = min;
        endValue = clamp(value as number, min, max);
      }
    }

    const isHorizontal = this._isHorizontal;
    // eslint-disable-next-line prefer-const
    // let [startValue, endValue] = convertValueToRange(value);

    if (!range) {
      startValue = min;
    }

    const trackContainer = graphicCreator.group({
      x: 0,
      y: 0,
      width: railWidth,
      height: railHeight,
      cornerRadius: railStyle?.cornerRadius,
      clip: true,
      pickable: false
    });
    trackContainer.name = SLIDER_ELEMENT_NAME.trackContainer;

    const draggableTrack = isObject(range) && range.draggableTrack === true;
    let cursor: Cursor;
    if (slidable === false) {
      cursor = 'default';
    } else if (range === false) {
      cursor = 'pointer';
    } else if (draggableTrack === false) {
      cursor = 'pointer';
    } else {
      cursor = getDefaultCursor(isHorizontal);
    }

    const startPos = this.calculatePosByValue(startValue, 'start');
    const endPos = this.calculatePosByValue(endValue, range ? 'end' : 'start');

    const track = graphicCreator.rect({
      x: isHorizontal ? Math.min(startPos, endPos) : 0,
      y: isHorizontal ? 0 : Math.min(startPos, endPos),
      width: isHorizontal ? Math.abs(endPos - startPos) : railWidth,
      height: isHorizontal ? railHeight : Math.abs(endPos - startPos),
      cursor,
      ...trackStyle
    });
    track.name = SLIDER_ELEMENT_NAME.track;
    this._track = track;
    trackContainer.add(track);
    container.add(trackContainer);
  }

  protected _renderHandler(style: Partial<ISymbolGraphicAttribute>) {
    // 渲染单个滑块
    const handler = graphicCreator.symbol(style);

    return handler;
  }

  private _renderHandlerText(value: number, position: 'start' | 'end') {
    const {
      align,
      handlerSize = 14,
      handlerText = {},
      railHeight,
      railWidth,
      slidable
    } = this.attribute as SliderAttributes;

    const isHorizontal = this._isHorizontal;

    const pos = this.calculatePosByValue(value, position);
    const textSpace = handlerText.space ?? 4;
    const textStyle: ITextGraphicAttribute = {
      text: handlerText.formatter ? handlerText.formatter(value) : value.toFixed(handlerText.precision ?? 0),
      lineHeight: handlerText.style?.lineHeight,
      cursor: slidable === false ? 'default' : getDefaultCursor(isHorizontal)
    };
    if (isHorizontal) {
      if (align === 'top') {
        // 展示 slider 上部
        textStyle.textBaseline = 'bottom';
        textStyle.textAlign = 'center';
        textStyle.x = pos;
        textStyle.y = (railHeight - handlerSize) / 2 - textSpace;
      } else {
        // 展示 slider 下部
        textStyle.textBaseline = 'top';
        textStyle.textAlign = 'center';
        textStyle.x = pos;
        textStyle.y = (railHeight + handlerSize) / 2 + textSpace;
      }
    } else {
      if (align === 'left') {
        // 展示 slider 左侧
        textStyle.textBaseline = 'middle';
        textStyle.textAlign = 'end';
        textStyle.x = (railWidth - handlerSize) / 2 - textSpace;
        textStyle.y = pos;
      } else {
        // 展示 slider 右侧
        textStyle.textBaseline = 'middle';
        textStyle.textAlign = 'start';
        textStyle.x = (railWidth + handlerSize) / 2 + textSpace;
        textStyle.y = pos;
      }
    }

    // 展示 handler 当前所在的数值
    const textShape = graphicCreator.text({
      ...textStyle,
      ...handlerText.style
    });
    return textShape;
  }

  private _renderTooltip() {
    const { tooltip, railHeight, railWidth, align } = this.attribute as SliderAttributes;

    if (tooltip && tooltip.alwaysShow) {
      this._tooltipState = {
        value: this._currentValue.startValue,
        pos: this._currentValue.startPos
      };
    } else {
      this._tooltipState = null;
    }

    const cx = this._isHorizontal ? 0 : railWidth / 2;
    const cy = this._isHorizontal ? railHeight / 2 : 0;

    if (tooltip && tooltip.shape) {
      const shape = graphicCreator.symbol({
        pickable: false,
        visible: !!this._tooltipState,
        x: cx,
        y: cy,
        symbolType: 'circle',

        ...tooltip.shapeStyle
      });

      this._tooltipShape = shape;
      this._mainContainer.add(shape);
    }

    const textConfig = (tooltip && tooltip.text) || {};
    const space = textConfig.space ?? 6;

    const textStyle: ITextGraphicAttribute = {
      pickable: false,
      visible: !!this._tooltipState,
      text: ''
    };

    if (this._isHorizontal) {
      textStyle.x = cx;
      textStyle.y = align === 'top' ? cy - railHeight / 2 - space : cy + railHeight / 2 + space;
      textStyle.textAlign = 'center';
      textStyle.textBaseline = align === 'top' ? 'bottom' : 'top';
    } else {
      textStyle.y = cy;
      textStyle.x = align === 'left' ? cx - railWidth / 2 - space : cy + railWidth / 2 + space;
      textStyle.textAlign = align === 'left' ? 'end' : 'start';
      textStyle.textBaseline = 'middle';
    }
    const text = graphicCreator.text({
      ...textStyle,
      ...textConfig.style
    });

    this._mainContainer.add(text);
    this._tooltipText = text;

    if (this._tooltipState) {
      this._updateTooltip();
    }
  }

  private _updateTooltip() {
    if ((!this._tooltipShape && !this._tooltipText) || !this._tooltipState) {
      return;
    }
    const { railWidth, railHeight } = this.attribute;

    const railLen = this._isHorizontal ? railWidth : railHeight;
    const coord = this._tooltipState.pos * railLen;
    const coordKey = this._isHorizontal ? 'x' : 'y';

    if (this._tooltipShape) {
      this._tooltipShape.setAttributes({
        visible: true,
        [coordKey]: coord
      });
    }
    const { align } = this.attribute;

    if (this._tooltipText) {
      const textConfig = (this.attribute.tooltip && this.attribute.tooltip.text) || {};
      this._tooltipText.setAttributes({
        visible: true,
        [coordKey]: coord,
        text: textConfig.formatter
          ? textConfig.formatter(this._tooltipState.value)
          : !this._isHorizontal && align === 'left'
          ? `${this._tooltipState.value.toFixed(textConfig.precision ?? 0)} ≈`
          : `≈ ${this._tooltipState.value.toFixed(textConfig.precision ?? 0)}`
      });
    }
  }

  private _bindEvents() {
    if (this.attribute.disableTriggerEvent) {
      return;
    }
    const { slidable, range } = this.attribute as SliderAttributes;
    if (slidable) {
      if (this._startHandler) {
        this._startHandler.addEventListener(
          'pointerdown',
          this._onHandlerPointerdown as EventListenerOrEventListenerObject
        );
      }
      if (this._startHandlerText) {
        this._startHandlerText.addEventListener(
          'pointerdown',
          this._onHandlerPointerdown as EventListenerOrEventListenerObject
        );
      }
      if (this._endHandler) {
        this._endHandler.addEventListener(
          'pointerdown',
          this._onHandlerPointerdown as EventListenerOrEventListenerObject
        );
      }
      if (this._endHandlerText) {
        this._endHandlerText.addEventListener(
          'pointerdown',
          this._onHandlerPointerdown as EventListenerOrEventListenerObject
        );
      }

      if (isObject(range) && range.draggableTrack) {
        this._track.addEventListener('pointerdown', this._onTrackPointerdown as EventListenerOrEventListenerObject);
      }

      this._railContainer.addEventListener(
        'pointerdown',
        this._onRailPointerDown as EventListenerOrEventListenerObject
      );
      /**
       * move的时候，需要显示的设置passive: false，因为在移动端需要禁用浏览器默认行为
       */
      (vglobal.env === 'browser' ? vglobal : this.stage).addEventListener('touchmove', this._handleTouchMove, {
        passive: false
      });
    }
  }

  private _bindTooltipEvents() {
    if (this.attribute.disableTriggerEvent) {
      return;
    }

    this._mainContainer.addEventListener('pointerenter', this._onTooltipShow as EventListenerOrEventListenerObject);
    this._mainContainer.addEventListener('pointermove', this._onTooltipUpdate as EventListenerOrEventListenerObject);
    this._mainContainer.addEventListener('pointerleave', this._onTooltipHide as EventListenerOrEventListenerObject);
  }

  private _onTooltipShow = (e: FederatedPointerEvent) => {
    if (this._isChanging || (this._tooltipState && this._tooltipState.isActive)) {
      return;
    }

    if (!this._tooltipState) {
      this._tooltipState = { isActive: true };
    } else {
      this._tooltipState.isActive = true;
    }

    this._onTooltipUpdate(e);
    this._dispatchTooltipEvent('sliderTooltipShow');
  };

  private _onTooltipUpdate = (e: FederatedPointerEvent) => {
    if (this._isChanging || !this._tooltipState || !this._tooltipState.isActive) {
      return;
    }
    const railLen = this._isHorizontal ? this._rail.globalAABBBounds.width() : this._rail.globalAABBBounds.height();
    const pos = clamp(
      this._isHorizontal
        ? (e.viewX - this._rail.globalAABBBounds.x1) / railLen
        : (e.viewY - this._rail.globalAABBBounds.y1) / railLen,
      0,
      1
    );

    if (pos !== this._tooltipState.pos) {
      this._tooltipState.pos = pos;
      this._tooltipState.value = this.calculateValueByPos(pos * railLen);

      this._updateTooltip();
      this._dispatchTooltipEvent('sliderTooltipUpdate');
    }
  };

  private _onTooltipHide = () => {
    const { tooltip } = this.attribute as SliderAttributes;

    if (tooltip && tooltip.alwaysShow) {
      return;
    }

    this._tooltipState = null;

    if (this._tooltipShape) {
      this._tooltipShape.setAttribute('visible', false);
    }
    if (this._tooltipText) {
      this._tooltipText.setAttribute('visible', false);
    }
    this._dispatchTooltipEvent('sliderTooltipHide');
  };

  private _onHandlerPointerdown = (e: FederatedPointerEvent) => {
    this._clearAllDragEvents();
    this._isChanging = true;
    const { x, y } = this.stage.eventPointTransform(e);
    this._currentHandler = e.target as unknown as IGraphic;
    this._prePos = this._isHorizontal ? x : y;
    const triggers = getEndTriggersOfDrag();
    const obj = vglobal.env === 'browser' ? vglobal : this.stage;

    /**
     * move的时候，需要通过 capture: true，能够在捕获截断被拦截
     */
    obj.addEventListener('pointermove', this._onHandlerPointerMove, { capture: true });
    triggers.forEach((trigger: string) => {
      obj.addEventListener(trigger, this._onHandlerPointerUp);
    });
  };

  private _clearAllDragEvents() {
    const triggers = getEndTriggersOfDrag();
    const obj = vglobal.env === 'browser' ? vglobal : this.stage;

    obj.removeEventListener('pointermove', this._onHandlerPointerMove, { capture: true });
    triggers.forEach((trigger: string) => {
      obj.removeEventListener(trigger, this._onHandlerPointerUp);
    });

    obj.removeEventListener('pointermove', this._onTrackPointerMove, { capture: true });
    triggers.forEach((trigger: string) => {
      obj.removeEventListener(trigger, this._onTrackPointerUp);
    });
  }

  private _onHandlerPointerMove = (e: FederatedPointerEvent) => {
    this._isChanging = true;
    const { railWidth, railHeight, min, max } = this.attribute as SliderAttributes;
    if (max === min) {
      return;
    }

    const { x, y } = this.stage.eventPointTransform(e);
    let currentPos;
    let delta = 0;
    let originPos;
    let railLen;
    if (!this._isHorizontal) {
      currentPos = y;
      delta = currentPos - this._prePos; // 实际位移的变化
      originPos = this._currentHandler?.attribute.y as number;
      railLen = railHeight;
    } else {
      currentPos = x;
      delta = currentPos - this._prePos; // 实际位移的变化
      originPos = this._currentHandler?.attribute.x as number;
      railLen = railWidth;
    }

    const newPos = clamp(originPos + delta, 0, railLen);
    const currentValue = this.calculateValueByPos(newPos);

    if (this._currentHandler.type === 'text') {
      this._updateHandlerText(this._currentHandler as IText, newPos, currentValue);
    } else {
      this._updateHandler(this._currentHandler as ISymbol, newPos, currentValue);
    }

    this._updateTrack();
    this._prePos = currentPos;

    this._dispatchChangeEvent();
  };

  private _onHandlerPointerUp = (e: FederatedPointerEvent) => {
    this._isChanging = false;
    this._currentHandler = null;

    this._clearAllDragEvents();
  };

  private _handleTouchMove = (e: TouchEvent) => {
    if (this._isChanging) {
      /**
       * https://developer.mozilla.org/zh-CN/docs/Web/CSS/overscroll-behavior
       * 由于浏览器的overscroll-behavior属性，需要在move的时候阻止浏览器默认行为，否则会因为浏览器检测到scroll行为，阻止pointer事件，
       * 抛出pointercancel事件，导致拖拽行为中断。
       */
      e.preventDefault();
    }
  };

  private _onTrackPointerdown = (e: FederatedPointerEvent) => {
    this._clearAllDragEvents();
    this._isChanging = true;

    const { x, y } = this.stage.eventPointTransform(e);
    this._prePos = this._isHorizontal ? x : y;
    const triggers = getEndTriggersOfDrag();
    const obj = vglobal.env === 'browser' ? vglobal : this.stage;

    obj.addEventListener('pointermove', this._onTrackPointerMove, { capture: true });
    triggers.forEach((trigger: string) => {
      obj.addEventListener(trigger, this._onTrackPointerUp);
    });
  };

  private _onTrackPointerMove = (e: FederatedPointerEvent) => {
    this._isChanging = true;
    const { railWidth, railHeight, min, max, inverse } = this.attribute as SliderAttributes;

    if (max === min) {
      return;
    }
    const { startHandler, endHandler } = this._getHandlers();

    let currentPos;
    let trackLen;
    let railLen;
    const { x, y } = this.stage.eventPointTransform(e);
    if (this._isHorizontal) {
      currentPos = x;
      // @ts-ignore
      trackLen = this._track.attribute.width;
      railLen = railWidth;
    } else {
      currentPos = y;
      // @ts-ignore
      trackLen = this._track.attribute.height;
      railLen = railHeight;
    }
    const delta = currentPos - this._prePos; // 实际位移的变化
    if (startHandler) {
      const originPos = (this._isHorizontal ? startHandler.attribute.x : startHandler.attribute.y) as number;
      const newPos = inverse
        ? clamp(originPos + delta, trackLen, railLen)
        : clamp(originPos + delta, 0, railLen - trackLen);
      const currentValue = this.calculateValueByPos(newPos);
      this._updateHandler(startHandler, newPos, currentValue);
    }

    if (endHandler) {
      const originPos = (this._isHorizontal ? endHandler.attribute.x : endHandler.attribute.y) as number;
      const newPos = inverse
        ? clamp(originPos + delta, 0, railLen - trackLen)
        : clamp(originPos + delta, trackLen, railLen);
      const currentValue = this.calculateValueByPos(newPos);
      const startHandlerAttribute = startHandler?.attribute;
      this._updateHandler(endHandler, newPos, currentValue);
      this._track.setAttributes(
        this._isHorizontal
          ? {
              x: Math.min(startHandlerAttribute.x as number, endHandler.attribute.x as number),
              // @ts-ignore
              width: Math.abs((startHandlerAttribute.x as number) - (endHandler.attribute.x as number))
            }
          : {
              y: Math.min(startHandlerAttribute.y as number, endHandler.attribute.y as number),
              // @ts-ignore
              height: Math.abs((startHandlerAttribute.y as number) - (endHandler.attribute.y as number))
            }
      );
    }

    this._prePos = currentPos;
    this._dispatchChangeEvent();
  };

  private _onTrackPointerUp = (e: FederatedPointerEvent) => {
    this._isChanging = false;

    this._clearAllDragEvents();
  };

  private _onRailPointerDown = (e: FederatedPointerEvent) => {
    this._clearAllDragEvents();
    this._isChanging = true;
    const { railWidth, railHeight, min, max } = this.attribute as SliderAttributes;

    if (max === min) {
      return;
    }

    const startHandler = this._startHandler as ISymbol;
    const endHandler = this._endHandler;

    let currentPos;
    let startHandlerPos;
    let endHandlerPos;
    let railLen;
    // 更新 handler, text 以及 track
    if (this._isHorizontal) {
      currentPos = e.viewX - this._rail.globalAABBBounds.x1;
      startHandlerPos = startHandler?.attribute.x as number;
      endHandlerPos = endHandler?.attribute.x;
      railLen = railWidth;
    } else {
      currentPos = e.viewY - this._rail.globalAABBBounds.y1;
      startHandlerPos = startHandler?.attribute.y as number;
      endHandlerPos = endHandler?.attribute.y;
      railLen = railHeight;
    }

    const currentValue = this.calculateValueByPos(currentPos);

    if (isValid(endHandlerPos)) {
      const updateHandler = (
        Math.abs(currentPos - startHandlerPos) > Math.abs(currentPos - endHandlerPos) ? endHandler : startHandler
      ) as ISymbol;
      this._updateHandler(updateHandler, currentPos, currentValue);
    } else {
      this._updateHandler(startHandler, currentPos, currentValue);
    }
    this._updateTrack();

    this._dispatchChangeEvent();
  };

  // 更新 track 样式
  private _updateTrack() {
    // 更新 track
    const { inverse, railWidth, railHeight } = this.attribute;
    const startHandler = this._startHandler;
    const endHandler = this._endHandler;

    if (this._isHorizontal) {
      const startHandlerPos = startHandler?.attribute.x as number;
      if (endHandler) {
        const endHandlerPos = endHandler?.attribute.x as number;
        // 区间
        this._track.setAttributes({
          x: Math.min(startHandlerPos, endHandlerPos),
          // @ts-ignore
          width: Math.abs(startHandlerPos - endHandlerPos)
        });
      } else if (inverse) {
        this._track.setAttributes({
          x: startHandlerPos,
          // @ts-ignore
          width: railWidth - startHandlerPos
        });
      } else {
        this._track.setAttributes({
          // @ts-ignore
          width: startHandlerPos
        });
      }
    } else {
      const startHandlerPos = startHandler?.attribute.y as number;
      if (endHandler) {
        const endHandlerPos = endHandler?.attribute.y as number;
        // 区间
        this._track.setAttributes({
          y: Math.min(startHandlerPos, endHandlerPos),
          // @ts-ignore
          height: Math.abs(startHandlerPos - endHandlerPos)
        });
      } else if (inverse) {
        this._track.setAttributes({
          y: startHandlerPos,
          // @ts-ignore
          height: railHeight - startHandlerPos
        });
      } else {
        this._track.setAttributes({
          // @ts-ignore
          height: startHandlerPos
        });
      }
    }
  }

  // 更新 handler 以及对应 text
  private _updateHandler(handler: ISymbol, position: number, value: number) {
    const isHorizontal = this._isHorizontal;
    handler.setAttribute(isHorizontal ? 'x' : 'y', position);
    const updateHandlerText =
      handler.name === SLIDER_ELEMENT_NAME.startHandler ? this._startHandlerText : this._endHandlerText;
    if (updateHandlerText) {
      const { handlerText = {} } = this.attribute as SliderAttributes;
      updateHandlerText.setAttributes({
        text: handlerText.formatter ? handlerText.formatter(value) : value.toFixed(handlerText.precision ?? 0),
        [isHorizontal ? 'x' : 'y']: position
      });
    }

    if (handler.name === SLIDER_ELEMENT_NAME.startHandler) {
      this._currentValue.startValue = value;
      this._currentValue.startPos = position;
    } else {
      this._currentValue.endValue = value;
      this._currentValue.endPos = position;
    }
  }

  // 更新 handler 以及对应 text
  private _updateHandlerText(handlerText: IText, position: number, value: number) {
    const isHorizontal = this._isHorizontal;
    const { handlerText: handlerTextAttr = {} } = this.attribute as SliderAttributes;
    handlerText.setAttributes({
      [isHorizontal ? 'x' : 'y']: position,
      text: handlerTextAttr.formatter ? handlerTextAttr.formatter(value) : value.toFixed(handlerTextAttr.precision ?? 0)
    });
    const updateHandler =
      handlerText.name === SLIDER_ELEMENT_NAME.startHandlerText ? this._startHandler : this._endHandler;
    if (updateHandler) {
      updateHandler.setAttributes({
        [isHorizontal ? 'x' : 'y']: position
      });
    }

    if (handlerText.name === SLIDER_ELEMENT_NAME.startHandlerText) {
      this._currentValue.startValue = value;
      this._currentValue.startPos = position;
    } else {
      this._currentValue.endValue = value;
      this._currentValue.endPos = position;
    }
  }

  private _dispatchChangeEvent() {
    const isRange = !!this.attribute.range;
    const currentValue = this._currentValue;

    this._dispatchEvent('change', {
      value: isRange
        ? [
            Math.min(currentValue.endValue as number, currentValue.startValue as number),
            Math.max(currentValue.endValue as number, currentValue.startValue as number)
          ]
        : currentValue.startValue,
      position: isRange
        ? [
            Math.min(currentValue.endPos as number, currentValue.startPos as number),
            Math.max(currentValue.endPos as number, currentValue.startPos as number)
          ]
        : currentValue.startPos
    });
  }

  private _dispatchTooltipEvent(type: string) {
    this._dispatchEvent('sliderTooltip', {
      type,
      position: this._tooltipState && this._tooltipState.pos,
      value: this._tooltipState && this._tooltipState.value
    });
  }

  private _getHandlers() {
    const { inverse } = this.attribute as SliderAttributes;
    let startHandler = this._startHandler;
    let endHandler = this._endHandler;

    if (!endHandler) {
      return { startHandler, endHandler };
    }

    if (this._isHorizontal) {
      if (
        (!inverse && (endHandler.attribute.x as number) < (startHandler?.attribute.x as number)) ||
        (inverse && (endHandler.attribute.x as number) > (startHandler?.attribute.x as number))
      ) {
        [startHandler, endHandler] = [endHandler, startHandler];
      }
    } else {
      if (
        (!inverse && (endHandler.attribute.y as number) < (startHandler?.attribute.y as number)) ||
        (inverse && (endHandler.attribute.y as number) > (startHandler?.attribute.y as number))
      ) {
        [startHandler, endHandler] = [endHandler, startHandler];
      }
    }

    return {
      startHandler,
      endHandler
    };
  }

  release(all?: boolean): void {
    /**
     * 浏览器上的事件必须解绑，防止内存泄漏，场景树上的事件会自动解绑
     */
    super.release(all);
    (vglobal.env === 'browser' ? vglobal : this.stage).addEventListener('touchmove', this._handleTouchMove, {
      passive: false
    });
    this._clearAllDragEvents();
  }
}
