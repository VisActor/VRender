import type { IGroupGraphicAttribute, IRectGraphicAttribute } from '@visactor/vrender-core';
import type { Direction, IDelayType } from '../interface';
import type { Padding } from '../core/type';
export interface ScrollBarAttributes extends IGroupGraphicAttribute {
  x: number;
  y: number;
  /**
   * 滚动条的布局方向，默认为 `horizontal`，水平布局。
   * @default horizontal
   */
  direction?: Direction;
  /** 滚动条的宽度。 */
  width: number;
  /** 滚动条的高度。 */
  height: number;
  /** 滑块是否圆角。 */
  round?: boolean;
  /**
   * 滚动条轨道样式。
   */
  railStyle?: Omit<IRectGraphicAttribute, 'width' | 'height'>;
  /**
   * 滚动条滑块样式。
   */
  sliderStyle?: Omit<IRectGraphicAttribute, 'width' | 'height'>;
  /**
   * 滚动条内边距，影响滑轨的实际可用空间 [top, right, bottom, left]
   */
  padding?: Padding;
  /** 滑块当前的可视范围，数值为 0 - 1 */
  range: [number, number];
  /**
   * 滑块限制的滚动范围，数值为 0 - 1
   */
  limitRange?: [number, number];
  /**
   * 关闭交互效果
   * @default false
   */
  disableTriggerEvent?: boolean;
  /*
   * 事件触发延迟类型
   * @default 'throttle'
   */
  delayType?: IDelayType;

  /**
   * 事件触发延迟时长
   * @default 0
   */
  delayTime?: number;
  /**
   * 是否在操作时动态更新视图
   * @default true
   */
  realTime?: boolean;
  /**
   * pointerMove时是否阻止冒泡
   * @default true
   * 内部使用, vtable不需要阻止冒泡
   */
  stopSliderMovePropagation?: boolean;
  /**
   * pointerDown时是否阻止冒泡
   * @default true
   * 内部使用, vtable不需要阻止冒泡
   */
  stopSliderDownPropagation?: boolean;
}
