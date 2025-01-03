// 存放公共属性
import { Logger, Matrix, pi2 } from '@visactor/vutils';
import { CustomPath2D } from '../common/custom-path2d';
import {
  type IArcGraphicAttribute,
  type IAreaGraphicAttribute,
  type IGraphicAttribute,
  type ICircleGraphicAttribute,
  type IFillStyle,
  type IGlyphGraphicAttribute,
  type IGroupGraphicAttribute,
  type IImageGraphicAttribute,
  type ILineGraphicAttribute,
  type IPathGraphicAttribute,
  type IPolygonGraphicAttribute,
  type IRect3dGraphicAttribute,
  type IRectGraphicAttribute,
  type IStrokeStyle,
  type IGraphicStyle,
  type ISymbolGraphicAttribute,
  type ITextAttribute,
  type ITextGraphicAttribute,
  type IRichTextGraphicAttribute,
  type ITransform,
  type RichTextWordBreak,
  type RichTextVerticalDirection,
  type RichTextGlobalAlignType,
  type RichTextGlobalBaselineType,
  type IRichTextIconGraphicAttribute,
  type IConnectedStyle,
  type ILayout,
  type IDebugType,
  type IPickStyle,
  MeasureModeEnum
} from '../interface';

export const DefaultLayout: ILayout = {
  alignSelf: 'auto'
};

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
  scaleCenter: [0, 0],
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
  maxWidth: Infinity,
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
  lineHeight: undefined,
  underline: 0,
  lineThrough: 0,
  scaleIn3d: false,
  direction: 'horizontal',
  wordBreak: 'break-all',
  ignoreBuf: false,
  verticalMode: 0,
  wrap: false,
  whiteSpace: 'no-wrap',
  heightLimit: Infinity,
  lineClamp: Infinity,
  suffixPosition: 'end',
  underlineDash: [],
  underlineOffset: 0,
  disableAutoClipedPoptip: undefined,
  measureMode: MeasureModeEnum.fontBounding,
  keepCenterInLine: false
};

export const DefaultPickStyle: IPickStyle = {
  pickStrokeBuffer: 0
};

export const DefaultStyle: IGraphicStyle = {
  forceBoundsWidth: undefined,
  forceBoundsHeight: undefined,
  opacity: 1,
  background: null,
  backgroundOpacity: 1,
  backgroundCornerRadius: 0,
  texture: null,
  textureColor: 'black',
  textureSize: 10,
  texturePadding: 2,
  backgroundMode: 'no-repeat',
  backgroundFit: true,
  blur: 0,
  cursor: null,
  html: null,
  react: null,
  ...DefaultFillStyle,
  ...DefaultStrokeStyle,
  ...DefaultLayout,
  ...DefaultPickStyle
};

export const DefaultConnectAttribute: Required<IConnectedStyle> = {
  connectedType: 'none',
  // connectedStyle: {
  //   stroke: DefaultStrokeStyle.stroke,
  //   strokeOpacity: DefaultStrokeStyle.strokeOpacity,
  //   lineDash: DefaultStrokeStyle.lineDash,
  //   lineDashOffset: DefaultStrokeStyle.lineDashOffset,
  //   lineCap: DefaultStrokeStyle.lineCap,
  //   lineJoin: DefaultStrokeStyle.lineJoin,
  //   lineWidth: DefaultStrokeStyle.lineWidth,
  //   fill: DefaultFillStyle.fill,
  //   fillOpacity: DefaultFillStyle.fillOpacity
  // },
  connectedStyle: {}, // 默认全都继承父属性
  connectedX: NaN,
  connectedY: NaN
} as IConnectedStyle;

export const DefaultDebugAttribute: Required<IDebugType> = {
  _debug_bounds: false
};

export const DefaultAttribute: Required<IGraphicAttribute> = {
  strokeSeg: null,
  renderable: true,
  pickable: true,
  shadowGraphic: undefined,
  childrenPickable: true,
  fillPickable: true,
  strokePickable: true,
  visible: true,
  zIndex: 0,
  layout: null,
  boundsPadding: 0,
  fillStrokeOrder: 0,
  renderStyle: 'default',
  pickMode: 'accurate',
  customPickShape: null,
  boundsMode: 'accurate',
  keepDirIn3d: true,
  shadowRootIdx: 1,
  globalZIndex: 1,
  globalCompositeOperation: '',
  overflow: 'hidden',
  shadowPickMode: 'graphic',
  keepStrokeScale: false,
  ...DefaultDebugAttribute,
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
  innerPadding: 0,
  outerPadding: 0,
  cornerRadius: 0,
  padRadius: 0,
  padAngle: 0,
  cap: false,
  forceShowCap: false
};

export const DefaultAreaAttribute: Required<IAreaGraphicAttribute> = {
  ...DefaultAttribute,
  ...DefaultConnectAttribute,
  points: [],
  segments: [],
  curveType: 'linear',
  clipRange: 1,
  closePath: false,
  curveTension: 1
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
  cornerRadius: 0,
  path: [],
  clip: false,
  visibleAll: true,
  display: 'relative',
  flexDirection: 'row',
  flexWrap: 'wrap',
  justifyContent: 'flex-start',
  alignItems: 'flex-start',
  alignContent: 'flex-start',
  baseOpacity: 1
};

export const DefaultGlyphAttribute: Required<IGlyphGraphicAttribute> = {
  ...DefaultAttribute,
  path: '',
  width: 0,
  height: 0,
  cornerRadius: 0,
  clip: false
};

export const DefaultLineAttribute: Required<ILineGraphicAttribute> = {
  ...DefaultAttribute,
  ...DefaultConnectAttribute,
  points: [],
  segments: [],
  curveType: 'linear',
  clipRange: 1,
  clipRangeByDimension: 'default',
  closePath: false,
  curveTension: 1
};

export const DefaultPathAttribute: Required<IPathGraphicAttribute> = {
  ...DefaultAttribute,
  path: new CustomPath2D(),
  fillStrokeOrder: 1,
  customPath: () => {
    Logger.getInstance().warn('空函数');
  }
};

export const DefaultPolygonAttribute: Required<IPolygonGraphicAttribute> = {
  ...DefaultAttribute,
  points: [],
  cornerRadius: 0,
  closePath: true
};

export const DefaultRectAttribute: Required<IRectGraphicAttribute> = {
  ...DefaultAttribute,
  width: 0,
  height: 0,
  x1: 0,
  y1: 0,
  strokeBoundsBuffer: 0,
  cornerRadius: 0
};

export const DefaultRect3dAttribute: Required<IRect3dGraphicAttribute> = {
  ...DefaultAttribute,
  width: 0,
  height: 0,
  x1: 0,
  y1: 0,
  cornerRadius: 0,
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
  ...DefaultTextStyle,
  editable: false,
  width: 300,
  height: 300,
  ellipsis: true,
  wordBreak: 'break-word' as RichTextWordBreak,
  verticalDirection: 'top' as RichTextVerticalDirection,
  textAlign: 'left' as RichTextGlobalAlignType,
  textBaseline: 'top' as RichTextGlobalBaselineType,
  layoutDirection: 'horizontal',
  textConfig: [],
  disableAutoWrapLine: false,
  maxHeight: undefined,
  maxWidth: undefined,
  singleLine: false
};

export const DefaultImageAttribute: Required<IImageGraphicAttribute> = {
  repeatX: 'no-repeat',
  repeatY: 'no-repeat',
  image: '',
  width: 0,
  height: 0,
  ...DefaultAttribute,
  fill: true,
  cornerRadius: 0
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
