import type { FederatedPointerEvent, IArea, IGroup, ILine, IRect, ISymbol, INode } from '@visactor/vrender-core';
// eslint-disable-next-line no-duplicate-imports
import { flatten_simplify, vglobal } from '@visactor/vrender-core';
import type { IBoundsLike, IPointLike } from '@visactor/vutils';
// eslint-disable-next-line no-duplicate-imports
import { Bounds, array, clamp, debounce, isFunction, isValid, merge, throttle } from '@visactor/vutils';
import { AbstractComponent } from '../core/base';
import type { TagAttributes } from '../tag';
// eslint-disable-next-line no-duplicate-imports
import { Tag } from '../tag';
import { DEFAULT_DATA_ZOOM_ATTRIBUTES, DEFAULT_HANDLER_ATTR_MAP } from './config';
import { DataZoomActiveTag } from './type';
// eslint-disable-next-line no-duplicate-imports
import type { DataZoomAttributes } from './type';
import type { ComponentOptions } from '../interface';
import { loadDataZoomComponent } from './register';

const delayMap = {
  debounce: debounce,
  throttle: throttle
};
loadDataZoomComponent();
export class DataZoom extends AbstractComponent<Required<DataZoomAttributes>> {
  name = 'dataZoom';
  static defaultAttributes = DEFAULT_DATA_ZOOM_ATTRIBUTES;

  private _isHorizontal: boolean;

  private _background!: IRect;

  private _container!: IGroup;

  /** 手柄 */
  private _startHandlerMask!: IRect;
  private _startHandler!: ISymbol;
  private _middleHandlerSymbol!: ISymbol;
  private _middleHandlerRect!: IRect;
  private _endHandlerMask!: IRect;
  private _endHandler!: ISymbol;
  private _selectedBackground!: IRect;
  private _dragMask!: IRect;
  private _startText!: Tag;
  private _endText!: Tag;
  private _startValue!: string | number;
  private _endValue!: string | number;
  private _showText!: boolean;

  /** 背景图表 */
  private _previewData: any[] = [];
  private _previewGroup!: IGroup;
  private _previewLine!: ILine;
  private _previewArea!: IArea;
  private _selectedPreviewGroupClip!: IGroup;
  private _selectedPreviewGroup!: IGroup;
  private _selectedPreviewLine!: ILine;
  private _selectedPreviewArea!: IArea;

  /** 交互状态 */
  protected _activeTag!: DataZoomActiveTag;
  protected _activeItem!: any;
  protected _activeState = false;
  protected _activeCache: {
    startPos: IPointLike;
    lastPos: IPointLike;
  } = {
    startPos: { x: 0, y: 0 },
    lastPos: { x: 0, y: 0 }
  };
  protected _layoutCache: {
    attPos: 'x' | 'y';
    attSize: 'width' | 'height';
    max: number;
  } = {
    attPos: 'x',
    attSize: 'width',
    max: 0
  };
  /** 起始状态 */
  readonly state = {
    start: 0,
    end: 1
  };
  protected _spanCache: number;

  /** 回调函数 */
  private _previewPointsX!: (datum: any) => number;
  private _previewPointsY!: (datum: any) => number;
  private _previewPointsX1!: (datum: any) => number;
  private _previewPointsY1!: (datum: any) => number;
  private _statePointToData: (state: number) => any = state => state;
  private _layoutAttrFromConfig: any; // 用于缓存

  setPropsFromAttrs() {
    const { start, end, orient, previewData, previewPointsX, previewPointsY, previewPointsX1, previewPointsY1 } = this
      .attribute as DataZoomAttributes;
    start && (this.state.start = start);
    end && (this.state.end = end);
    const { width, height } = this.getLayoutAttrFromConfig();
    this._spanCache = this.state.end - this.state.start;
    this._isHorizontal = orient === 'top' || orient === 'bottom';
    this._layoutCache.max = this._isHorizontal ? width : height;
    this._layoutCache.attPos = this._isHorizontal ? 'x' : 'y';
    this._layoutCache.attSize = this._isHorizontal ? 'width' : 'height';
    previewData && (this._previewData = previewData);
    isFunction(previewPointsX) && (this._previewPointsX = previewPointsX);
    isFunction(previewPointsY) && (this._previewPointsY = previewPointsY);
    isFunction(previewPointsX1) && (this._previewPointsX1 = previewPointsX1);
    isFunction(previewPointsY1) && (this._previewPointsY1 = previewPointsY1);
  }

  constructor(attributes: DataZoomAttributes, options?: ComponentOptions) {
    super(options?.skipDefault ? attributes : merge({}, DataZoom.defaultAttributes, attributes));
    const { position, showDetail } = attributes;
    // 这些属性在事件交互过程中会改变，所以不能在setAttrs里面动态更改
    this._activeCache.startPos = position;
    this._activeCache.lastPos = position;
    if (showDetail === 'auto') {
      this._showText = false as boolean;
    } else {
      this._showText = showDetail as boolean;
    }
    this.setPropsFromAttrs();
  }

  setAttributes(params: Partial<Required<DataZoomAttributes>>, forceUpdateTag?: boolean): void {
    super.setAttributes(params, forceUpdateTag);
    this.setPropsFromAttrs();
  }

