/**
 * @description 滚动条组件
 */
import type { IRectGraphicAttribute, FederatedPointerEvent, IGroup, IRect } from '@visactor/vrender-core';
// eslint-disable-next-line no-duplicate-imports
import { vglobal } from '@visactor/vrender-core';
import { merge, normalizePadding, clamp, clampRange, debounce, throttle } from '@visactor/vutils';
import { AbstractComponent } from '../core/base';

import type { ScrollBarAttributes } from './type';
import type { ComponentOptions } from '../interface';
import { loadScrollbarComponent } from './register';
import { SCROLLBAR_EVENT } from '../constant';

type ComponentBounds = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  width: number;
  height: number;
};

const delayMap = {
  debounce: debounce,
  throttle: throttle
};

loadScrollbarComponent();

export class ScrollBar extends AbstractComponent<Required<ScrollBarAttributes>> {
  name = 'scrollbar';

  static defaultAttributes = {
    direction: 'horizontal',
    round: true,
    sliderSize: 20,
    sliderStyle: {
      fill: 'rgba(0, 0, 0, .5)'
    },
    railStyle: {
      fill: 'rgba(0, 0, 0, .0)'
    },
    padding: 2,
    scrollRange: [0, 1],
    delayType: 'throttle',
    delayTime: 0,
    realTime: true
  };

  private _container!: IGroup;
  // 滚动条滑块
  private _slider!: IRect;
  // 滚动条滑轨
  private _rail!: IRect;
  // 滑块可渲染的区域包围盒
  private _sliderRenderBounds!: ComponentBounds | null;
  // 滑块滑动的范围
  private _sliderLimitRange!: [number, number] | null;
  // 保留滑块上一次的位置
  private _prePos!: number;
  // TODO: 临时方案
  private _viewPosition!: { x: number; y: number };
  private _sliderSize!: number;

  constructor(attributes: ScrollBarAttributes, options?: ComponentOptions) {
    super(options?.skipDefault ? attributes : merge({}, ScrollBar.defaultAttributes, attributes));
  }

  setScrollRange(range: [number, number], render = true) {
    const {
      direction = 'horizontal',
      limitRange = [0, 1],
      range: preRange,
      realTime = true
    } = this.attribute as ScrollBarAttributes;

    const currScrollRange = clampRange(range, limitRange[0], limitRange[1]);
    if (render) {
      // 更新图形
      const sliderPos = this._getSliderPos(currScrollRange);
      if (this._slider) {
        const sliderSize = sliderPos[1] - sliderPos[0];
        this._sliderSize = sliderSize;

        if (direction === 'horizontal') {
          this._slider.setAttributes(
            {
              x: sliderPos[0],
              width: sliderSize
            },
            true
          );
        } else {
          this._slider.setAttributes(
            {
              y: sliderPos[0],
              height: sliderSize
            },
            true
          );
        }

        if (this.stage && !this.stage.autoRender) {
          this.stage.renderNextFrame();
        }
      }
    }
    (this.attribute as ScrollBarAttributes).range = currScrollRange;
    // 发射 change 事件
    if (realTime) {
      this._dispatchEvent(SCROLLBAR_EVENT, {
        pre: preRange,
        value: currScrollRange
      });
    }
  }

  getScrollRange(): [number, number] {
    return (this.attribute as ScrollBarAttributes).range;
  }

  // public setLocation(point: PointLocationCfg) {
  //   this.translateTo(point.x, point.y);
  // }

  // 绑定事件
  protected bindEvents(): void {
    if (this.attribute.disableTriggerEvent) {
      return;
    }
    const { delayType = 'throttle', delayTime = 0 } = this.attribute as ScrollBarAttributes;
    // TODO: wheel 事件支持
    if (this._rail) {
      this._rail.addEventListener(
        'pointerdown',
        delayMap[delayType](this._onRailPointerDown, delayTime) as EventListener
      );
    }
    if (this._slider) {
      this._slider.addEventListener('pointerdown', this._onSliderPointerDown as EventListener);
    }
  }

