import type { IGraphicAttribute, IGraphic } from '../graphic';
import type { ICustomPath2D } from '../path';

export type IRectAttribute = {
  width: number;
  height: number;
  cornerRadius: number | number[];
};

export type IRectGraphicAttribute = Partial<IGraphicAttribute> & Partial<IRectAttribute>;

export interface IRect extends IGraphic<IRectGraphicAttribute> {
  cache?: ICustomPath2D;
}
