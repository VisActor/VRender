import type { IGraphic } from '../graphic';
import type { ICustomPath2D } from '../path';
import type { IArcGraphicAttribute } from './arc';

export type IArc3dGraphicAttribute = Partial<IArcGraphicAttribute> & {
  height?: number; // 长度
};

export interface IArc3d extends IGraphic<IArc3dGraphicAttribute> {
  cache?: ICustomPath2D;

  getParsedCornerRadius: () => number;
  getParsedAngle: () => { startAngle: number; endAngle: number };
  getParsePadAngle: (
    startAngle: number,
    endAngle: number
  ) => {
    outerStartAngle: number;
    outerEndAngle: number;
    innerStartAngle: number;
    innerEndAngle: number;

    outerDeltaAngle: number;
    innerDeltaAngle: number;
  };
}
