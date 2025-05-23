import type { IGraphicAttribute } from '../graphic';
import type { IArcGraphicAttribute } from './arc';
import type { IAreaGraphicAttribute } from './area';
import type { ICircleGraphicAttribute } from './circle';
import type { IGlyphGraphicAttribute } from './glyph';
import type { IGroup, IGroupGraphicAttribute } from './group';
import type { IImageGraphicAttribute } from './image';
import type { ILineGraphicAttribute } from './line';
import type { IPathGraphicAttribute } from './path';
import type { IPolygonGraphicAttribute } from './polygon';
import type { IRectGraphicAttribute } from './rect';
import type { IRichTextGraphicAttribute, IRichTextIconGraphicAttribute } from './richText';
import type { IStarGraphicAttribute } from './star';
import type { ISymbolGraphicAttribute } from './symbol';
import type { ITextGraphicAttribute } from './text';

export interface IThemeSpec {
  text?: Partial<ITextGraphicAttribute>;
  rect?: Partial<IRectGraphicAttribute>;
  arc?: Partial<IArcGraphicAttribute>;
  area?: Partial<IAreaGraphicAttribute>;
  circle?: Partial<ICircleGraphicAttribute>;
  line?: Partial<ILineGraphicAttribute>;
  path?: Partial<IPathGraphicAttribute>;
  symbol?: Partial<ISymbolGraphicAttribute>;
  star?: Partial<IStarGraphicAttribute>;
  group?: Partial<IGroupGraphicAttribute>;
  polygon?: Partial<IPolygonGraphicAttribute>;
  image?: Partial<IImageGraphicAttribute>;
  common?: Partial<IGraphicAttribute>;
}

export interface IFullThemeSpec {
  arc: Required<IArcGraphicAttribute>;
  area: Required<IAreaGraphicAttribute>;
  circle: Required<ICircleGraphicAttribute>;
  line: Required<ILineGraphicAttribute>;
  path: Required<IPathGraphicAttribute>;
  symbol: Required<ISymbolGraphicAttribute>;
  text: Required<ITextGraphicAttribute>;
  rect: Required<IRectGraphicAttribute>;
  glyph: Required<IGlyphGraphicAttribute>;
  group: Required<IGroupGraphicAttribute>;
  polygon: Required<IPolygonGraphicAttribute>;
  star: Required<IStarGraphicAttribute>;
  richtext: Required<IRichTextGraphicAttribute>;
  richtextIcon: Required<IRichTextIconGraphicAttribute>;
  image: Required<IImageGraphicAttribute>;
}

export interface ITheme {
  getTheme: (g: IGroup) => IFullThemeSpec;
  combinedTheme?: IFullThemeSpec;
  userTheme?: IThemeSpec;
  nextTheme?: IThemeSpec;
  applyTheme: (group: IGroup, pt: IThemeSpec, force?: boolean) => IThemeSpec;
  setTheme: (t: IThemeSpec, g: IGroup) => void;
  dirty: boolean;
}
