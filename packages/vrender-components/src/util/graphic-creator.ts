import * as graphicCreatorModule from '../../../vrender-core/src/graphic/graphic-creator';
import type {
  IArc,
  IArcGraphicAttribute,
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
  IRectGraphicAttribute,
  IRichText,
  IRichTextGraphicAttribute,
  ISymbol,
  ISymbolGraphicAttribute,
  IText,
  ITextGraphicAttribute
} from '@visactor/vrender-core';

const createGraphic = (graphicCreatorModule as any).createGraphic as <TGraphic, TAttributes>(
  type: string,
  attributes: TAttributes
) => TGraphic;

export const graphicCreator = {
  arc: (attributes: IArcGraphicAttribute): IArc => createGraphic('arc', attributes),
  circle: (attributes: ICircleGraphicAttribute): ICircle => createGraphic('circle', attributes),
  group: (attributes: IGroupGraphicAttribute): IGroup => createGraphic('group', attributes),
  image: (attributes: IImageGraphicAttribute): IImage => createGraphic('image', attributes),
  line: (attributes: ILineGraphicAttribute): ILine => createGraphic('line', attributes),
  path: (attributes: IPathGraphicAttribute): IPath => createGraphic('path', attributes),
  polygon: (attributes: IPolygonGraphicAttribute): IPolygon => createGraphic('polygon', attributes),
  rect: (attributes: IRectGraphicAttribute): IRect => createGraphic('rect', attributes),
  richtext: (attributes: IRichTextGraphicAttribute): IRichText => createGraphic('richtext', attributes),
  symbol: (attributes: ISymbolGraphicAttribute): ISymbol => createGraphic('symbol', attributes),
  text: (attributes: ITextGraphicAttribute): IText => createGraphic('text', attributes)
};
