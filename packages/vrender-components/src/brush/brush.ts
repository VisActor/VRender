/**
 * @description 框选组件
 */
import type { FederatedPointerEvent, IGroup, IPolygon } from '@visactor/vrender-core';
import { graphicCreator, vglobal } from '@visactor/vrender-core';
import type { IBounds, IPointLike } from '@visactor/vutils';
import { cloneDeep, debounce, merge, polygonContainPoint, throttle } from '@visactor/vutils';
import { AbstractComponent } from '../core/base';
import type { BrushAttributes } from './type';
import { IOperateType } from './type';
import { DEFAULT_BRUSH_ATTRIBUTES, DEFAULT_SIZE_THRESHOLD } from './config';
import type { ComponentOptions } from '../interface';
import { loadBrushComponent } from './register';

const delayMap = {
  debounce: debounce,
  throttle: throttle
};

loadBrushComponent();
export class Brush extends AbstractComponent<Required<BrushAttributes>> {
  name = 'brush';
  static defaultAttributes = DEFAULT_BRUSH_ATTRIBUTES;

  private _container!: IGroup;

  // 绘制mask时的相关属性
  private _activeDrawState = false; // 用于标记绘制状态
  private _cacheDrawPoints: IPointLike[] = []; // 用于维护鼠标走过的路径，主要用于绘制mask的点
  private _isDrawedBeforeEnd = false;
  // 移动mask时的相关属性
  private _activeMoveState = false; // 用于标记移动状态
  private _operatingMaskMoveDx = 0; // 用于标记移动的位移量
  private _operatingMaskMoveDy = 0;
  private _operatingMaskMoveRangeX: [number, number] = [-Infinity, Infinity];
  private _operatingMaskMoveRangeY: [number, number] = [-Infinity, Infinity];
  private _cacheMovePoint!: IPointLike; // 用于维护鼠标所在位置，主要用于计算位移量

  private _operatingMask!: IPolygon; // 用于标记正在绘制的mask 或 正在移动的mask

  // 透出给上层的属性（主要是所有mask的AABBBounds，这里用的是dict存储方便添加和修改）
  private _brushMaskAABBBoundsDict: { [name: string]: IBounds } = {};

  constructor(attributes: BrushAttributes, options?: ComponentOptions) {
    super(options?.skipDefault ? attributes : merge({}, Brush.defaultAttributes, attributes));
  }

  private _bindBrushEvents(): void {
    if (this.attribute.disableTriggerEvent) {
      return;
    }
    const {
      trigger = DEFAULT_BRUSH_ATTRIBUTES.trigger,
      updateTrigger = DEFAULT_BRUSH_ATTRIBUTES.updateTrigger,
      endTrigger = DEFAULT_BRUSH_ATTRIBUTES.endTrigger,
      resetTrigger = DEFAULT_BRUSH_ATTRIBUTES.resetTrigger
    } = this.attribute as BrushAttributes;
    // 拖拽绘制开始
    this.stage.addEventListener(trigger, this._onBrushStart as EventListener);
    // 拖拽绘制时
    this.stage.addEventListener(updateTrigger, this._onBrushingWithDelay as EventListener);
    // 拖拽绘制结束
    this.stage.addEventListener(endTrigger, this._onBrushEnd as EventListener);
    this.stage.addEventListener(resetTrigger, this._onBrushEnd as EventListener);
  }

  private _isPosInBrushMask(e: FederatedPointerEvent) {
    const pos = this.eventPosToStagePos(e);
    const brushMasks = this._container.getChildren();
    for (let i = 0; i < brushMasks.length; i++) {
      const { points = [], dx = 0, dy = 0 } = (brushMasks[i] as IPolygon).attribute;
      const pointsConsiderOffset: IPointLike[] = points.map((point: IPointLike) => {
        return {
          x: point.x + dx,
          y: point.y + dy
        };
      });
      if (polygonContainPoint(pointsConsiderOffset, pos.x, pos.y)) {
        this._operatingMask = brushMasks[i] as IPolygon;
        return true;
      }
    }
    return false;
  }

