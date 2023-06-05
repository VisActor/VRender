import type { IGraphicAttribute, IGraphic } from '../graphic';

export type IRepeatType = 'no-repeat' | 'repeat' | 'stretch';

export type IImageAttribute = {
  width: number;
  height: number;
  repeatX: IRepeatType;
  repeatY: IRepeatType;
  image: string | HTMLImageElement | HTMLCanvasElement;
};

export type IImageGraphicAttribute = Partial<IGraphicAttribute> & Partial<IImageAttribute>;

export interface IImage extends IGraphic<IImageGraphicAttribute> {
  successCallback?: () => void;
  failCallback?: () => void;
}
