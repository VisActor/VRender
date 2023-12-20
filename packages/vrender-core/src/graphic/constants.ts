import { genNumberType } from './tools';

export const ARC_NUMBER_TYPE = genNumberType();
export const ARC3D_NUMBER_TYPE = genNumberType();
export const AREA_NUMBER_TYPE = genNumberType();
export const CIRCLE_NUMBER_TYPE = genNumberType();
export const GLYPH_NUMBER_TYPE = genNumberType();
export const GROUP_NUMBER_TYPE = genNumberType();
export const IMAGE_NUMBER_TYPE = genNumberType();
export const LINE_NUMBER_TYPE = genNumberType();
export const PATH_NUMBER_TYPE = genNumberType();
export const POLYGON_NUMBER_TYPE = genNumberType();
export const PYRAMID3D_NUMBER_TYPE = genNumberType();
export const RECT_NUMBER_TYPE = genNumberType();
export const RECT3D_NUMBER_TYPE = genNumberType();
export const RICHTEXT_NUMBER_TYPE = genNumberType();
export const SYMBOL_NUMBER_TYPE = genNumberType();
export const TEXT_NUMBER_TYPE = genNumberType();

export const GraphicService = Symbol.for('GraphicService');
export const GraphicCreator = Symbol.for('GraphicCreator');

export const SVG_ATTRIBUTE_MAP = {
  'stroke-linecap': 'lineCap',
  'stroke-linejoin': 'lineJoin',
  'stroke-dasharray': 'lineDash',
  'stroke-dashoffset': 'lineDashOffset',
  'stroke-width': 'lineWidth',
  'fill-opacity': 'fillOpacity',
  'stroke-opacity': 'strokeOpacity'
};

export const SVG_ATTRIBUTE_MAP_KEYS = Object.keys(SVG_ATTRIBUTE_MAP);

export const SVG_PARSE_ATTRIBUTE_MAP = {
  'stroke-linecap': 'lineCap',
  'stroke-linejoin': 'lineJoin',
  'stroke-dasharray': 'lineDash',
  'stroke-dashoffset': 'lineDashOffset',
  'stroke-width': 'lineWidth',
  'fill-opacity': 'fillOpacity',
  'stroke-opacity': 'strokeOpacity',
  stroke: 'stroke',
  fill: 'fill'
};

export const SVG_PARSE_ATTRIBUTE_MAP_KEYS = Object.keys(SVG_PARSE_ATTRIBUTE_MAP);
