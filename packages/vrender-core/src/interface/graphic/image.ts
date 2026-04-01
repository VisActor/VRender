import type { BackgroundPosition, BackgroundSizing, IGraphicAttribute, IGraphic } from '../graphic';

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
   * 最大宽度
   */
  maxWidth?: number;
  /**
   * 最大高度
   */
  maxHeight?: number;
  /**
   * 图像布局方式，仅在设置了 width/height 且不重复平铺时生效。
   * - 'cover': 等比缩放并裁剪
   * - 'contain': 等比缩放并留白
   * - 'fill': 拉伸适配到指定宽高
   * - 'auto': 保持原始尺寸
   */
  imageSizing: BackgroundSizing;
  /**
   * 图像锚定位置，语义与 backgroundPosition 一致。
   */
  imagePosition: BackgroundPosition;
  /**
   * 图像额外缩放比例，仅在不重复平铺时生效。
   */
  imageScale: number;
  /**
   * 图像 x 偏移，仅在不重复平铺时生效。
   */
  imageOffsetX: number;
  /**
   * 图像 y 偏移，仅在不重复平铺时生效。
   */
  imageOffsetY: number;
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
