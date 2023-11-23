import type { IRectGraphicAttribute } from '@visactor/vrender-core';

export type Direction = 'horizontal' | 'vertical';

export type OrientType = 'top' | 'right' | 'bottom' | 'left';

export type BackgroundAttributes = {
  /**
   * 是否绘制背景层
   */
  visible: boolean;
} & Partial<IRectGraphicAttribute>;

export type IDelayType = 'debounce' | 'throttle';

export interface ComponentOptions {
  /** skip default attributes of component */
  skipDefault?: boolean;
  /** the mode of component, only axis support 3d mode now */
  mode?: '2d' | '3d';
}
