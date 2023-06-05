import type { Options } from 'roughjs/bin/core';

export const defaultRouthThemeSpec: Options = {
  maxRandomnessOffset: 3,
  // 粗糙度，值越大绘制的越乱
  roughness: 1,
  // 线段的弯曲度
  bowing: 1,
  // 曲线拟合程度
  curveFitting: 0.95,
  curveTightness: undefined,
  // 近似曲线的点数
  curveStepCount: 9,
  // 填充形式，默认斜线
  fillStyle: 'hachure',
  // 填充线的粗细、填充点的大小
  fillWeight: undefined,
  // 填充为hachure时的转角
  hachureAngle: 60,
  // 填充为hachure时线段间的间隙
  hachureGap: 6,
  // 是否简化线段
  simplification: 0,
  dashOffset: undefined,
  dashGap: undefined,
  zigzagOffset: undefined,
  // 生成随机形状的种子
  seed: 1,
  fillLineDash: undefined,
  fillLineDashOffset: undefined,
  // 禁止用多个笔画绘制
  disableMultiStroke: false,
  disableMultiStrokeFill: false,
  preserveVertices: true,
  fixedDecimalPlaceDigits: undefined
};
