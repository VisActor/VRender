import type { ICustomPath2D, IRectGraphicAttribute } from '../../interface';
import type { IGraphic } from '../graphic';

export type IRect3dGraphicAttribute = Partial<IRectGraphicAttribute> & {
  length?: number; // 长度
};

export interface IRect3d extends IGraphic {
  attribute: IRect3dGraphicAttribute;

  cache?: ICustomPath2D;
}
