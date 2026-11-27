import type { SliderAttributes } from '../../slider/type';
import type { LegendBaseAttributes } from '../type';
export type ColorLegendAttributes = {
  /**
   * 图例的颜色
   */
  colors: string[];
  /**
   * 是否让两个手柄标签按实际位置向轨道两端对齐。横向图例默认开启，竖向图例默认关闭。
   */
  separateHandlerText?: boolean;
} & Omit<SliderAttributes, 'step' | 'range'> &
  LegendBaseAttributes;
