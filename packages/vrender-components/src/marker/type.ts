import type {
  EasingType,
  IArcGraphicAttribute,
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
import type {
  ArcSegmentAttributes,
  CommonSegmentAttributes,
  ILineGraphicWithCornerRadius,
  SegmentAttributes,
  SymbolAttributes
} from '../segment';
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

export enum IMarkCommonArcLabelPosition {
  arcInnerStart = 'arcInnerStart',
  arcInnerEnd = 'arcInnerEnd',
  arcInnerMiddle = 'arcInnerMiddle',
  arcOuterStart = 'arcOuterStart',
  arcOuterEnd = 'arcOuterEnd',
  arcOuterMiddle = 'arcOuterMiddle',
  center = 'center'
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

export type MarkerAttrs<AnimationType> = IGroupGraphicAttribute & {
  type?: 'line' | 'arc-line' | 'area' | 'arc-area' | 'point';
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
} & BaseMarkerAnimation<AnimationType>;

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

export type MarkCommonLineAnimationType = 'clipIn' | 'fadeIn';

export type CommonMarkAreaAnimationType = 'fadeIn';

export type MarkPointAnimationType = 'callIn' | 'fadeIn';

export type MarkerExitAnimation = {
  type: 'fadeOut';
  duration?: number;
  delay?: number;
  easing?: EasingType;
};

export type MarkerAnimationState = 'enter' | 'update' | 'exit';

/** state type */
export type MarkCommonLineState<LineAttr> = {
  line?: State<LineAttr>;
  lineStartSymbol?: State<Partial<ISymbolGraphicAttribute>>;
  lineEndSymbol?: State<Partial<ISymbolGraphicAttribute>>;
  label?: State<Partial<ITextGraphicAttribute>>;
  labelBackground?: State<Partial<IRectGraphicAttribute>>;
};

export type CommonMarkAreaState<AreaAttr> = {
  area?: State<Partial<AreaAttr>>;
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

export type MarkCommonLineAttrs<LineAttr, LineLabelPosition, MarkCommonLineAnimationType> =
  MarkerAttrs<MarkCommonLineAnimationType> &
    Omit<CommonSegmentAttributes, 'state' | 'lineStyle'> & {
      /**
       * 标签
       */
      label?: {
        /**
         * label 相对line的位置
         */
        position?: LineLabelPosition;
        /**
         * 当 mark 配置了 limitRect 之后，label 是否自动调整位置
         * @default false
         */
        confine?: boolean;
      } & IMarkRef &
        IMarkLabel;
      state?: MarkCommonLineState<LineAttr>;
    };

export type MarkLineAttrs = MarkCommonLineAttrs<
  ILineGraphicWithCornerRadius | ILineGraphicAttribute[],
  keyof typeof IMarkLineLabelPosition,
  MarkCommonLineAnimationType
> & {
  type?: 'line';
  /**
   * 是否对 points 进行多段处理，默认为 false，即直接将所有的点连接成线。
   * 如果需要进行多段处理，需要将 points 属性配置为 Point[][] 类型
   * @default false
   */
  multiSegment?: boolean;
  /**
   * 在 `multiSegment` 属性开启的前提下，用于声明那一段线段用来作为主线段，如果不声明，默认全段为主线段
   */
  mainSegmentIndex?: number;
  /**
   * 构成line的点: 如果是两个点，则为直线；多个点则为曲线
   */
  points: Point[] | Point[][];
  lineStyle?: ILineGraphicAttribute;
};

export type MarkArcLineAttrs = MarkCommonLineAttrs<
  IArcGraphicAttribute,
  keyof typeof IMarkCommonArcLabelPosition,
  MarkCommonLineAnimationType
> & {
  type?: 'arc-line';
  /**
   * 弧线中心位置
   */
  center: {
    x: number;
    y: number;
  };
  /**
   * 弧线半径
   */
  radius: number;
  /**
   * 弧线起始角度（弧度）
   */
  startAngle: number;
  /**
   * 弧线终点角度（弧度）
   */
  endAngle: number;
  lineStyle?: IArcGraphicAttribute;
};

export type MarkAreaAttrs = MarkerAttrs<CommonMarkAreaAnimationType> & {
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

  state?: CommonMarkAreaState<IPolygonGraphicAttribute>;
};

export type MarkArcAreaAttrs = MarkerAttrs<CommonMarkAreaAnimationType> & {
  type?: 'arc-area';
  /**
   * 扇区中心位置
   */
  center: {
    x: number;
    y: number;
  };
  /**
   * 扇区内半径
   */
  innerRadius: number;
  /**
   * 扇区外半径
   */
  outerRadius: number;
  /**
   * 扇区起始角度（弧度）
   */
  startAngle: number;
  /**
   * 扇区终点角度（弧度）
   */
  endAngle: number;
  /**
   * 标签
   */
  label?: {
    position?: keyof typeof IMarkCommonArcLabelPosition;
    /**
     * 当 mark 配置了 limitRect 之后，label 是否自动调整位置
     * @default false
     */
    confine?: boolean;
  } & IMarkRef &
    IMarkLabel;
  /**
   * area的样式
   */
  areaStyle?: IArcGraphicAttribute;

  state?: CommonMarkAreaState<IArcGraphicAttribute>;
};

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

export type MarkPointAttrs = Omit<MarkerAttrs<MarkPointAnimationType>, 'labelStyle'> & {
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
