// 存放公共属性
import { Matrix, pi2 } from '@visactor/vutils';
import { CustomPath2D } from '../common/custom-path2d';
import {
  IArcGraphicAttribute,
  IAreaGraphicAttribute,
  IGraphicAttribute,
  ICircleGraphicAttribute,
  IFillStyle,
  IGlyphGraphicAttribute,
  IGroupGraphicAttribute,
  IImageGraphicAttribute,
  ILineGraphicAttribute,
  IPathGraphicAttribute,
  IPolygonGraphicAttribute,
  IRect3dGraphicAttribute,
  IRectGraphicAttribute,
  IStrokeStyle,
  IGraphicStyle,
  ISymbolGraphicAttribute,
  ITextAttribute,
  ITextGraphicAttribute,
  IRichTextGraphicAttribute,
  ITransform,
  RichTextWordBreak,
  RichTextVerticalDirection,
  RichTextGlobalAlignType,
  RichTextGlobalBaselineType,
  IRichTextIconGraphicAttribute
} from '../interface';

export const DefaultTransform: ITransform = {
  x: 0,
  y: 0,
  z: 0,
  dx: 0,
  dy: 0,
  dz: 0,
  scrollX: 0,
  scrollY: 0,
  scaleX: 1,
  scaleY: 1,
  scaleZ: 1,
  angle: 0,
  alpha: 0,
  beta: 0,
  anchor: [0, 0],
  anchor3d: [0, 0],
  postMatrix: new Matrix()
};

export const DefaultFillStyle: IFillStyle = {
  fillOpacity: 1,
  fill: false,
  shadowBlur: 0,
  shadowColor: 'black',
  shadowOffsetX: 0,
  shadowOffsetY: 0
};

const commonStroke: Omit<IStrokeStyle, 'outerBorder' | 'innerBorder'> = {
  strokeOpacity: 1,
  lineDash: [],
  lineDashOffset: 0,
  lineWidth: 1,
  lineCap: 'butt',
  lineJoin: 'miter',
  miterLimit: 10,
  strokeBoundsBuffer: 2,
  stroke: false
};

export const DefaultStrokeStyle: IStrokeStyle = {
  outerBorder: { ...commonStroke, distance: 0 },
  innerBorder: { ...commonStroke, distance: 0 },
  ...commonStroke
};

export const DefaultTextStyle: Required<ITextAttribute> = {
  text: '',
  maxLineWidth: Infinity,
  textAlign: 'left',
  textBaseline: 'alphabetic',
  fontSize: 16,
  // @ts-ignore
  fontFamily: `PingFang SC,Microsoft Yahei,system-ui,-apple-system,segoe ui,
    Roboto,Helvetica,Arial,sans-serif, apple color emoji,segoe ui emoji,segoe ui symbol`,
  fontWeight: '',
  ellipsis: '…',
  fontVariant: '',
  fontStyle: '',
  lineHeight: 16,
  underline: 0,
  lineThrough: 0
};

export const DefaultStyle: IGraphicStyle = {
  opacity: 1,
  background: null,
  texture: null,
  textureColor: 'black',
  textureSize: 10,
  texturePadding: 2,
  backgroundMode: 0,
  blur: 0,
  cursor: null,
  ...DefaultFillStyle,
  ...DefaultStrokeStyle
};

export const DefaultAttribute: Required<IGraphicAttribute> = {
  strokeSeg: null,
  pickable: true,
  childrenPickable: true,
  visible: true,
  zIndex: 0,
  layout: null,
  boundsPadding: 0,
  pickMode: 'accurate',
  customPickShape: null,
  boundsMode: 'accurate',
  keepDirIn3d: true,
  ...DefaultStyle,
  ...DefaultTransform
};

export function addAttributeToPrototype(obj: Record<string, any>, c: any, keys: string[]) {
  keys.forEach(key => {
    c.prototype[key] = obj[key];
  });
}
export function rewriteProto(obj: Record<string, any>, c: Record<string, any>) {
  Object.setPrototypeOf(obj, c);
}

