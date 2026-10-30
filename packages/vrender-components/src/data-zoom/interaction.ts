import { DataZoomActiveTag, IDataZoomInteractiveEvent, type DataZoomAttributes } from './type';
import type { IPointLike, Dict, Matrix } from '@visactor/vutils';
import type { FederatedPointerEvent, InputEventSource, IGroup, IRect, ISymbol, IStage } from '@visactor/vrender-core';
import { clamp, debounce, EventEmitter, throttle } from '@visactor/vutils';
import { DEFAULT_DATA_ZOOM_ATTRIBUTES } from './config';
const delayMap = {
  debounce: debounce,
  throttle: throttle
};
export interface InteractionAttributes {
  stage: IStage;
  attribute: Partial<Required<DataZoomAttributes>>;
  startHandlerMask?: IRect;
  endHandlerMask?: IRect;
  middleHandlerSymbol?: ISymbol;
  middleHandlerRect?: IRect;
  selectedBackground?: IRect;
  background?: IRect;
  previewGroup?: IGroup;
  selectedPreviewGroup?: IGroup;
  getLayoutAttrFromConfig?: any;
  getState: () => { start: number; end: number };
  setState: (state: { start: number; end: number }) => void;
  getGlobalTransMatrix: () => Matrix;
}
export class DataZoomInteraction extends EventEmitter {
  /** 上层透传 */
  stage: IStage;
  attribute!: Partial<Required<DataZoomAttributes>>;
  private _getLayoutAttrFromConfig: any;
  private _getState: () => { start: number; end: number };
  private _setState: (state: { start: number; end: number }) => void;
  private _getGlobalTransMatrix: () => Matrix;

  /** 图元 */
  private _startHandlerMask: IRect | undefined;
  private _middleHandlerSymbol: ISymbol | undefined;
  private _middleHandlerRect: IRect | undefined;
  private _endHandlerMask: IRect | undefined;
  private _background: IRect | undefined;
  private _previewGroup: IGroup | undefined;
  private _selectedPreviewGroup: IGroup | undefined;
  private _selectedBackground: IRect | undefined;

  /** 交互 */
  private _activeTag!: DataZoomActiveTag;
  private _activeItem!: any;
  private _activeState = false;
  private _activeCache: {
    startPos: IPointLike;
    lastPos: IPointLike;
  } = {
    startPos: { x: 0, y: 0 },
    lastPos: { x: 0, y: 0 }
  };
  private _layoutCache: {
    attPos: 'x' | 'y';
    attSize: 'width' | 'height';
    size: number;
  } = {
    attPos: 'x',
    attSize: 'width',
    size: 0
  };
  private _spanCache: number;

  private _inputSource?: InputEventSource;
  private _activePointerId?: number;
  private _finishing = false;
  private _pending = false;
  private _pendingPoint = { x: 0, y: 0 };
  private _scheduleMove: (() => void) & { cancel?: () => void };
  private _delayTime = DEFAULT_DATA_ZOOM_ATTRIBUTES.delayTime;
  private _delayType = DEFAULT_DATA_ZOOM_ATTRIBUTES.delayType;

  constructor(props: InteractionAttributes) {
    super();
    this._scheduleMove = this._applyPendingPoint;
    this.setAttributes(props);
  }

  setAttributes(props: InteractionAttributes): void {
    const delayTime = props.attribute.delayTime ?? DEFAULT_DATA_ZOOM_ATTRIBUTES.delayTime;
    const delayType = props.attribute.delayType ?? DEFAULT_DATA_ZOOM_ATTRIBUTES.delayType;
    // 零延迟时 delayType 不影响调度，等价的属性更新应保留正在进行的拖拽。
    if (delayTime !== this._delayTime || (delayTime !== 0 && delayType !== this._delayType)) {
      this.clearDragEvents();
      this._scheduleMove =
        delayTime === 0 ? this._applyPendingPoint : delayMap[delayType](this._applyPendingPoint, delayTime);
    }
    this._delayTime = delayTime;
    this._delayType = delayType;
    this._initAttrs(props);
  }

