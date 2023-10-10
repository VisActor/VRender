import { AABBBounds } from '@visactor/vutils';
/**
 * @description 均值线的拖拽交互
 */
import { IBoundsLike, merge } from '@visactor/vutils';
import type { GraphicEventType, IGroup, FederatedPointerEvent, IRect, IPolygon } from '@visactor/vrender-core';
import { CustomEvent, vglobal, createGroup, createRect, createPolygon } from '@visactor/vrender-core';
import { MarkLine } from '../../../src/marker/line';
import { MarkArea, Segment, Tag } from '../../../src';

type MarkLineInteractionConfig = {
  /**
   * 交互的限制范围
   */
  limitBounds?: IBoundsLike;
  /**
   * 交互的方向
   */
  orient: 'vertical' | 'horizontal';
  /**
   * 交互的对象
   */
  element: IGroup;
};

/**
 * @description 均值线交互
 * 1. hover 出现浮层
 * 2. 双击出现编辑框，线的双击，文字的双击
 * 3. 拖拽，出现蒙层，更改蒙层，拖拽结束更新组件
 */
export class MarkLineInteraction {
  private _element: IGroup;
  private _orient: string;
  private _limitBounds?: IBoundsLike;

  private _overlayGraphic: IGroup; // 交互浮层
  private _overlayLine: IGroup;
  private _overlayLabel: IGroup;
  private _dragging: boolean = false;
  private _selecting: boolean = false;
  private _prePos!: number;
  private _preOffset: number = 0;

  constructor(cfg: MarkLineInteractionConfig) {
    const { limitBounds, orient, element } = cfg || {};

    if (element) {
      this._element = element;
      this._limitBounds = limitBounds;
      this._orient = orient;

      this._initEvents();
    }
  }

