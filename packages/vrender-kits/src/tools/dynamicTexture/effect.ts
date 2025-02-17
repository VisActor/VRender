import type { IContext2d, IGraphic } from '@visactor/vrender-core';

export function randomOpacity(
  ctx: IContext2d,
  row: number,
  column: number,
  rowCount: number,
  columnCount: number,
  ratio: number,
  graphic: IGraphic,
  minRatio: number = 0, // 最小ratio值，默认为0
  amplitude: number = 1 // 变化幅度，默认为1
): number {
  if (!graphic.dynamicTextureCache) {
    graphic.dynamicTextureCache = new Array(rowCount * columnCount).fill(0).map(item => Math.random() * 2 * Math.PI);
  }
  const targetRandomValue = graphic.dynamicTextureCache[row * columnCount + column];
  // 调整sin函数的振幅，并将结果映射到[minRatio, minRatio + amplitude]范围
  const _r = minRatio + (amplitude * (Math.sin(ratio * 2 * Math.PI + targetRandomValue) + 1)) / 2;
  return Math.min(1, Math.max(0, _r)); // 确保返回值在[0,1]范围内
}

// 从左到右的列式渐变
export function columnLeftToRight(
  ctx: IContext2d,
  row: number,
  column: number,
  rowCount: number,
  columnCount: number,
  ratio: number,
  graphic: IGraphic,
  minRatio: number = 0,
  amplitude: number = 1
): number {
  const delay = column / columnCount;
  const _r = minRatio + (amplitude * (Math.sin(ratio * 2 * Math.PI - delay * 2 * Math.PI) + 1)) / 2;
  return Math.min(1, Math.max(0, _r));
}

// 从右到左的列式渐变
export function columnRightToLeft(
  ctx: IContext2d,
  row: number,
  column: number,
  rowCount: number,
  columnCount: number,
  ratio: number,
  graphic: IGraphic,
  minRatio: number = 0,
  amplitude: number = 1
): number {
  const delay = (columnCount - 1 - column) / columnCount;
  const _r = minRatio + (amplitude * (Math.sin(ratio * 2 * Math.PI - delay * 2 * Math.PI) + 1)) / 2;
  return Math.min(1, Math.max(0, _r));
}

// 从上到下的行式渐变
export function rowTopToBottom(
  ctx: IContext2d,
  row: number,
  column: number,
  rowCount: number,
  columnCount: number,
  ratio: number,
  graphic: IGraphic,
  minRatio: number = 0,
  amplitude: number = 1
): number {
  const delay = row / rowCount;
  const _r = minRatio + (amplitude * (Math.sin(ratio * 2 * Math.PI - delay * 2 * Math.PI) + 1)) / 2;
  return Math.min(1, Math.max(0, _r));
}

// 从下到上的行式渐变
export function rowBottomToTop(
  ctx: IContext2d,
  row: number,
  column: number,
  rowCount: number,
  columnCount: number,
  ratio: number,
  graphic: IGraphic,
  minRatio: number = 0,
  amplitude: number = 1
): number {
  const delay = (rowCount - 1 - row) / rowCount;
  const _r = minRatio + (amplitude * (Math.sin(ratio * 2 * Math.PI - delay * 2 * Math.PI) + 1)) / 2;
  return Math.min(1, Math.max(0, _r));
}

// 从中心向两边的对角线渐变
export function diagonalCenterToEdge(
  ctx: IContext2d,
  row: number,
  column: number,
  rowCount: number,
  columnCount: number,
  ratio: number,
  graphic: IGraphic,
  minRatio: number = 0,
  amplitude: number = 1
): number {
  const centerRow = rowCount / 2;
  const centerCol = columnCount / 2;
  const distance = Math.sqrt(
    Math.pow((row - centerRow) / rowCount, 2) + Math.pow((column - centerCol) / columnCount, 2)
  );
  const _r = minRatio + (amplitude * (Math.sin(ratio * 2 * Math.PI - distance * 2 * Math.PI) + 1)) / 2;
  return Math.min(1, Math.max(0, _r));
}

