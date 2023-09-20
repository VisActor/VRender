import type { FederatedPointerEvent, IArea, IGroup, ILine, IRect, ISymbol, INode } from '@visactor/vrender';
import { vglobal, CustomEvent } from '@visactor/vrender';
import type { IPointLike } from '@visactor/vutils';
import { array, clamp, isFunction, isValid, merge } from '@visactor/vutils';
import { AbstractComponent } from '../core/base';
import type { TagAttributes } from '../tag';
import { Tag } from '../tag';
import { DataZoomActiveTag, DEFAULT_DATA_ZOOM_ATTRIBUTES } from './config';
import type { DataZoomAttributes } from './type';

export class DataZoom extends AbstractComponent<Required<DataZoomAttributes>> {
  name = 'dataZoom';
  static defaultAttributes = DEFAULT_DATA_ZOOM_ATTRIBUTES;

  private _isHorizontal: boolean;

  private _background!: IRect;

  private _container!: IGroup;

  /** 手柄 */
  private _startHandler!: ISymbol;
  private _middleHandlerSymbol!: ISymbol;
  private _middleHandlerRect!: IRect;
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
  protected _activeTag!: string;
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

  /** 回调函数 */
  private _previewCallbackX!: (datum: any) => number;
  private _previewCallbackY!: (datum: any) => number;
  private _previewCallbackX1!: (datum: any) => number;
  private _previewCallbackY1!: (datum: any) => number;
  private _updateStateCallback!: (start: number, end: number) => void;
  private _statePointToData: (state: number) => any = state => state;
  private _layoutAttrFromConfig: any; // 用于缓存

  constructor(attributes: DataZoomAttributes) {
    super(merge({}, DataZoom.defaultAttributes, attributes));
    const {
      start,
      end,
      size,
      orient,
      showDetail,
      position,
      previewData,
      previewCallbackX,
      previewCallbackY,
      previewCallbackX1,
      previewCallbackY1,
      updateStateCallback
    } = this.attribute as DataZoomAttributes;
    const { width, height } = size;
    start && (this.state.start = start);
    end && (this.state.end = end);
    this._isHorizontal = orient === 'top' || orient === 'bottom';
    this._layoutCache.max = this._isHorizontal ? width : height;
    this._layoutCache.attPos = this._isHorizontal ? 'x' : 'y';
    this._layoutCache.attSize = this._isHorizontal ? 'width' : 'height';
    this._activeCache.startPos = position;
    this._activeCache.lastPos = position;
    if (showDetail === 'auto') {
      this._showText = false as boolean;
    } else {
      this._showText = showDetail as boolean;
    }
    previewData && (this._previewData = previewData);
    isFunction(previewCallbackX) && (this._previewCallbackX = previewCallbackX);
    isFunction(previewCallbackY) && (this._previewCallbackY = previewCallbackY);
    isFunction(previewCallbackX1) && (this._previewCallbackX1 = previewCallbackX1);
    isFunction(previewCallbackY1) && (this._previewCallbackY1 = previewCallbackY1);
    isFunction(updateStateCallback) && (this._updateStateCallback = updateStateCallback);
  }