  private _initEvents() {
    let timer;

    this._element.addEventListener('dblclick', e => {
      clearTimeout(timer);
      this._onDblclick(e);
    });
    this._element.addEventListener('pointerdown', e => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        this._onDragStart(e);
      }, 100);
    });

    this._element.addEventListener('pointermove', this._onHover as EventListenerOrEventListenerObject);
    this._element.addEventListener('pointerout', this._onUnHover as EventListenerOrEventListenerObject);
  }

  private _onDblclick = (e: FederatedPointerEvent) => {
    this._selecting = true;
    this._dragging = false;
    // 进入选中状态，弹出编辑框
    // TODO: 当编辑结束之后，需要将编辑状态取消
    if (e.target === this._overlayLine) {
      console.log('Bingo, line clicked, please popup the line editor panel!');
    } else if (e.target === this._overlayLabel) {
      // TODO：需要添加拖拽层
      console.log('Bingo, label clicked, please popup the label editor panel!');
    }
  };

  private _onHover = (e: FederatedPointerEvent) => {
    this._getOverlayGraphic();
    this._overlayLine.showAll();
  };

  private _onUnHover = (e: FederatedPointerEvent) => {
    if (this._dragging || this._selecting) {
      return;
    }
    const overlayGraphic = this._getOverlayGraphic();
    overlayGraphic.hideAll();
  };

  private _onDragStart = (e: FederatedPointerEvent) => {
    e.stopPropagation();
    this._selecting = false;
    this._prePos = this._orient === 'horizontal' ? e.clientX : e.clientY;
    const overlayGraphic = this._getOverlayGraphic();
    overlayGraphic.setAttribute('cursor', this._orient === 'horizontal' ? 'ew-resize' : 'ns-resize');
    this._preOffset = overlayGraphic.attribute[this._orient === 'horizontal' ? 'dx' : 'dy'] ?? 0;
    if (vglobal.env === 'browser') {
      vglobal.addEventListener('pointermove', this._onDrag);
      vglobal.addEventListener('pointerup', this._onDragEnd);
    } else {
      overlayGraphic.addEventListener('pointermove', this._onDrag);
      overlayGraphic.addEventListener('pointerup', this._onDragEnd);
      overlayGraphic.addEventListener('pointerupoutside', this._onDragEnd);
    }
  };

  private _onDrag = (e: any) => {
    if (this._selecting) {
      return;
    }
    e.stopPropagation();
    this._dragging = true;
    const overlayGraphic = this._getOverlayGraphic();
    overlayGraphic.showAll();

    let currentPos;
    let delta = 0;
    let updateField;
    if (this._orient === 'vertical') {
      currentPos = e.clientY;
      delta = currentPos - this._prePos;
      updateField = 'dy';
    } else {
      currentPos = e.clientX;
      delta = currentPos - this._prePos;
      updateField = 'dx';
    }
    overlayGraphic.setAttribute(updateField, this._preOffset + delta);
  };

  private _onDragEnd = (e: any) => {
    e.preventDefault();
    if (!this._dragging) {
      return;
    }
    this._dragging = false;
    const overlayGraphic = this._getOverlayGraphic();
    overlayGraphic.hideAll();

    const offset = overlayGraphic.attribute[this._orient === 'horizontal' ? 'dx' : 'dy'] - this._preOffset;
    const points = this._element.attribute.points;
    const newPoints = points.map(point => {
      const field = this._orient === 'horizontal' ? 'x' : 'y';
      point[field] = point[field] + offset;
      return point;
    });

    // TODO: 计算新的 label 值，同时释放事件
    this._element.setAttributes({
      newPoints
    });
    if (vglobal.env === 'browser') {
      vglobal.removeEventListener('pointermove', this._onDrag);
      vglobal.removeEventListener('pointerup', this._onDragEnd);
    } else {
      overlayGraphic.removeEventListener('pointermove', this._onDrag);
      overlayGraphic.removeEventListener('pointerup', this._onDragEnd);
      overlayGraphic.removeEventListener('pointerupoutside', this._onDragEnd);
    }
  };

  private _getOverlayGraphic() {
    if (this._overlayGraphic) {
      return this._overlayGraphic;
    }

    const overlayGraphic = createGroup({});

    const lineShape = (this._element as MarkLine).getLine();
    const overlayLine = new Segment(
      merge({}, lineShape.attribute, {
        lineStyle: {
          stroke: '#3073F2'
        },
        startSymbol: {
          style: {
            fill: '#3073F2'
          }
        },
        endSymbol: {
          style: {
            fill: '#3073F2'
          }
        }
      })
    );
    overlayLine.name = 'overlay-mark-line-line';
    this._overlayLine = overlayLine;
    overlayGraphic.add(overlayLine);

    const labelShape = (this._element as MarkLine).getLabel() as IGroup;
    const overlayLabel = createRect({
      x: labelShape.AABBBounds.x1 + (this._orient === 'vertical' ? 2 : 0),
      y: labelShape.AABBBounds.y1 + (this._orient === 'vertical' ? 0 : -2),
      width: labelShape.AABBBounds.width(),
      height: labelShape.AABBBounds.height(),
      fill: '#3073F2',
      fillOpacity: 0.3,
      visible: false
    });
    overlayLabel.name = 'overlay-mark-line-label';
    this._overlayLabel = overlayLabel;
    overlayGraphic.add(overlayLabel);

    this._overlayGraphic = overlayGraphic;
    // TODO: 临时添加
    this._element.add(overlayGraphic);
    return this._overlayGraphic;
  }
}

type MarkAreaInteractionConfig = {
  /**
   * 交互的限制范围
   */
  limitBounds?: IBoundsLike;
  /**
   * 交互的方向
   */
  orient: 'vertical' | 'horizontal';
  /**
   * 交互的对象
   */
  element: IGroup;
};
/**
 * @description 区域标注交互
 * 1. hover 时出现编辑图形
 * 2. 双击出现编辑框，区域的双击，文字的双击
 * 3. 各个操作锚点的 resize
 * 4. 区域浮层也允许拖拽
 */
export class MarkAreaInteraction {
  private _element: IGroup;
  private _orient: string;
  private _limitBounds?: IBoundsLike;

  private _overlayGraphic: IGroup; // 交互浮层
  private _overlayAreaGroup: IGroup;
  private _overlayArea: IPolygon;
  private _overlayLabel: IGroup;
  private _topHandler: IRect;
  private _bottomHandler: IRect;
  private _rightHandler: IRect;
  private _leftHandler: IRect;
  private _currentHandler: IRect;

  private _selecting: boolean = false;
  private _resizing: boolean = false;

  private _prePos: number = 0;

  constructor(cfg: MarkAreaInteractionConfig) {
    const { limitBounds, orient, element } = cfg || {};

    if (element) {
      this._element = element;
      this._limitBounds = limitBounds;
      this._orient = orient;

      this._initEvents();
    }
  }

  private _initEvents() {
    this._element.addEventListener('dblclick', this._onDblclick);
    this._element.addEventListener('pointermove', this._onHover as EventListenerOrEventListenerObject);
    this._element.addEventListener('pointerout', this._onUnHover as EventListenerOrEventListenerObject);
  }

