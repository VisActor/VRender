import type { SliderAttributes } from '../../slider/type';
import type { LegendBaseAttributes } from '../type';
export type ColorLegendAttributes = {
  /**
   * 图例的颜色
   */
  colors: string[];
} & Omit<SliderAttributes, 'step' | 'range'> &
  LegendBaseAttributes;
