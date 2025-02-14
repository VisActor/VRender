// import type { IContext2d, IGraphic } from '@visactor/vrender-core';

// export function randomOpacity(
//   ctx: IContext2d,
//   row: number,
//   column: number,
//   rowCount: number,
//   columnCount: number,
//   ratio: number,
//   graphic: IGraphic
// ) {
//   if (!graphic.dynamicTextureCache) {
//     graphic.dynamicTextureCache = new Array(rowCount * columnCount).fill(0).map(item => Math.random() * 2 * Math.PI);
//   }
//   const targetRandomValue = graphic.dynamicTextureCache[row * columnCount + column];
//   const _r = (Math.sin(ratio * 2 * Math.PI + targetRandomValue) + 1) / 2;
//   ctx.globalAlpha = _r;
//   ctx.fill();
// }

// // 从左到右的列式渐变
// export function columnLeftToRight(
//   ctx: IContext2d,
//   row: number,
//   column: number,
//   rowCount: number,
//   columnCount: number,
//   ratio: number,
//   graphic: IGraphic
// ) {
//   // 根据列号计算延迟
//   const delay = column / columnCount;
//   // 使用连续的sin函数，不需要max(0,ratio-delay)的截断
//   const _r = (Math.sin(ratio * 2 * Math.PI - delay * 2 * Math.PI) + 1) / 2;
//   ctx.globalAlpha = _r;
//   ctx.fill();
// }

// // 从右到左的列式渐变
// export function columnRightToLeft(
//   ctx: IContext2d,
//   row: number,
//   column: number,
//   rowCount: number,
//   columnCount: number,
//   ratio: number,
//   graphic: IGraphic
// ) {
//   const delay = (columnCount - 1 - column) / columnCount;
//   const _r = (Math.sin(ratio * 2 * Math.PI - delay * 2 * Math.PI) + 1) / 2;
//   ctx.globalAlpha = _r;
//   ctx.fill();
// }

// // 从上到下的行式渐变
// export function rowTopToBottom(
//   ctx: IContext2d,
//   row: number,
//   column: number,
//   rowCount: number,
//   columnCount: number,
//   ratio: number,
//   graphic: IGraphic
// ) {
//   const delay = row / rowCount;
//   const _r = (Math.sin(ratio * 2 * Math.PI - delay * 2 * Math.PI) + 1) / 2;
//   ctx.globalAlpha = _r;
//   ctx.fill();
// }

// // 从下到上的行式渐变
// export function rowBottomToTop(
//   ctx: IContext2d,
//   row: number,
//   column: number,
//   rowCount: number,
//   columnCount: number,
//   ratio: number,
//   graphic: IGraphic
// ) {
//   const delay = (rowCount - 1 - row) / rowCount;
//   const _r = (Math.sin(ratio * 2 * Math.PI - delay * 2 * Math.PI) + 1) / 2;
//   ctx.globalAlpha = _r;
//   ctx.fill();
// }

// // 从中心向两边的对角线渐变
// export function diagonalCenterToEdge(
//   ctx: IContext2d,
//   row: number,
//   column: number,
//   rowCount: number,
//   columnCount: number,
//   ratio: number,
//   graphic: IGraphic
// ) {
//   const centerRow = rowCount / 2;
//   const centerCol = columnCount / 2;
//   const distance = Math.sqrt(
//     Math.pow((row - centerRow) / rowCount, 2) + Math.pow((column - centerCol) / columnCount, 2)
//   );
//   const _r = (Math.sin(ratio * 2 * Math.PI - distance * 2 * Math.PI) + 1) / 2;
//   ctx.globalAlpha = _r;
//   ctx.fill();
// }

// // 从左上角到右下角的对角线渐变
// export function diagonalTopLeftToBottomRight(
//   ctx: IContext2d,
//   row: number,
//   column: number,
//   rowCount: number,
//   columnCount: number,
//   ratio: number,
//   graphic: IGraphic
// ) {
//   const delay = (row / rowCount + column / columnCount) / 2;
//   const _r = (Math.sin(ratio * 2 * Math.PI - delay * 2 * Math.PI) + 1) / 2;
//   ctx.globalAlpha = _r;
//   ctx.fill();
// }