// 从左上角到右下角的对角线渐变
export function diagonalTopLeftToBottomRight(
  ctx: IContext2d,
  row: number,
  column: number,
  rowCount: number,
  columnCount: number,
  ratio: number,
  graphic: IGraphic,
  minRatio: number = 0,
  amplitude: number = 1
): number {
  const delay = (row / rowCount + column / columnCount) / 2;
  const _r = minRatio + (amplitude * (Math.sin(ratio * 2 * Math.PI - delay * 2 * Math.PI) + 1)) / 2;
  return Math.min(1, Math.max(0, _r));
}

// 旋转扫描效果
export function rotationScan(
  ctx: IContext2d,
  row: number,
  column: number,
  rowCount: number,
  columnCount: number,
  ratio: number,
  graphic: IGraphic,
  minRatio: number = 0,
  amplitude: number = 1
): number {
  // 计算当前点相对于中心点的角度
  const centerRow = rowCount / 2;
  const centerCol = columnCount / 2;
  const angle = Math.atan2(row - centerRow, column - centerCol);
  // 将角度归一化到 [0, 2π]
  const normalizedAngle = angle < 0 ? angle + 2 * Math.PI : angle;
  // 计算扫描延迟
  const delay = normalizedAngle / (2 * Math.PI);
  const _r = minRatio + (amplitude * (Math.sin(ratio * 2 * Math.PI - delay * 2 * Math.PI) + 1)) / 2;
  return Math.min(1, Math.max(0, _r));
}

// 波纹扩散效果
export function rippleEffect(
  ctx: IContext2d,
  row: number,
  column: number,
  rowCount: number,
  columnCount: number,
  ratio: number,
  graphic: IGraphic,
  minRatio: number = 0,
  amplitude: number = 1
): number {
  const centerRow = rowCount / 2;
  const centerCol = columnCount / 2;
  // 计算到中心的距离
  const distance = Math.sqrt(Math.pow(row - centerRow, 2) + Math.pow(column - centerCol, 2));
  // 归一化距离
  const normalizedDistance = distance / Math.sqrt(Math.pow(rowCount / 2, 2) + Math.pow(columnCount / 2, 2));
  // 创建多个波纹
  const waves = 3;
  const _r =
    minRatio + (amplitude * (Math.sin(ratio * 2 * Math.PI * waves - normalizedDistance * 2 * Math.PI) + 1)) / 2;
  return Math.min(1, Math.max(0, _r));
}

// 蛇形波动效果
export function snakeWave(
  ctx: IContext2d,
  row: number,
  column: number,
  rowCount: number,
  columnCount: number,
  ratio: number,
  graphic: IGraphic,
  minRatio: number = 0,
  amplitude: number = 1
): number {
  // 使用行和列的位置创建蛇形路径
  const delay = ((row + column) % (rowCount + columnCount)) / (rowCount + columnCount);
  const _r = minRatio + (amplitude * (Math.sin(ratio * 2 * Math.PI - delay * 4 * Math.PI) + 1)) / 2;
  return Math.min(1, Math.max(0, _r));
}

// 交错波纹效果
export function alternatingWave(
  ctx: IContext2d,
  row: number,
  column: number,
  rowCount: number,
  columnCount: number,
  ratio: number,
  graphic: IGraphic,
  minRatio: number = 0,
  amplitude: number = 1
): number {
  // 行和列的交错波纹
  const rowPhase = row / rowCount;
  const colPhase = column / columnCount;
  const _r =
    minRatio +
    (amplitude *
      (Math.sin(ratio * 2 * Math.PI - rowPhase * 2 * Math.PI) * Math.sin(ratio * 2 * Math.PI - colPhase * 2 * Math.PI) +
        1)) /
      2;
  return Math.min(1, Math.max(0, _r));
}

