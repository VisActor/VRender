import { DataZoomActiveTag, type DataZoomAttributes } from './type';
import { getEndTriggersOfDrag } from '../util/event';
import type { IPointLike, Dict } from '@visactor/vutils';
import { vglobal } from '@visactor/vrender-core';
// eslint-disable-next-line no-duplicate-imports
import type { FederatedPointerEvent, IGroup, IRect, ISymbol, IStage, INode } from '@visactor/vrender-core';
// eslint-disable-next-line no-duplicate-imports
import { clamp, debounce, EventEmitter, throttle } from '@visactor/vutils';
const delayMap = {
  debounce: debounce,
  throttle: throttle
};
export interface InteractionManagerAttributes {
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
}
export class InteractionManager extends EventEmitter {
  /** 上层透传 */
  stage: IStage;
  attribute!: Partial<Required<DataZoomAttributes>>;
  private _getLayoutAttrFromConfig: any;
  // 图元
  private _startHandlerMask: IRect | undefined;
  private _middleHandlerSymbol: ISymbol | undefined;
  private _middleHandlerRect: IRect | undefined;
  private _endHandlerMask: IRect | undefined;
  private _background: IRect | undefined;
  private _previewGroup: IGroup | undefined;
  private _selectedPreviewGroup: IGroup | undefined;
  private _selectedBackground: IRect | undefined;

  /** 交互相关 */
  _activeTag!: DataZoomActiveTag;
  _activeItem!: any;
  _activeState = false;
  _activeCache: {
    startPos: IPointLike;
    lastPos: IPointLike;
  } = {
    startPos: { x: 0, y: 0 },
    lastPos: { x: 0, y: 0 }
  };
  _layoutCache: {
    attPos: 'x' | 'y';
    attSize: 'width' | 'height';
    size: number;
  } = {
    attPos: 'x',
    attSize: 'width',
    size: 0
  };
  _spanCache: number;

  private _getState: () => { start: number; end: number };
  private _setState: (state: { start: number; end: number }) => void;

  constructor(props: InteractionManagerAttributes) {
    super();
    this.attribute = props.attribute;
    this._initAttrs(props);
  }

  setAttributes(props: InteractionManagerAttributes): void {
    this._initAttrs(props);
  }

  private _initAttrs(props: InteractionManagerAttributes) {
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
  }

  clearDragEvents() {
    const evtTarget = vglobal.env === 'browser' ? vglobal : this.stage;
    const triggers = getEndTriggersOfDrag();

    evtTarget.removeEventListener('pointermove', this._onHandlerPointerMove, { capture: true });
    triggers.forEach((trigger: string) => {
      evtTarget.removeEventListener(trigger, this._onHandlerPointerUp);
    });

    (this as unknown as IGroup).off('pointermove', this._onHandlerPointerMove, {
      capture: true
    });
  }

  clearVGlobalEvents() {
    (vglobal.env === 'browser' ? vglobal : this.stage).addEventListener('touchmove', this._handleTouchMove, {
      passive: false
    });
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

    (vglobal.env === 'browser' ? vglobal : this.stage).addEventListener('touchmove', this._handleTouchMove, {
      passive: false
    });
  }
  private _handleTouchMove = (e: TouchEvent) => {
    if (this._activeState) {
      /**
       * https://developer.mozilla.org/zh-CN/docs/Web/CSS/overscroll-behavior
       * 由于浏览器的overscroll-behavior属性，需要在move的时候阻止浏览器默认行为，否则会因为浏览器检测到scroll行为，阻止pointer事件，
       * 抛出pointercancel事件，导致拖拽行为中断。
       */
      e.preventDefault();
    }
  };

  /**
   * 拖拽开始事件
   * @description 开启activeState + 通过tag判断事件在哪个元素上触发 并 更新交互坐标
   */
  private _onHandlerPointerDown = (e: FederatedPointerEvent, tag: string) => {
    // 清除之前的事件，防止没有被清除掉
    this.clearDragEvents();
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
    const evtTarget = vglobal.env === 'browser' ? vglobal : this.stage;
    const triggers = getEndTriggersOfDrag();

    /**
     * move的时候，需要通过 capture: true，能够在捕获截断被拦截，
     */
    evtTarget.addEventListener('pointermove', this._onHandlerPointerMove, { capture: true });
    (this as unknown as IGroup).on('pointermove', this._onHandlerPointerMove, {
      capture: true
    });

    triggers.forEach((trigger: string) => {
      evtTarget.addEventListener(trigger, this._onHandlerPointerUp);
    });
  };

