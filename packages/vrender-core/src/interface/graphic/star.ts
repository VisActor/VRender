import type { IPointLike } from '@visactor/vutils';
import type { IGraphicAttribute, IGraphic } from '../graphic';

export type IStarAttribute = {
  /**
   * Width of the star
   */
  width: number;

  /**
   * Height of the star
   */
  height: number;

  /**
   * Number of spikes/corners (must be >= 3)
   */
  spikes: number;

  /**
   * How much the corners protrude (0-1)
   * 0 means a regular polygon, 1 means maximum protrusion
   */
  thickness: number;
};

export type IStarGraphicAttribute = Partial<IGraphicAttribute> & Partial<IStarAttribute>;

export type IStar = IGraphic<IStarGraphicAttribute> & {
  getCachedPoints: () => IPointLike[];
};
