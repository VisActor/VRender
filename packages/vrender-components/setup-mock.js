const {
  Arc,
  Area,
  Circle,
  Group,
  Image,
  Line,
  Path,
  Polygon,
  Rect,
  Symbol: MarkSymbol,
  ShadowRoot: MarkShadowRoot,
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
} = require('@visactor/vrender-core');
const {
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
} = require('@visactor/vrender-kits');

global.__DEV__ = true;
global.__VERSION__ = true;

function createArc(attributes) {
  return new Arc(attributes);
}
function createArc3d(attributes) {
  return new Arc3d(attributes);
}
function createPyramid3d(attributes) {
  return new Pyramid3d(attributes);
}
function createArea(attributes) {
  return new Area(attributes);
}
function createCircle(attributes) {
  return new Circle(attributes);
}
function createGroup(attributes) {
  return new Group(attributes);
}
function createLine(attributes) {
  return new Line(attributes);
}
function createPath(attributes) {
  return new Path(attributes);
}
function createRect(attributes) {
  return new Rect(attributes);
}
function createRect3d(attributes) {
  return new Rect3d(attributes);
}
function createGlyph(attributes) {
  return new Glyph(attributes);
}
function createText(attributes) {
  return new Text(attributes);
}
function createWrapText(attributes) {
  return new WrapText(attributes);
}
function createSymbol(attributes) {
  return new MarkSymbol(attributes);
}
function createImage(attributes) {
  return new Image(attributes);
}
function createPolygon(attributes) {
  return new Polygon(attributes);
}
function createShadowRoot(graphic) {
  return new MarkShadowRoot(graphic);
}
function createRichText(attributes) {
  return new RichText(attributes);
}

const obj = {
  arc: createArc,
  arc3d: createArc3d,
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
