import type { IGroup } from '@visactor/vrender-core';
import { array, isFunction, isValid, merge } from '@visactor/vutils';
import { AbstractComponent } from '../core/base';
import type { DataZoomAttributes } from './type';
import type { ComponentOptions } from '../interface';
import { Renderer, type IRenderer } from './renderer';
import { InteractionManager, type InteractionManagerAttributes } from './interaction';
import { loadDataZoomComponent } from './register';
import { DEFAULT_DATA_ZOOM_ATTRIBUTES } from './config';

loadDataZoomComponent();
export class DataZoom extends AbstractComponent<Required<DataZoomAttributes>> {
  name = 'dataZoom';
  static defaultAttributes = DEFAULT_DATA_ZOOM_ATTRIBUTES;
  /** 交互控制 */
  private _interaction: InteractionManager;
  /** 渲染控制 */
  private _renderer: Renderer;
  /** 共享变量: 状态 */
  private _state: { start: number; end: number } = { start: 0, end: 1 };
  /** 共享变量: 布局 */
  private _layoutCacheFromConfig: any;

  constructor(attributes: DataZoomAttributes, options?: ComponentOptions) {
    super(options?.skipDefault ? attributes : merge({}, DataZoom.defaultAttributes, attributes));
    this._renderer = new Renderer(this._rendererAttrs());
    this._interaction = new InteractionManager(this._interactionAttrs());
    const { start, end } = this.attribute as DataZoomAttributes;
    start && (this._state.start = start);
    end && (this._state.end = end);
  }

  /**
   * 获取背景框中的位置和宽高
   * @description 实际绘制的背景框中的高度或宽度 减去 中间手柄的高度或宽度
   */
  private _getLayoutAttrFromConfig() {
    if (this._layoutCacheFromConfig) {
      return this._layoutCacheFromConfig;
    }
    const {
      position: positionConfig,
      size,
      orient,
      middleHandlerStyle = {},
      startHandlerStyle = {},
      endHandlerStyle = {},
      backgroundStyle = {}
    } = this.attribute as DataZoomAttributes;
    const { width: widthConfig, height: heightConfig } = size;
    const middleHandlerSize = middleHandlerStyle.background?.size ?? 10;

    // 如果middleHandler显示的话，要将其宽高计入datazoom宽高
    let width;
    let height;
    let position;
    if (middleHandlerStyle.visible) {
      if (this.attribute.orient === 'top' || this.attribute.orient === 'bottom') {
        width = widthConfig;
        height = heightConfig - middleHandlerSize;
        position = {
          x: positionConfig.x,
          y: positionConfig.y + middleHandlerSize
        };
      } else {
        width = widthConfig - middleHandlerSize;
        height = heightConfig;
        position = {
          x: positionConfig.x + (orient === 'left' ? middleHandlerSize : 0),
          y: positionConfig.y
        };
      }
    } else {
      width = widthConfig;
      height = heightConfig;
      position = positionConfig;
    }

    const isHorizontal = this.attribute.orient === 'top' || this.attribute.orient === 'bottom';

    const startHandlerSize = (startHandlerStyle.size as number) ?? (isHorizontal ? height : width);
    const endHandlerSize = (endHandlerStyle.size as number) ?? (isHorizontal ? height : width);
    // 如果startHandler显示的话，要将其宽高计入dataZoom宽高
    if (startHandlerStyle.visible) {
      if (isHorizontal) {
        width -= (startHandlerSize + endHandlerSize) / 2;
        position = {
          x: position.x + startHandlerSize / 2,
          y: position.y
        };
      } else {
        height -= (startHandlerSize + endHandlerSize) / 2;
        position = {
          x: position.x,
          y: position.y + startHandlerSize / 2
        };
      }
    }

    // stroke 需计入宽高, 否则dataZoom在画布边缘会被裁剪lineWidth / 2
    height += (backgroundStyle.lineWidth ?? 2) / 2;
    width += (backgroundStyle.lineWidth ?? 2) / 2;

    this._layoutCacheFromConfig = {
      position,
      width,
      height
    };
    return this._layoutCacheFromConfig;
  }

  get getLayoutAttrFromConfig() {
    return this._getLayoutAttrFromConfig;
  }

  private _rendererAttrs(): IRenderer {
    return {
      attribute: this.attribute,
      getLayoutAttrFromConfig: this.getLayoutAttrFromConfig,
      setState: (state: { start: number; end: number }) => {
        this._state = state;
      },
      getState: () => {
        return this._state;
      }
    };
  }

