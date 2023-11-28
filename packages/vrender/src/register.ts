import type {
  IArc,
  IArcGraphicAttribute,
  IArea,
  IAreaGraphicAttribute,
  ICircle,
  ICircleGraphicAttribute,
  IGroup,
  IGroupGraphicAttribute,
  IImageGraphicAttribute,
  ILine,
  ILineGraphicAttribute,
  IPath,
  IPathGraphicAttribute,
  IPolygonGraphicAttribute,
  IRect,
  IRectGraphicAttribute,
  ISymbolGraphicAttribute,
  IText,
  ITextGraphicAttribute,
  ISymbol,
  IImage,
  IPolygon,
  IShadowRoot,
  IGraphic,
  IRichTextGraphicAttribute,
  IRichText,
  IGlyph,
  IGlyphGraphicAttribute,
  IRect3d,
  IRect3dGraphicAttribute,
  IArc3dGraphicAttribute,
  IPyramid3dGraphicAttribute,
  IPyramid3d,
  IWrapTextGraphicAttribute
} from '@visactor/vrender-core';
import {
  Arc,
  Area,
  Circle,
  Group,
  Image,
  Line,
  Path,
  Polygon,
  Rect,
  Symbol as MarkSymbol,
  ShadowRoot as MarkShadowRoot,
  Text,
  RichText,
  Glyph,
  Rect3d,
  Arc3d,
  Pyramid3d,
  WrapText,
  graphicCreator,
  arcModule,
  container,
  rectModule,
  lineModule,
  areaModule,
  symbolModule,
  textModule,
  circleModule,
  pathModule,
  richtextModule,
  polygonModule,
  isBrowserEnv,
  imageModule,
  glyphModule,
  rect3dModule,
  arc3dModule,
  pyramid3dModule
} from '@visactor/vrender-core';
import {
  arc3dCanvasPickModule,
  arcCanvasPickModule,
  arcMathPickModule,
  areaCanvasPickModule,
  areaMathPickModule,
  circleCanvasPickModule,
  circleMathPickModule,
  glyphCanvasPickModule,
  glyphMathPickModule,
  imageCanvasPickModule,
  imageMathPickModule,
  lineCanvasPickModule,
  lineMathPickModule,
  pathCanvasPickModule,
  pathMathPickModule,
  polygonCanvasPickModule,
  polygonMathPickModule,
  pyramid3dCanvasPickModule,
  rect3dCanvasPickModule,
  rectCanvasPickModule,
  rectMathPickModule,
  richTextMathPickModule,
  richtextCanvasPickModule,
  symbolCanvasPickModule,
  symbolMathPickModule,
  textCanvasPickModule,
  textMathPickModule
} from '@visactor/vrender-kits';

export function createArc(attributes: IArcGraphicAttribute): IArc {
  return new Arc(attributes);
}
export function createArc3d(attributes: IArc3dGraphicAttribute): IArc {
  return new Arc3d(attributes);
}
export function createPyramid3d(attributes: IPyramid3dGraphicAttribute): IPyramid3d {
  return new Pyramid3d(attributes);
}
export function createArea(attributes: IAreaGraphicAttribute): IArea {
  return new Area(attributes);
}
export function createCircle(attributes: ICircleGraphicAttribute): ICircle {
  return new Circle(attributes);
}
export function createGroup(attributes: IGroupGraphicAttribute): IGroup {
  return new Group(attributes);
}
export function createLine(attributes: ILineGraphicAttribute): ILine {
  return new Line(attributes);
}
export function createPath(attributes: IPathGraphicAttribute): IPath {
  return new Path(attributes);
}
export function createRect(attributes: IRectGraphicAttribute): IRect {
  return new Rect(attributes);
}
export function createRect3d(attributes: IRect3dGraphicAttribute): IRect3d {
  return new Rect3d(attributes);
}
export function createGlyph(attributes: IGlyphGraphicAttribute): IGlyph {
  return new Glyph(attributes);
}
export function createText(attributes: ITextGraphicAttribute): IText {
  return new Text(attributes);
}
export function createWrapText(attributes: IWrapTextGraphicAttribute): IText {
  return new WrapText(attributes);
}
export function createSymbol(attributes: ISymbolGraphicAttribute): ISymbol {
  return new MarkSymbol(attributes);
}
export function createImage(attributes: IImageGraphicAttribute): IImage {
  return new Image(attributes);
}
export function createPolygon(attributes: IPolygonGraphicAttribute): IPolygon {
  return new Polygon(attributes);
}
export function createShadowRoot(graphic?: IGraphic): IShadowRoot {
  return new MarkShadowRoot(graphic);
}
export function createRichText(attributes: IRichTextGraphicAttribute): IRichText {
  return new RichText(attributes);
}

const obj = {
  arc: createArc,
  area: createArea,
  circle: createCircle,
  group: createGroup,
  image: createImage,
  line: createLine,
  path: createPath,
  rect: createRect,
  rect3d: createRect3d,
  pyramid3d: createPyramid3d,
  symbol: createSymbol,
  text: createText,
  richtext: createRichText,
  polygon: createPolygon,
  shadowRoot: createShadowRoot,
  wrapText: createWrapText
};

Object.keys(obj).forEach(k => {
  graphicCreator.RegisterGraphicCreator(k, obj[k]);
});

const browser = isBrowserEnv();

container.load(arcModule);
container.load(browser ? arcCanvasPickModule : arcMathPickModule);

container.load(rectModule);
container.load(browser ? rectCanvasPickModule : rectMathPickModule);

container.load(lineModule);
container.load(browser ? lineCanvasPickModule : lineMathPickModule);

container.load(areaModule);
container.load(browser ? areaCanvasPickModule : areaMathPickModule);

container.load(symbolModule);
container.load(browser ? symbolCanvasPickModule : symbolMathPickModule);

container.load(textModule);
container.load(browser ? textCanvasPickModule : textMathPickModule);

container.load(circleModule);
container.load(browser ? circleCanvasPickModule : circleMathPickModule);

container.load(pathModule);
container.load(browser ? pathCanvasPickModule : pathMathPickModule);

container.load(richtextModule);
container.load(browser ? richtextCanvasPickModule : richTextMathPickModule);

container.load(polygonModule);
container.load(browser ? polygonCanvasPickModule : polygonMathPickModule);

container.load(imageModule);
container.load(browser ? imageCanvasPickModule : imageMathPickModule);

container.load(glyphModule);
container.load(browser ? glyphCanvasPickModule : glyphMathPickModule);

container.load(rect3dModule);
container.load(browser ? rect3dCanvasPickModule : rect3dCanvasPickModule);

container.load(arc3dModule);
container.load(browser ? arc3dCanvasPickModule : arc3dCanvasPickModule);

container.load(pyramid3dModule);
container.load(browser ? pyramid3dCanvasPickModule : pyramid3dCanvasPickModule);
