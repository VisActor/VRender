import type { ICustomPath2D } from '../../interface';
import type { IGraphicAttribute, IGraphic } from '../graphic';

export type IRectAttribute = {
  width: number;
  height: number;
  borderRadius: number | number[];
};

export type IRectGraphicAttribute = Partial<IGraphicAttribute> & Partial<IRectAttribute>;

export interface IRect extends IGraphic<IRectGraphicAttribute> {
  cache?: ICustomPath2D;
}
