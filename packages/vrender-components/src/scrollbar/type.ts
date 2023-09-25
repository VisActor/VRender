import type { IGroupGraphicAttribute, IRectGraphicAttribute } from '@visactor/vrender';
import type { Direction } from '../interface';
import type { Padding } from '../core/type';
import type { IDelayType } from '../common/type';
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
   * 事件触发延迟类型
   * @default 'throttle'
   */
  delayType?: IDelayType;

  /**
   * 事件触发延迟时长
   * @default 0
   */
  delayTime?: number;
}