  protected bindEvents(): void {
    if (this.attribute.disableTriggerEvent) {
      this.setAttribute('childrenPickable', false);
      return;
    }
    const { showDetail, brushSelect } = this.attribute as DataZoomAttributes;
    // 拖拽开始
    if (this._startHandlerMask) {
      this._startHandlerMask.addEventListener(
        'pointerdown',
        (e: FederatedPointerEvent) => this._onHandlerPointerDown(e, 'start') as unknown as EventListener
      );
    }
    if (this._endHandlerMask) {
      this._endHandlerMask.addEventListener(
        'pointerdown',
        (e: FederatedPointerEvent) => this._onHandlerPointerDown(e, 'end') as unknown as EventListener
      );
    }
    if (this._middleHandlerSymbol) {
      this._middleHandlerSymbol.addEventListener(
        'pointerdown',
        (e: FederatedPointerEvent) => this._onHandlerPointerDown(e, 'middleSymbol') as unknown as EventListener
      );
    }
    if (this._middleHandlerRect) {
      this._middleHandlerRect.addEventListener(
        'pointerdown',
        (e: FederatedPointerEvent) => this._onHandlerPointerDown(e, 'middleRect') as unknown as EventListener
      );
    }

    const selectedTag = brushSelect ? 'background' : 'middleRect';
    if (this._selectedBackground) {
      this._selectedBackground.addEventListener(
        'pointerdown',
        (e: FederatedPointerEvent) => this._onHandlerPointerDown(e, selectedTag) as unknown as EventListener
      );
    }
    if (brushSelect && this._background) {
      this._background.addEventListener(
        'pointerdown',
        (e: FederatedPointerEvent) => this._onHandlerPointerDown(e, 'background') as unknown as EventListener
      );
    }
    if (brushSelect && this._previewGroup) {
      this._previewGroup.addEventListener(
        'pointerdown',
        (e: FederatedPointerEvent) => this._onHandlerPointerDown(e, 'background') as unknown as EventListener
      );
    }
    if (this._selectedPreviewGroup) {
      this._selectedPreviewGroup.addEventListener(
        'pointerdown',
        (e: FederatedPointerEvent) => this._onHandlerPointerDown(e, selectedTag) as unknown as EventListener
      );
    }
    // 拖拽结束
    (this as unknown as IGroup).addEventListener('pointerup', this._onHandlerPointerUp);
    (this as unknown as IGroup).addEventListener('pointerupoutside', this._onHandlerPointerUp);
    // hover
    if (showDetail === 'auto') {
      (this as unknown as IGroup).addEventListener('pointerenter', this._onHandlerPointerEnter as EventListener);
      (this as unknown as IGroup).addEventListener('pointerleave', this._onHandlerPointerLeave as EventListener);
    }
  }

  /** dragMask size边界处理 */
  protected dragMaskSize() {
    const { position } = this.attribute as DataZoomAttributes;
    const { attPos, max } = this._layoutCache;
    if (this._activeCache.lastPos[attPos] - position[attPos] > max) {
      return max + position[attPos] - this._activeCache.startPos[attPos];
    } else if (this._activeCache.lastPos[attPos] - position[attPos] < 0) {
      return position[attPos] - this._activeCache.startPos[attPos];
    }
    return this._activeCache.lastPos[attPos] - this._activeCache.startPos[attPos];
  }

  /** state 边界处理 */
  protected setStateAttr(start: number, end: number, shouldRender: boolean) {
    const { zoomLock = false, minSpan = 0, maxSpan = 1 } = this.attribute as DataZoomAttributes;
    const span = end - start;
    if (span !== this._spanCache && (zoomLock || span < minSpan || span > maxSpan)) {
      return;
    }
    this._spanCache = span;
    this.state.start = start;
    this.state.end = end;
    shouldRender && this.setAttributes({ start, end });
  }

  /** 事件系统坐标转换为stage坐标 */
  protected eventPosToStagePos(e: FederatedPointerEvent) {
    return this.stage.eventPointTransform(e);
  }

  /**
   * 拖拽开始事件
   * @description 开启activeState + 通过tag判断事件在哪个元素上触发 并 更新交互坐标
   */
  private _onHandlerPointerDown = (e: FederatedPointerEvent, tag: string) => {
    e.stopPropagation();
    if (tag === 'start') {
      this._activeTag = DataZoomActiveTag.startHandler;
      this._activeItem = this._startHandlerMask;
    } else if (tag === 'end') {
      this._activeTag = DataZoomActiveTag.endHandler;
      this._activeItem = this._endHandlerMask;
    } else if (tag === 'middleRect') {
      this._activeTag = DataZoomActiveTag.middleHandler;
      this._activeItem = this._middleHandlerRect;
    } else if (tag === 'middleSymbol') {
      this._activeTag = DataZoomActiveTag.middleHandler;
      this._activeItem = this._middleHandlerSymbol;
    } else if (tag === 'background') {
      this._activeTag = DataZoomActiveTag.background;
      this._activeItem = this._background;
    }
    this._activeState = true;
    this._activeCache.startPos = this.eventPosToStagePos(e);
    this._activeCache.lastPos = this.eventPosToStagePos(e);

    // 拖拽开始时监听事件
    if (vglobal.env === 'browser') {
      // 拖拽时
      vglobal.addEventListener('pointermove', this._onHandlerPointerMove, { capture: true });
      // 拖拽结束
      vglobal.addEventListener('pointerup', this._onHandlerPointerUp);
    }
    // 拖拽时
    (this as unknown as IGroup).addEventListener('pointermove', this._onHandlerPointerMove, { capture: true });
  };