  private _onDblclick = (e: any) => {
    this._selecting = true;
    // 进入选中状态，弹出编辑框
    // TODO: 当编辑结束之后，需要将编辑状态取消
    if (e.target === this._overlayArea) {
      console.log('Bingo, area clicked, please popup the area editor panel!');
    } else if (e.target === this._overlayLabel) {
      // TODO：需要添加拖拽层
      console.log('Bingo, label clicked, please popup the label editor panel!');
    }
  };

  private _onHover = (e: FederatedPointerEvent) => {
    this._getOverlayGraphic();
    this._overlayAreaGroup.showAll();
  };

  private _onUnHover = (e: FederatedPointerEvent) => {
    if (this._selecting) {
      return;
    }
    const overlayGraphic = this._getOverlayGraphic();
    overlayGraphic.hideAll();
  };

  private _onHandlerDragStart = (e: FederatedPointerEvent) => {
    e.stopPropagation();
    const handler = e.target;
    this._currentHandler = handler;
    this._selecting = false;

    this._prePos = this._orient === 'vertical' ? e.clientX : e.clientY;
    if (vglobal.env === 'browser') {
      vglobal.addEventListener('pointermove', this._onHandlerDrag);
      vglobal.addEventListener('pointerup', this._onHandlerDragEnd);
    } else {
      handler.addEventListener('pointermove', this._onHandlerDrag);
      handler.addEventListener('pointerup', this._onHandlerDragEnd);
      handler.addEventListener('pointerupoutside', this._onHandlerDragEnd);
    }
  };

  private _onHandlerDrag = (e: any) => {
    if (this._selecting) {
      return;
    }
    e.stopPropagation();

    this._resizing = true;
    const overlayGraphic = this._getOverlayGraphic();
    overlayGraphic.showAll();

    let currentPos;
    let delta = 0;
    let updateField;
    if (this._orient === 'horizontal') {
      currentPos = e.clientY;
      delta = currentPos - this._prePos;
      updateField = 'y';
    } else {
      currentPos = e.clientX;
      delta = currentPos - this._prePos;
      updateField = 'x';
    }
    this._prePos = currentPos;

    // 更新 area
    const overlayArea = this._overlayArea;
    const points = overlayArea.attribute.points;
    if (this._currentHandler.name === 'overlay-right-handler') {
      points[3].x += delta;
      points[2].x += delta;

      overlayArea.setAttribute('points', points);
    } else if (this._currentHandler.name === 'overlay-left-handler') {
      points[0].x += delta;
      points[1].x += delta;

      overlayArea.setAttribute('points', points);
    } else if (this._currentHandler.name === 'overlay-top-handler') {
      points[1].y += delta;
      points[2].y += delta;

      overlayArea.setAttribute('points', points);
    } else if (this._currentHandler.name === 'overlay-bottom-handler') {
      points[0].y += delta;
      points[3].y += delta;

      overlayArea.setAttribute('points', points);
    }

    // 更新 label
    const overlayLabel = this._overlayLabel;
    overlayLabel.setAttribute(
      updateField,
      this._orient === 'vertical'
        ? (overlayArea.AABBBounds.x1 + overlayArea.AABBBounds.x2) / 2 - overlayLabel.attribute.width / 2
        : (overlayArea.AABBBounds.y1 + overlayArea.AABBBounds.y2) / 2 - overlayLabel.attribute.height / 2
    );

    // 更新当前 handler
    this._currentHandler.setAttribute(updateField, this._currentHandler.attribute[updateField] + delta);
  };

  private _onHandlerDragEnd = (e: any) => {
    e.preventDefault();
    if (!this._resizing) {
      return;
    }
    console.log('_onHandlerDragEnd');
    const overlayArea = this._overlayArea;
    const points = overlayArea.attribute.points;

    this._resizing = false;
    const overlayGraphic = this._getOverlayGraphic();
    overlayGraphic.hideAll();

    // 更新真正的图形
    const areaShape = (this._element as MarkArea).getArea();
    areaShape.setAttribute(
      'points',
      points.map(point => {
        return { ...point };
      })
    );
    const labelShape = (this._element as MarkArea).getLabel();
    if (this._orient === 'vertical') {
      labelShape.setAttribute('x', this._overlayLabel.attribute.x + this._overlayLabel.attribute.width / 2);
    } else {
      labelShape.setAttribute('y', this._overlayLabel.attribute.y + this._overlayLabel.attribute.height / 2);
    }

    if (vglobal.env === 'browser') {
      vglobal.removeEventListener('pointermove', this._onHandlerDrag);
      vglobal.removeEventListener('pointerup', this._onHandlerDragEnd);
    } else {
      this._currentHandler.removeEventListener('pointermove', this._onHandlerDrag);
      this._currentHandler.removeEventListener('pointerup', this._onHandlerDragEnd);
      this._currentHandler.removeEventListener('pointerupoutside', this._onHandlerDragEnd);
    }
  };