  private _initAttrs(props: InteractionAttributes) {
    this.stage = props.stage;
    this.attribute = props.attribute;
    this._startHandlerMask = props.startHandlerMask;
    this._endHandlerMask = props.endHandlerMask;
    this._middleHandlerSymbol = props.middleHandlerSymbol;
    this._middleHandlerRect = props.middleHandlerRect;
    this._selectedBackground = props.selectedBackground;
    this._background = props.background;
    this._previewGroup = props.previewGroup;
    this._selectedPreviewGroup = props.selectedPreviewGroup;
    this._getLayoutAttrFromConfig = props.getLayoutAttrFromConfig;
    this._getState = props.getState;
    this._setState = props.setState;

    const { width, height } = this._getLayoutAttrFromConfig();
    this._spanCache = this._getState().end - this._getState().start;
    const isHorizontal = this.attribute.orient === 'top' || this.attribute.orient === 'bottom';
    this._layoutCache.size = isHorizontal ? width : height;
    this._layoutCache.attPos = isHorizontal ? 'x' : 'y';
    this._layoutCache.attSize = isHorizontal ? 'width' : 'height';
    this._getGlobalTransMatrix = props.getGlobalTransMatrix;
  }

  clearDragEvents() {
    this._scheduleMove?.cancel?.();
    this._pending = false;
    this._inputSource?.off('pointermove', this._onHandlerPointerMove);
    this._inputSource?.off('pointerup', this._onHandlerPointerUp);
    this._inputSource?.off('pointercancel', this._onHandlerPointerCancel);
    this._inputSource = undefined;
    this._activePointerId = undefined;
    this._activeState = false;
  }

  bindEvents(): void {
    const { brushSelect } = this.attribute as DataZoomAttributes;
    // 拖拽开始
    this._startHandlerMask?.addEventListener(
      'pointerdown',
      (e: FederatedPointerEvent) => this._onHandlerPointerDown(e, 'start') as unknown as EventListener
    );
    this._endHandlerMask?.addEventListener(
      'pointerdown',
      (e: FederatedPointerEvent) => this._onHandlerPointerDown(e, 'end') as unknown as EventListener
    );
    this._middleHandlerSymbol?.addEventListener(
      'pointerdown',
      (e: FederatedPointerEvent) => this._onHandlerPointerDown(e, 'middleSymbol') as unknown as EventListener
    );
    this._middleHandlerRect?.addEventListener(
      'pointerdown',
      (e: FederatedPointerEvent) => this._onHandlerPointerDown(e, 'middleRect') as unknown as EventListener
    );
    const selectedTag = brushSelect ? 'background' : 'middleRect';
    this._selectedBackground?.addEventListener(
      'pointerdown',
      (e: FederatedPointerEvent) => this._onHandlerPointerDown(e, selectedTag) as unknown as EventListener
    );
    brushSelect &&
      this._background?.addEventListener(
        'pointerdown',
        (e: FederatedPointerEvent) => this._onHandlerPointerDown(e, 'background') as unknown as EventListener
      );
    brushSelect &&
      this._previewGroup?.addEventListener(
        'pointerdown',
        (e: FederatedPointerEvent) => this._onHandlerPointerDown(e, 'background') as unknown as EventListener
      );
    this._selectedPreviewGroup?.addEventListener(
      'pointerdown',
      (e: FederatedPointerEvent) => this._onHandlerPointerDown(e, selectedTag) as unknown as EventListener
    );
  }