  private _interactionAttrs(): InteractionManagerAttributes {
    return {
      stage: this.stage,
      attribute: this.attribute,
      startHandlerMask: this._renderer.startHandlerMask,
      endHandlerMask: this._renderer.endHandlerMask,
      middleHandlerSymbol: this._renderer.middleHandlerSymbol,
      middleHandlerRect: this._renderer.middleHandlerRect,
      selectedBackground: this._renderer.selectedBackground,
      background: this._renderer.background,
      previewGroup: this._renderer.previewGroup,
      selectedPreviewGroup: this._renderer.selectedPreviewGroup,
      getLayoutAttrFromConfig: this.getLayoutAttrFromConfig,
      setState: (state: { start: number; end: number }) => {
        this._state = state;
      },
      getState: () => {
        return this._state;
      }
    };
  }

  bindEvents(): void {
    if (this.attribute.disableTriggerEvent) {
      this.setAttribute('childrenPickable', false);
      return;
    }
    this._interaction.bindEvents();
    this._interaction.on('stateChange', ({ shouldRender }) => {
      if (shouldRender) {
        this._renderer.renderDataZoom();
      }
    });
    this._interaction.on('eventChange', ({ start, end, tag }) => {
      this._dispatchEvent('change', { start, end, tag });
    });
    this._interaction.on('renderMask', () => {
      this._renderer.renderDragMask();
    });
    this._interaction.on('enter', () => {
      this._renderer.showText = true;
      this._renderer._renderText();
    });

    // hover
    if (this.attribute.showDetail === 'auto') {
      (this as unknown as IGroup).addEventListener('pointerenter', () => {
        this._renderer.showText = true;
        this._renderer._renderText();
      });
      (this as unknown as IGroup).addEventListener('pointerleave', () => {
        this._renderer.showText = false;
        this._renderer._renderText();
      });
    }
  }

  setAttributes(params: Partial<Required<DataZoomAttributes>>, forceUpdateTag?: boolean): void {
    super.setAttributes(params, forceUpdateTag);
    const { start, end } = this.attribute as DataZoomAttributes;
    start && (this._state.start = start);
    end && (this._state.end = end);

    this._renderer.setAttributes(this._rendererAttrs());
    this._interaction.setAttributes(this._interactionAttrs());
  }

  render(): void {
    this._layoutCacheFromConfig = null;

    const group = (this as unknown as IGroup).createOrUpdateChild('dataZoom-container', {}, 'group') as IGroup;
    this._renderer.container = group;
    this._renderer.renderDataZoom();
    this._interaction.setAttributes(this._interactionAttrs());
  }

  release(all?: boolean): void {
    /**
     * 浏览器上的事件必须解绑，防止内存泄漏，场景树上的事件会自动解绑
     */
    super.release(all);
    this._interaction.clearDragEvents();
    this._interaction.clearDragEvents();
  }

  /** 外部重置组件的起始状态 */
  setStartAndEnd(start?: number, end?: number) {
    const { start: startAttr, end: endAttr } = this.attribute as DataZoomAttributes;
    const { start: startState, end: endState } = this._state;
    if (isValid(start) && isValid(end) && (start !== startState || end !== endState)) {
      if (startAttr !== startState || endAttr !== endState) {
        this._renderer.renderDataZoom();
        this._dispatchEvent('change', {
          start,
          end
        });
      }
    }
  }

  /** 外部更新背景图表的数据 */
  setPreviewData(data: any[]) {
    this._renderer.previewData = data;
  }

  /** 外部更新手柄文字 */
  setText(text: string, tag: 'start' | 'end') {
    if (tag === 'start') {
      this._renderer.startText.setAttribute('text', text);
    } else {
      this._renderer.endText.setAttribute('text', text);
    }
  }

  /** 外部获取起始点数据值 */
  getStartValue() {
    return this._renderer.startValue;
  }

  getEndTextValue() {
    return this._renderer.endValue;
  }

  getMiddleHandlerSize() {
    const { middleHandlerStyle = {} } = this.attribute as DataZoomAttributes;
    const middleHandlerRectSize = middleHandlerStyle.background?.size ?? 10;
    const middleHandlerSymbolSize = middleHandlerStyle.icon?.size ?? 10;
    return Math.max(middleHandlerRectSize, ...array(middleHandlerSymbolSize));
  }

  /** 外部传入数据映射 */
  setPreviewPointsX(callback: (d: any) => number) {
    isFunction(callback) && (this._renderer.previewPointsX = callback);
  }
  setPreviewPointsY(callback: (d: any) => number) {
    isFunction(callback) && (this._renderer.previewPointsY = callback);
  }
  setPreviewPointsX1(callback: (d: any) => number) {
    isFunction(callback) && (this._renderer.previewPointsX1 = callback);
  }
  setPreviewPointsY1(callback: (d: any) => number) {
    isFunction(callback) && (this._renderer.previewPointsY1 = callback);
  }
  setStatePointToData(callback: (state: number) => any) {
    isFunction(callback) && (this._renderer.statePointToData = callback);
  }
}
