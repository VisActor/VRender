import type {
  IArc,
  IArcGraphicAttribute,
  IArea,
  IAreaGraphicAttribute,
  ICircle,
  ICircleGraphicAttribute,
  IGroup,
  IGroupGraphicAttribute,
  IImage,
  IImageGraphicAttribute,
  ILine,
  ILineGraphicAttribute,
  IPath,
  IPathGraphicAttribute,
  IPolygon,
  IPolygonGraphicAttribute,
  IRect,
  IRect3d,
  IRect3dGraphicAttribute,
  IRectGraphicAttribute,
  IRichText,
  IRichTextGraphicAttribute,
  IShadowRoot,
  ISymbol,
  ISymbolGraphicAttribute,
  IText,
  ITextGraphicAttribute,
  IWrapTextGraphicAttribute
} from '../interface';
import { GraphicFactory } from '../factory/graphic-factory';
import type { IGraphic } from '../interface/graphic';

export type IGraphicCreateCallback<TGraphic extends IGraphic = IGraphic, TAttributes = any> = (
  attributes: TAttributes
) => TGraphic;

function createGraphicCtor<TGraphic extends IGraphic = IGraphic, TAttributes = any>(
  creator: IGraphicCreateCallback<TGraphic, TAttributes>
) {
  return class RegisteredGraphicCtor {
    constructor(attributes: TAttributes) {
      try {
        return new (creator as any)(attributes);
      } catch (error) {
        return creator(attributes);
      }
    }
  } as any;
}

const sharedGraphicFactory = new GraphicFactory();

class GraphicCreator {
  declare store: Map<string, IGraphicCreateCallback>;
  declare arc?: (attribute: IArcGraphicAttribute) => IArc;
  declare area?: (attribute: IAreaGraphicAttribute) => IArea;
  declare circle?: (attribute: ICircleGraphicAttribute) => ICircle;
  declare group?: (attribute: IGroupGraphicAttribute) => IGroup;
  declare image?: (attribute: IImageGraphicAttribute) => IImage;
  declare line?: (attribute: ILineGraphicAttribute) => ILine;
  declare path?: (attribute: IPathGraphicAttribute) => IPath;
  declare rect?: (attribute: IRectGraphicAttribute) => IRect;
  declare rect3d?: (attribute: IRect3dGraphicAttribute) => IRect3d;
  declare symbol?: (attribute: ISymbolGraphicAttribute) => ISymbol;
  declare text?: (attribute: ITextGraphicAttribute) => IText;
  declare richtext?: (attribute: IRichTextGraphicAttribute) => IRichText;
  declare polygon?: (attribute: IPolygonGraphicAttribute) => IPolygon;
  declare shadowRoot?: (attribute: IGroupGraphicAttribute) => IShadowRoot;
  declare wrapText?: (attribute: IWrapTextGraphicAttribute) => IText;

  constructor() {
    this.store = new Map();
  }

  registerStore(name: string, creator: IGraphicCreateCallback) {
    this.store.set(name, creator);
    (this as any)[name] = creator;
  }

  RegisterGraphicCreator(name: string, creator: IGraphicCreateCallback) {
    registerGraphic(name, creator);
  }

  CreateGraphic<TGraphic extends IGraphic = IGraphic, TAttributes = any>(
    name: string,
    attributes: TAttributes
  ): TGraphic | null {
    if (!this.store.has(name)) {
      return null;
    }

    return createGraphic<TGraphic, TAttributes>(name, attributes);
  }
}

export const graphicCreator = new GraphicCreator();

export function registerGraphic<TGraphic extends IGraphic = IGraphic, TAttributes = any>(
  name: string,
  creator: IGraphicCreateCallback<TGraphic, TAttributes>
) {
  if (!name) {
    throw new Error('Graphic registration requires a non-empty graphic type');
  }

  graphicCreator.registerStore(name, creator as IGraphicCreateCallback);
  sharedGraphicFactory.register(name, createGraphicCtor(creator));
}

export function createGraphic<TGraphic extends IGraphic = IGraphic, TAttributes = any>(
  name: string,
  attributes: TAttributes
): TGraphic {
  return sharedGraphicFactory.create<TGraphic, TAttributes>(name, attributes);
}
