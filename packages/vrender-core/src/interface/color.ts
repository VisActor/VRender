interface IGradientStop {
  /**
   * 颜色偏移量, 0-1的值
   */
  offset: number;
  /**
   * 颜色值
   */
  color: string;
}

export type IGradientColor = ILinearGradient | IRadialGradient | IConicalGradient;

/**
 * 线性渐变色
 */
export interface ILinearGradient {
  /**
   * 渐变色的类型设置为 'linear'，即线形渐变
   */
  gradient: 'linear';
  /**
   * 渐变色的起点x坐标，0-1的值，相对于图形包围盒x方向取值的比例值
   */
  x0?: number;
  /**
   * 渐变色的起点y坐标，0-1的值，相对于图形包围盒y方向取值的比例值
   */
  y0?: number;
  /**
   * 渐变色的终点x坐标，0-1的值，相对于图形包围盒x方向取值的比例值
   */
  x1?: number;
  /**
   * 渐变色的终点y坐标，0-1的值，相对于图形包围盒y方向取值的比例值
   */
  y1?: number;
  /**
   * 渐变色的颜色数组，每个颜色对象包含一个偏移量（0-1）和一个颜色值
   */
  stops: IGradientStop[];
}

/**
 * 径向渐变色
 */
export interface IRadialGradient {
  /**
   * 渐变色的类型设置为 'radial'，即环形渐变
   */
  gradient: 'radial';
  /**
   * 径向渐变的起点的x坐标
   */
  x0?: number;
  /**
   * 径向渐变的起点的y坐标
   */
  y0?: number;
  /**
   * 径向渐变的终点的x坐标
   */
  x1?: number;
  /**
   * 径向渐变的终点的x坐标
   */
  y1?: number;
  /**
   * 径向渐变的起点的半径
   */
  r0?: number;
  /**
   * 径向渐变的终点的半径
   */
  r1?: number;
  /**
   * 径向渐变的颜色数组，每个颜色对象包含一个偏移量（0-1）和一个颜色值
   */
  stops: IGradientStop[];
}

/**
 * 环形渐变色/锥形渐变色
 */
export interface IConicalGradient {
  /**
   * 渐变色的类型设置为 'conical'，即环形渐变
   */
  gradient: 'conical';
  /**
   * 锥形渐变的开始角度
   */
  startAngle?: number;
  /**
   * 锥形渐变的开始角度
   */
  endAngle?: number;
  /**
   * 锥形渐变的中心点x坐标
   */
  x?: number;
  /**
   * 锥形渐变的中心点y坐标
   */
  y?: number;
  /**
   * 锥形渐变的颜色
   */
  stops: IGradientStop[];
}

export interface IColorStop {
  /**
   * 颜色偏移量, 0-1的值
   */
  offset: number;
  /**
   * 颜色值
   */
  color: string;
}

/**
 * 颜色类型，
 * 支持字符串、线性渐变、径向渐变、锥形渐变
 */
export type IColor = string | ILinearGradient | IRadialGradient | IConicalGradient;
