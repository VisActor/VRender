import type { IGraphicAttribute, IGraphic } from '../graphic';

export type IRepeatType = 'no-repeat' | 'repeat';

export type IImageAttribute = {
  /**
   * 宽度
   */
  width: number;
  /**
   * 高度
   */
  height: number;
  /**
   * x方向的重复方式
   */
  repeatX: IRepeatType;
  /**
   * y方向的重复方式
   */
  repeatY: IRepeatType;
  /**
   * 图像url或者内容
   */
  image: string | HTMLImageElement | HTMLCanvasElement;
  /**
   * 圆角半径
   */
  cornerRadius: number | number[];
  /**
   * 圆角类型，
   * 'round' - 圆弧
   * 'bevel' - 斜角
   */
  cornerType: 'round' | 'bevel';
};

export type IImageGraphicAttribute = Partial<IGraphicAttribute> & Partial<IImageAttribute>;

export interface IImage extends IGraphic<IImageGraphicAttribute> {
  successCallback?: () => void;
  failCallback?: () => void;
}