  protected render() {
    this._reset();
    const {
      direction = 'horizontal',
      width,
      height,
      range,
      limitRange = [0, 1],
      // sliderSize = 20,
      // scrollValue = 0,
      // scrollRange = [0, 1],
      railStyle,
      sliderStyle,
      padding = 2
    } = this.attribute as ScrollBarAttributes;

    const group = this.createOrUpdateChild('scrollbar-container', {}, 'group') as IGroup;
    // 绘制轨道

    const rail = group.createOrUpdateChild(
      'scrollbar-rail',
      {
        x: 0,
        y: 0,
        width,
        height,
        ...railStyle
      },
      'rect'
    ) as IRect;
    this._rail = rail;

    // 滑块
    const sliderRenderBounds = this.getSliderRenderBounds();
    const sliderPos = this._getSliderPos(clampRange(range, limitRange[0], limitRange[1]));
    const sliderSize = sliderPos[1] - sliderPos[0];
    this._sliderSize = sliderSize;
    // const sliderRangePos = this._getScrollRange();

    let sliderAttribute: IRectGraphicAttribute;
    if (direction === 'horizontal') {
      sliderAttribute = {
        x: sliderPos[0],
        y: sliderRenderBounds.y1,
        width: sliderSize,
        height: sliderRenderBounds.height
      };
    } else {
      sliderAttribute = {
        x: sliderRenderBounds.x1,
        y: sliderPos[0],
        width: sliderRenderBounds.width,
        height: sliderSize
      };
    }

    const slider = group.createOrUpdateChild(
      'slider',
      {
        ...sliderAttribute,
        cornerRadius: this._getDefaultSliderCornerRadius(),
        ...sliderStyle,
        boundsPadding: normalizePadding(padding),
        pickMode: 'imprecise'
      },
      'rect'
    ) as IRect;
    this._slider = slider;
    this._container = group;

    const containerAABBBounds = this._container.AABBBounds;
    this._viewPosition = {
      x: containerAABBBounds.x1,
      y: containerAABBBounds.y1
    };
  }

  // 获取滑块渲染的包围盒区域
  getSliderRenderBounds() {
    if (this._sliderRenderBounds) {
      return this._sliderRenderBounds;
    }
    const { width, height, padding = 2 } = this.attribute as ScrollBarAttributes;
    const [top, right, bottom, left] = normalizePadding(padding);
    const renderBounds = {
      x1: left,
      y1: top,
      x2: width - right,
      y2: height - bottom,
      width: Math.max(0, width - (left + right)),
      height: Math.max(0, height - (top + bottom))
    };
    this._sliderRenderBounds = renderBounds;
    return renderBounds;
  }

  // 获取默认的滑块圆角
  private _getDefaultSliderCornerRadius() {
    const { direction, round } = this.attribute as ScrollBarAttributes;

    if (round) {
      const { width, height } = this.getSliderRenderBounds();
      return direction === 'horizontal' ? height : width;
    }

    return 0;
  }

  // 计算滑块在轨道的位置
  private _getSliderPos(range: [number, number]) {
    const { direction } = this.attribute as ScrollBarAttributes;
    const { width, height, x1, y1 } = this.getSliderRenderBounds();

    if (direction === 'horizontal') {
      return [width * range[0] + x1, width * range[1] + x1];
    }
    return [height * range[0] + y1, height * range[1] + y1];
  }

  private _getScrollRange() {
    if (this._sliderLimitRange) {
      return this._sliderLimitRange;
    }
    const { limitRange = [0, 1], direction } = this.attribute as ScrollBarAttributes;
    const [min, max] = clampRange(limitRange, 0, 1);
    const { width, height, x1, y1 } = this.getSliderRenderBounds();
    const sliderSize = this._sliderSize;

    return direction === 'horizontal'
      ? clampRange([x1 + min * width, x1 + max * width], x1, width - sliderSize)
      : clampRange([y1 + min * height, y1 + max * height], y1, height - sliderSize);
  }

