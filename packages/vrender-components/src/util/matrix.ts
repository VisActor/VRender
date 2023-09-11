export type Vector2 = [number, number];

/**
 * Scales a vec2 by a scalar number
 */
export function scale(vector: Vector2, scale: number): [number, number] {
  return [vector[0] * scale, vector[1] * scale];
}

/**
 * Calculates the length of a vec2
 */
export function length(vector: Vector2) {
  const [x, y] = vector;
  return Math.sqrt(x * x + y * y);
}

/**
 * Normalize a vec2
 */
export function normalize(vector: Vector2) {
  const [x, y] = vector;
  let len = x * x + y * y;
  if (len > 0) {
    len = 1 / Math.sqrt(len);
  }
  return [vector[0] * len, vector[1] * len];
}

/**
 * Get the angle between two 2D vectors
 */
export function angle(vector1: Vector2, vector2: Vector2) {
  const [x1, y1] = vector1;
  const [x2, y2] = vector2;
  const mag = Math.sqrt((x1 * x1 + y1 * y1) * (x2 * x2 + y2 * y2));
  const cosine = mag && (x1 * x2 + y1 * y2) / mag;
  return Math.acos(Math.min(Math.max(cosine, -1), 1));
}

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
  const ang = angle(v1, v2);
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
