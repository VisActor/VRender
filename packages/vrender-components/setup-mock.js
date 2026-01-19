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
  isBrowserEnv
} = require('@visactor/vrender-core');

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
