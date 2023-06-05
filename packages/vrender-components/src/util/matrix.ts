import { vec2 } from 'gl-matrix';

export { vec2 };

/**
 * 向量 v1 到 向量 v2 夹角的方向
 * @param  {Array} v1 向量
 * @param  {Array} v2 向量
 * @return {Boolean} >= 0 顺时针 < 0 逆时针
 */
export function direction(v1: number[], v2: number[]): number {
  return v1[0] * v2[1] - v2[0] * v1[1];
}

/**
 * 二维向量 v1 到 v2 的夹角
 * @param v1
 * @param v2
 * @param direct
 */
export function angleTo(v1: [number, number], v2: [number, number], direct: boolean): number {
  const ang = vec2.angle(v1, v2);
  const angleLargeThanPI = direction(v1, v2) >= 0;
  if (direct) {
    if (angleLargeThanPI) {
      return Math.PI * 2 - ang;
    }
    return ang;
  }

  if (angleLargeThanPI) {
    return ang;
  }
  return Math.PI * 2 - ang;
}