  /**
   * 开始绘制 或 移动
   * @description
   * 1. 判断状态: 如果在brushMask中，则属于移动状态; 否则属于绘制状态
   *（移动状态和绘制状态互斥, 且移动状态考虑brushMoved配置, 如果在brush点内但brushMoved为false, 则走绘制状态, 而非两个状态都不响应, 此效果与echarts保持一致）
   * 2. 判断坐标是否在有效交互范围内
   * 2. 如果是移动状态: 标记移动状态 & 标记正在移动的mask & 初始化mask的dx和dy
   * 3. 如果是绘制状态: 标记绘制状态 & 标记正在绘制的mask & 清除之前的mask & 添加新的mask
   */
  private _onBrushStart = (e: FederatedPointerEvent) => {
    if (this._outOfInteractiveRange(e)) {
      return;
    }
    e.stopPropagation();

    const brushMoved = this.attribute.brushMoved ?? true;
    this._activeMoveState = brushMoved && this._isPosInBrushMask(e); // 如果是移动状态，在这里会标记operatingMask为正在移动的mask
    this._activeDrawState = !this._activeMoveState;

    this._activeDrawState && this._initDraw(e); // 如果是绘制状态，在这里会标记operatingMask为正在绘制的mask
    this._activeMoveState && this._initMove(e);
  };

  /**
   * 绘制 或 移动 中
   * @description
   * 1. 如果是绘制状态: 更新_cacheDrawPoints 和 mask的points属性
   * 2. 如果是移动状态: 标记移动状态 & 计算位移量 & 给被移动的mask偏移属性
   */
  private _onBrushing = (e: FederatedPointerEvent) => {
    if (this._outOfInteractiveRange(e)) {
      return;
    }

    if (this._activeDrawState || this._activeMoveState) {
      e.stopPropagation();
    }

    this._activeDrawState && this._drawing(e); // 如果是绘制状态，在这里会标记operatingMask为正在绘制的mask
    this._activeMoveState && this._moving(e);
  };

  private _onBrushingWithDelay =
    this.attribute.delayTime === 0
      ? this._onBrushing
      : delayMap[this.attribute.delayType](this._onBrushing, this.attribute.delayTime);

  /**
   * 结束绘制 和 移动
   * @description 取消绘制 和 移动 状态
   */
  private _onBrushEnd = (e: FederatedPointerEvent) => {
    if (!this._activeDrawState && !this._activeMoveState) {
      return;
    }

    e.preventDefault();
    const { removeOnClick = true } = this.attribute as BrushAttributes;
    if (this._activeDrawState && !this._isDrawedBeforeEnd && removeOnClick) {
      // _isDrawedBeforeEnd有两种情况:
      // 1. 没有绘制mask
      // 2. 绘制了mask但没有超过阈值
      // 只有第2种情况才会触发clear, 可以理解为双击才触发clear
      if (this._operatingMask?._AABBBounds.empty()) {
        this._dispatchEvent(IOperateType.brushClear, {
          operateMask: this._operatingMask as any,
          operatedMaskAABBBounds: this._brushMaskAABBBoundsDict,
          event: e
        });
      }
      this._container.incrementalClearChild();
      this._brushMaskAABBBoundsDict = {};
    } else {
      if (this._activeDrawState) {
        this._dispatchEvent(IOperateType.drawEnd, {
          operateMask: this._operatingMask as any,
          operatedMaskAABBBounds: this._brushMaskAABBBoundsDict,
          event: e
        });
      }

      if (this._activeMoveState) {
        this._dispatchEvent(IOperateType.moveEnd, {
          operateMask: this._operatingMask as any,
          operatedMaskAABBBounds: this._brushMaskAABBBoundsDict,
          event: e
        });
      }
    }

    this._activeDrawState = false;
    this._activeMoveState = false;
    this._isDrawedBeforeEnd = false;
    if (this._operatingMask) {
      this._operatingMask.setAttribute('pickable', false);
    }
  };

  /**
   * 初始化绘制状态
   * @description 清除之前的mask & 添加新的mask
   */
  private _initDraw(e: FederatedPointerEvent) {
    const { brushMode } = this.attribute as BrushAttributes;
    const pos = this.eventPosToStagePos(e);
    this._cacheDrawPoints = [pos];
    this._isDrawedBeforeEnd = false;
    if (brushMode === 'single') {
      this._brushMaskAABBBoundsDict = {};
      this._container.incrementalClearChild();
    }
    this._addBrushMask();
    this._dispatchEvent(IOperateType.drawStart, {
      operateMask: this._operatingMask as any,
      operatedMaskAABBBounds: this._brushMaskAABBBoundsDict,
      event: e
    });
  }

