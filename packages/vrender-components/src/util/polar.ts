/**
 *
 * @param x x方向到圆心距离
 * @param y y方向到圆心距离
 * @returns 在圆上的角度(顺时针方向, 与arc图元绘制方向一致)
 */
export const deltaXYToAngle = (y: number, x: number) => {
  const angle = Math.atan2(y, x);
  // ref: https://jsbin.com/taxozoyaja/2/edit?html,js,output
  return angle < 0 ? angle + Math.PI * 2 : angle;
};

export const tan2AngleToAngle = (angle: number) => {
  return angle < 0 ? angle + Math.PI * 2 : angle;
};