  private _onRailPointerDown = (e: FederatedPointerEvent) => {
    // 将事件坐标转换为实际的滑块位置
    // TODO: 这里有问题，应该拿  viewX viewY，同时 graphic 要提供接口获取它的 相对 view 的坐标
    const { viewX, viewY } = e;
    const { direction, width, height, range } = this.attribute as ScrollBarAttributes;
    const sliderSize = this._sliderSize;
    const [min, max] = this._getScrollRange();
    let currentScrollValue;
    if (direction === 'vertical') {
      const relativeY = viewY - this._viewPosition.y;
      const currentYPos = clamp(relativeY - sliderSize / 2, min, max);
      currentScrollValue = relativeY / height;
      this._slider.setAttribute('y', currentYPos, true);
    } else {
      const relativeX = viewX - this._viewPosition.x;
      const currentXPos = clamp(relativeX - sliderSize / 2, min, max);
      currentScrollValue = relativeX / width;
      this._slider.setAttribute('x', currentXPos, true);
    }

    this.setScrollRange(
      [currentScrollValue - (range[1] - range[0]) / 2, currentScrollValue + (range[1] - range[0]) / 2],
      false
    );

    if (this.stage && !this.stage.autoRender) {
      this.stage.renderNextFrame();
    }
  };

  private _onSliderPointerDown = (e: FederatedPointerEvent) => {
    const { stopSliderDownPropagation = true } = this.attribute as ScrollBarAttributes;
    if (stopSliderDownPropagation) {
      e.stopPropagation();
    }
    const { direction } = this.attribute as ScrollBarAttributes;
    const { x, y } = this.stage.eventPointTransform(e);
    this._prePos = direction === 'horizontal' ? x : y;
    this._dispatchEvent('scrollDown', {
      pos: this._prePos,
      event: e
    });
    if (vglobal.env === 'browser') {
      vglobal.addEventListener('pointermove', this._onSliderPointerMoveWithDelay, { capture: true });
      vglobal.addEventListener('pointerup', this._onSliderPointerUp);
    } else {
      this.stage.addEventListener('pointermove', this._onSliderPointerMoveWithDelay, { capture: true });
      this.stage.addEventListener('pointerup', this._onSliderPointerUp);
      this.stage.addEventListener('pointerupoutside', this._onSliderPointerUp);
    }
  };

  private _computeScrollValue = (e: any) => {
    const { direction } = this.attribute as ScrollBarAttributes;
    const { x, y } = this.stage.eventPointTransform(e);

    let currentScrollValue;
    let currentPos;
    let delta = 0;

    const { width, height } = this.getSliderRenderBounds();
    if (direction === 'vertical') {
      currentPos = y;
      delta = currentPos - this._prePos;
      currentScrollValue = delta / height;
    } else {
      currentPos = x;
      delta = currentPos - this._prePos;
      currentScrollValue = delta / width;
    }
    return [currentPos, currentScrollValue];
  };

  private _onSliderPointerMove = (e: any) => {
    const { stopSliderMovePropagation = true } = this.attribute as ScrollBarAttributes;
    if (stopSliderMovePropagation) {
      e.stopPropagation();
    }
    const preScrollRange = this.getScrollRange();
    const [currentPos, currentScrollValue] = this._computeScrollValue(e);
    this.setScrollRange([preScrollRange[0] + currentScrollValue, preScrollRange[1] + currentScrollValue], true);
    this._prePos = currentPos;
  };

  private _onSliderPointerMoveWithDelay =
    this.attribute.delayTime === 0
      ? this._onSliderPointerMove
      : delayMap[this.attribute.delayType](this._onSliderPointerMove, this.attribute.delayTime);

  private _onSliderPointerUp = (e: any) => {
    e.preventDefault();
    const { realTime = true, range: preRange, limitRange = [0, 1] } = this.attribute as ScrollBarAttributes;
    // 发射 change 事件
    const preScrollRange = this.getScrollRange();
    const [currentPos, currentScrollValue] = this._computeScrollValue(e);
    const range: [number, number] = [preScrollRange[0] + currentScrollValue, preScrollRange[1] + currentScrollValue];

    this._dispatchEvent('scrollUp', {
      pre: preRange,
      value: clampRange(range, limitRange[0], limitRange[1])
    });
    if (vglobal.env === 'browser') {
      vglobal.removeEventListener('pointermove', this._onSliderPointerMoveWithDelay, { capture: true });
      vglobal.removeEventListener('pointerup', this._onSliderPointerUp);
    } else {
      this.stage.removeEventListener('pointermove', this._onSliderPointerMoveWithDelay, { capture: true });
      this.stage.removeEventListener('pointerup', this._onSliderPointerUp);
      this.stage.removeEventListener('pointerupoutside', this._onSliderPointerUp);
    }
  };

  private _reset() {
    this._sliderRenderBounds = null;
    this._sliderLimitRange = null;
  }
}
