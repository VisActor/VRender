import type { EasingType } from '@visactor/vrender-core';
import type { ILabelAnimation } from '../type';

export const DefaultLabelAnimation: ILabelAnimation = {
  mode: 'same-time',
  duration: 300,
  easing: 'linear' as EasingType
};
