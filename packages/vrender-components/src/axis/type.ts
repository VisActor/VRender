import type {
  IGraphicAttribute,
  ILineGraphicAttribute,
  SymbolType,
  ITextGraphicAttribute,
  ISymbolGraphicAttribute,
  IRectGraphicAttribute,
  IGroupGraphicAttribute
} from '@visactor/vrender';
import type { Dict } from '@visactor/vutils';
import type { Point } from '../core/type';
import type { SegmentAttributes } from '../segment';
import type { TagAttributes } from '../tag';

export type AxisItemStateStyle<T> = {
  hover?: T;
  hover_reverse?: T;
  selected?: T;
  selected_reverse?: T;
};

export type callbackFunc<T> = (datum: Dict<any>, index: number, data?: Dict<any>[], layer?: number) => T;

// 处理过的用于绘制的 tickLine 数据
export type TickLineItem = {
  start: Point;
  end: Point;
  /** 归一化后的数据 */
  value: number;
  // 3d数据
  anchor?: [number, number];
  alpha?: number;
  beta?: number;
  [key: string]: any;
};

// 处理过的用于绘制的数据
export type TransformedAxisItem = AxisItem & {
  point: Point;
};

export type AxisItem = {
  /** 标识符，用于动画以及图形查找 */
  id?: string;
  /** 显示文本 */
  label: string;
  /** 归一化后的数据 */
  value: number;
  /** 对应原始数据 */
  rawValue: any;
  [key: string]: any;
};

export type GridItem = {
  /**
   * 标识符
   */
  id?: string | number;
  /** 网格线点集合 */
  points: Point[];
  [key: string]: any;
};

// 网格线配置
export type GridBaseAttributes = {
  type: 'line' | 'circle' | 'polygon';
  /**
   * 网格线绘制点数据
   */
  items: GridItem[];
  /**
   * 栅格线是否封闭
   */
  closed?: boolean;
  /**
   * 线样式配置
   */
  style?: ILineGraphicAttribute | callbackFunc<Partial<ILineGraphicAttribute> | undefined>;
  /**
   * 两个栅格线间的填充色
   */
  alternateColor?: string | string[];
  /**
   * 网格线的绘图层级
   */
  zIndex?: number;
  /** grid 是否与 label 对齐 */
  alignWithLabel?: boolean;
} & IGroupGraphicAttribute;

export type LineGridAttributes = {
  type: 'line';
  /**
   * 当用户配置了 alternateColor 属性时，填充区域是否进行弧线连接
   */
  smoothLink?: boolean;
  center?: Point;
  /**
   * 3d网格线的深度
   */
  depth?: number;
} & GridBaseAttributes;

export type PolygonGridAttributes = {
  type: 'polygon';
} & GridBaseAttributes;

export type CircleGridAttributes = {
  type: 'circle';
  /**
   * 用于圆弧型网格线的圆心位置声明
   */
  center: Point;
} & GridBaseAttributes;

export type GridAttributes = LineGridAttributes | CircleGridAttributes | PolygonGridAttributes;

export interface AxisBaseAttributes extends IGroupGraphicAttribute {
  /**
   * 是否开启选中交互
   * @default false
   */
  select?: boolean;
  /**
   * 是否开启 hover 交互
   * @default false
   */
  hover?: boolean;
  /**
   * 垂直于坐标轴方向的因子，默认为 1
   */
  verticalFactor?: number;
  /** 坐标轴数据 */
  items: AxisItem[][];
  /**
   * 坐标轴组件可占用尺寸，用于组件内部的约束性布局
   */
  layoutSize?: [number, number];
  /**
   * 轴标题配置
   */
  title?: TitleAttributes;
  /**
   * 轴标签配置
   */
  label?: LabelAttributes;
  /**
   * 轴刻度线配置
   */
  tick?: TickAttributes;
  /**
   * 自刻度线配置
   */
  subTick?: SubTickAttributes;
  /**
   * 轴线配置
   */
  line?: LineAttributes;
  /**
   * 网格线配置
   */
  grid?: LineAxisGridAttributes | CircleAxisGridAttributes;
  /**
   * 子刻度对应网格线配置
   */
  subGrid?: SubGridAttributesForAxis;
  /**
   * 坐标轴背景配置
   */
  panel?: {
    /**
     * 是否绘制坐标轴背景
     */
    visible?: boolean;
    /**
     * 坐标轴背景配置
     */
    style?: Partial<IRectGraphicAttribute>;
    /**
     * 坐标轴背景交互状态样式配置
     */
    state?: AxisItemStateStyle<Partial<IRectGraphicAttribute>>;
  };
}

