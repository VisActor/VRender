import type { IAABBBounds } from '@visactor/vutils';
import type { IGraphic } from './graphic';
import type { IGroup, IGroupGraphicAttribute } from './graphic/group';
import type { IStage } from './stage';
import type { IRectGraphicAttribute } from './graphic/rect';
import type { ISymbol, ISymbolGraphicAttribute } from './graphic/symbol';
import type { ICircle, ICircleGraphicAttribute } from './graphic/circle';
import type { IArc, IArcGraphicAttribute } from './graphic/arc';
import type { IArc3d, IArc3dGraphicAttribute } from './graphic/arc3d';
import type { IArea, IAreaGraphicAttribute } from './graphic/area';
import type { ILine, ILineGraphicAttribute } from './graphic/line';
import type { IPyramid3d, IPyramid3dGraphicAttribute } from './graphic/pyramid3d';
import type { IText, ITextGraphicAttribute } from './graphic/text';
import type { IRichText, IRichTextGraphicAttribute } from './graphic/richText';
import type { IImage, IImageGraphicAttribute } from './graphic/image';
import type { IPolygon, IPolygonGraphicAttribute } from './graphic/polygon';
import type { IPath, IPathGraphicAttribute } from './graphic/path';
import type { IGlyph, IGlyphGraphicAttribute } from './graphic/glyph';
import type { ISyncHook } from './sync-hook';

export interface IGraphicService {
  // themeService: IThemeService;
  onAttributeUpdate: (graphic: IGraphic) => void;
  onSetStage: (graphic: IGraphic, stage: IStage) => void;
  onRemove: (graphic: IGraphic) => void;
  onAddIncremental: (graphic: IGraphic, group: IGroup, stage: IStage) => void;
  onClearIncremental: (group: IGroup, stage: IStage) => void;
  hooks: {
    onAttributeUpdate: ISyncHook<[IGraphic]>;
    onSetStage: ISyncHook<[IGraphic, IStage]>;
    onRemove: ISyncHook<[IGraphic]>;
    onAddIncremental: ISyncHook<[IGraphic, IGroup, IStage]>;
    onClearIncremental: ISyncHook<[IGroup, IStage]>;
    beforeUpdateAABBBounds: ISyncHook<[IGraphic, IStage, boolean, IAABBBounds]>;
    afterUpdateAABBBounds: ISyncHook<[IGraphic, IStage, IAABBBounds, { globalAABBBounds: IAABBBounds }, boolean]>;
  };
  beforeUpdateAABBBounds: (graphic: IGraphic, stage: IStage, willUpdate: boolean, bounds: IAABBBounds) => void;
  afterUpdateAABBBounds: (
    graphic: IGraphic,
    stage: IStage,
    bounds: IAABBBounds,
    params: { globalAABBBounds: IAABBBounds },
    selfChange: boolean
  ) => void;

  creator: Record<string, (attrs: any) => any>;

  updateRectAABBBounds: (
    attribute: IRectGraphicAttribute,
    rectTheme: Required<IRectGraphicAttribute>,
    aabbBounds: IAABBBounds,
    graphic?: IGraphic
  ) => IAABBBounds;

  updateGroupAABBBounds: (
    attribute: IGroupGraphicAttribute,
    groupTheme: Required<IGroupGraphicAttribute>,
    aabbBounds: IAABBBounds,
    graphic?: IGroup
  ) => IAABBBounds;

  updateGlyphAABBBounds: (
    attribute: IGlyphGraphicAttribute,
    groupTheme: Required<IGlyphGraphicAttribute>,
    aabbBounds: IAABBBounds,
    graphic?: IGlyph
  ) => IAABBBounds;

  updateSymbolAABBBounds: (
    attribute: ISymbolGraphicAttribute,
    symbolTheme: Required<ISymbolGraphicAttribute>,
    aabbBounds: IAABBBounds,
    full?: boolean,
    graphic?: ISymbol
  ) => IAABBBounds;

  updateCircleAABBBounds: (
    attribute: ICircleGraphicAttribute,
    circleTheme: Required<ICircleGraphicAttribute>,
    aabbBounds: IAABBBounds,
    full?: boolean,
    graphic?: ICircle
  ) => IAABBBounds;

  updateArcAABBBounds: (
    attribute: IArcGraphicAttribute,
    arcTheme: Required<IArcGraphicAttribute>,
    aabbBounds: IAABBBounds,
    full?: boolean,
    graphic?: IArc
  ) => IAABBBounds;

  updateArc3dAABBBounds: (
    attribute: IArc3dGraphicAttribute,
    arcTheme: Required<IArc3dGraphicAttribute>,
    aabbBounds: IAABBBounds,
    graphic?: IArc3d
  ) => IAABBBounds;

  updateAreaAABBBounds: (
    attribute: IAreaGraphicAttribute,
    areaTheme: Required<IAreaGraphicAttribute>,
    aabbBounds: IAABBBounds,
    graphic?: IArea
  ) => IAABBBounds;

  updateLineAABBBounds: (
    attribute: ILineGraphicAttribute,
    lineTheme: Required<ILineGraphicAttribute>,
    aabbBounds: IAABBBounds,
    graphic?: ILine
  ) => IAABBBounds;

  updatePathAABBBounds: (
    attribute: IPathGraphicAttribute,
    pathTheme: Required<IPathGraphicAttribute>,
    aabbBounds: IAABBBounds,
    graphic?: IPath
  ) => IAABBBounds;

  updatePolygonAABBBounds: (
    attribute: IPolygonGraphicAttribute,
    polygonTheme: Required<IPolygonGraphicAttribute>,
    aabbBounds: IAABBBounds,
    graphic?: IPolygon
  ) => IAABBBounds;

  updatePyramid3dAABBBounds: (
    attribute: IPyramid3dGraphicAttribute,
    polygonTheme: Required<IPyramid3dGraphicAttribute>,
    aabbBounds: IAABBBounds,
    graphic?: IPyramid3d
  ) => IAABBBounds;

  updateTextAABBBounds: (
    attribute: ITextGraphicAttribute,
    textTheme: Required<ITextGraphicAttribute>,
    aabbBounds: IAABBBounds,
    graphic?: IText
  ) => IAABBBounds;

  updateRichTextAABBBounds: (
    attribute: IRichTextGraphicAttribute,
    textTheme: Required<IRichTextGraphicAttribute>,
    aabbBounds: IAABBBounds,
    graphic?: IRichText
  ) => IAABBBounds;

  updateImageAABBBounds: (
    attribute: IImageGraphicAttribute,
    textTheme: Required<IImageGraphicAttribute>,
    aabbBounds: IAABBBounds,
    graphic?: IImage
  ) => IAABBBounds;
}