// 螺旋效果
export function spiralEffect(
  ctx: IContext2d,
  row: number,
  column: number,
  rowCount: number,
  columnCount: number,
  ratio: number,
  graphic: IGraphic,
  minRatio: number = 0,
  amplitude: number = 1
): number {
  // 计算到中心的距离和角度
  const centerRow = rowCount / 2;
  const centerCol = columnCount / 2;
  const distance = Math.sqrt(Math.pow(row - centerRow, 2) + Math.pow(column - centerCol, 2));
  const angle = Math.atan2(row - centerRow, column - centerCol);
  // 归一化距离
  const normalizedDistance = distance / Math.sqrt(Math.pow(rowCount / 2, 2) + Math.pow(columnCount / 2, 2));
  // 组合距离和角度创建螺旋效果
  const delay = (normalizedDistance + angle / (2 * Math.PI)) / 2;
  const _r = minRatio + (amplitude * (Math.sin(ratio * 2 * Math.PI - delay * 4 * Math.PI) + 1)) / 2;
  return Math.min(1, Math.max(0, _r));
}

// 从两边向中间的列式渐变
export function columnCenterToEdge(
  ctx: IContext2d,
  row: number,
  column: number,
  rowCount: number,
  columnCount: number,
  ratio: number,
  graphic: IGraphic,
  minRatio: number = 0,
  amplitude: number = 1
): number {
  const centerCol = columnCount / 2;
  // 计算到中心的距离，并归一化到[0,1]区间
  const distance = Math.abs(column - centerCol) / centerCol;
  const _r = minRatio + (amplitude * (Math.sin(ratio * 2 * Math.PI - distance * 2 * Math.PI) + 1)) / 2;
  return Math.min(1, Math.max(0, _r));
}

// 从中间向两边的列式渐变
export function columnEdgeToCenter(
  ctx: IContext2d,
  row: number,
  column: number,
  rowCount: number,
  columnCount: number,
  ratio: number,
  graphic: IGraphic,
  minRatio: number = 0,
  amplitude: number = 1
): number {
  const centerCol = columnCount / 2;
  // 计算到中心的距离，并归一化到[0,1]区间，然后用1减去它来反转延迟
  const distance = 1 - Math.abs(column - centerCol) / centerCol;
  const _r = minRatio + (amplitude * (Math.sin(ratio * 2 * Math.PI - distance * 2 * Math.PI) + 1)) / 2;
  return Math.min(1, Math.max(0, _r));
}

// 从上下向中间的行式渐变
export function rowCenterToEdge(
  ctx: IContext2d,
  row: number,
  column: number,
  rowCount: number,
  columnCount: number,
  ratio: number,
  graphic: IGraphic,
  minRatio: number = 0,
  amplitude: number = 1
): number {
  const centerRow = rowCount / 2;
  // 计算到中心的距离，并归一化到[0,1]区间
  const distance = Math.abs(row - centerRow) / centerRow;
  const _r = minRatio + (amplitude * (Math.sin(ratio * 2 * Math.PI - distance * 2 * Math.PI) + 1)) / 2;
  return Math.min(1, Math.max(0, _r));
}

// 从中间向上下的行式渐变
export function rowEdgeToCenter(
  ctx: IContext2d,
  row: number,
  column: number,
  rowCount: number,
  columnCount: number,
  ratio: number,
  graphic: IGraphic,
  minRatio: number = 0,
  amplitude: number = 1
): number {
  const centerRow = rowCount / 2;
  // 计算到中心的距离，并归一化到[0,1]区间，然后用1减去它来反转延迟
  const distance = 1 - Math.abs(row - centerRow) / centerRow;
  const _r = minRatio + (amplitude * (Math.sin(ratio * 2 * Math.PI - distance * 2 * Math.PI) + 1)) / 2;
  return Math.min(1, Math.max(0, _r));
}

// 从四个角向中心的渐变
export function cornerToCenter(
  ctx: IContext2d,
  row: number,
  column: number,
  rowCount: number,
  columnCount: number,
  ratio: number,
  graphic: IGraphic,
  minRatio: number = 0,
  amplitude: number = 1
): number {
  const centerRow = rowCount / 2;
  const centerCol = columnCount / 2;
  // 计算到中心的距离，使用欧几里得距离
  const distance = Math.sqrt(
    Math.pow((row - centerRow) / centerRow, 2) + Math.pow((column - centerCol) / centerCol, 2)
  );
  // 归一化到[0,1]区间
  const normalizedDistance = Math.min(distance, 1);
  const _r = minRatio + (amplitude * (Math.sin(ratio * 2 * Math.PI - normalizedDistance * 2 * Math.PI) + 1)) / 2;
  return Math.min(1, Math.max(0, _r));
}