  /**
   * 初始化移动状态
   * @description 初始化mask的dx和dy
   */
  private _initMove(e: FederatedPointerEvent) {
    this._cacheMovePoint = this.eventPosToStagePos(e);

    this._operatingMaskMoveDx = this._operatingMask.attribute.dx ?? 0;
    this._operatingMaskMoveDy = this._operatingMask.attribute.dy ?? 0;

    // 计算最大移动范围, 为了将brushMask限制在交互范围内
    const { interactiveRange } = this.attribute as BrushAttributes;
    const { minY = -Infinity, maxY = Infinity, minX = -Infinity, maxX = Infinity } = interactiveRange;

    const { x1, x2, y1, y2 } = this._operatingMask.globalAABBBounds;
    const minMoveStepX = minX - x1;
    const maxMoveStepX = maxX - x2;
    const minMoveStepY = minY - y1;
    const maxMoveStepY = maxY - y2;

    this._operatingMaskMoveRangeX = [minMoveStepX, maxMoveStepX];
    this._operatingMaskMoveRangeY = [minMoveStepY, maxMoveStepY];

    this._operatingMask.setAttribute('pickable', true);
    this._dispatchEvent(IOperateType.moveStart, {
      operateMask: this._operatingMask as any,
      operatedMaskAABBBounds: this._brushMaskAABBBoundsDict,
      event: e
    });
  }

  /**
   * 绘制中
   * @description 更新_cacheDrawPoints 和 mask的points属性
   */
  private _drawing(e: FederatedPointerEvent) {
    const pos = this.eventPosToStagePos(e);
    const { sizeThreshold = DEFAULT_SIZE_THRESHOLD, brushType } = this.attribute as BrushAttributes;

    const cacheLength = this._cacheDrawPoints.length;

    // 如果当前点的位置和上一次点的位置一致，则无需更新
    if (cacheLength > 0) {
      const lastPos = this._cacheDrawPoints[this._cacheDrawPoints.length - 1] ?? ({} as IPointLike);
      if (pos.x === lastPos.x && pos.y === lastPos.y) {
        return;
      }
    }
    // 更新交互位置
    if (brushType === 'polygon' || cacheLength <= 1) {
      this._cacheDrawPoints.push(pos);
    } else {
      this._cacheDrawPoints[cacheLength - 1] = pos;
    }
    // 更新mask形状
    const maskPoints = this._computeMaskPoints();
    this._operatingMask.setAttribute('points', maskPoints);

    // 更新形状之后再判断是否需要正在绘制
    // if not, 则_isDrawedBeforeEnd false
    // then: 1. 不暴露drawing状态    2. 在brushEnd时该形状会被清空
    const { x1 = 0, x2 = 0, y1 = 0, y2 = 0 } = this._operatingMask?._AABBBounds;
    this._isDrawedBeforeEnd =
      !this._operatingMask._AABBBounds.empty() &&
      !!(Math.abs(x2 - x1) > sizeThreshold || Math.abs(y1 - y2) > sizeThreshold);
    if (this._isDrawedBeforeEnd) {
      this._brushMaskAABBBoundsDict[this._operatingMask.name] = this._operatingMask.AABBBounds;
      this._dispatchEvent(IOperateType.drawing, {
        operateMask: this._operatingMask as any,
        operatedMaskAABBBounds: this._brushMaskAABBBoundsDict,
        event: e
      });
    }
  }

  /**
   * 移动中
   * @description 标记移动状态 & 计算位移量 & 给被移动的mask偏移属性
   */
  private _moving(e: FederatedPointerEvent) {
    const startPos = this._cacheMovePoint;
    const pos = this.eventPosToStagePos(e);
    // 如果当前点的位置和上一次点的位置一致，则无需更新
    if (pos.x === startPos?.x && pos.y === startPos?.y) {
      return;
    }

    const moveStepX = pos.x - startPos.x;
    const moveStepY = pos.y - startPos.y;
    const moveX =
      Math.min(this._operatingMaskMoveRangeX[1], Math.max(this._operatingMaskMoveRangeX[0], moveStepX)) +
      this._operatingMaskMoveDx;
    const moveY =
      Math.min(this._operatingMaskMoveRangeY[1], Math.max(this._operatingMaskMoveRangeY[0], moveStepY)) +
      this._operatingMaskMoveDy;

    this._operatingMask.setAttributes({
      dx: moveX,
      dy: moveY
    });
    this._brushMaskAABBBoundsDict[this._operatingMask.name] = this._operatingMask.AABBBounds;
    this._dispatchEvent(IOperateType.moving, {
      operateMask: this._operatingMask as any,
      operatedMaskAABBBounds: this._brushMaskAABBBoundsDict,
      event: e
    });
  }