  /**
   * 拖拽开始事件
   * @description 开启activeState + 通过tag判断事件在哪个元素上触发 并 更新交互坐标
   */
  private _onHandlerPointerDown = (e: FederatedPointerEvent, tag: string) => {
    if (this._activeState || this._finishing) {
      return;
    }
    this.clearDragEvents();
    this._activePointerId = e.pointerId;
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
    this._activeCache.startPos = this._eventPosToStagePos(e);
    this._activeCache.lastPos = this._eventPosToStagePos(e);
    this._inputSource = this.stage.eventSystem.input.window;
    this._inputSource.on('pointermove', this._onHandlerPointerMove);
    this._inputSource.on('pointerup', this._onHandlerPointerUp);
    this._inputSource.on('pointercancel', this._onHandlerPointerCancel);
  };

  /**
   * 拖拽进行事件
   * @description 分为以下四种情况:
   * 1. 在背景 or 背景图表上拖拽 (activeTag === 'background'): 改变lastPos => only renderDragMask
   * 2. 在middleHandler上拖拽 (activeTag === 'middleHandler'): 改变lastPos、start & end + 边界处理: 防止拖拽结果超出背景 => render
   * 3. 在startHandler上拖拽 (activeTag === 'startHandler'): 改变lastPos、start & end + 边界处理: startHandler和endHandler交换 => render
   * 4. 在endHandler上拖拽，同上
   */
  private _onHandlerPointerMove = (e: FederatedPointerEvent) => {
    if (e.pointerId !== this._activePointerId || this._finishing) {
      return;
    }
    if (e.pointerType === 'touch') {
      e.preventDefault();
    }
    this._eventPosToStagePos(e, this._pendingPoint);
    this._pending = true;
    this._scheduleMove();
  };

  private _applyPendingPoint = () => {
    if (!this._pending || !this._activeState) {
      return;
    }
    this._pending = false;
    this._pointerMove(this._pendingPoint);
  };

  private _pointerMove = (pos: IPointLike) => {
    const { brushSelect } = this.attribute as DataZoomAttributes;
    const { position } = this._getLayoutAttrFromConfig();

    const { attPos, size, attSize } = this._layoutCache;
    const dis = (pos[attPos] - this._activeCache.lastPos[attPos]) / size;
    const statePos = (pos[attPos] - position[attPos]) / this._getLayoutAttrFromConfig()[attSize];

    let { start, end } = this._getState();
    let shouldRender = true;
    if (this._activeState) {
      if (this._activeTag === DataZoomActiveTag.middleHandler) {
        ({ start, end } = this._moveZoomWithMiddle(dis));
      } else if (this._activeTag === DataZoomActiveTag.startHandler) {
        ({ start, end } = this._moveZoomWithHandler(statePos, 'start'));
      } else if (this._activeTag === DataZoomActiveTag.endHandler) {
        ({ start, end } = this._moveZoomWithHandler(statePos, 'end'));
      } else if (this._activeTag === DataZoomActiveTag.background && brushSelect) {
        ({ start, end } = this._moveZoomWithBackground(statePos));
        shouldRender = false;
        this._dispatchEvent(IDataZoomInteractiveEvent.maskUpdate);
      }
      this._activeCache.lastPos.x = pos.x;
      this._activeCache.lastPos.y = pos.y;
    }

    // 避免attributes相同时, 重复渲染
    if (this._getState().start !== start || this._getState().end !== end) {
      this._setStateAttr(start, end);
      this._dispatchEvent(IDataZoomInteractiveEvent.stateUpdate, {
        start: this._getState().start,
        end: this._getState().end,
        shouldRender,
        tag: this._activeTag
      });
      if (this.attribute.realTime) {
        this._dispatchEvent(IDataZoomInteractiveEvent.dataZoomUpdate, {
          start: this._getState().start,
          end: this._getState().end,
          shouldRender: true,
          tag: this._activeTag
        });
      }
    }
  };

