import type { IGraphic, IRectGraphicAttribute } from '@visactor/vrender-core';
import type { AnimationItem } from 'lottie-web';

export type ILottieAttribute = {
  data: string;
};

export type ILottieGraphicAttribute = Partial<IRectGraphicAttribute> & Partial<ILottieAttribute>;

export interface ILottie extends IGraphic<ILottieGraphicAttribute> {
  lottieInstance?: AnimationItem;
  canvas?: any;
}
