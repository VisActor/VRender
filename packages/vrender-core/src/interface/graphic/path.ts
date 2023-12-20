import type { IGraphicAttribute, IGraphic } from '../graphic';
import type { ICustomPath2D } from '../path';
// TODO: Path svg <Path path='' />

export type IPathAttribute = {
  path: ICustomPath2D | string;
  customPath: (context: ICustomPath2D, pathMark: IPath) => void;
};

export type IPathGraphicAttribute = Partial<IGraphicAttribute> & Partial<IPathAttribute>;

export type ShapeType = 'area' | 'circle' | 'ellipse' | 'line' | 'rect';

export interface IPath extends IGraphic<IPathGraphicAttribute> {
  originType?: ShapeType;
  cache?: ICustomPath2D;
  pathShape: ICustomPath2D;

  getParsedPathShape: () => ICustomPath2D;
}