  /**
   * 构造brushMask的points属性
   * @description 根据不同的brushType从_cacheDrawPoints中取points
   * 1. 'rect': 只取鼠标轨迹_cacheDrawPoints的第一个点和最后一个点
   * 2. 'x': 只取鼠标轨迹_cacheDrawPoints的第一个点和最后一个点的x坐标
   * 3. 'y': 只取鼠标轨迹_cacheDrawPoints的第一个点和最后一个点的y坐标
   * 4. 'polygon': 取鼠标轨迹_cacheDrawPoints的所有点
   */
  private _computeMaskPoints() {
    const { brushType, xRange = [0, 0], yRange = [0, 0] } = this.attribute as BrushAttributes;
    let maskPoints: IPointLike[] = [];
    const startPoint = this._cacheDrawPoints[0];
    const endPoint = this._cacheDrawPoints[this._cacheDrawPoints.length - 1];

    if (brushType === 'rect') {
      maskPoints = [
        startPoint,
        {
          x: endPoint.x,
          y: startPoint.y
        },
        endPoint,
        {
          x: startPoint.x,
          y: endPoint.y
        }
      ];
    } else if (brushType === 'x') {
      maskPoints = [
        {
          x: startPoint.x,
          y: yRange[0]
        },
        {
          x: endPoint.x,
          y: yRange[0]
        },
        {
          x: endPoint.x,
          y: yRange[1]
        },
        {
          x: startPoint.x,
          y: yRange[1]
        }
      ];
    } else if (brushType === 'y') {
      maskPoints = [
        {
          x: xRange[0],
          y: startPoint.y
        },
        {
          x: xRange[0],
          y: endPoint.y
        },
        {
          x: xRange[1],
          y: endPoint.y
        },
        {
          x: xRange[1],
          y: startPoint.y
        }
      ];
    } else {
      maskPoints = cloneDeep(this._cacheDrawPoints); // _cacheDrawPoints在不断更新，所以这里需要cloneDeep
    }
    return maskPoints;
  }

  private _addBrushMask() {
    const { brushStyle, hasMask } = this.attribute as BrushAttributes;
    const brushMask = graphicCreator.polygon({
      points: cloneDeep(this._cacheDrawPoints), // _cacheDrawPoints在不断更新，所以这里需要cloneDeep
      cursor: 'move',
      pickable: false,
      ...brushStyle,
      opacity: hasMask ? brushStyle.opacity ?? 1 : 0
    });
    brushMask.name = `brush-${Date.now()}`; // 用Date给mask唯一标记
    this._operatingMask = brushMask;
    this._container.add(brushMask);
    this._brushMaskAABBBoundsDict[brushMask.name] = brushMask.AABBBounds;
  }

  private _outOfInteractiveRange(e: FederatedPointerEvent) {
    // 在返回坐标时，将其限制在交互范围内
    const { interactiveRange } = this.attribute as BrushAttributes;
    const { minY = -Infinity, maxY = Infinity, minX = -Infinity, maxX = Infinity } = interactiveRange;
    const pos = this.eventPosToStagePos(e);
    if (pos.x > maxX || pos.x < minX || pos.y > maxY || pos.y < minY) {
      return true;
    }
    return false;
  }

  /** 事件系统坐标转换为stage坐标 */
  protected eventPosToStagePos(e: FederatedPointerEvent) {
    return this.stage.eventPointTransform(e);
  }

  protected render() {
    this._bindBrushEvents();
    const group = this.createOrUpdateChild('brush-container', {}, 'group') as unknown as IGroup;
    this._container = group;
  }

  releaseBrushEvents(): void {
    const {
      delayType = 'throttle',
      delayTime = 0,
      trigger = DEFAULT_BRUSH_ATTRIBUTES.trigger,
      updateTrigger = DEFAULT_BRUSH_ATTRIBUTES.updateTrigger,
      endTrigger = DEFAULT_BRUSH_ATTRIBUTES.endTrigger,
      resetTrigger = DEFAULT_BRUSH_ATTRIBUTES.resetTrigger
    } = this.attribute as BrushAttributes;
    this.stage.removeEventListener(trigger, this._onBrushStart as EventListener);
    this.stage.removeEventListener(updateTrigger, this._onBrushingWithDelay as EventListener);
    this.stage.removeEventListener(endTrigger, this._onBrushEnd as EventListener);
    this.stage.removeEventListener(resetTrigger, this._onBrushEnd as EventListener);
  }
}
