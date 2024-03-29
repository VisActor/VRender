import type {
  IGraphicAttribute,
  IGroupGraphicAttribute,
  ILineGraphicAttribute,
  ISymbolGraphicAttribute,
  SymbolType
} from '@visactor/vrender-core';
import type { Point, State } from '../core/type';

export type SymbolAttributes = {
  /** 是否展示 symbol */
  visible: boolean;
  /**
   * symbol 形状，默认为带左右方向的箭头
   */
  symbolType?: SymbolType;
  /**
   * symbol 大小
   */
  size?: number;
  /**
   * 自动旋转，沿着线的方向，默认 true
   */
  autoRotate?: boolean;
  /**
   * symbol 相对line平行方向上的偏移
   */
  refX?: number;
  /**
   * symbol 相对line正交方向上的偏移
   */
  refY?: number;
  /**
   * symbol 相对默认角度的偏移
   * @description (@chensiji: 默认角度为笛卡尔坐标系y正方向，即默认symbol包围盒的角度为笛卡尔坐标系y正方向, 做自动旋转时, 会在此基础上，将包围盒转换到line平行方向上。)
   */
  refAngle?: number;
  /**
   * symbol 是否clip line，即当symbol fill为false时，line在symbol内部的部分是否展示
   * @defalut false
   */
  clip?: boolean;
  /**
   * symbol 样式配置
   */
  style?: Partial<IGraphicAttribute>;
};

export interface SegmentAttributes extends IGroupGraphicAttribute {
  /**
   * 可见性
   * @default true
   */
  visible?: boolean;
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
  points: Point[] | Point[][];
  /** 轴线起始点 symbol 配置 */
  startSymbol?: SymbolAttributes;
  /** 轴线末端 symbol 配置 */
  endSymbol?: SymbolAttributes;
  /**
   * 线样式配置
   */
  lineStyle?: ILineGraphicWithCornerRadius | Partial<ILineGraphicAttribute>[];

  state?: {
    line?: State<ILineGraphicWithCornerRadius | Partial<ILineGraphicAttribute>[]>;
    symbol?: State<Partial<ISymbolGraphicAttribute>>;
    startSymbol?: State<Partial<ISymbolGraphicAttribute>>;
    endSymbol?: State<Partial<ISymbolGraphicAttribute>>;
  };
}

export interface ILineGraphicWithCornerRadius extends Partial<ILineGraphicAttribute> {
  /**
   * 折现拐角处的圆角配置
   */
  cornerRadius?: number;
}
