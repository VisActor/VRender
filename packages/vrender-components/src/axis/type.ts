import type {
  ILineGraphicAttribute,
  ITextGraphicAttribute,
  ISymbolGraphicAttribute,
  IRectGraphicAttribute,
  IGroupGraphicAttribute,
  IText,
  IGroup,
  IGraphic
} from '@visactor/vrender-core';
import type { Dict } from '@visactor/vutils';
import type { ContinuousScale, CustomTicksFunc } from '@visactor/vscale';
import type { Point, TextContent } from '../core/type';
import type { SegmentAttributes } from '../segment/type';
import type { TagAttributes } from '../tag/type';

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
  id?: string | number;
  /** 显示文本 */
  label: string | number;
  /** 归一化后的数据 */
  value: number;
  /** 对应原始数据 */
  rawValue: any;
  [key: string]: any;
};

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
  /**
   * 坐标轴的显示位置，用于文本的防重叠处理
   */
  orient?: string;
  /** 坐标轴数据 */
  items: AxisItem[][];
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
   * 关闭交互效果
   * @default false
   */
  disableTriggerEvent?: boolean;
}

export interface ILine3dType {
  alpha: number;
  anchor3d?: [number, number];
}

export interface BreakSymbol {
  /**
   * 是否显示
   */
  visible?: boolean;
  /**
   * 截断图形旋转的弧度。
   */
  angle?: number;

  /**
   * 样式配置
   */
  style?: Partial<ISymbolGraphicAttribute>;
}
export interface AxisBreakProps {
  /**
   * 轴截断的范围，值为归一化后的数据
   */
  range: [number, number];
  /**
   * 截断图形配置
   */
  breakSymbol?: BreakSymbol;
  /**
   * 轴截断原始的数据范围
   */
  rawRange?: [number, number];
}

export interface TransformedAxisBreak extends AxisBreakProps {
  /**
   * 截断的起始点
   */
  startPoint: Point;
  /**
   * 截断的结束点
   */
  endPoint: Point;
}

export interface LineAxisAttributes extends Omit<AxisBaseAttributes, 'label'> {
  /**
   * 起始点坐标
   */
  start: Point;
  /**
   * 结束点坐标
   */
  end: Point;
  /**
   * 坐标轴垂直方向的限制空间，该配置会影响文本的显示，
   * 即如果超出，文本则会进行自动旋转、自动隐藏等动作。
   */
  verticalLimitSize?: number;
  /**
   * 坐标轴垂直方向的最小空间，如果小于该值，则以该值占据显示空间。
   * 如果同时声明了 verticalLimitSize，请保证 verticalMinSize <= verticalLimitSize，否则会以 verticalLimitSize 为准。
   */
  verticalMinSize?: number;

  /**
   * 轴标签配置
   */
  label?: LabelAttributes & {
    /**
     * label 相对于容器整体的对齐方式
     * - `top`：整体向上对齐（垂直方向）
     * - `middle`：整体居中对齐（垂直方向）
     * - `bottom`：整体向下对齐（垂直方向）
     * - `left`：整体向左对齐（水平方向）
     * - `center`：整体居中对齐（水平方向）
     * - `right`：整体向右对齐（水平方向）
     */
    containerAlign?: 'left' | 'right' | 'center' | 'top' | 'bottom' | 'middle';
    /**
     * 坐标轴首尾文字向内收缩
     * @default false
     */
    flush?: boolean;
    /**
     * 保证最后的label必须展示
     * @default false
     * @since 0.17.10
     */
    lastVisible?: boolean;
    /**
     * 保证第一个的label必须展示
     * @default false
     * @since 0.20.7
     */
    firstVisible?: boolean;
  };
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

  /**
   * 轴截断配置
   * @since 0.20.3
   */
  breaks?: AxisBreakProps[];
}

export interface CircleAxisAttributes extends AxisBaseAttributes {
  /**
   * 坐标轴可用布局区域的大小，之前是通过width,height传入，会影响组件的Bounds大小，影响拾取
   * @since 0.20.11
   */
  size?: { width: number; height: number };
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
   * 边数
   * @since 0.19.24
   */
  sides?: number;
}

// 坐标轴标题配置
export type TitleAttributes = Omit<TagAttributes, 'shape' | 'space' | 'panel' | 'state'> & {
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
};
// 坐标轴线配置
export interface LineAttributes extends Pick<SegmentAttributes, 'startSymbol' | 'endSymbol'> {
  /**
   * 是否展示轴线
   */
  visible?: boolean;
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
  /**
   * 刻度线状态样式配置
   */
  state?: AxisItemStateStyle<Partial<ILineGraphicAttribute> | callbackFunc<Partial<ILineGraphicAttribute> | undefined>>;
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
  /**
   * 子刻度线状态样式配置
   */
  state?: AxisItemStateStyle<Partial<ILineGraphicAttribute> | callbackFunc<Partial<ILineGraphicAttribute> | undefined>>;
}

export type CustomMethod = (items: IText[], separation: number) => IText[];

