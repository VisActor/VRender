import { IGraphicAttribute } from '../graphic';
import { IArc, IArcAttribute, IArcGraphicAttribute } from './arc';
import { IArea, IAreaAttribute, IAreaGraphicAttribute } from './area';
import { ICircle, ICircleAttribute, ICircleGraphicAttribute } from './circle';
import { IEllipse, IEllipseAttribute } from './ellipse';
import { IGroup, IGroupAttribute, IGroupGraphicAttribute } from './group';
import { IImage, IImageAttribute, IImageGraphicAttribute } from './image';
import { IIsogon, IIsogonAttribute } from './isogon';
import { ILine, ILineAttribute, ILineGraphicAttribute } from './line';
import { IPath, IPathAttribute, IPathGraphicAttribute } from './path';
import { IPolygon, IPolygonAttribute } from './polygon';
import { IRect, IRectAttribute, IRectGraphicAttribute } from './rect';
import { IRichText, IRichTextAttribute, IRichTextGraphicAttribute } from './richText';
import { ISvg, ISvgAttribute } from './svg';
import { ISymbol, ISymbolAttribute, ISymbolGraphicAttribute } from './symbol';
import { IText, ITextAttribute, ITextGraphicAttribute, IWrapTextGraphicAttribute } from './text';

export type IMarkAttribute =
  | IGraphicAttribute
  | IArcAttribute
  | IAreaAttribute
  | ICircleAttribute
  | IEllipseAttribute
  | IGroupAttribute
  | IImageAttribute
  | IIsogonAttribute
  | ILineAttribute
  | IPathAttribute
  | IPolygonAttribute
  | IRectAttribute
  | IRichTextAttribute
  | ISvgAttribute
  | ISymbolAttribute
  | ITextAttribute;

export type IThemeAttribute =
  | IArcGraphicAttribute
  | IAreaGraphicAttribute
  | ICircleGraphicAttribute
  // | IEllipseGraphicAttribute
  // | IGroupGraphicAttribute
  | IImageGraphicAttribute
  // | IIsogonGraphicAttribute
  | ILineGraphicAttribute
  | IPathGraphicAttribute
  // | IPolygonGraphicAttribute
  | IRectGraphicAttribute
  // | IRichTextGraphicAttribute
  // | ISvgGraphicAttribute
  | ISymbolGraphicAttribute
  | ITextGraphicAttribute
  | IRichTextGraphicAttribute
  | IWrapTextGraphicAttribute;

/**
 * facet object map
 */
export interface GraphicAttributeMap {
  readonly arc: IArcGraphicAttribute;
  readonly area: IAreaGraphicAttribute;
  readonly circle: ICircleGraphicAttribute;
  readonly image: IImageGraphicAttribute;
  readonly line: ILineGraphicAttribute;
  readonly path: IPathGraphicAttribute;
  readonly group: IGroupGraphicAttribute;
  readonly rect: IRectGraphicAttribute;
  readonly symbol: ISymbolGraphicAttribute;
  readonly text: ITextGraphicAttribute;
  readonly richtext: IRichTextGraphicAttribute;
  readonly wrapText: IWrapTextGraphicAttribute;
}

// export declare function createArc(params: Partial<IArcAttribute & IGraphicAttribute>): IArc;
// export declare function createArea(params: Partial<IAreaAttribute & IGraphicAttribute>): IArea;
// export declare function createCircle(params: Partial<ICircleAttribute & IGraphicAttribute>): ICircle;
// // export declare function createDynamicPath(params: Params<Partial<IDynamicPathShape>, Partial<IGraphicAttribute>>): IDynamicPath;
// export declare function createEllipse(params: Partial<IEllipseAttribute & IGraphicAttribute>): IEllipse;
// export declare function createGlyph(): IGlyph;
// export declare function createGroup(params: Partial<IGroupAttribute & IGraphicAttribute>): IGroup;
// export declare function createImage(params: Partial<IImageAttribute & IGraphicAttribute>): IImage;
// export declare function createIsogon(params: Partial<IIsogonAttribute & IGraphicAttribute>): IIsogon;
// export declare function createIine(params: Partial<ILineAttribute & IGraphicAttribute>): ILine;
// export declare function createPath(params: Partial<IPathAttribute & IGraphicAttribute>): IPath;
// export declare function createPolygon(params: Partial<IPolygonAttribute & IGraphicAttribute>): IPolygon;
// // export declare function createPolyline(params: Partial<IArcAttribute & IGraphicAttribute>): IPolyline;
// export declare function createRect(params: Partial<IRectAttribute & IGraphicAttribute>): IRect;
// export declare function createRichText(params: Partial<IRichTextAttribute & IGraphicAttribute>): IRichText;
// export declare function createSvg(params: Partial<ISvgAttribute & IGraphicAttribute>): ISvg;
// export declare function createSymbol(params: Partial<ISymbolAttribute & IGraphicAttribute>): ISymbol;
// export declare function createText(params: Partial<ITextAttribute & IGraphicAttribute>): IText;