  /**
   * 拖拽进行事件
   * @description 分为以下四种情况:
   * 1. 在背景 or 背景图表上拖拽 (activeTag === 'background'): 改变lastPos => dragMask的宽 or 高被改变
   * 2. 在middleHandler上拖拽 (activeTag === 'middleHandler'): 改变lastPos、start & end + 边界处理: 防止拖拽结果超出背景 => 所有handler的位置被改变
   * 3. 在startHandler上拖拽 (activeTag === 'startHandler'): 改变lastPos、start & end + 边界处理: startHandler和endHandler交换 => 所有handler的位置被改变
   * 4. 在endHandler上拖拽，同上
   */
  private _pointerMove = (e: FederatedPointerEvent) => {
    e.stopPropagation();
    const { start: startAttr, end: endAttr, brushSelect, realTime = true } = this.attribute as DataZoomAttributes;
    const pos = this.eventPosToStagePos(e);
    const { attPos, max } = this._layoutCache;
    const dis = (pos[attPos] - this._activeCache.lastPos[attPos]) / max;

    let { start, end } = this.state;
    // this._activeState= false;
    if (this._activeState) {
      // if (this._activeTag === DataZoomActiveTag.background) {
      // } else
      if (this._activeTag === DataZoomActiveTag.middleHandler) {
        this.moveZoomWithMiddle((this.state.start + this.state.end) / 2 + dis);
      } else if (this._activeTag === DataZoomActiveTag.startHandler) {
        if (start + dis > end) {
          start = end;
          end = start + dis;
          this._activeTag = DataZoomActiveTag.endHandler;
        } else {
          start = start + dis;
        }
      } else if (this._activeTag === DataZoomActiveTag.endHandler) {
        if (end + dis < start) {
          end = start;
          start = end + dis;
          this._activeTag = DataZoomActiveTag.startHandler;
        } else {
          end = end + dis;
        }
      }
      this._activeCache.lastPos = pos;
      brushSelect && this.renderDragMask();
    }
    start = Math.min(Math.max(start, 0), 1);
    end = Math.min(Math.max(end, 0), 1);

    // 避免attributes相同时, 重复渲染
    if (startAttr !== start || endAttr !== end) {
      this.setStateAttr(start, end, true);

      if (realTime) {
        this._dispatchEvent('change', {
          start,
          end,
          tag: this._activeTag
        });
      }
    }
  };
  private _onHandlerPointerMove =
    this.attribute.delayTime === 0
      ? this._pointerMove
      : delayMap[this.attribute.delayType](this._pointerMove, this.attribute.delayTime);

  /**
   * 拖拽结束事件
   * @description 关闭activeState + 边界情况处理: 防止拖拽后start和end过近
   */
  private _onHandlerPointerUp = (e: FederatedPointerEvent) => {
    e.preventDefault();
    const { start, end, brushSelect, realTime = true } = this.attribute as DataZoomAttributes;
    if (this._activeState) {
      if (this._activeTag === DataZoomActiveTag.background) {
        const pos = this.eventPosToStagePos(e);
        this.backgroundDragZoom(this._activeCache.startPos, pos);
      }
    }
    this._activeState = false;

    // dragMask不依赖于state更新
    brushSelect && this.renderDragMask();

    // 避免attributes相同时, 重复渲染
    if (start !== this.state.start || end !== this.state.end) {
      this.setStateAttr(this.state.start, this.state.end, true);

      this._dispatchEvent('change', {
        start: this.state.start,
        end: this.state.end,
        tag: this._activeTag
      });
    }

    // 拖拽结束后卸载事件
    if (vglobal.env === 'browser') {
      // 拖拽时
      vglobal.removeEventListener('pointermove', this._onHandlerPointerMove, { capture: true });
      // 拖拽结束
      vglobal.removeEventListener('pointerup', this._onHandlerPointerUp);
    }
    // 拖拽时
    (this as unknown as IGroup).removeEventListener('pointermove', this._onHandlerPointerMove, { capture: true });
    (this as unknown as IGroup).removeEventListener('pointerup', this._onHandlerPointerUp);
  };

  /**
   * 鼠标进入事件
   * @description 鼠标进入选中部分出现start和end文字
   */
  private _onHandlerPointerEnter(e: FederatedPointerEvent) {
    e.stopPropagation();
    this._showText = true;
    this.renderText();
  }

  /**
   * 鼠标移出事件
   * @description 鼠标移出选中部分不出现start和end文字
   */
  private _onHandlerPointerLeave(e: FederatedPointerEvent) {
    e.stopPropagation();
    this._showText = false;
    this.renderText();
  }

  protected backgroundDragZoom(startPos: IPointLike, endPos: IPointLike) {
    const { attPos, max } = this._layoutCache;
    const { position } = this.attribute as DataZoomAttributes;
    const startPosInComponent = startPos[attPos] - position[attPos];
    const endPosInComponent = endPos[attPos] - position[attPos];
    const start = Math.min(Math.max(Math.min(startPosInComponent, endPosInComponent) / max, 0), 1);
    const end = Math.min(Math.max(Math.max(startPosInComponent, endPosInComponent) / max, 0), 1);
    if (Math.abs(start - end) < 0.01) {
      this.moveZoomWithMiddle(start);
    } else {
      this.setStateAttr(start, end, false);
    }
  }

  protected moveZoomWithMiddle(middle: number) {
    const currentMiddle = (this.state.start + this.state.end) / 2;
    let offset = middle - currentMiddle;
    // 拖拽middleHandler时，限制在background范围内
    if (offset === 0) {
      return;
    } else if (offset > 0) {
      if (this.state.end + offset > 1) {
        offset = 1 - this.state.end;
      }
    } else if (offset < 0) {
      if (this.state.start + offset < 0) {
        offset = -this.state.start;
      }
    }
    this.setStateAttr(this.state.start + offset, this.state.end + offset, false);
  }

