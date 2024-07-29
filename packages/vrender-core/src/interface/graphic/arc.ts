import type { IGraphicAttribute, IGraphic } from '../graphic';
import type { ICustomPath2D } from '../path';

/**
 * 扇区属性
 */
export type IArcAttribute = {
  /** 内半径 */
  innerRadius: number;
  /** 外半径 */
  outerRadius: number;
  /* 内边距 */
  innerPadding: number;
  /* 外边距 */
  outerPadding: number;
  /**
   * 起始角度；
   * 以弧度的形式指定，0 表示 12 点钟方向并且顺时针方向为正。
   * 如果 |endAngle - startAngle| ≥ τ 则会绘制一个完整的扇形或圆环
   */
  startAngle: number;
  /**
   * 终止角度；
   * 以弧度的形式指定，0 表示 12 点钟方向并且顺时针方向为正。
   * 如果 |endAngle - startAngle| ≥ τ 则会绘制一个完整的扇形或圆环
   */
  endAngle: number;
  /**
   * 用于指定扇形区块的内外圆角半径，支持设置固定数值 或者 相对于扇形区块的半径差(| outerRadius - innerRadius |)的百分比值
   * 支持分别配置从外到内顺时针方向四个角的圆角半径，百分比值为相对于内外扇形的半径差。
   * 其中
   *
   * cornerRadius: 10：表示内圆角半径和外圆角半径都是 10px。
   * cornerRadius: '20%'：表示内圆角半径和外圆角半径都是扇形区块半径的 20%。
   * cornerRadius: [10, 20]：表示为环形图时，外圆角半径是 10px、内圆角半径是 20px。
   * cornerRadius: ['20%', '50%']：表示为环形图时，外圆角半径是内外圆半径差的 20%、内圆角半径是内外圆半径差的 50%。
   * cornerRadius: [5, 10, 15, 20]：表示外圆角半径分别为 5px 和 10px，内圆角半径分别为 15px 和 20px。
   *
   * 也支持如下形式的配置：
   * cornerRadius: [5, '10%', '20%', 10]
   * TODO: 暂不支持
   */
  cornerRadius: number | string | Array<number | string>;
  /**
   * 间隙角度；间隔角度会转换为一个在两个相邻的弧之间的确定的线性距离，定义为 padRadius * | padAngle |
   * 这个距离在弧的开始和结束处都是相等的；
   * 间隔角度通常只应用于环形扇区（即当内半径大于 0）
   */
  padAngle: number;
  padRadius: number;

  /**
   * 对应了线段的 lineCap 属性，lineCap 表示的是线段末端如何绘制
   * cap: true 表示在弧线的起始位置都增加一个角度，角度是 | outerRadius - innerRadius | / outerRadius
   */
  cap: boolean | [boolean, boolean];
  /**
   * 当cap = true 并且 使用了渐变填充的时候，自动实现conical渐变，也就是环形的渐变
   */
  forceShowCap: boolean;
};
/**
 * 内部缓存，用于存储一些内部变量
 */
export type IArcCache = {
  /** 解析后的圆角配置 */
  cornerRadius?: [number, number, number, number];
  startAngle?: number;
  endAngle?: number;
};

export type IArcGraphicAttribute = Partial<IGraphicAttribute> & Partial<IArcAttribute>;

export interface IArc extends IGraphic<IArcGraphicAttribute> {
  cache?: ICustomPath2D;

  getParsedCornerRadius: () => number | number[];
  getParsedAngle: () => { startAngle: number; endAngle: number; sc?: number; ec?: number };
  getParsePadAngle: (
    startAngle: number,
    endAngle: number
  ) => {
    outerStartAngle: number;
    outerEndAngle: number;
    innerStartAngle: number;
    innerEndAngle: number;

    outerDeltaAngle: number;
    innerDeltaAngle: number;
  };
}