// // 旋转扫描效果
// export function rotationScan(
//   ctx: IContext2d,
//   row: number,
//   column: number,
//   rowCount: number,
//   columnCount: number,
//   ratio: number,
//   graphic: IGraphic
// ) {
//   // 计算当前点相对于中心点的角度
//   const centerRow = rowCount / 2;
//   const centerCol = columnCount / 2;
//   const angle = Math.atan2(row - centerRow, column - centerCol);
//   // 将角度归一化到 [0, 2π]
//   const normalizedAngle = angle < 0 ? angle + 2 * Math.PI : angle;
//   // 计算扫描延迟
//   const delay = normalizedAngle / (2 * Math.PI);
//   const _r = (Math.sin(ratio * 2 * Math.PI - delay * 2 * Math.PI) + 1) / 2;
//   ctx.globalAlpha = _r;
//   ctx.fill();
// }

// // 波纹扩散效果
// export function rippleEffect(
//   ctx: IContext2d,
//   row: number,
//   column: number,
//   rowCount: number,
//   columnCount: number,
//   ratio: number,
//   graphic: IGraphic
// ) {
//   const centerRow = rowCount / 2;
//   const centerCol = columnCount / 2;
//   // 计算到中心的距离
//   const distance = Math.sqrt(Math.pow(row - centerRow, 2) + Math.pow(column - centerCol, 2));
//   // 归一化距离
//   const normalizedDistance = distance / Math.sqrt(Math.pow(rowCount / 2, 2) + Math.pow(columnCount / 2, 2));
//   // 创建多个波纹
//   const waves = 3;
//   const _r = (Math.sin(ratio * 2 * Math.PI * waves - normalizedDistance * 2 * Math.PI) + 1) / 2;
//   ctx.globalAlpha = _r;
//   ctx.fill();
// }

// // 蛇形波动效果
// export function snakeWave(
//   ctx: IContext2d,
//   row: number,
//   column: number,
//   rowCount: number,
//   columnCount: number,
//   ratio: number,
//   graphic: IGraphic
// ) {
//   // 使用行和列的位置创建蛇形路径
//   const delay = ((row + column) % (rowCount + columnCount)) / (rowCount + columnCount);
//   const _r = (Math.sin(ratio * 2 * Math.PI - delay * 4 * Math.PI) + 1) / 2;
//   ctx.globalAlpha = _r;
//   ctx.fill();
// }

// // 交错波纹效果
// export function alternatingWave(
//   ctx: IContext2d,
//   row: number,
//   column: number,
//   rowCount: number,
//   columnCount: number,
//   ratio: number,
//   graphic: IGraphic
// ) {
//   // 行和列的交错波纹
//   const rowPhase = row / rowCount;
//   const colPhase = column / columnCount;
//   const _r =
//     (Math.sin(ratio * 2 * Math.PI - rowPhase * 2 * Math.PI) * Math.sin(ratio * 2 * Math.PI - colPhase * 2 * Math.PI) +
//       1) /
//     2;
//   ctx.globalAlpha = _r;
//   ctx.fill();
// }

// // 螺旋效果
// export function spiralEffect(
//   ctx: IContext2d,
//   row: number,
//   column: number,
//   rowCount: number,
//   columnCount: number,
//   ratio: number,
//   graphic: IGraphic
// ) {
//   const centerRow = rowCount / 2;
//   const centerCol = columnCount / 2;
//   // 计算到中心的距离和角度
//   const distance = Math.sqrt(Math.pow(row - centerRow, 2) + Math.pow(column - centerCol, 2));
//   const angle = Math.atan2(row - centerRow, column - centerCol);
//   // 归一化距离
//   const normalizedDistance = distance / Math.sqrt(Math.pow(rowCount / 2, 2) + Math.pow(columnCount / 2, 2));
//   // 组合距离和角度创建螺旋效果
//   const delay = (normalizedDistance + angle / (2 * Math.PI)) / 2;
//   const _r = (Math.sin(ratio * 2 * Math.PI - delay * 4 * Math.PI) + 1) / 2;
//   ctx.globalAlpha = _r;
//   ctx.fill();
// }