  protected renderDragMask() {
    const { dragMaskStyle } = this.attribute as DataZoomAttributes;
    const { position, width, height } = this.getLayoutAttrFromConfig();
    // drag部分
    if (this._isHorizontal) {
      this._dragMask = this._container.createOrUpdateChild(
        'dragMask',
        {
          x: clamp(
            this.dragMaskSize() < 0 ? this._activeCache.lastPos.x : this._activeCache.startPos.x,
            position.x,
            position.x + width
          ),
          y: position.y,
          width:
            (this._activeState && this._activeTag === DataZoomActiveTag.background && Math.abs(this.dragMaskSize())) ||
            0,
          height,
          ...dragMaskStyle
        },
        'rect'
      ) as IRect;
    } else {
      this._dragMask = this._container.createOrUpdateChild(
        'dragMask',
        {
          x: position.x,
          y: clamp(
            this.dragMaskSize() < 0 ? this._activeCache.lastPos.y : this._activeCache.startPos.y,
            position.y,
            position.y + height
          ),
          width,
          height:
            (this._activeState && this._activeTag === DataZoomActiveTag.background && Math.abs(this.dragMaskSize())) ||
            0,
          ...dragMaskStyle
        },
        'rect'
      ) as IRect;
    }
  }

  /**
   * 判断文字是否超出datazoom范围
   */
  protected isTextOverflow(componentBoundsLike: IBoundsLike, textBounds: IBoundsLike | null, layout: 'start' | 'end') {
    if (!textBounds) {
      return false;
    }
    if (this._isHorizontal) {
      if (layout === 'start') {
        if (textBounds.x1 < componentBoundsLike.x1) {
          return true;
        }
      } else {
        if (textBounds.x2 > componentBoundsLike.x2) {
          return true;
        }
      }
    } else {
      if (layout === 'start') {
        if (textBounds.y1 < componentBoundsLike.y1) {
          return true;
        }
      } else {
        if (textBounds.y2 > componentBoundsLike.y2) {
          return true;
        }
      }
    }
    return false;
  }

  protected setTextAttr(startTextBounds: IBoundsLike, endTextBounds: IBoundsLike) {
    const { startTextStyle, endTextStyle } = this.attribute as DataZoomAttributes;
    const { formatMethod: startTextFormat, ...restStartTextStyle } = startTextStyle;
    const { formatMethod: endTextFormat, ...restEndTextStyle } = endTextStyle;
    const { start, end } = this.state;
    this._startValue = this._statePointToData(start);
    this._endValue = this._statePointToData(end);
    const { position, width, height } = this.getLayoutAttrFromConfig();

    const startTextValue = startTextFormat ? startTextFormat(this._startValue) : this._startValue;
    const endTextValue = endTextFormat ? endTextFormat(this._endValue) : this._endValue;
    const componentBoundsLike = {
      x1: position.x,
      y1: position.y,
      x2: position.x + width,
      y2: position.y + height
    };
    let startTextPosition: IPointLike;
    let endTextPosition: IPointLike;
    let startTextAlignStyle: any;
    let endTextAlignStyle: any;
    if (this._isHorizontal) {
      startTextPosition = {
        x: position.x + start * width,
        y: position.y + height / 2
      };
      endTextPosition = {
        x: position.x + end * width,
        y: position.y + height / 2
      };
      startTextAlignStyle = {
        textAlign: this.isTextOverflow(componentBoundsLike, startTextBounds, 'start') ? 'left' : 'right',
        textBaseline: restStartTextStyle?.textStyle?.textBaseline ?? 'middle'
      };
      endTextAlignStyle = {
        textAlign: this.isTextOverflow(componentBoundsLike, endTextBounds, 'end') ? 'right' : 'left',
        textBaseline: restEndTextStyle?.textStyle?.textBaseline ?? 'middle'
      };
    } else {
      startTextPosition = {
        x: position.x + width / 2,
        y: position.y + start * height
      };
      endTextPosition = {
        x: position.x + width / 2,
        y: position.y + end * height
      };
      startTextAlignStyle = {
        textAlign: restStartTextStyle?.textStyle?.textAlign ?? 'center',
        textBaseline: this.isTextOverflow(componentBoundsLike, startTextBounds, 'start') ? 'top' : 'bottom'
      };
      endTextAlignStyle = {
        textAlign: restEndTextStyle?.textStyle?.textAlign ?? 'center',
        textBaseline: this.isTextOverflow(componentBoundsLike, endTextBounds, 'end') ? 'bottom' : 'top'
      };
    }

    this._startText = this.maybeAddLabel(
      this._container,
      merge({}, restStartTextStyle, {
        text: startTextValue,
        x: startTextPosition.x,
        y: startTextPosition.y,
        visible: this._showText,
        pickable: false,
        childrenPickable: false,
        textStyle: startTextAlignStyle
      }),
      `data-zoom-start-text-${position}`
    );
    this._endText = this.maybeAddLabel(
      this._container,
      merge({}, restEndTextStyle, {
        text: endTextValue,
        x: endTextPosition.x,
        y: endTextPosition.y,
        visible: this._showText,
        pickable: false,
        childrenPickable: false,
        textStyle: endTextAlignStyle
      }),
      `data-zoom-end-text-${position}`
    );
  }

