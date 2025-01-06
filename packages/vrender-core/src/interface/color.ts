interface IGradientStop {
  offset: number;
  color: string;
}

export type IGradientColor = ILinearGradient | IRadialGradient | IConicalGradient;

/**
 * 线性渐变色
 */
export interface ILinearGradient {
  gradient: 'linear';
  x0?: number;
  y0?: number;
  x1?: number;
  y1?: number;
  stops: IGradientStop[];
}

/**
 * 径向渐变色
 */
export interface IRadialGradient {
  gradient: 'radial';
  x0?: number;
  y0?: number;
  x1?: number;
  y1?: number;
  r0?: number;
  r1?: number;
  stops: IGradientStop[];
}

/**
 * 环形渐变色/锥形渐变色
 */
export interface IConicalGradient {
  gradient: 'conical';
  startAngle?: number;
  endAngle?: number;
  x?: number;
  y?: number;
  stops: IGradientStop[];
}

export interface IColorStop {
  offset: number;
  color: string;
}

/**
 * 颜色类型，
 * 支持字符串、线性渐变、径向渐变、锥形渐变
 */
export type IColor = string | ILinearGradient | IRadialGradient | IConicalGradient;