  /**
   * 拖拽进行事件
   * @description 分为以下四种情况:
   * 1. 在背景 or 背景图表上拖拽 (activeTag === 'background'): 改变lastPos => only renderDragMask
   * 2. 在middleHandler上拖拽 (activeTag === 'middleHandler'): 改变lastPos、start & end + 边界处理: 防止拖拽结果超出背景 => render
   * 3. 在startHandler上拖拽 (activeTag === 'startHandler'): 改变lastPos、start & end + 边界处理: startHandler和endHandler交换 => render
   * 4. 在endHandler上拖拽，同上
   */
  private _pointerMove = (e: FederatedPointerEvent) => {
    const { brushSelect } = this.attribute as DataZoomAttributes;
    const pos = this._eventPosToStagePos(e);
    const { attPos, size } = this._layoutCache;
    const dis = (pos[attPos] - this._activeCache.lastPos[attPos]) / size;

    let { start, end } = this._getState();
    let shouldRender = true;
    if (this._activeState) {
      if (this._activeTag === DataZoomActiveTag.middleHandler) {
        ({ start, end } = this._moveZoomWithMiddle(dis));
      } else if (this._activeTag === DataZoomActiveTag.startHandler) {
        ({ start, end } = this._moveZoomWithHandler('start', dis));
      } else if (this._activeTag === DataZoomActiveTag.endHandler) {
        ({ start, end } = this._moveZoomWithHandler('end', dis));
      } else if (this._activeTag === DataZoomActiveTag.background && brushSelect) {
        const { position, width } = this._getLayoutAttrFromConfig();
        const currentPos = pos ?? this._activeCache.lastPos;
        start = clamp(
          (this._activeCache.startPos[this._layoutCache.attPos] - position[this._layoutCache.attPos]) / width,
          0,
          1
        );
        end = clamp((currentPos[this._layoutCache.attPos] - position[this._layoutCache.attPos]) / width, 0, 1);
        if (start > end) {
          [start, end] = [end, start];
        }
        shouldRender = false;
        this._dispatchEvent('renderMask');
      }
      this._activeCache.lastPos = pos;
    }

    // 避免attributes相同时, 重复渲染
    if (this._getState().start !== start || this._getState().end !== end) {
      this._setStateAttr(start, end);
      this._dispatchEvent('stateChange', {
        start: this._getState().start,
        end: this._getState().end,
        shouldRender,
        tag: this._activeTag
      });
      if (this.attribute.realTime) {
        this._dispatchEvent('eventChange', {
          start: this._getState().start,
          end: this._getState().end,
          shouldRender: true,
          tag: this._activeTag
        });
      }
    }
  };
  private _onHandlerPointerMove =
    (this.attribute?.delayTime ?? 0) === 0
      ? this._pointerMove
      : delayMap[this.attribute?.delayType ?? 'debounce'](this._pointerMove, this.attribute?.delayTime ?? 0);

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
  private _moveZoomWithHandler(handler: 'start' | 'end', dis: number) {
    const { start, end } = this._getState();
    let newStart = start;
    let newEnd = end;
    if (handler === 'start') {
      if (start + dis > end) {
        newStart = end;
        newEnd = start + dis;
        this._activeTag = DataZoomActiveTag.endHandler;
      } else {
        newStart = start + dis;
      }
    } else if (handler === 'end') {
      if (end + dis < start) {
        newEnd = start;
        newStart = end + dis;
        this._activeTag = DataZoomActiveTag.startHandler;
      } else {
        newEnd = end + dis;
      }
    }
    return {
      start: clamp(newStart, 0, 1),
      end: clamp(newEnd, 0, 1)
    };
  }
  /**
   * 拖拽结束事件
   * @description 关闭activeState + 边界情况处理: 防止拖拽后start和end过近
   */
  private _onHandlerPointerUp = (e: FederatedPointerEvent) => {
    if (this._activeState) {
      // brush的时候, 只改变了state, 没有触发重新渲染, 在抬起鼠标时触发
      if (this._activeTag === DataZoomActiveTag.background) {
        this._setStateAttr(this._getState().start, this._getState().end);
        this._dispatchEvent('stateChange', {
          start: this._getState().start,
          end: this._getState().end,
          shouldRender: true,
          tag: this._activeTag
        });
      }
    }
    this._activeState = false;
    // 此次dispatch不能被省略
    // 因为pointermove时, 已经将状态更新至最新, 所以在pointerup时, 必定start = state.start & end = state.end
    // 而realTime = false时, 需要依赖这次dispatch来更新图表图元
    this._dispatchEvent('eventChange', {
      start: this._getState().start,
      end: this._getState().end,
      shouldRender: true,
      tag: this._activeTag
    });

    this.clearDragEvents();
  };

  /**
   * 鼠标进入事件
   * @description 鼠标进入选中部分出现start和end文字
   */
  private _onHandlerPointerEnter(e: FederatedPointerEvent) {
    this._dispatchEvent('enter', {
      start: this._getState().start,
      end: this._getState().end,
      shouldRender: true
    });
  }

  /**
   * 鼠标移出事件
   * @description 鼠标移出选中部分不出现start和end文字
   */
  private _onHandlerPointerLeave(e: FederatedPointerEvent) {
    this._dispatchEvent('leave', {
      start: this._getState().start,
      end: this._getState().end,
      shouldRender: true
    });
  }

  /** 事件系统坐标转换为stage坐标 */
  private _eventPosToStagePos(e: FederatedPointerEvent) {
    // updateSpec过程中交互的话, stage可能为空
    return this.stage?.eventPointTransform(e as any) ?? { x: 0, y: 0 };
  }

  protected _dispatchEvent(eventName: string, details?: Dict<any>) {
    this.emit(eventName, details);
    // return !changeEvent.defaultPrevented;
  }
}