  protected bindEvents(): void {
    const { showDetail, brushSelect } = this.attribute as DataZoomAttributes;
    // 拖拽开始
    if (this._startHandler) {
      this._startHandler.addEventListener(
        'pointerdown',
        (e: FederatedPointerEvent) => this._onHandlerPointerDown(e, 'start') as unknown as EventListener
      );
    }
    if (this._endHandler) {
      this._endHandler.addEventListener(
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
    if (vglobal.env === 'browser') {
      // 拖拽时
      vglobal.addEventListener('pointermove', this._onHandlerPointerMove.bind(this) as EventListener);
      // 拖拽结束
      vglobal.addEventListener('pointerup', this._onHandlerPointerUp.bind(this) as EventListener);
    }
    // 拖拽时
    (this as unknown as IGroup).addEventListener('pointermove', this._onHandlerPointerMove as EventListener);
    // 拖拽结束
    (this as unknown as IGroup).addEventListener('pointerup', this._onHandlerPointerUp as EventListener);
    (this as unknown as IGroup).addEventListener('pointerupoutside', this._onHandlerPointerUp as EventListener);
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

  /** 事件系统坐标转换为stage坐标 */
  protected eventPosToStagePos(e: FederatedPointerEvent) {
    const stagePosition = (this as unknown as IGroup).stage?.window.getBoundingClientRect();
    return {
      x: e.clientX - (stagePosition?.left || 0) - ((this as unknown as IGroup).stage?.x || 0),
      y: e.clientY - (stagePosition?.top || 0) - ((this as unknown as IGroup).stage?.y || 0)
    };
  }

  /**
   * 拖拽开始事件
   * @description 开启activeState + 通过tag判断事件在哪个元素上触发 并 更新交互坐标
   */
  private _onHandlerPointerDown = (e: FederatedPointerEvent, tag: string) => {
    if (tag === 'start') {
      this._activeTag = DataZoomActiveTag.startHandler;
      this._activeItem = this._startHandler;
    } else if (tag === 'end') {
      this._activeTag = DataZoomActiveTag.endHandler;
      this._activeItem = this._endHandler;
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
  };

  /**
   * 拖拽进行事件
   * @description 分为以下四种情况:
   * 1. 在背景 or 背景图表上拖拽 (activeTag === 'background'): 改变lastPos => dragMask的宽 or 高被改变
   * 2. 在middleHandler上拖拽 (activeTag === 'middleHandler'): 改变lastPos、start & end + 边界处理: 防止拖拽结果超出背景 => 所有handler的位置被改变
   * 3. 在startHandler上拖拽 (activeTag === 'startHandler'): 改变lastPos、start & end + 边界处理: startHandler和endHandler交换 => 所有handler的位置被改变
   * 4. 在endHandler上拖拽，同上
   */
  private _onHandlerPointerMove = (e: FederatedPointerEvent) => {
    const { start, end, brushSelect } = this.attribute as DataZoomAttributes;
    const pos = this.eventPosToStagePos(e);
    const { attPos, max } = this._layoutCache;
    const dis = (pos[attPos] - this._activeCache.lastPos[attPos]) / max;
    if (this._activeState) {
      // if (this._activeTag === DataZoomActiveTag.background) {
      // } else
      if (this._activeTag === DataZoomActiveTag.middleHandler) {
        this.moveZoomWithMiddle((this.state.start + this.state.end) / 2 + dis);
      } else if (this._activeTag === DataZoomActiveTag.startHandler) {
        if (this.state.start + dis > this.state.end) {
          this.state.start = this.state.end;
          this.state.end = this.state.start + dis;
          this._activeTag = DataZoomActiveTag.endHandler;
        } else {
          this.state.start = this.state.start + dis;
        }
      } else if (this._activeTag === DataZoomActiveTag.endHandler) {
        if (this.state.end + dis < this.state.start) {
          this.state.end = this.state.start;
          this.state.start = this.state.end + dis;
          this._activeTag = DataZoomActiveTag.startHandler;
        } else {
          this.state.end = this.state.end + dis;
        }
      }
      this._activeCache.lastPos = pos;
      brushSelect && this.renderDragMask();
    }
    this.state.start = Math.min(Math.max(this.state.start, 0), 1);
    this.state.end = Math.min(Math.max(this.state.end, 0), 1);

    // 避免attributes相同时, 重复渲染
    if (start !== this.state.start || end !== this.state.end) {
      this.setAttributes({
        start: this.state.start,
        end: this.state.end
      });
      this._updateStateCallback && this._updateStateCallback(this.state.start, this.state.end);
      this._dispatchChangeEvent(this.state.start, this.state.end);
    }
  };

  /**
   * 拖拽结束事件
   * @description 关闭activeState + 边界情况处理: 防止拖拽后start和end过近
   */
  private _onHandlerPointerUp(e: FederatedPointerEvent) {
    const { start, end, brushSelect } = this.attribute as DataZoomAttributes;
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
      this.setAttributes({
        start: this.state.start,
        end: this.state.end
      });
      this._updateStateCallback && this._updateStateCallback(this.state.start, this.state.end);
      this._dispatchChangeEvent(this.state.start, this.state.end);
    }
  }

  /**
   * 鼠标进入事件
   * @description 鼠标进入选中部分出现start和end文字
   */
  private _onHandlerPointerEnter(e: FederatedPointerEvent) {
    this._showText = true;
    this.renderText();
  }

  /**
   * 鼠标移出事件
   * @description 鼠标移出选中部分不出现start和end文字
   */
  private _onHandlerPointerLeave(e: FederatedPointerEvent) {
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
      this.state.start = start;
      this.state.end = end;
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
    this.state.start = this.state.start + offset;
    this.state.end = this.state.end + offset;
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

  protected renderText() {
    const { startTextStyle, endTextStyle } = this.attribute as DataZoomAttributes;
    const { formatMethod: startTextFormat, ...restStartStyle } = startTextStyle;
    const { formatMethod: endTextFormat, ...restEndTextStyle } = endTextStyle;
    const { start, end } = this.state;
    this._startValue = this._statePointToData(start);
    this._endValue = this._statePointToData(end);
    const { position, width, height } = this.getLayoutAttrFromConfig();

    if (this._isHorizontal) {
      // 起始文字
      this._startText = this.maybeAddLabel(
        this._container,
        merge({}, restStartStyle, {
          text: startTextFormat ? startTextFormat(this._startValue) : this._startValue,
          x: position.x + start * width,
          y: position.y + height / 2,
          visible: this._showText,
          pickable: false,
          childrenPickable: false,
          textStyle: {
            textAlign: 'right',
            textBaseline: 'middle'
          }
        }),
        `data-zoom-start-text-${position}`
      );
      this._endText = this.maybeAddLabel(
        this._container,
        merge({}, restEndTextStyle, {
          text: endTextFormat ? endTextFormat(this._endValue) : this._endValue,
          x: position.x + end * width,
          y: position.y + height / 2,
          visible: this._showText,
          pickable: false,
          childrenPickable: false,
          textStyle: {
            textAlign: 'left',
            textBaseline: 'middle'
          }
        }),
        `data-zoom-end-text-${position}`
      );
    } else {
      // 起始文字
      this._startText = this.maybeAddLabel(
        this._container,
        merge({}, restStartStyle, {
          text: startTextFormat ? startTextFormat(this._startValue) : this._startValue,
          x: position.x + width / 2,
          y: position.y + start * height,
          visible: this._showText,
          pickable: false,
          childrenPickable: false,
          textStyle: {
            textAlign: 'center',
            textBaseline: 'bottom'
          }
        }),
        `data-zoom-start-text-${position}`
      );
      this._endText = this.maybeAddLabel(
        this._container,
        merge({}, restEndTextStyle, {
          text: endTextFormat ? endTextFormat(this._endValue) : this._endValue,
          x: position.x + width / 2,
          y: position.y + end * height,
          visible: this._showText,
          pickable: false,
          childrenPickable: false,
          textStyle: {
            textAlign: 'center',
            textBaseline: 'top'
          }
        }),
        `data-zoom-end-text-${position}`
      );
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
      middleHandlerStyle,
      startHandlerStyle,
      endHandlerStyle
    } = this.attribute as DataZoomAttributes;
    const { width: widthConfig, height: heightConfig } = size;
    const middleHandlerSize = middleHandlerStyle?.background?.size ?? 10;

    // 如果middleHandler显示的话，要将其宽高计入datazoom宽高
    let width;
    let height;
    let position;
    if (middleHandlerStyle?.visible) {
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

    const startHandlerSize = (startHandlerStyle?.size as number) ?? (this._isHorizontal ? height : width);
    const endHandlerSize = (endHandlerStyle?.size as number) ?? (this._isHorizontal ? height : width);
    // 如果startHandler显示的话，要将其宽高计入dataZoom宽高
    if (startHandlerStyle?.visible) {
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
          y: position.y + startHandlerSize
        };
      }
    }

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
      backgroundChartStyle,
      selectedBackgroundStyle,
      selectedBackgroundChartStyle,
      middleHandlerStyle,
      startHandlerStyle,
      endHandlerStyle,
      brushSelect
    } = this.attribute as DataZoomAttributes;
    const { start, end } = this.state;
    const { position, width, height } = this.getLayoutAttrFromConfig();
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
        ...backgroundStyle
      },
      'rect'
    ) as IRect;

    /** 背景图表 */
    backgroundChartStyle?.line?.visible && this.setPreviewAttributes('line', group);
    backgroundChartStyle?.area?.visible && this.setPreviewAttributes('area', group);

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
          ...selectedBackgroundStyle
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
          ...selectedBackgroundStyle
        },
        'rect'
      ) as IRect;
    }

    /** 选中的背景图表 */
    selectedBackgroundChartStyle?.line?.visible && this.setSelectedPreviewAttributes('line', group);
    selectedBackgroundChartStyle?.area?.visible && this.setSelectedPreviewAttributes('area', group);

    /** 中间手柄 */

    /** 左右文字 */
    this.renderText();

    /** 左右 和 中间手柄 */
    if (this._isHorizontal) {
      this._startHandler = group.createOrUpdateChild(
        'startHandler',
        {
          x: position.x + start * width,
          y: position.y + height / 2,
          size: height,
          angle: 0,
          symbolType: startHandlerStyle?.symbolType ?? 'square',
          cursor: 'ew-resize',
          strokeBoundsBuffer: 0,
          boundsPadding: 2,
          pickMode: 'imprecise',
          ...startHandlerStyle
        },
        'symbol'
      ) as ISymbol;
      this._endHandler = group.createOrUpdateChild(
        'endHandler',
        {
          x: position.x + end * width,
          y: position.y + height / 2,
          size: height,
          angle: 0,
          symbolType: endHandlerStyle?.symbolType ?? 'square',
          cursor: 'ew-resize',
          strokeBoundsBuffer: 0,
          boundsPadding: 2,
          pickMode: 'imprecise',
          ...endHandlerStyle
        },
        'symbol'
      ) as ISymbol;
      if (middleHandlerStyle?.visible) {
        this._middleHandlerRect = group.createOrUpdateChild(
          'middleHandlerRect',
          {
            x: position.x + start * width,
            y: position.y - (middleHandlerStyle?.background?.size || 10),
            width: (end - start) * width,
            height: middleHandlerStyle?.background?.size || 10,
            ...middleHandlerStyle?.background?.style
          },
          'rect'
        ) as IRect;
        this._middleHandlerSymbol = group.createOrUpdateChild(
          'middleHandlerSymbol',
          {
            x: position.x + ((start + end) / 2) * width,
            y: position.y - (middleHandlerStyle?.background?.size || 10) / 2,
            strokeBoundsBuffer: 0,
            angle: 0,
            symbolType: middleHandlerStyle?.icon?.symbolType ?? 'square',
            ...middleHandlerStyle?.icon
          },
          'symbol'
        ) as ISymbol;
      }
    } else {
      this._startHandler = group.createOrUpdateChild(
        'startHandler',
        {
          x: position.x + width / 2,
          y: position.y + start * height,
          size: width,
          angle: 90 * (Math.PI / 180),
          symbolType: startHandlerStyle?.symbolType ?? 'square',
          cursor: 'ns-resize',
          boundsPadding: 2,
          pickMode: 'imprecise',
          strokeBoundsBuffer: 0,
          ...startHandlerStyle
        },
        'symbol'
      ) as ISymbol;
      if (middleHandlerStyle?.visible) {
        this._middleHandlerRect = group.createOrUpdateChild(
          'middleHandlerRect',
          {
            x: orient === 'left' ? position.x - (middleHandlerStyle?.background?.size || 10) : position.x + width,
            y: position.y + start * height,
            width: middleHandlerStyle?.background?.size || 10,
            height: (end - start) * height,
            ...middleHandlerStyle?.background?.style
          },
          'rect'
        ) as IRect;
        this._middleHandlerSymbol = group.createOrUpdateChild(
          'middleHandlerSymbol',
          {
            x:
              orient === 'left'
                ? position.x - (middleHandlerStyle?.background?.size || 10) / 2
                : position.x + width + (middleHandlerStyle?.background?.size || 10) / 2,
            y: position.y + ((start + end) / 2) * height,
            // size: height,
            angle: 90 * (Math.PI / 180),
            symbolType: middleHandlerStyle?.icon?.symbolType ?? 'square',
            strokeBoundsBuffer: 0,
            ...middleHandlerStyle?.icon
          },
          'symbol'
        ) as ISymbol;
      }
      this._endHandler = group.createOrUpdateChild(
        'endHandler',
        {
          x: position.x + width / 2,
          y: position.y + end * height,
          size: width,
          angle: 90 * (Math.PI / 180),
          symbolType: endHandlerStyle?.symbolType ?? 'square',
          cursor: 'ns-resize',
          boundsPadding: 2,
          pickMode: 'imprecise',
          strokeBoundsBuffer: 0,
          ...endHandlerStyle
        },
        'symbol'
      ) as ISymbol;
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

  protected getPreviewLinePoints() {
    const previewPoints = this._previewData.map(d => {
      return {
        x: this._previewCallbackX && this._previewCallbackX(d),
        y: this._previewCallbackY && this._previewCallbackY(d)
      };
    });
    // 仅在有数据的时候增加base point, 以弥补背景图表两端的不连续缺口。不然的话没有数据时，会因为base point而仍然绘制图形
    if (previewPoints.length === 0) {
      return previewPoints;
    }
    const { basePointStart, basePointEnd } = this.computeBasePoints();
    return basePointStart.concat(previewPoints).concat(basePointEnd);
  }

  protected getPreviewAreaPoints() {
    const previewPoints = this._previewData.map(d => {
      return {
        x: this._previewCallbackX && this._previewCallbackX(d),
        y: this._previewCallbackY && this._previewCallbackY(d),
        x1: this._previewCallbackX1 && this._previewCallbackX1(d),
        y1: this._previewCallbackY1 && this._previewCallbackY1(d)
      };
    });
    // 仅在有数据的时候增加base point, 以弥补背景图表两端的不连续缺口。不然的话没有数据时，会因为base point而仍然绘制图形
    if (previewPoints.length === 0) {
      return previewPoints;
    }
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

    const { backgroundChartStyle } = this.attribute as DataZoomAttributes;

    type === 'line' &&
      this._previewLine.setAttributes({
        points: this.getPreviewLinePoints(),
        curveType: 'basis',
        pickable: false,
        ...backgroundChartStyle?.line
      });
    type === 'area' &&
      this._previewArea.setAttributes({
        points: this.getPreviewAreaPoints(),
        curveType: 'basis',
        pickable: false,
        ...backgroundChartStyle?.area
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

    const { selectedBackgroundChartStyle } = this.attribute as DataZoomAttributes;

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
        ...selectedBackgroundChartStyle?.line
      });
    type === 'area' &&
      this._selectedPreviewArea.setAttributes({
        points: this.getPreviewAreaPoints(),
        curveType: 'basis',
        pickable: false,
        ...selectedBackgroundChartStyle?.area
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

  private _dispatchChangeEvent(start: number, end: number) {
    const changeEvent = new CustomEvent('change', {
      start,
      end
    });
    // FIXME: 需要在 vrender 的事件系统支持
    // @ts-ignore
    changeEvent.manager = this.stage?.eventSystem.manager;
    this.dispatchEvent(changeEvent);
  }

  /** 外部重置组件的起始状态 */
  setStartAndEnd(start?: number, end?: number) {
    const { start: startAttr, end: endAttr } = this.attribute as DataZoomAttributes;
    if (isValid(start) && isValid(end) && (start !== this.state.start || end !== this.state.end)) {
      this.state.start = start;
      this.state.end = end;
      if (startAttr !== this.state.start || endAttr !== this.state.end) {
        this.setAttributes({ start, end });
        this._updateStateCallback && this._updateStateCallback(start, end);
        this._dispatchChangeEvent(start, end);
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
    const { middleHandlerStyle } = this.attribute as DataZoomAttributes;
    const middleHandlerRectSize = middleHandlerStyle?.background?.size ?? 10;
    const middleHandlerSymbolSize = middleHandlerStyle?.icon?.size ?? 10;
    return Math.max(middleHandlerRectSize, ...array(middleHandlerSymbolSize));
  }

  /** 外部传入start和end状态更新后的逻辑 */
  setUpdateStateCallback(callback: (start: number, end: number) => void) {
    isFunction(callback) && (this._updateStateCallback = callback);
  }

  /** 外部传入数据映射 */
  setPreviewCallbackX(callback: (d: any) => number) {
    isFunction(callback) && (this._previewCallbackX = callback);
  }
  setPreviewCallbackY(callback: (d: any) => number) {
    isFunction(callback) && (this._previewCallbackY = callback);
  }
  setPreviewCallbackX1(callback: (d: any) => number) {
    isFunction(callback) && (this._previewCallbackX1 = callback);
  }
  setPreviewCallbackY1(callback: (d: any) => number) {
    isFunction(callback) && (this._previewCallbackY1 = callback);
  }
  setStatePointToData(callback: (state: number) => any) {
    isFunction(callback) && (this._statePointToData = callback);
  }
}