export type LineGridOfLineAxisAttributes = Omit<LineGridAttributes, 'items'> & {
  /**
   * 是否展示网格线
   */
  visible?: boolean;
  /**
   * 网格线的长度
   */
  length: number;
};

export type PolarGridOfLineAxisAttributes = (
  | Omit<PolygonGridAttributes, 'items'>
  | Omit<CircleGridAttributes, 'items'>
) & {
  /**
   * 是否展示网格线
   */
  visible?: boolean;
  /**
   * 圆心
   */
  center?: Point;
  /**
   * 边数
   */
  sides?: number;
  /**
   * **弧度值**，起始弧度，默认 -0.5 * Math.PI
   *
   */
  startAngle?: number;
  /**
   * **弧度值**，结束弧度，默认 1.5 * Math.PI
   */
  endAngle?: number;
};

export type LineAxisGridAttributes = LineGridOfLineAxisAttributes | PolarGridOfLineAxisAttributes;
export type SubGridAttributesForAxis = {
  /**
   * 是否展示网格线
   */
  visible?: boolean;
} & Pick<GridBaseAttributes, 'alternateColor' | 'style' | 'zIndex'>;

export interface ILine3dType {
  alpha: number;
  anchor3d?: [number, number];
}

export interface IGrid3dType {
  beta: number;
  anchor3d?: [number, number];
}

export interface LineAxisAttributes extends AxisBaseAttributes {
  /**
   * 起始点坐标
   */
  start: Point;
  /**
   * 结束点坐标
   */
  end: Point;
  /**
   * 网格线配置
   */
  grid?: LineAxisGridAttributes;
}

export interface CircleAxisGridAttributes extends Omit<LineGridAttributes, 'items'> {
  type: 'line';
  /**
   * 是否展示网格线
   */
  visible?: boolean;
}

export interface CircleAxisAttributes extends AxisBaseAttributes {
  /**
   * 当配置了 innerRadius 时，可以通过设置 inside: true，将坐标轴战士在内圆半径上。
   * @default false
   */
  inside?: boolean;
  /**
   * 圆心坐标
   */
  center: Point;
  /**
   * **弧度值**，起始弧度，默认 -0.5 * Math.PI
   *
   */
  startAngle?: number;
  /**
   * **弧度值**，结束弧度，默认 1.5 * Math.PI
   */
  endAngle?: number;
  /**
   * 半径
   */
  radius: number;
  /** 内半径 */
  innerRadius?: number;
  /**
   * 网格线配置
   */
  grid?: CircleAxisGridAttributes;
}

// 坐标轴标题配置
export interface TitleAttributes extends Omit<TagAttributes, 'shape' | 'space' | 'text' | 'panel' | 'state'> {
  /**
   * 是否展示标题
   */
  visible?: boolean;
  /**
   * 标题的显示位置，默认 'middle'
   */
  position?: 'start' | 'middle' | 'end';
  /**
   * 标题距离坐标轴(轴线、刻度、标签共同构成的包围盒)的距离
   */
  space?: number;
  /**
   * 标题是否自动旋转以和坐标轴平行
   */
  autoRotate?: boolean;
  /**
   * 文本内容，如果需要进行换行，则使用数组形式，如 ['abc', '123']
   */
  text?: string | string[] | number | number[];
  shape?: {
    /**
     * 是否展示 shape
     */
    visible?: boolean;
    /**
     * shape 同 文本的间距
     */
    space?: number;
    style?: Omit<Partial<ISymbolGraphicAttribute>, 'visible'>;
  };
  /**
   * 背景设置
   */
  background?: {
    /**
     * 是否绘制背景层
     */
    visible?: boolean;
    /**
     * 背景层样式
     */
    style?: Omit<Partial<IRectGraphicAttribute>, 'visible' | 'width' | 'height'>;
  };

