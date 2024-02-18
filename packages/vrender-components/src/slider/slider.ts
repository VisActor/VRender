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
import { isNil, merge, clamp, isValid, array, isObject, isArray, clampRange } from '@visactor/vutils';
import { graphicCreator, vglobal, CustomEvent } from '@visactor/vrender-core';
import { AbstractComponent } from '../core/base';
import { SLIDER_ELEMENT_NAME } from './constant';

import type { SliderAttributes } from './type';
import type { ComponentOptions } from '../interface';
import { loadSliderComponent } from './register';

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

  constructor(attributes: SliderAttributes, options?: ComponentOptions) {
    super(options?.skipDefault ? attributes : merge({}, Slider.defaultAttributes, attributes));
  }

  /**
   * 更新值域
   */
  setValue(value: number | number[]) {
    const { layout, railWidth, railHeight, min, max } = this.attribute as SliderAttributes;
    if (max === min) {
      return;
    }

    const [startValue, endValue] = array(value);

    const { startHandler, endHandler } = this._getHandlers();
    const railLen = layout === 'vertical' ? railHeight : railWidth;
    const startPos = ((startValue - min) / (max - min)) * railLen;
    if (startHandler) {
      this._updateHandler(startHandler, startPos, startValue);
    }

    if (endHandler) {
      const endPos = ((endValue - min) / (max - min)) * railLen;
      this._updateHandler(endHandler, endPos, endValue);
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
      showHandler = true
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
    const railLen = isHorizontal ? railWidth : railHeight;

    const [startValue, endValue] = convertValueToRange(value);
    // 单滑块
    const handlerStart = max === min ? (range ? 0 : railLen) : (((startValue as number) - min) / (max - min)) * railLen;
    const startHandler = this._renderHandler({
      x: isHorizontal ? handlerStart : railWidth / 2,
      y: isHorizontal ? railHeight / 2 : handlerStart,
      size: handlerSize,
      strokeBoundsBuffer: 0,
      cursor: slidable === false ? 'default' : getDefaultCursor(isHorizontal),
      ...handlerStyle
    });
    startHandler.name = SLIDER_ELEMENT_NAME.startHandler;
    this._startHandler = startHandler;
    container.add(startHandler);
    this._currentValue.startPos = handlerStart;

    if (handlerTextVisible) {
      const startHandlerText = this._renderHandlerText(startValue, range ? 'start' : 'end');
      startHandlerText.name = SLIDER_ELEMENT_NAME.startHandlerText;
      container.add(startHandlerText);

      this._startHandlerText = startHandlerText;
    }

    if (range) {
      // 绘制第二个滑块
      // 单滑块
      const handlerEnd = max === min ? railLen : (((endValue as number) - min) / (max - min)) * railLen;
      const endHandler = this._renderHandler({
        x: isHorizontal ? handlerEnd : railWidth / 2,
        y: isHorizontal ? railHeight / 2 : handlerEnd,
        size: handlerSize,
        strokeBoundsBuffer: 0,
        cursor: slidable === false ? 'default' : getDefaultCursor(isHorizontal),
        ...handlerStyle
      });
      endHandler.name = SLIDER_ELEMENT_NAME.endHandler;
      this._endHandler = endHandler;
      container.add(endHandler);
      this._currentValue.endPos = handlerEnd;

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
    const railLen = isHorizontal ? railWidth : railHeight;
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

    const trackWidth = max === min ? railLen : ((endValue - startValue) / (max - min)) * railLen;
    const startPos = max === min ? 0 : ((startValue - min) / (max - min)) * railLen;
    const track = graphicCreator.rect({
      x: isHorizontal ? startPos : 0,
      y: isHorizontal ? 0 : startPos,
      width: isHorizontal ? trackWidth : railWidth,
      height: isHorizontal ? railHeight : trackWidth,
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

  private _renderHandlerText(value: number, position: string) {
    const {
      align,
      min,
      max,
      handlerSize = 14,
      handlerText = {},
      railHeight,
      railWidth,
      slidable
    } = this.attribute as SliderAttributes;

    const isHorizontal = this._isHorizontal;
    const railLen = isHorizontal ? railWidth : railHeight;
    const handlerStart =
      max === min ? (position === 'start' ? 0 : railLen) : (((value as number) - min) / (max - min)) * railLen;
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
        textStyle.x = handlerStart;
        textStyle.y = (railHeight - handlerSize) / 2 - textSpace;
      } else {
        // 展示 slider 下部
        textStyle.textBaseline = 'top';
        textStyle.textAlign = 'center';
        textStyle.x = handlerStart;
        textStyle.y = (railHeight + handlerSize) / 2 + textSpace;
      }
    } else {
      if (align === 'left') {
        // 展示 slider 左侧
        textStyle.textBaseline = 'middle';
        textStyle.textAlign = 'end';
        textStyle.x = (railWidth - handlerSize) / 2 - textSpace;
        textStyle.y = handlerStart;
      } else {
        // 展示 slider 右侧
        textStyle.textBaseline = 'middle';
        textStyle.textAlign = 'start';
        textStyle.x = (railWidth + handlerSize) / 2 + textSpace;
        textStyle.y = handlerStart;
      }
    }

    // 展示 handler 当前所在的数值
    const textShape = graphicCreator.text({
      ...textStyle,
      ...handlerText.style
    });
    return textShape;
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
    }
  }

  private _onHandlerPointerdown = (e: FederatedPointerEvent) => {
    e.stopPropagation();
    this._currentHandler = e.target as unknown as IGraphic;
    this._prePos = this._isHorizontal ? e.clientX : e.clientY;
    if (vglobal.env === 'browser') {
      vglobal.addEventListener('pointermove', this._onHandlerPointerMove as EventListenerOrEventListenerObject, {
        capture: true
      });
      vglobal.addEventListener('pointerup', this._onHandlerPointerUp as EventListenerOrEventListenerObject);
    } else {
      this.stage.addEventListener('pointermove', this._onHandlerPointerMove as EventListenerOrEventListenerObject, {
        capture: true
      });
      this.stage.addEventListener('pointerup', this._onHandlerPointerUp as EventListenerOrEventListenerObject);
      this.stage.addEventListener('pointerupoutside', this._onHandlerPointerUp as EventListenerOrEventListenerObject);
    }
  };

  private _onHandlerPointerMove = (e: FederatedPointerEvent) => {
    e.stopPropagation();
    const { railWidth, railHeight, min, max } = this.attribute as SliderAttributes;
    if (max === min) {
      return;
    }

    let currentPos;
    let delta = 0;
    let originPos;
    let railLen;
    if (!this._isHorizontal) {
      currentPos = e.clientY;
      delta = currentPos - this._prePos; // 实际位移的变化
      originPos = this._currentHandler?.attribute.y as number;
      railLen = railHeight;
    } else {
      currentPos = e.clientX;
      delta = currentPos - this._prePos; // 实际位移的变化
      originPos = this._currentHandler?.attribute.x as number;
      railLen = railWidth;
    }

    const newPos = clamp(originPos + delta, 0, railLen);
    const currentValue = (newPos / railLen) * (max - min) + min;

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
    e.preventDefault();
    this._currentHandler = null;
    if (vglobal.env === 'browser') {
      vglobal.removeEventListener('pointermove', this._onHandlerPointerMove as EventListenerOrEventListenerObject, {
        capture: true
      });
      vglobal.removeEventListener('pointerup', this._onHandlerPointerUp as EventListenerOrEventListenerObject);
    } else {
      this.stage.removeEventListener('pointermove', this._onHandlerPointerMove as EventListenerOrEventListenerObject, {
        capture: true
      });
      this.stage.removeEventListener('pointerup', this._onHandlerPointerUp as EventListenerOrEventListenerObject);
      this.stage.removeEventListener(
        'pointerupoutside',
        this._onHandlerPointerUp as EventListenerOrEventListenerObject
      );
    }
  };

  private _onTrackPointerdown = (e: FederatedPointerEvent) => {
    e.stopPropagation();
    this._prePos = this._isHorizontal ? e.clientX : e.clientY;
    if (vglobal.env === 'browser') {
      vglobal.addEventListener('pointermove', this._onTrackPointerMove as EventListenerOrEventListenerObject, {
        capture: true
      });
      vglobal.addEventListener('pointerup', this._onTrackPointerUp as EventListenerOrEventListenerObject);
    } else {
      this.stage.addEventListener('pointermove', this._onTrackPointerMove as EventListenerOrEventListenerObject, {
        capture: true
      });
      this.stage.addEventListener('pointerup', this._onTrackPointerUp as EventListenerOrEventListenerObject);
      this.stage.addEventListener('pointerupoutside', this._onTrackPointerUp as EventListenerOrEventListenerObject);
    }
  };

  private _onTrackPointerMove = (e: FederatedPointerEvent) => {
    e.stopPropagation();
    const { railWidth, railHeight, min, max } = this.attribute as SliderAttributes;

    if (max === min) {
      return;
    }
    const { startHandler, endHandler } = this._getHandlers();

    let currentPos;
    let trackLen;
    let railLen;
    if (this._isHorizontal) {
      currentPos = e.clientX;
      // @ts-ignore
      trackLen = this._track.attribute.width;
      railLen = railWidth;
    } else {
      currentPos = e.clientY;
      // @ts-ignore
      trackLen = this._track.attribute.height;
      railLen = railHeight;
    }
    const delta = currentPos - this._prePos; // 实际位移的变化
    if (startHandler) {
      const originPos = (this._isHorizontal ? startHandler.attribute.x : startHandler.attribute.y) as number;
      const newPos = clamp(originPos + delta, 0, railLen - trackLen);
      const currentValue = (newPos / railLen) * (max - min) + min;
      this._updateHandler(startHandler, newPos, currentValue);
    }

    if (endHandler) {
      const originPos = (this._isHorizontal ? endHandler.attribute.x : endHandler.attribute.y) as number;
      const newPos = clamp(originPos + delta, trackLen, railLen);
      const currentValue = (newPos / railLen) * (max - min) + min;
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
    e.preventDefault();
    if (vglobal.env === 'browser') {
      vglobal.removeEventListener('pointermove', this._onTrackPointerMove as EventListenerOrEventListenerObject, {
        capture: true
      });
      vglobal.removeEventListener('pointerup', this._onTrackPointerUp as EventListenerOrEventListenerObject);
    } else {
      this.stage.removeEventListener('pointermove', this._onTrackPointerMove as EventListenerOrEventListenerObject, {
        capture: true
      });
      this.stage.removeEventListener('pointerup', this._onTrackPointerUp as EventListenerOrEventListenerObject);
      this.stage.removeEventListener('pointerupoutside', this._onTrackPointerUp as EventListenerOrEventListenerObject);
    }
  };

  private _onRailPointerDown = (e: FederatedPointerEvent) => {
    e.stopPropagation();
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

    const currentValue = (currentPos / railLen) * (max - min) + min;

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

  private _getHandlers() {
    let startHandler = this._startHandler;
    let endHandler = this._endHandler;
    let temp;

    if (this._isHorizontal) {
      if (endHandler && (endHandler.attribute.x as number) < (startHandler?.attribute.x as number)) {
        temp = startHandler;
        startHandler = endHandler;
        endHandler = temp;
      }
    } else {
      if (endHandler && (endHandler.attribute.y as number) < (startHandler?.attribute.y as number)) {
        temp = startHandler;
        startHandler = endHandler;
        endHandler = temp;
      }
    }

    return {
      startHandler,
      endHandler
    };
  }
}