export const DefaultArcAttribute: Required<IArcGraphicAttribute> = {
  ...DefaultAttribute,
  startAngle: 0,
  endAngle: pi2,
  innerRadius: 0,
  outerRadius: 1,
  cornerRadius: 0,
  padRadius: 0,
  padAngle: 0,
  cap: false,
  forceShowCap: false
};

export const DefaultAreaAttribute: Required<IAreaGraphicAttribute> = {
  ...DefaultAttribute,
  points: [],
  segments: [],
  curveType: 'linear',
  clipRange: 1
};

export const DefaultCircleAttribute: Required<ICircleGraphicAttribute> = {
  ...DefaultAttribute,
  radius: 1,
  startAngle: 0,
  endAngle: pi2
};

export const DefaultGroupAttribute: Required<IGroupGraphicAttribute> = {
  ...DefaultAttribute,
  width: 0,
  height: 0,
  borderRadius: 0,
  path: [],
  clip: false,
  visibleAll: true
};

export const DefaultGlyphAttribute: Required<IGlyphGraphicAttribute> = {
  ...DefaultAttribute,
  path: '',
  width: 0,
  height: 0,
  borderRadius: 0,
  clip: false
};

export const DefaultLineAttribute: Required<ILineGraphicAttribute> = {
  ...DefaultAttribute,
  points: [],
  segments: [],
  curveType: 'linear',
  clipRange: 1,
  clipRangeByDimension: 'default'
};

export const DefaultPathAttribute: Required<IPathGraphicAttribute> = {
  ...DefaultAttribute,
  path: new CustomPath2D(),
  customPath: () => {
    console.warn('空函数');
  }
};

export const DefaultPolygonAttribute: Required<IPolygonGraphicAttribute> = {
  ...DefaultAttribute,
  points: [],
  borderRadius: 0
};

export const DefaultRectAttribute: Required<IRectGraphicAttribute> = {
  ...DefaultAttribute,
  width: 0,
  height: 0,
  borderRadius: 0
};

export const DefaultRect3dAttribute: Required<IRect3dGraphicAttribute> = {
  ...DefaultAttribute,
  width: 0,
  height: 0,
  borderRadius: 0,
  length: 0
};

export const DefaultSymbolAttribute: Required<ISymbolGraphicAttribute> = {
  ...DefaultAttribute,
  symbolType: 'circle',
  size: 10, // 外接**正方形**的边长
  keepDirIn3d: true
};

export const DefaultTextAttribute: Required<ITextGraphicAttribute> = {
  ...DefaultAttribute,
  ...DefaultTextStyle,
  strokeBoundsBuffer: 0,
  keepDirIn3d: true
};

export const DefaultRichTextAttribute: Required<IRichTextGraphicAttribute> = {
  ...DefaultAttribute,
  width: 300,
  height: 300,
  ellipsis: true,
  wordBreak: 'break-word' as RichTextWordBreak,
  verticalDirection: 'top' as RichTextVerticalDirection,
  textAlign: 'left' as RichTextGlobalAlignType,
  textBaseline: 'top' as RichTextGlobalBaselineType,
  layoutDirection: 'horizontal',
  textConfig: [],
  maxHeight: undefined,
  maxWidth: undefined,
  singleLine: false
};

export const DefaultImageAttribute: Required<IImageGraphicAttribute> = {
  repeatX: 'stretch',
  repeatY: 'stretch',
  image: '',
  width: 0,
  height: 0,
  ...DefaultAttribute,
  fill: true
};

export const DefaultRichTextIconAttribute: Required<IRichTextIconGraphicAttribute> = {
  ...DefaultImageAttribute,
  backgroundShowMode: 'never',
  backgroundWidth: 0,
  backgroundHeight: 0,
  textAlign: 'left',
  textBaseline: 'middle',
  direction: 'horizontal',
  margin: 0,
  id: '',

  width: 20,
  height: 20,
  backgroundFill: 'rgba(101, 117, 168, 0.1)',
  backgroundFillOpacity: 1,
  backgroundStroke: false,
  backgroundStrokeOpacity: 1,
  backgroundRadius: 4,
  opacity: 1
};