  /**
   * 交互状态样式配置
   */
  state?: {
    /**
     * text 文本的状态配置
     */
    text?: AxisItemStateStyle<Partial<ITextGraphicAttribute>>;
    /**
     * shape 标记的状态配置
     */
    shape?: AxisItemStateStyle<Partial<ISymbolGraphicAttribute>>;
    /**
     * panel 背景的状态配置
     */
    background?: AxisItemStateStyle<Partial<IRectGraphicAttribute>>;
  };
}
// 坐标轴线配置
export interface LineAttributes extends Pick<SegmentAttributes, 'startSymbol' | 'endSymbol'> {
  /**
   * 是否展示轴线
   */
  visible?: boolean;
  /**
   * TODO: 待支持
   * 坐标轴截断范围，当需要对坐标轴轴线截断时，可配置该属性
   */
  breakRange?: [number, number];
  /**
   * TODO: 待支持
   * 截断区域的形状
   */
  breakShape?: SymbolType | [SymbolType, SymbolType];
  /**
   * TODO: 待支持
   * 截断图形样式
   */
  breakShapeStyle?: Partial<IGraphicAttribute>;
  /**
   * 线的样式配置
   */
  style?: Partial<ILineGraphicAttribute>;
  state?: AxisItemStateStyle<Partial<ILineGraphicAttribute>>;
}

// 轴刻度线配置
export interface TickAttributes {
  /** 是否显示轴刻度线 */
  visible: boolean;
  /**
   * 刻度线朝向，默认朝外(坐标线包围盒外部)
   * @default false
   */
  inside?: boolean;
  /**
   * tick 是否与 label 对齐
   * @default true
   */
  alignWithLabel?: boolean;
  /**
   * 刻度线的长度
   */
  length?: number;
  /**
   * 刻度线样式配置
   */
  style?: Partial<ILineGraphicAttribute> | callbackFunc<Partial<ILineGraphicAttribute> | undefined>;
  state?: AxisItemStateStyle<Partial<ILineGraphicAttribute>>;
  /**
   * 用于 tick 的数据过滤
   * @param data
   * @returns
   */
  dataFilter?: (data: AxisItem[]) => AxisItem[];
}

// 子轴刻度线配置
export interface SubTickAttributes {
  /** 是否显示子轴刻度线 */
  visible: boolean;
  /**
   * TODO: 考虑下 log 轴，自刻度线之间的间距是不均匀的问题
   * 子刻度个数
   */
  count?: number;
  /**
   * 子刻度线朝向，默认朝外(坐标线包围盒外部)
   * @default false
   */
  inside?: boolean;
  /**
   * 子刻度线的长度
   */
  length?: number;
  /**
   * 子刻度线样式配置
   */
  style?: Partial<ILineGraphicAttribute> | callbackFunc<Partial<ILineGraphicAttribute> | undefined>;
  state?: AxisItemStateStyle<Partial<ILineGraphicAttribute>>;
}

export interface LabelLayoutConfig {
  type: 'autoHide' | 'autoRotate' | 'autoEllipsis' | 'custom';
  [key: string]: any;
}

export interface LabelAttributes {
  /** 是否展示标签 */
  visible: boolean;
  /**
   * 标签朝向，默认朝外(坐标线包围盒外部)
   * @default false
   */
  inside?: boolean;
  /** 标签同 tick 之间的间距 */
  space?: number;
  /**
   * 格式化文本回调
   * @param text 文本原始值
   * @param item 对应的图形元素
   * @param index 文本索引顺序
   * @returns 格式化文本
   */
  formatMethod?: (value: string, datum: Dict<any>, index: number, data?: Dict<any>[], layer?: number) => string;
  /**
   * 文本样式
   */
  style?: Partial<ITextGraphicAttribute> | callbackFunc<Partial<ITextGraphicAttribute> | undefined>;
  /**
   * TODO：待确定逻辑及配置
   * 标签防重叠布局配置
   */
  layouts?: LabelLayoutConfig[];
  state?: AxisItemStateStyle<Partial<ITextGraphicAttribute>>;

  /**
   * 用于 label 的数据过滤
   * @param data
   * @param layer
   * @returns
   */
  dataFilter?: (data: AxisItem[], layer: number) => AxisItem[];
}
