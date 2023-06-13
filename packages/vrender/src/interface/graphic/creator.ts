import { IGraphicAttribute } from '../graphic';
import { IArcAttribute, IArcGraphicAttribute } from './arc';
import { IAreaAttribute, IAreaGraphicAttribute } from './area';
import { ICircleAttribute, ICircleGraphicAttribute } from './circle';
import { IEllipseAttribute } from './ellipse';
import { IGroupAttribute, IGroupGraphicAttribute } from './group';
import { IImageAttribute, IImageGraphicAttribute } from './image';
import { IIsogonAttribute } from './isogon';
import { ILineAttribute, ILineGraphicAttribute } from './line';
import { IPathAttribute, IPathGraphicAttribute } from './path';
import { IPolygonAttribute } from './polygon';
import { IRectAttribute, IRectGraphicAttribute } from './rect';
import { IRichTextAttribute, IRichTextGraphicAttribute } from './richText';
import { ISvgAttribute } from './svg';
import { ISymbolAttribute, ISymbolGraphicAttribute } from './symbol';
import { ITextAttribute, ITextGraphicAttribute, IWrapTextGraphicAttribute } from './text';

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
