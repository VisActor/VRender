import type { IPathGraphicAttribute } from '@visactor/vrender-core';
import type { SliderAttributes } from '../../slider/type';
import type { LegendBaseAttributes } from '../type';

export type SizeLegendAttributes = {
  // /**
  //  * 背景三角形两端的大小
  //  */
  // sizeRange: [number, number];
  sizeBackground?: Partial<IPathGraphicAttribute>;
} & Omit<SliderAttributes, 'step' | 'range'> &
  LegendBaseAttributes;