  private _onAreaDragStart = (e: FederatedPointerEvent) => {
    e.stopPropagation();
    this._selecting = false;

    this._prePos = this._orient === 'vertical' ? e.clientX : e.clientY;
    if (vglobal.env === 'browser') {
      vglobal.addEventListener('pointermove', this._onAreaDrag);
      vglobal.addEventListener('pointerup', this._onAreaDragEnd);
    } else {
      this._overlayArea.addEventListener('pointermove', this._onAreaDrag);
      this._overlayArea.addEventListener('pointerup', this._onAreaDragEnd);
      this._overlayArea.addEventListener('pointerupoutside', this._onAreaDragEnd);
    }
  };

  private _onAreaDrag = (e: any) => {
    if (this._selecting) {
      return;
    }
    e.stopPropagation();

    this._resizing = true;
    const overlayGraphic = this._getOverlayGraphic();
    overlayGraphic.showAll();

    let currentPos;
    let delta = 0;
    let updateField;
    if (this._orient === 'horizontal') {
      currentPos = e.clientY;
      delta = currentPos - this._prePos;
      updateField = 'y';
    } else {
      currentPos = e.clientX;
      delta = currentPos - this._prePos;
      updateField = 'x';
    }
    this._prePos = currentPos;

    // 更新 area
    const overlayArea = this._overlayArea;
    const points = overlayArea.attribute.points;
    overlayArea.setAttributes(
      'points',
      points.map(point => {
        point[updateField] += delta;
        return point;
      })
    );

    // 更新当前 label, handler
    const overlayLabel = this._overlayLabel;
    if (this._orient === 'vertical') {
      overlayLabel.setAttribute(
        updateField,
        (overlayArea.AABBBounds.x1 + overlayArea.AABBBounds.x2) / 2 - overlayLabel.attribute.width / 2
      );
      this._rightHandler.setAttribute(updateField, this._rightHandler.attribute[updateField] + delta);
      this._leftHandler.setAttribute(updateField, this._leftHandler.attribute[updateField] + delta);
    } else {
      overlayLabel.setAttribute(
        updateField,
        (overlayArea.AABBBounds.y1 + overlayArea.AABBBounds.y2) / 2 - overlayLabel.attribute.height / 2
      );
      this._topHandler.setAttribute(updateField, this._topHandler.attribute[updateField] + delta);
      this._bottomHandler.setAttribute(updateField, this._bottomHandler.attribute[updateField] + delta);
    }
  };

  private _onAreaDragEnd = (e: any) => {
    e.preventDefault();
    if (!this._resizing) {
      return;
    }
    const overlayArea = this._overlayArea;
    const points = overlayArea.attribute.points;

    this._resizing = false;
    const overlayGraphic = this._getOverlayGraphic();
    overlayGraphic.hideAll();

    // 更新真正的图形
    const areaShape = (this._element as MarkArea).getArea();
    areaShape.setAttribute(
      'points',
      points.map(point => {
        return { ...point };
      })
    );

    const labelShape = (this._element as MarkArea).getLabel();
    if (this._orient === 'vertical') {
      labelShape.setAttribute('x', this._overlayLabel.attribute.x + this._overlayLabel.attribute.width / 2);
    } else {
      labelShape.setAttribute('y', this._overlayLabel.attribute.y + this._overlayLabel.attribute.height / 2);
    }

    if (vglobal.env === 'browser') {
      vglobal.removeEventListener('pointermove', this._onAreaDrag);
      vglobal.removeEventListener('pointerup', this._onAreaDragEnd);
    } else {
      this._overlayArea.removeEventListener('pointermove', this._onAreaDrag);
      this._overlayArea.removeEventListener('pointerup', this._onAreaDragEnd);
      this._overlayArea.removeEventListener('pointerupoutside', this._onAreaDragEnd);
    }
  };

