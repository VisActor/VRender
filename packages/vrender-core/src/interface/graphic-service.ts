import type { IAABBBounds } from '@visactor/vutils';

import type { ISyncHook } from './sync-hook';
import type { IGraphic } from './graphic';
import type { IStage } from './stage';
import type {
  IRectGraphicAttribute,
  IGroup,
  IGroupGraphicAttribute,
  IGlyphGraphicAttribute,
  ISymbolGraphicAttribute,
  ICircleGraphicAttribute,
  ICircle,
  IGlyph,
  ISymbol,
  IArcGraphicAttribute,
  IArc,
  IArc3dGraphicAttribute,
  IAreaGraphicAttribute,
  IArc3d,
  IArea,
  ILineGraphicAttribute,
  IPathGraphicAttribute,
  ILine,
  IPath,
  IPolygonGraphicAttribute,
  IPolygon,
  IPyramid3dGraphicAttribute,
  IPyramid3d,
  ITextGraphicAttribute,
  IText,
  IRichTextGraphicAttribute,
  IRichText,
  IImageGraphicAttribute,
  IImage,
  IRect3dGraphicAttribute,
  IRect,
  IRect3d,
  IShadowRoot,
  IWrapTextGraphicAttribute
} from './graphic/index';

export interface IGraphicService {
  // themeService: IThemeService;
  onAttributeUpdate: (graphic: IGraphic) => void;
  onSetStage: (graphic: IGraphic, stage: IStage) => void;
  onRemove: (graphic: IGraphic) => void;
  onRelease: (graphic: IGraphic) => void;
  onAddIncremental: (graphic: IGraphic, group: IGroup, stage: IStage) => void;
  onClearIncremental: (group: IGroup, stage: IStage) => void;
  hooks: {
    onAttributeUpdate: ISyncHook<[IGraphic]>;
    onSetStage: ISyncHook<[IGraphic, IStage]>;
    onRemove: ISyncHook<[IGraphic]>;
    onRelease: ISyncHook<[IGraphic]>;
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

  creator: IGraphicCreator;

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

export type IGraphicCreator = {
  arc: (attributes: IArcGraphicAttribute) => IArc;
  area: (attributes: IAreaGraphicAttribute) => IArea;
  circle: (attributes: ICircleGraphicAttribute) => ICircle;
  group: (attributes: IGroupGraphicAttribute) => IGroup;
  image: (attributes: IImageGraphicAttribute) => IImage;
  line: (attributes: ILineGraphicAttribute) => ILine;
  path: (attributes: IPathGraphicAttribute) => IPath;
  rect: (attributes: IRectGraphicAttribute) => IRect;
  rect3d: (attributes: IRect3dGraphicAttribute) => IRect3d;
  symbol: (attributes: ISymbolGraphicAttribute) => ISymbol;
  text: (attributes: ITextGraphicAttribute) => IText;
  richtext: (attributes: IRichTextGraphicAttribute) => IRichText;
  polygon: (attributes: IPolygonGraphicAttribute) => IPolygon;
  shadowRoot: (graphic?: IGraphic) => IShadowRoot;
  wrapText: (attributes: IWrapTextGraphicAttribute) => IText;
};

export interface IArcBoundsContribution {
  updateBounds: (
    attribute: IArcGraphicAttribute,
    arcTheme: Required<IArcGraphicAttribute>,
    aabbBounds: IAABBBounds,
    graphic?: IGraphic
  ) => IAABBBounds;
}

export interface IAreaBoundsContribution {
  updateBounds: (
    attribute: IAreaGraphicAttribute,
    arcTheme: Required<IAreaGraphicAttribute>,
    aabbBounds: IAABBBounds,
    graphic?: IGraphic
  ) => IAABBBounds;
}

export interface ICircleBoundsContribution {
  updateBounds: (
    attribute: ICircleGraphicAttribute,
    circleTheme: Required<ICircleGraphicAttribute>,
    aabbBounds: IAABBBounds,
    graphic?: IGraphic
  ) => IAABBBounds;
}

export interface IPathBoundsContribution {
  updateBounds: (
    attribute: IPathGraphicAttribute,
    pathTheme: Required<IPathGraphicAttribute>,
    aabbBounds: IAABBBounds,
    graphic?: IGraphic
  ) => IAABBBounds;
}

export interface IRectBoundsContribution {
  updateBounds: (
    attribute: IRectGraphicAttribute,
    rectTheme: Required<IRectGraphicAttribute>,
    aabbBounds: IAABBBounds,
    graphic?: IGraphic
  ) => IAABBBounds;
}

export interface ISymbolBoundsContribution {
  updateBounds: (
    attribute: ISymbolGraphicAttribute,
    SymbolTheme: Required<ISymbolGraphicAttribute>,
    aabbBounds: IAABBBounds,
    graphic?: IGraphic
  ) => IAABBBounds;
}
