// import type {
//   IArc,
//   IArcGraphicAttribute,
//   IArea,
//   IAreaGraphicAttribute,
//   ICircle,
//   ICircleGraphicAttribute,
//   IGroup,
//   IGroupGraphicAttribute,
//   IImageGraphicAttribute,
//   ILine,
//   ILineGraphicAttribute,
//   IPath,
//   IPathGraphicAttribute,
//   IPolygonGraphicAttribute,
//   IRect,
//   IRectGraphicAttribute,
//   ISymbolGraphicAttribute,
//   IText,
//   ITextGraphicAttribute,
//   ISymbol,
//   IImage,
//   IPolygon,
//   IShadowRoot,
//   IGraphic,
//   IRichTextGraphicAttribute,
//   IRichText,
//   IGlyph,
//   IGlyphGraphicAttribute,
//   IRect3d,
//   IRect3dGraphicAttribute,
//   IArc3dGraphicAttribute,
//   IPyramid3dGraphicAttribute,
//   IPyramid3d,
//   IWrapTextGraphicAttribute
// } from '../interface';
// import { Arc } from './arc';
// import { Area } from './area';
// import { Circle } from './circle';
// import { Group } from './group';
// import { Image } from './image';
// import { Line } from './line';
// import { Path } from './path';
// import { Polygon } from './polygon';
// import { Rect } from './rect';
// // 这里git会将Symbol强行转成小写symbol，先重命名一下
// import { Symbol as MarkSymbol } from './symbol';
// import { ShadowRoot as MarkShadowRoot } from './shadow-root';
// import { Text } from './text';
// import { RichText } from './richtext';
// import { Glyph } from './glyph';
// import { Rect3d } from './rect3d';
// import { Arc3d } from './arc3d';
// import { Pyramid3d } from './pyramid3d';
// import { WrapText } from './wrap-text';

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

// export function createArc(attributes: IArcGraphicAttribute): IArc {
//   return new Arc(attributes);
// }
// export function createArc3d(attributes: IArc3dGraphicAttribute): IArc {
//   return new Arc3d(attributes);
// }
// export function createPyramid3d(attributes: IPyramid3dGraphicAttribute): IPyramid3d {
//   return new Pyramid3d(attributes);
// }
// export function createArea(attributes: IAreaGraphicAttribute): IArea {
//   return new Area(attributes);
// }
// export function createCircle(attributes: ICircleGraphicAttribute): ICircle {
//   return new Circle(attributes);
// }
// export function createGroup(attributes: IGroupGraphicAttribute): IGroup {
//   return new Group(attributes);
// }
// export function createLine(attributes: ILineGraphicAttribute): ILine {
//   return new Line(attributes);
// }
// export function createPath(attributes: IPathGraphicAttribute): IPath {
//   return new Path(attributes);
// }
// export function createRect(attributes: IRectGraphicAttribute): IRect {
//   return new Rect(attributes);
// }
// export function createRect3d(attributes: IRect3dGraphicAttribute): IRect3d {
//   return new Rect3d(attributes);
// }
// export function createGlyph(attributes: IGlyphGraphicAttribute): IGlyph {
//   return new Glyph(attributes);
// }
// export function createText(attributes: ITextGraphicAttribute): IText {
//   return new Text(attributes);
// }
// export function createWrapText(attributes: IWrapTextGraphicAttribute): IText {
//   return new WrapText(attributes);
// }
// export function createSymbol(attributes: ISymbolGraphicAttribute): ISymbol {
//   return new MarkSymbol(attributes);
// }
// export function createImage(attributes: IImageGraphicAttribute): IImage {
//   return new Image(attributes);
// }
// export function createPolygon(attributes: IPolygonGraphicAttribute): IPolygon {
//   return new Polygon(attributes);
// }
// export function createShadowRoot(graphic?: IGraphic): IShadowRoot {
//   return new MarkShadowRoot(graphic);
// }
// export function createRichText(attributes: IRichTextGraphicAttribute): IRichText {
//   return new RichText(attributes);
// }

class GraphicCreator {
  declare store: Map<string, any>;
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
  declare wraptext?: (attribute: IWrapTextGraphicAttribute) => IText;
  constructor() {
    this.store = new Map();
  }

  RegisterGraphicCreator(name: string, cb: any) {
    this.store.set(name, cb);
    (this as any)[name] = cb;
  }

  CreateGraphic(name: string, params: any) {
    const cb = this.store.get(name);
    if (!cb) {
      return null;
    }
    return cb(params);
  }
}

export const graphicCreator = new GraphicCreator();

// export const graphicCreator = {
//   arc: createArc,
//   area: createArea,
//   circle: createCircle,
//   group: createGroup,
//   image: createImage,
//   line: createLine,
//   path: createPath,
//   rect: createRect,
//   rect3d: createRect3d,
//   symbol: createSymbol,
//   text: createText,
//   richtext: createRichText,
//   polygon: createPolygon,
//   shadowRoot: createShadowRoot,
//   wrapText: createWrapText
// };
