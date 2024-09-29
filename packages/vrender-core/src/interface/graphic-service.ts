import type { IAABBBounds } from '@visactor/vutils';

import type { ISyncHook } from './sync-hook';
import type { IGraphic, IGraphicAttribute } from './graphic';
import type { IStage } from './stage';
import type {
  IRectGraphicAttribute,
  IGroup,
  IGroupGraphicAttribute,
  ISymbolGraphicAttribute,
  ICircleGraphicAttribute,
  ICircle,
  ISymbol,
  IArcGraphicAttribute,
  IArc,
  IAreaGraphicAttribute,
  IArea,
  ILineGraphicAttribute,
  IPathGraphicAttribute,
  ILine,
  IPath,
  IPolygonGraphicAttribute,
  IPolygon,
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
    clearAABBBounds: ISyncHook<[IGraphic, IStage, IAABBBounds]>;
  };
  beforeUpdateAABBBounds: (graphic: IGraphic, stage: IStage, willUpdate: boolean, bounds: IAABBBounds) => void;
  afterUpdateAABBBounds: (
    graphic: IGraphic,
    stage: IStage,
    bounds: IAABBBounds,
    params: { globalAABBBounds: IAABBBounds },
    selfChange: boolean
  ) => void;
  clearAABBBounds: (graphic: IGraphic, stage: IStage, b: IAABBBounds) => void;

  creator: IGraphicCreator;
  validCheck: (
    attribute: Partial<IGraphicAttribute>,
    theme: Required<IGraphicAttribute>,
    aabbBounds: IAABBBounds,
    graphic?: IGraphic
  ) => boolean;

  transformAABBBounds: (
    attribute: Partial<IGraphicAttribute>,
    aabbBounds: IAABBBounds,
    theme: Required<IGraphicAttribute>,
    miter: boolean,
    graphic?: IGraphic
  ) => void;

  updateHTMLTextAABBBounds: (
    attribute: ITextGraphicAttribute,
    textTheme: Required<ITextGraphicAttribute>,
    aabbBounds: IAABBBounds,
    graphic?: IText
  ) => void;

  combindShadowAABBBounds: (bounds: IAABBBounds, graphic?: IGraphic) => void;
  updateTempAABBBounds: (aabbBounds: IAABBBounds) => { tb1: IAABBBounds; tb2: IAABBBounds };
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
export interface IImageBoundsContribution {
  updateBounds: (
    attribute: IImageGraphicAttribute,
    ImageTheme: Required<IImageGraphicAttribute>,
    aabbBounds: IAABBBounds,
    graphic?: IGraphic
  ) => IAABBBounds;
}
