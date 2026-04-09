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
  getLegacyBindingContext,
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
  bindArc3dCanvasPickerContribution,
  bindArcCanvasPickerContribution,
  bindArcMathPickerContribution,
  bindAreaCanvasPickerContribution,
  bindAreaMathPickerContribution,
  bindCircleCanvasPickerContribution,
  bindCircleMathPickerContribution,
  bindGlyphCanvasPickerContribution,
  bindGlyphMathPickerContribution,
  bindImageCanvasPickerContribution,
  bindImageMathPickerContribution,
  bindLineCanvasPickerContribution,
  bindLineMathPickerContribution,
  bindPathCanvasPickerContribution,
  bindPathMathPickerContribution,
  bindPolygonCanvasPickerContribution,
  bindPolygonMathPickerContribution,
  bindPyramid3dCanvasPickerContribution,
  bindRect3dCanvasPickerContribution,
  bindRectCanvasPickerContribution,
  bindRectMathPickerContribution,
  bindRichTextMathPickerContribution,
  bindRichtextCanvasPickerContribution,
  bindSymbolCanvasPickerContribution,
  bindSymbolMathPickerContribution,
  bindTextCanvasPickerContribution,
  bindTextMathPickerContribution
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
const legacyContext = getLegacyBindingContext();
const bindContext = { bind: legacyContext.bind };

arcModule(bindContext);
browser ? bindArcCanvasPickerContribution(legacyContext) : bindArcMathPickerContribution(legacyContext);

rectModule(bindContext);
browser ? bindRectCanvasPickerContribution(legacyContext) : bindRectMathPickerContribution(legacyContext);

lineModule(bindContext);
browser ? bindLineCanvasPickerContribution(legacyContext) : bindLineMathPickerContribution(legacyContext);

areaModule(bindContext);
browser ? bindAreaCanvasPickerContribution(legacyContext) : bindAreaMathPickerContribution(legacyContext);

symbolModule(bindContext);
browser ? bindSymbolCanvasPickerContribution(legacyContext) : bindSymbolMathPickerContribution(legacyContext);

textModule(bindContext);
browser ? bindTextCanvasPickerContribution(legacyContext) : bindTextMathPickerContribution(legacyContext);

circleModule(bindContext);
browser ? bindCircleCanvasPickerContribution(legacyContext) : bindCircleMathPickerContribution(legacyContext);

pathModule(bindContext);
browser ? bindPathCanvasPickerContribution(legacyContext) : bindPathMathPickerContribution(legacyContext);

richtextModule(bindContext);
browser ? bindRichtextCanvasPickerContribution(legacyContext) : bindRichTextMathPickerContribution(legacyContext);

polygonModule(bindContext);
browser ? bindPolygonCanvasPickerContribution(legacyContext) : bindPolygonMathPickerContribution(legacyContext);

imageModule(bindContext);
browser ? bindImageCanvasPickerContribution(legacyContext) : bindImageMathPickerContribution(legacyContext);

glyphModule(bindContext);
browser ? bindGlyphCanvasPickerContribution(legacyContext) : bindGlyphMathPickerContribution(legacyContext);

rect3dModule(bindContext);
bindRect3dCanvasPickerContribution(legacyContext);

arc3dModule(bindContext);
bindArc3dCanvasPickerContribution(legacyContext);

pyramid3dModule(bindContext);
bindPyramid3dCanvasPickerContribution(legacyContext);