  protected renderText() {
    let startTextBounds: IBoundsLike | null = null;
    let endTextBounds: IBoundsLike | null = null;

    // 第一次绘制
    this.setTextAttr(startTextBounds, endTextBounds);
    // 得到bounds
    startTextBounds = this._startText.AABBBounds;
    endTextBounds = this._endText.AABBBounds;

    // 第二次绘制: 将text限制在组件bounds内
    this.setTextAttr(startTextBounds, endTextBounds);
    // 得到bounds
    startTextBounds = this._startText.AABBBounds;
    endTextBounds = this._endText.AABBBounds;
    const { x1, x2, y1, y2 } = startTextBounds;
    const { dx: startTextDx = 0, dy: startTextDy = 0 } = this.attribute.startTextStyle;

    // 第三次绘制: 避免startText和endText重叠, 如果重叠了, 对startText做位置调整(考虑到调整的最小化，只单独调整startText而不调整endText)
    if (new Bounds().set(x1, y1, x2, y2).intersects(endTextBounds)) {
      const direction = this.attribute.orient === 'bottom' || this.attribute.orient === 'right' ? -1 : 1;
      if (this._isHorizontal) {
        this._startText.setAttribute('dy', startTextDy + direction * Math.abs(endTextBounds.y1 - endTextBounds.y2));
      } else {
        this._startText.setAttribute('dx', startTextDx + direction * Math.abs(endTextBounds.x1 - endTextBounds.x2));
      }
    } else {
      if (this._isHorizontal) {
        this._startText.setAttribute('dy', startTextDy);
      } else {
        this._startText.setAttribute('dx', startTextDx);
      }
    }
  }