  /** state 边界处理 */
  private _setStateAttr(start: number, end: number) {
    const { zoomLock = false, minSpan = 0, maxSpan = 1 } = this.attribute as DataZoomAttributes;
    const span = end - start;
    if (span !== this._spanCache && (zoomLock || span < minSpan || span > maxSpan)) {
      return;
    }
    this._spanCache = span;
    this._setState({ start, end });
  }
  /**
   * @description 拖拽middleHandler, 改变start和end
   */
  private _moveZoomWithMiddle(dis: number) {
    const { start: staetState, end: endState } = this._getState();
    // 拖拽middleHandler时，限制在background范围内
    if (dis > 0 && endState + dis > 1) {
      dis = 1 - endState;
    } else if (dis < 0 && staetState + dis < 0) {
      dis = -staetState;
    }
    return {
      start: clamp(staetState + dis, 0, 1),
      end: clamp(endState + dis, 0, 1)
    };
  }

  /**
   * @description 拖拽startHandler/endHandler, 改变start和end
   */
  private _moveZoomWithHandler(statePos: number, handler: 'start' | 'end') {
    const { start, end } = this._getState();
    let newStart = start;
    let newEnd = end;
    if (handler === 'start') {
      if (statePos > end) {
        newStart = end;
        newEnd = statePos;
        this._activeTag = DataZoomActiveTag.endHandler;
      } else {
        newStart = statePos;
      }
    } else if (handler === 'end') {
      if (statePos < start) {
        newEnd = start;
        newStart = statePos;
        this._activeTag = DataZoomActiveTag.startHandler;
      } else {
        newEnd = statePos;
      }
    }
    return {
      start: clamp(newStart, 0, 1),
      end: clamp(newEnd, 0, 1)
    };
  }

  /**
   * @description 拖拽背景, 改变start和end
   */
  private _moveZoomWithBackground(statePos: number) {
    const { position } = this._getLayoutAttrFromConfig();
    const { attSize } = this._layoutCache;
    const startPos =
      (this._activeCache.startPos[this._layoutCache.attPos] - position[this._layoutCache.attPos]) /
      this._getLayoutAttrFromConfig()[attSize];
    const endPos = statePos;
    let start = clamp(startPos, 0, 1);
    let end = clamp(endPos, 0, 1);
    if (start > end) {
      [start, end] = [end, start];
    }
    return { start, end };
  }

  /**
   * 拖拽结束事件
   * @description 关闭activeState + 边界情况处理: 防止拖拽后start和end过近
   */
  private _onHandlerPointerUp = (e: FederatedPointerEvent) => this._finish(e, false);
  private _onHandlerPointerCancel = (e: FederatedPointerEvent) => this._finish(e, true);

  private _finish(e: FederatedPointerEvent, cancel: boolean): void {
    if (e.pointerId !== this._activePointerId || this._finishing) {
      return;
    }
    this._finishing = true;
    try {
      this._scheduleMove.cancel?.();
      if (!cancel) {
        this._applyPendingPoint();
      }
      const tag = this._activeTag;
      this.clearDragEvents();
      if (tag === DataZoomActiveTag.background) {
        this._dispatchEvent(IDataZoomInteractiveEvent.stateUpdate, {
          ...this._getState(),
          shouldRender: true,
          tag
        });
      }
      // Cancellation retains applied values; delayed samples are discarded. realTime=false still commits.
      this._dispatchEvent(IDataZoomInteractiveEvent.dataZoomUpdate, {
        ...this._getState(),
        shouldRender: true,
        tag
      });
    } finally {
      this.clearDragEvents();
      this._finishing = false;
    }
  }

  /** 事件系统坐标转换为stage坐标 */
  private _eventPosToStagePos(e: FederatedPointerEvent, result = { x: 0, y: 0 }) {
    // 1. 外部坐标 -> 内部坐标
    const stagePoints = this.stage?.eventPointTransform(e as any) ?? { x: 0, y: 0 }; // updateSpec过程中交互的话, stage可能为空
    // 2. 内部坐标 -> 组件坐标 (比如: 给layer设置 scale / x / y)
    this._getGlobalTransMatrix().transformPoint(stagePoints, result);
    return result;
  }

  protected _dispatchEvent(eventName: IDataZoomInteractiveEvent, details?: Dict<any>) {
    this.emit(eventName, details);
  }
}
