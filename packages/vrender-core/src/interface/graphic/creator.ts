import type { IGraphicAttribute } from '../graphic';
import type { IArcAttribute, IArcGraphicAttribute } from './arc';
import type { IAreaAttribute, IAreaGraphicAttribute } from './area';
import type { ICircleAttribute, ICircleGraphicAttribute } from './circle';
import type { IEllipseAttribute } from './ellipse';
import type { IGroupAttribute, IGroupGraphicAttribute } from './group';
import type { IImageAttribute, IImageGraphicAttribute } from './image';
import type { IIsogonAttribute } from './isogon';
import type { ILineAttribute, ILineGraphicAttribute } from './line';
import type { IPathAttribute, IPathGraphicAttribute } from './path';
import type { IPolygonAttribute, IPolygonGraphicAttribute } from './polygon';
import type { IRectAttribute, IRectGraphicAttribute } from './rect';
import type { IRichTextAttribute, IRichTextGraphicAttribute } from './richText';
import type { ISvgAttribute } from './svg';
import type { ISymbolAttribute, ISymbolGraphicAttribute } from './symbol';
import type { ITextAttribute, ITextGraphicAttribute, IWrapTextGraphicAttribute } from './text';

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
  readonly polygon: IPolygonGraphicAttribute;
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