  private _getOverlayGraphic() {
    if (this._overlayGraphic) {
      return this._overlayGraphic;
    }

    const overlayGraphic = createGroup({});
    const overlayAreaGroup = createGroup({
      x: 0,
      y: 0
    });
    overlayAreaGroup.name = 'overlay-mark-area-group';
    overlayGraphic.add(overlayAreaGroup);
    this._overlayAreaGroup = overlayAreaGroup;

    const areaShape = (this._element as MarkArea).getArea();
    const overlayArea = createPolygon(
      merge({}, areaShape.attribute, {
        lineWidth: 1,
        stroke: '#3073F2'
      })
    );
    overlayArea.name = 'overlay-mark-area-area';
    this._overlayArea = overlayArea;
    overlayAreaGroup.add(overlayArea);
    // overlayArea 添加事件
    overlayArea.addEventListener('pointerdown', this._onAreaDragStart as EventListenerOrEventListenerObject);

    const labelShape = (this._element as MarkArea).getLabel() as IGroup;
    const overlayLabel = createRect({
      x: labelShape.AABBBounds.x1,
      y: labelShape.AABBBounds.y1,
      width: labelShape.AABBBounds.width(),
      height: labelShape.AABBBounds.height(),
      fill: '#3073F2',
      fillOpacity: 0.3,
      visible: false
    });
    overlayLabel.name = 'overlay-mark-area-label';
    this._overlayLabel = overlayLabel;
    overlayGraphic.add(overlayLabel);

    // 绘制 resize 的手柄
    const handlerWidth = 9;
    const handlerHeight = 40;
    const areaBounds = areaShape.AABBBounds;
    if (this._orient === 'vertical') {
      const rightHandler = createRect({
        x: areaBounds.x2 - handlerWidth / 2,
        y: (areaBounds.y1 + areaBounds.y2) / 2 - handlerHeight / 2,
        width: handlerWidth,
        height: handlerHeight,
        fill: '#3073F2',
        fillOpacity: 0.6,
        cornerRadius: 9,
        cursor: 'ew-resize'
      });
      rightHandler.name = 'overlay-right-handler';
      overlayAreaGroup.add(rightHandler);
      this._rightHandler = rightHandler;

      const leftHandler = createRect({
        x: areaBounds.x1 - handlerWidth / 2,
        y: (areaBounds.y1 + areaBounds.y2) / 2 - handlerHeight / 2,
        width: handlerWidth,
        height: handlerHeight,
        fill: '#3073F2',
        fillOpacity: 0.6,
        cornerRadius: 9,
        cursor: 'ew-resize'
      });
      leftHandler.name = 'overlay-left-handler';
      overlayAreaGroup.add(leftHandler);
      this._leftHandler = leftHandler;

      // resize 手柄的事件监听
      this._rightHandler.addEventListener(
        'pointerdown',
        this._onHandlerDragStart as EventListenerOrEventListenerObject
      );
      this._leftHandler.addEventListener('pointerdown', this._onHandlerDragStart as EventListenerOrEventListenerObject);
    } else {
      const topHandler = createRect({
        x: (areaBounds.x1 + areaBounds.x2) / 2 - handlerHeight / 2,
        y: areaBounds.y1 - handlerWidth / 2,
        width: handlerHeight,
        height: handlerWidth,
        fill: '#3073F2',
        fillOpacity: 0.6,
        cornerRadius: 9,
        cursor: 'ns-resize'
      });
      topHandler.name = 'overlay-top-handler';
      overlayAreaGroup.add(topHandler);
      this._topHandler = topHandler;

      const bottomHandler = createRect({
        x: (areaBounds.x1 + areaBounds.x2) / 2 - handlerHeight / 2,
        y: areaBounds.y2 - handlerWidth / 2,
        width: handlerHeight,
        height: handlerWidth,
        fill: '#3073F2',
        fillOpacity: 0.6,
        cornerRadius: 9,
        cursor: 'ns-resize'
      });
      bottomHandler.name = 'overlay-bottom-handler';
      overlayAreaGroup.add(bottomHandler);
      this._bottomHandler = bottomHandler;

      // resize 手柄的事件监听
      this._topHandler.addEventListener('pointerdown', this._onHandlerDragStart as EventListenerOrEventListenerObject);
      this._bottomHandler.addEventListener(
        'pointerdown',
        this._onHandlerDragStart as EventListenerOrEventListenerObject
      );
    }

    this._overlayGraphic = overlayGraphic;
    // TODO: 临时添加
    this._element.add(overlayGraphic);
    return this._overlayGraphic;
  }
}