  /**
   * 获取背景框中的位置和宽高
   * @description 实际绘制的背景框中的高度或宽度 减去 中间手柄的高度或宽度
   */
  protected getLayoutAttrFromConfig() {
    if (this._layoutAttrFromConfig) {
      return this._layoutAttrFromConfig;
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
      if (this._isHorizontal) {
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

    const startHandlerSize = (startHandlerStyle.size as number) ?? (this._isHorizontal ? height : width);
    const endHandlerSize = (endHandlerStyle.size as number) ?? (this._isHorizontal ? height : width);
    // 如果startHandler显示的话，要将其宽高计入dataZoom宽高
    if (startHandlerStyle.visible) {
      if (this._isHorizontal) {
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
    height += backgroundStyle.lineWidth / 2 ?? 1;
    width += backgroundStyle.lineWidth / 2 ?? 1;

    this._layoutAttrFromConfig = {
      position,
      width,
      height
    };
    return this._layoutAttrFromConfig;
  }

  protected render() {
    this._layoutAttrFromConfig = null;
    const {
      // start,
      // end,
      orient,
      backgroundStyle,
      backgroundChartStyle = {},
      selectedBackgroundStyle = {},
      selectedBackgroundChartStyle = {},
      middleHandlerStyle = {},
      startHandlerStyle = {},
      endHandlerStyle = {},
      brushSelect,
      zoomLock
    } = this.attribute as DataZoomAttributes;
    const { start, end } = this.state;

    const { position, width, height } = this.getLayoutAttrFromConfig();
    const startHandlerMinSize = startHandlerStyle.triggerMinSize ?? 40;
    const endHandlerMinSize = endHandlerStyle.triggerMinSize ?? 40;
    const group = (this as unknown as IGroup).createOrUpdateChild('dataZoom-container', {}, 'group') as IGroup;
    this._container = group;
    this._background = group.createOrUpdateChild(
      'background',
      {
        x: position.x,
        y: position.y,
        width,
        height,
        cursor: brushSelect ? 'crosshair' : 'auto',
        ...backgroundStyle,
        pickable: zoomLock ? false : backgroundStyle.pickable ?? true
      },
      'rect'
    ) as IRect;

    /** 背景图表 */
    backgroundChartStyle.line?.visible && this.setPreviewAttributes('line', group);
    backgroundChartStyle.area?.visible && this.setPreviewAttributes('area', group);

    /** drag mask */
    brushSelect && this.renderDragMask();

    /** 选中背景 */
    if (this._isHorizontal) {
      // 选中部分
      this._selectedBackground = group.createOrUpdateChild(
        'selectedBackground',
        {
          x: position.x + start * width,
          y: position.y,
          width: (end - start) * width,
          height: height,
          cursor: brushSelect ? 'crosshair' : 'move',
          ...selectedBackgroundStyle,
          pickable: zoomLock ? false : (selectedBackgroundChartStyle as any).pickable ?? true
        },
        'rect'
      ) as IRect;
    } else {
      // 选中部分
      this._selectedBackground = group.createOrUpdateChild(
        'selectedBackground',
        {
          x: position.x,
          y: position.y + start * height,
          width,
          height: (end - start) * height,
          cursor: brushSelect ? 'crosshair' : 'move',
          ...selectedBackgroundStyle,
          pickable: zoomLock ? false : selectedBackgroundStyle.pickable ?? true
        },
        'rect'
      ) as IRect;
    }

    /** 选中的背景图表 */
    selectedBackgroundChartStyle.line?.visible && this.setSelectedPreviewAttributes('line', group);
    selectedBackgroundChartStyle.area?.visible && this.setSelectedPreviewAttributes('area', group);

    /** 左右 和 中间手柄 */
    if (this._isHorizontal) {
      if (middleHandlerStyle.visible) {
        const middleHandlerBackgroundSize = middleHandlerStyle.background?.size || 10;
        this._middleHandlerRect = group.createOrUpdateChild(
          'middleHandlerRect',
          {
            x: position.x + start * width,
            y: position.y - middleHandlerBackgroundSize,
            width: (end - start) * width,
            height: middleHandlerBackgroundSize,
            ...middleHandlerStyle.background?.style,
            pickable: zoomLock ? false : middleHandlerStyle.background?.style?.pickable ?? true
          },
          'rect'
        ) as IRect;
        this._middleHandlerSymbol = group.createOrUpdateChild(
          'middleHandlerSymbol',
          {
            x: position.x + ((start + end) / 2) * width,
            y: position.y - middleHandlerBackgroundSize / 2,
            strokeBoundsBuffer: 0,
            angle: 0,
            symbolType: middleHandlerStyle.icon?.symbolType ?? 'square',
            ...middleHandlerStyle.icon,
            pickable: zoomLock ? false : middleHandlerStyle.icon.pickable ?? true
          },
          'symbol'
        ) as ISymbol;
      }
      this._startHandler = group.createOrUpdateChild(
        'startHandler',
        {
          x: position.x + start * width,
          y: position.y + height / 2,
          size: height,
          symbolType: startHandlerStyle.symbolType ?? 'square',
          ...(DEFAULT_HANDLER_ATTR_MAP.horizontal as any),
          ...startHandlerStyle,
          pickable: zoomLock ? false : startHandlerStyle.pickable ?? true
        },
        'symbol'
      ) as ISymbol;
      this._endHandler = group.createOrUpdateChild(
        'endHandler',
        {
          x: position.x + end * width,
          y: position.y + height / 2,
          size: height,
          symbolType: endHandlerStyle.symbolType ?? 'square',
          ...(DEFAULT_HANDLER_ATTR_MAP.horizontal as any),
          ...endHandlerStyle,
          pickable: zoomLock ? false : endHandlerStyle.pickable ?? true
        },
        'symbol'
      ) as ISymbol;

      // 透明mask构造热区, 热区大小配置来自handler bounds
      const startHandlerWidth = Math.max(this._startHandler.AABBBounds.width(), startHandlerMinSize);
      const startHandlerHeight = Math.max(this._startHandler.AABBBounds.height(), startHandlerMinSize);
      const endHandlerWidth = Math.max(this._endHandler.AABBBounds.width(), endHandlerMinSize);
      const endHandlerHeight = Math.max(this._endHandler.AABBBounds.height(), endHandlerMinSize);

      this._startHandlerMask = group.createOrUpdateChild(
        'startHandlerMask',
        {
          x: position.x + start * width - startHandlerWidth / 2,
          y: position.y + height / 2 - startHandlerHeight / 2,
          width: startHandlerWidth,
          height: startHandlerHeight,
          fill: 'white',
          fillOpacity: 0,
          zIndex: 999,
          ...(DEFAULT_HANDLER_ATTR_MAP.horizontal as any),
          pickable: !zoomLock
        },
        'rect'
      ) as IRect;
      this._endHandlerMask = group.createOrUpdateChild(
        'endHandlerMask',
        {
          x: position.x + end * width - endHandlerWidth / 2,
          y: position.y + height / 2 - endHandlerHeight / 2,
          width: endHandlerWidth,
          height: endHandlerHeight,
          fill: 'white',
          fillOpacity: 0,
          zIndex: 999,
          ...(DEFAULT_HANDLER_ATTR_MAP.horizontal as any),
          pickable: !zoomLock
        },
        'rect'
      ) as IRect;
    } else {
      if (middleHandlerStyle.visible) {
        const middleHandlerBackgroundSize = middleHandlerStyle.background?.size || 10;

        this._middleHandlerRect = group.createOrUpdateChild(
          'middleHandlerRect',
          {
            x: orient === 'left' ? position.x - middleHandlerBackgroundSize : position.x + width,
            y: position.y + start * height,
            width: middleHandlerBackgroundSize,
            height: (end - start) * height,
            ...middleHandlerStyle.background?.style,
            pickable: zoomLock ? false : middleHandlerStyle.background?.style?.pickable ?? true
          },
          'rect'
        ) as IRect;
        this._middleHandlerSymbol = group.createOrUpdateChild(
          'middleHandlerSymbol',
          {
            x:
              orient === 'left'
                ? position.x - middleHandlerBackgroundSize / 2
                : position.x + width + middleHandlerBackgroundSize / 2,
            y: position.y + ((start + end) / 2) * height,
            // size: height,
            angle: 90 * (Math.PI / 180),
            symbolType: middleHandlerStyle.icon?.symbolType ?? 'square',
            strokeBoundsBuffer: 0,
            ...middleHandlerStyle.icon,
            pickable: zoomLock ? false : middleHandlerStyle.icon?.pickable ?? true
          },
          'symbol'
        ) as ISymbol;
      }
      this._startHandler = group.createOrUpdateChild(
        'startHandler',
        {
          x: position.x + width / 2,
          y: position.y + start * height,
          size: width,
          symbolType: startHandlerStyle.symbolType ?? 'square',
          ...(DEFAULT_HANDLER_ATTR_MAP.vertical as any),
          ...startHandlerStyle,
          pickable: zoomLock ? false : startHandlerStyle.pickable ?? true
        },
        'symbol'
      ) as ISymbol;

      this._endHandler = group.createOrUpdateChild(
        'endHandler',
        {
          x: position.x + width / 2,
          y: position.y + end * height,
          size: width,
          symbolType: endHandlerStyle.symbolType ?? 'square',
          ...(DEFAULT_HANDLER_ATTR_MAP.vertical as any),
          ...endHandlerStyle,
          pickable: zoomLock ? false : endHandlerStyle.pickable ?? true
        },
        'symbol'
      ) as ISymbol;

      // 透明mask构造热区, 热区大小配置来自handler bounds
      const startHandlerWidth = Math.max(this._startHandler.AABBBounds.width(), startHandlerMinSize);
      const startHandlerHeight = Math.max(this._startHandler.AABBBounds.height(), startHandlerMinSize);
      const endHandlerWidth = Math.max(this._endHandler.AABBBounds.width(), endHandlerMinSize);
      const endHandlerHeight = Math.max(this._endHandler.AABBBounds.height(), endHandlerMinSize);

      this._startHandlerMask = group.createOrUpdateChild(
        'startHandlerMask',
        {
          x: position.x + width / 2 + startHandlerWidth / 2,
          y: position.y + start * height - startHandlerHeight / 2,
          width: endHandlerHeight,
          height: endHandlerWidth,
          fill: 'white',
          fillOpacity: 0,
          zIndex: 999,
          ...(DEFAULT_HANDLER_ATTR_MAP.vertical as any),
          pickable: !zoomLock
        },
        'rect'
      ) as IRect;
      this._endHandlerMask = group.createOrUpdateChild(
        'endHandlerMask',
        {
          x: position.x + width / 2 + endHandlerWidth / 2,
          y: position.y + end * height - endHandlerHeight / 2,
          width: endHandlerHeight,
          height: endHandlerWidth,
          fill: 'white',
          fillOpacity: 0,
          zIndex: 999,
          ...(DEFAULT_HANDLER_ATTR_MAP.vertical as any),
          pickable: !zoomLock
        },
        'rect'
      ) as IRect;
    }

    /** 左右文字 */
    if (this._showText) {
      this.renderText();
    }
  }

  computeBasePoints() {
    const { orient } = this.attribute as DataZoomAttributes;
    const { position, width, height } = this.getLayoutAttrFromConfig();
    let basePointStart: any;
    let basePointEnd: any;
    if (this._isHorizontal) {
      basePointStart = [
        {
          x: position.x,
          y: position.y + height
        }
      ];
      basePointEnd = [
        {
          x: position.x + width,
          y: position.y + height
        }
      ];
    } else if (orient === 'left') {
      basePointStart = [
        {
          x: position.x + width,
          y: position.y
        }
      ];
      basePointEnd = [
        {
          x: position.x + width,
          y: position.y + height
        }
      ];
    } else {
      basePointStart = [
        {
          x: position.x,
          y: position.y + height
        }
      ];
      basePointEnd = [
        {
          x: position.x,
          y: position.y
        }
      ];
    }
    return {
      basePointStart,
      basePointEnd
    };
  }

  protected simplifyPoints(points: IPointLike[]) {
    // 采样压缩率策略: 如果没做任何配置, 那么限制在niceCount内, 如果做了配置, 则按照配置计算
    const niceCount = 10000; // 经验值
    if (points.length > niceCount) {
      const tolerance = this.attribute.tolerance ?? this._previewData.length / niceCount;
      return flatten_simplify(points, tolerance, false);
    }
    return points;
  }

  protected getPreviewLinePoints() {
    let previewPoints = this._previewData.map(d => {
      return {
        x: this._previewPointsX && this._previewPointsX(d),
        y: this._previewPointsY && this._previewPointsY(d)
      };
    });
    // 仅在有数据的时候增加base point, 以弥补背景图表两端的不连续缺口。不然的话没有数据时，会因为base point而仍然绘制图形
    if (previewPoints.length === 0) {
      return previewPoints;
    }

    // 采样
    previewPoints = this.simplifyPoints(previewPoints);

    const { basePointStart, basePointEnd } = this.computeBasePoints();
    return basePointStart.concat(previewPoints).concat(basePointEnd);
  }

  protected getPreviewAreaPoints() {
    let previewPoints: IPointLike[] = this._previewData.map(d => {
      return {
        x: this._previewPointsX && this._previewPointsX(d),
        y: this._previewPointsY && this._previewPointsY(d),
        x1: this._previewPointsX1 && this._previewPointsX1(d),
        y1: this._previewPointsY1 && this._previewPointsY1(d)
      };
    });
    // 仅在有数据的时候增加base point, 以弥补背景图表两端的不连续缺口。不然的话没有数据时，会因为base point而仍然绘制图形
    if (previewPoints.length === 0) {
      return previewPoints;
    }

    // 采样
    previewPoints = this.simplifyPoints(previewPoints);

    const { basePointStart, basePointEnd } = this.computeBasePoints();
    return basePointStart.concat(previewPoints).concat(basePointEnd);
  }

  /** 使用callback绘制背景图表 (数据和数据映射从外部传进来) */
  protected setPreviewAttributes(type: 'line' | 'area', group: IGroup) {
    if (!this._previewGroup) {
      this._previewGroup = group.createOrUpdateChild('previewGroup', { pickable: false }, 'group') as IGroup;
    }
    if (type === 'line') {
      this._previewLine = this._previewGroup.createOrUpdateChild('previewLine', {}, 'line') as ILine;
    } else {
      this._previewArea = this._previewGroup.createOrUpdateChild(
        'previewArea',
        { curveType: 'basis' },
        'area'
      ) as IArea;
    }

    const { backgroundChartStyle = {} } = this.attribute as DataZoomAttributes;

    type === 'line' &&
      this._previewLine.setAttributes({
        points: this.getPreviewLinePoints(),
        curveType: 'basis',
        pickable: false,
        ...backgroundChartStyle.line
      });
    type === 'area' &&
      this._previewArea.setAttributes({
        points: this.getPreviewAreaPoints(),
        curveType: 'basis',
        pickable: false,
        ...backgroundChartStyle.area
      });
  }

  /** 使用callback绘制选中的背景图表 (数据和数据映射从外部传进来) */
  protected setSelectedPreviewAttributes(type: 'area' | 'line', group: IGroup) {
    if (!this._selectedPreviewGroupClip) {
      this._selectedPreviewGroupClip = group.createOrUpdateChild(
        'selectedPreviewGroupClip',
        { pickable: false },
        'group'
      ) as IGroup;
      this._selectedPreviewGroup = this._selectedPreviewGroupClip.createOrUpdateChild(
        'selectedPreviewGroup',
        {},
        'group'
      ) as IGroup;
    }

    if (type === 'line') {
      this._selectedPreviewLine = this._selectedPreviewGroup.createOrUpdateChild(
        'selectedPreviewLine',
        {},
        'line'
      ) as ILine;
    } else {
      this._selectedPreviewArea = this._selectedPreviewGroup.createOrUpdateChild(
        'selectedPreviewArea',
        { curveType: 'basis' },
        'area'
      ) as IArea;
    }

    const { selectedBackgroundChartStyle = {} } = this.attribute as DataZoomAttributes;

    const { start, end } = this.state;
    const { position, width, height } = this.getLayoutAttrFromConfig();
    this._selectedPreviewGroupClip.setAttributes({
      x: this._isHorizontal ? position.x + start * width : position.x,
      y: this._isHorizontal ? position.y : position.y + start * height,
      width: this._isHorizontal ? (end - start) * width : width,
      height: this._isHorizontal ? height : (end - start) * height,
      clip: true,
      pickable: false
    } as any);
    this._selectedPreviewGroup.setAttributes({
      x: -(this._isHorizontal ? position.x + start * width : position.x),
      y: -(this._isHorizontal ? position.y : position.y + start * height),
      width: this._isHorizontal ? (end - start) * width : width,
      height: this._isHorizontal ? height : (end - start) * height,
      pickable: false
    } as any);
    type === 'line' &&
      this._selectedPreviewLine.setAttributes({
        points: this.getPreviewLinePoints(),
        curveType: 'basis',
        pickable: false,
        ...selectedBackgroundChartStyle.line
      });
    type === 'area' &&
      this._selectedPreviewArea.setAttributes({
        points: this.getPreviewAreaPoints(),
        curveType: 'basis',
        pickable: false,
        ...selectedBackgroundChartStyle.area
      });
  }

  protected maybeAddLabel(container: IGroup, attributes: TagAttributes, name: string): Tag {
    let labelShape = (this as unknown as IGroup).find(node => node.name === name, true) as unknown as Tag;
    if (labelShape) {
      labelShape.setAttributes(attributes);
    } else {
      labelShape = new Tag(attributes);
      labelShape.name = name;
    }

    container.add(labelShape as unknown as INode);
    return labelShape;
  }

  /** 外部重置组件的起始状态 */
  setStartAndEnd(start?: number, end?: number) {
    const { start: startAttr, end: endAttr } = this.attribute as DataZoomAttributes;
    if (isValid(start) && isValid(end) && (start !== this.state.start || end !== this.state.end)) {
      this.state.start = start;
      this.state.end = end;
      if (startAttr !== this.state.start || endAttr !== this.state.end) {
        this.setStateAttr(start, end, true);
        this._dispatchEvent('change', {
          start,
          end,
          tag: this._activeTag
        });
      }
    }
  }

  /** 外部更新背景图表的数据 */
  setPreviewData(data: any[]) {
    this._previewData = data;
  }

  /** 外部更新手柄文字 */
  setText(text: string, tag: 'start' | 'end') {
    if (tag === 'start') {
      this._startText.setAttribute('text', text);
    } else {
      this._endText.setAttribute('text', text);
    }
  }

  /** 外部获取起始点数据值 */
  getStartValue() {
    return this._startValue;
  }

  getEndTextValue() {
    return this._endValue;
  }

  getMiddleHandlerSize() {
    const { middleHandlerStyle = {} } = this.attribute as DataZoomAttributes;
    const middleHandlerRectSize = middleHandlerStyle.background?.size ?? 10;
    const middleHandlerSymbolSize = middleHandlerStyle.icon?.size ?? 10;
    return Math.max(middleHandlerRectSize, ...array(middleHandlerSymbolSize));
  }

  /** 外部传入数据映射 */
  setPreviewPointsX(callback: (d: any) => number) {
    isFunction(callback) && (this._previewPointsX = callback);
  }
  setPreviewPointsY(callback: (d: any) => number) {
    isFunction(callback) && (this._previewPointsY = callback);
  }
  setPreviewPointsX1(callback: (d: any) => number) {
    isFunction(callback) && (this._previewPointsX1 = callback);
  }
  setPreviewPointsY1(callback: (d: any) => number) {
    isFunction(callback) && (this._previewPointsY1 = callback);
  }
  setStatePointToData(callback: (state: number) => any) {
    isFunction(callback) && (this._statePointToData = callback);
  }
}