export interface AxisLabelOverlap {
  /**
   * 自动旋转配置
   * @default false
   */
  autoRotate?: boolean;
  /**
   * 仅当 `autoRotate` 为 true 时生效，可选的旋转范围，默认为 [0, 45, 90]
   * @default [0, 45, 90]
   */
  autoRotateAngle?: number[];
  /**
   * 自动隐藏配置
   * @default false
   */
  autoHide?: boolean;
  /**
   * 防重叠策略，默认为 'parity'。
   * - 'parity': 奇偶校验，使用删除所有其他标签的策略（这对于标准线性轴非常有效）。
   * - 'greedy': 将执行标签的线性扫描，并删除与最后一个可见标签重叠的所有标签。
   * - 也可以传入函数用于自定义策略
   * @default 'parity'
   */
  autoHideMethod?: 'parity' | 'greedy' | CustomMethod;
  /**
   * 仅当 `autoHide` 为 true 时生效，设置文本之间的间隔距离，单位 px
   * @default 0
   */
  autoHideSeparation?: number;
  /**
   * 自动隐藏配置
   * @default false
   */
  autoLimit?: boolean;
  /**
   * 仅当 `autoLimit` 为 true 时生效，省略占位符，默认为 '...'
   * @default '...'
   */
  limitEllipsis?: string;
  /**
   * 文字超出坐标轴范围时，两侧可以提供扩充的空间大小。
   * 例如，x 轴坐标 135 度旋转时，左侧第一个标签可能超出坐标轴范围，导致文本被缩略，此时可以通过配置 `overflowLimitLength` 优化效果。
   * 仅当 `autoLimit` 为 true 时生效。
   * @default 0
   * @since 0.20.3 支持 X 轴配置生效
   */
  overflowLimitLength?:
    | number
    | {
        /**
         * 左侧扩充空间的大小
         */
        left?: number;
        /**
         * 右侧扩充空间的大小
         */
        right?: number;
        // top?: number;
        // bottom?: number;
      };

  /**
   * 自定义布局配置，如果声明了 `layoutFunc`，则默认提供的防重叠相关的配置（`autoHide`, `autoRotate`, `autoLimit`）均不生效
   * @param labels 标签图形元素
   * @param labelData 标签数据
   * @param layer 当前轴的层级
   * @param axis 当前轴组件实例
   * @returns void
   */
  layoutFunc?: (labels: IText[], labelData: AxisItem[], layer: number, axis: IGroup) => void;

  /**
   * 标签自动换行。与 `autoRotate` 不能同时生效，若开启了 `autoRotate`，则优先使用自动旋转策略。
   * @since 0.20.3
   * @default false
   */
  autoWrap?: boolean;
}

export type LabelAttributes = Omit<AxisLabelOverlap, 'text'> &
  TextContent & {
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
     * 文本状态样式配置
     */
    state?: AxisItemStateStyle<
      Partial<ITextGraphicAttribute> | callbackFunc<Partial<ITextGraphicAttribute> | undefined>
    >;

    /**
     * 用于 label 的数据过滤
     * @param data
     * @param layer
     * @returns
     */
    dataFilter?: (data: AxisItem[], layer: number) => AxisItem[];
  };

export type CoordinateType = 'cartesian' | 'polar' | 'geo' | 'none';
export type IOrientType = 'left' | 'top' | 'right' | 'bottom' | 'z';
export type IPolarOrientType = 'radius' | 'angle';

type breakData = {
  /**
   * 截断后的值域范围
   */
  domain?: [number, number][];
  /**
   * 截断后的归一化范围
   */
  scope?: [number, number][];
  /**
   * 用户配置的截断范围
   */
  breakDomains: [number, number][];
};

export interface ITickDataOpt {
  /**
   * 是否进行轴采样
   */
  sampling?: boolean;
  tickCount?: number | ((option: ITickCallbackOption) => number);
  forceTickCount?: number;
  tickStep?: number;
  tickMode?: 'average' | 'd3' | string | CustomTicksFunc<ContinuousScale>;
  noDecimals?: boolean;

  coordinateType: CoordinateType;
  axisOrientType: IOrientType | IPolarOrientType;
  startAngle?: number;

  labelFormatter?: (value: any) => string;
  labelStyle: ITextGraphicAttribute;
  labelGap?: number;
  labelFirstVisible?: boolean;
  labelLastVisible?: boolean;
  /**
   * 截断数据范围配置
   */
  breakData?: () => breakData;
}

export interface ICartesianTickDataOpt extends ITickDataOpt {
  axisOrientType: IOrientType;
  labelFlush: boolean;
  /**
   * 截断数据范围配置
   */
  breakData?: () => breakData;
}

export interface IPolarTickDataOpt extends ITickDataOpt {
  axisOrientType: IPolarOrientType;
  getRadius: () => number;
  labelOffset: number;
  inside: boolean;
}

export interface ITickData {
  index: number;
  value: number | string;
  // label: string;
}

export type ITickCallbackOption = {
  /**
   * 坐标轴占据的画布大小。
   * 直角坐标系中为轴的宽度或高度。
   * 极坐标系中半径轴的长度。
   */
  axisLength?: number;
  /**
   * 轴标签的样式
   */
  labelStyle?: ITextGraphicAttribute;
};

export interface ILabelItem<T> extends Pick<IGraphic, 'AABBBounds'> {
  value?: T;
}