// 从中心向四个角的渐变
export function centerToCorner(
  ctx: IContext2d,
  row: number,
  column: number,
  rowCount: number,
  columnCount: number,
  ratio: number,
  graphic: IGraphic,
  minRatio: number = 0,
  amplitude: number = 1
): number {
  const centerRow = rowCount / 2;
  const centerCol = columnCount / 2;
  // 计算到中心的距离，使用欧几里得距离
  const distance = Math.sqrt(
    Math.pow((row - centerRow) / centerRow, 2) + Math.pow((column - centerCol) / centerCol, 2)
  );
  // 归一化到[0,1]区间并反转
  const normalizedDistance = 1 - Math.min(distance, 1);
  const _r = minRatio + (amplitude * (Math.sin(ratio * 2 * Math.PI - normalizedDistance * 2 * Math.PI) + 1)) / 2;
  return Math.min(1, Math.max(0, _r));
}

// 脉冲波纹效果
export function pulseWave(
  ctx: IContext2d,
  row: number,
  column: number,
  rowCount: number,
  columnCount: number,
  ratio: number,
  graphic: IGraphic,
  minRatio: number = 0,
  amplitude: number = 1
): number {
  const centerRow = rowCount / 2;
  const centerCol = columnCount / 2;
  // 计算到中心的距离
  const distance = Math.sqrt(
    Math.pow((row - centerRow) / centerRow, 2) + Math.pow((column - centerCol) / centerCol, 2)
  );
  const normalizedDistance = Math.min(distance, 1);
  // 创建多个波纹
  const waves = 3;
  const wavePhase = ratio * 2 * Math.PI * waves;
  // 添加距离衰减
  const decay = Math.max(0, 1 - normalizedDistance);
  // 组合波纹和衰减效果
  const wave = Math.sin(wavePhase - normalizedDistance * 4 * Math.PI);
  const _r = minRatio + amplitude * ((wave + 1) / 2) * (decay * 0.7 + 0.3);
  return Math.min(1, Math.max(0, _r));
}

// 粒子动画效果
export function particleEffect(
  ctx: IContext2d,
  row: number,
  column: number,
  rowCount: number,
  columnCount: number,
  ratio: number,
  graphic: IGraphic,
  minRatio: number = 0,
  amplitude: number = 1
): number {
  // 初始化随机种子
  if (!graphic.dynamicTextureCache) {
    graphic.dynamicTextureCache = {
      phases: new Array(rowCount * columnCount).fill(0).map(() => Math.random() * 2 * Math.PI),
      speeds: new Array(rowCount * columnCount).fill(0).map(() => 0.5 + Math.random() * 0.5),
      directions: new Array(rowCount * columnCount).fill(0).map(() => Math.random() * 2 * Math.PI)
    };
  }

  const index = row * columnCount + column;
  const phase = graphic.dynamicTextureCache.phases[index];
  const speed = graphic.dynamicTextureCache.speeds[index];
  const direction = graphic.dynamicTextureCache.directions[index];

  // 计算到中心的距离
  const centerRow = rowCount / 2;
  const centerCol = columnCount / 2;
  const distance = Math.sqrt(
    Math.pow((row - centerRow) / centerRow, 2) + Math.pow((column - centerCol) / centerCol, 2)
  );
  const normalizedDistance = Math.min(distance, 1);

  // 扩散阶段：粒子随机运动
  const scatterRatio = (ratio - 0.4) / 0.6;
  // 使用相位和方向创建随机运动
  const movement = Math.sin(scatterRatio * speed * 8 * Math.PI + phase + direction * scatterRatio);
  // 添加距离影响
  const distanceEffect = Math.cos(normalizedDistance * Math.PI + scatterRatio * Math.PI);
  // 添加衰减效果
  const decay = Math.max(0, 1 - scatterRatio * 1.2);

  // 组合所有效果
  const baseEffect = ((movement + 1) / 2) * decay * (0.3 + 0.7 * distanceEffect);
  const _r = minRatio + amplitude * baseEffect;
  return Math.min(1, Math.max(0, _r));
}
