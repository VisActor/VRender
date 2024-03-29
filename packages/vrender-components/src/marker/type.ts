import type {
  EasingType,
  IGroup,
  IGroupGraphicAttribute,
  IImageGraphicAttribute,
  ILineGraphicAttribute,
  IPolygonAttribute,
  IPolygonGraphicAttribute,
  IRectGraphicAttribute,
  IRichTextGraphicAttribute,
  ISymbolGraphicAttribute,
  ITextGraphicAttribute
} from '@visactor/vrender-core';
import type { ILineGraphicWithCornerRadius, SegmentAttributes, SymbolAttributes } from '../segment';
import type { TagAttributes } from '../tag';
import type { Point, State } from '../core/type';

export enum IMarkLineLabelPosition {
  start = 'start',
  middle = 'middle',
  end = 'end',
  insideStartTop = 'insideStartTop',
  insideStartBottom = 'insideStartBottom',
  insideMiddleTop = 'insideMiddleTop',
  insideMiddleBottom = 'insideMiddleBottom',
  insideEndTop = 'insideEndTop',
  insideEndBottom = 'insideEndBottom'
}

export enum IMarkAreaLabelPosition {
  left = 'left',
  right = 'right',
  top = 'top',
  bottom = 'bottom',
  middle = 'middle',
  insideLeft = 'insideLeft',
  insideRight = 'insideRight',
  insideTop = 'insideTop',
  insideBottom = 'insideBottom'
}

export enum IMarkPointItemPosition {
  top = 'top',
  bottom = 'bottom',
  middle = 'middle',
  insideTop = 'insideTop',
  insideBottom = 'insideBottom',
  insideMiddle = 'insideMiddle'
}

export type IMarkBackgroundAttributes = {
  /**
   * 是否绘制背景层
   */
  visible: boolean;
  /**
   * TODO: 根据文字宽度进行背景 panel size自适应
   */
  autoHeight?: boolean;
  /**
   * TODO: 根据文高度度进行背景 panel size自适应
   */
  autoWidth?: boolean;
} & Partial<SymbolAttributes>;

export type IMarkLabel = Omit<TagAttributes, 'x' | 'y' | 'panel'> & {
  /**
   * 标签的背景面板配置
   */
  panel?: IMarkBackgroundAttributes;
};

export type IMarkRef = {
  /**
   * 自动旋转，沿着线的方向，默认 true
   */
  autoRotate?: boolean;
  /**
   * label 相对line平行方向上的偏移
   */
  refX?: number;
  /**
   * label 相对line正交方向上的偏移
   */
  refY?: number;
  /**
   * label 相对默认角度的偏移 （label跟随line的角度做自动旋转时，默认按照line的平行向量作为初始角度）
   */
  refAngle?: number;
};

export type MarkerAttrs = IGroupGraphicAttribute & {
  type?: 'line' | 'area' | 'point';
  /**
   * 是否支持交互
   * @default true
   */
  interactive?: boolean;
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
   * 是否显示marker组件
   * @default true
   */
  visible?: boolean;
  /**
   * 是否将组件在绘制区域内进行剪切
   * @default true
   */
  clipInRange?: boolean;
  /**
   * 组件绘制范围配置
   */
  limitRect?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
};

/** animation type */
export type BaseMarkerAnimation<T> = {
  animation?: MarkerAnimation<T> | boolean;
  animationEnter?: MarkerUpdateAnimation<T>;
  animationUpdate?: MarkerUpdateAnimation<T>;
  animationExit?: MarkerExitAnimation;
};
export type MarkerAnimation<T> = MarkerUpdateAnimation<T> | MarkerUpdateAnimation<T>;

export type MarkerUpdateAnimation<T> = {
  type: T;
} & MarkerExitAnimation;

export type MarkLineAnimationType = 'clipIn' | 'fadeIn';

export type MarkAreaAnimationType = 'fadeIn';

export type MarkPointAnimationType = 'callIn' | 'fadeIn';

export type MarkerExitAnimation = {
  duration?: number;
  delay?: number;
  easing?: EasingType;
};

/** state type */
export type MarkLineState = {
  line?: State<ILineGraphicWithCornerRadius | Partial<ILineGraphicAttribute>[]>;
  lineStartSymbol?: State<Partial<ISymbolGraphicAttribute>>;
  lineEndSymbol?: State<Partial<ISymbolGraphicAttribute>>;
  label?: State<Partial<ITextGraphicAttribute>>;
  labelBackground?: State<Partial<IRectGraphicAttribute>>;
};

export type MarkAreaState = {
  area?: State<Partial<IPolygonGraphicAttribute>>;
  label?: State<Partial<ITextGraphicAttribute>>;
  labelBackground?: State<Partial<IRectGraphicAttribute>>;
};

export type MarkPointState = {
  line?: State<ILineGraphicWithCornerRadius | Partial<ILineGraphicAttribute>[]>;
  lineStartSymbol?: State<Partial<ISymbolGraphicAttribute>>;
  lineEndSymbol?: State<Partial<ISymbolGraphicAttribute>>;
  symbol?: State<Partial<ISymbolGraphicAttribute>>;
  image?: State<Partial<IImageGraphicAttribute>>;
  text?: State<Partial<ITextGraphicAttribute>>;
  textBackground?: State<Partial<IRectGraphicAttribute>>;
  richText?: State<Partial<IRichTextGraphicAttribute>>;
  customMark?: State<Partial<IGroupGraphicAttribute>>;
};

export type MarkLineAttrs = MarkerAttrs &
  Omit<SegmentAttributes, 'state'> & {
    type?: 'line';
    /**
     * 构成line的点: 如果是两个点，则为直线；多个点则为曲线
     */
    points: Point[] | Point[][];

    /**
     * 标签
     */
    label?: {
      /**
       * label 相对line的位置
       */
      position?: keyof typeof IMarkLineLabelPosition;
      /**
       * 当 mark 配置了 limitRect 之后，label 是否自动调整位置
       * @default false
       */
      confine?: boolean;

      state?: MarkLineState;
    } & IMarkRef &
      IMarkLabel;
  } & BaseMarkerAnimation<MarkLineAnimationType>;

export type MarkAreaAttrs = MarkerAttrs & {
  type?: 'area';
  /**
   * 构成area的点
   */
  points: Point[];
  /**
   * 标签
   */
  label?: {
    position?: keyof typeof IMarkAreaLabelPosition;
    /**
     * 当 mark 配置了 limitRect 之后，label 是否自动调整位置
     * @default false
     */
    confine?: boolean;
  } & IMarkLabel;
  /**
   * area的样式
   */
  areaStyle?: IPolygonAttribute;

  state?: MarkAreaState;
} & BaseMarkerAnimation<MarkAreaAnimationType>;

export type IItemContent = IMarkRef & {
  /**
   * 标注类型
   * Tips: 保留'richText'与之前的定义做兼容
   */
  type?: 'symbol' | 'text' | 'image' | 'richText' | 'custom';
  position?: keyof typeof IMarkPointItemPosition;
  /**
   * x 方向偏移量
   */
  offsetX?: number;
  /**
   * y 方向偏移量
   */
  offsetY?: number;
  /**
   * type为symbol时, symbol的样式
   */
  symbolStyle?: ISymbolGraphicAttribute;
  /**
   * type为image时, image的样式
   */
  imageStyle?: IImageGraphicAttribute;
  /**
   * type为text时, text的配置
   * 'text'类型的ItemContent新增三种子类型：'text','rich','html'。配置在textStyle.type上，继承自TagAttributes。
   */
  textStyle?: IMarkLabel;
  /**
   * type为rich text时, rich text的样式
   */
  richTextStyle?: IRichTextGraphicAttribute;
  /**
   * type为custom时，允许以callback的方式传入需要render的item
   */
  renderCustomCallback?: () => IGroup;
  /**
   * 当 mark 配置了 limitRect 之后，label 是否自动调整位置
   * @default false
   */
  confine?: boolean;
};

export type IItemLine = {
  /** TODO：'type-opo' */
  type?: 'type-s' | 'type-do' | 'type-po' | 'type-op';
  visible?: boolean;
  /**
   * 垂直于引导线的装饰线，参考案例: https://observablehq.com/@mikelotis/edmonton-population-history-line-chart
   */
  decorativeLine?: {
    visible?: boolean;
    length?: number;
  };
} & Omit<SegmentAttributes, 'points'>;

export type MarkPointAttrs = Omit<MarkerAttrs, 'labelStyle'> & {
  /**
   * markPoint的位置（也是path的起点）
   */
  position: Point;
  /**
   * 标注引导线
   */
  itemLine?: IItemLine;

  /**
   * 标注内容
   */
  itemContent?: IItemContent;

  state?: MarkPointState;
} & BaseMarkerAnimation<MarkPointAnimationType>;
