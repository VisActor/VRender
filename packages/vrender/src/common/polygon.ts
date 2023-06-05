import { IPointLike } from '@visactor/vutils';
import { IPath2D } from '../interface';

/**
 * 绘制闭合的常规多边形
 * TODO polygon 图元的xy属性没有意义
 * @param path
 * @param points
 * @param x
 * @param y
 */
export function drawPolygon(path: IPath2D, points: IPointLike[], x: number, y: number) {
  path.moveTo(points[0].x + x, points[0].y + y);
  for (let i = 1; i < points.length; i++) {
    path.lineTo(points[i].x + x, points[i].y + y);
  }
}

/**
 * algorithm detail see: https://stackoverflow.com/a/24780108
 */
export function drawRoundedPolygon(
  path: IPath2D,
  points: IPointLike[],
  x: number,
  y: number,
  borderRadius: number | number[]
) {
  if (points.length < 3) {
    drawPolygon(path, points, x, y);
    return;
  }

  for (let i = 0; i < points.length; i++) {
    const p1 = points[i];
    const angularPoint = points[(i + 1) % points.length];
    const p2 = points[(i + 2) % points.length];

    //Vector 1
    const dx1 = angularPoint.x - p1.x;
    const dy1 = angularPoint.y - p1.y;

    //Vector 2
    const dx2 = angularPoint.x - p2.x;
    const dy2 = angularPoint.y - p2.y;

    //Angle between vector 1 and vector 2 divided by 2
    const angle = (Math.atan2(dy1, dx1) - Math.atan2(dy2, dx2)) / 2;

    // The length of segment between angular point and the
    // points of intersection with the circle of a given radius
    const tan = Math.abs(Math.tan(angle));

    // get config radius
    let radius = Array.isArray(borderRadius) ? borderRadius[(i + 1) % points.length] ?? 0 : borderRadius;
    let segment = radius / tan;

    //Check the segment
    const length1 = getLength(dx1, dy1);
    const length2 = getLength(dx2, dy2);

    const length = Math.min(length1, length2);

    if (segment > length) {
      segment = length;
      radius = length * tan;
    }

    // Points of intersection are calculated by the proportion between
    // the coordinates of the vector, length of vector and the length of the segment.
    const p1Cross = getProportionPoint(angularPoint, segment, length1, dx1, dy1);
    const p2Cross = getProportionPoint(angularPoint, segment, length2, dx2, dy2);

    // Calculation of the coordinates of the circle
    // center by the addition of angular vectors.
    const dx = angularPoint.x * 2 - p1Cross.x - p2Cross.x;
    const dy = angularPoint.y * 2 - p1Cross.y - p2Cross.y;

    const L = getLength(dx, dy);
    const d = getLength(segment, radius);

    const circlePoint = getProportionPoint(angularPoint, d, L, dx, dy);

    //StartAngle and EndAngle of arc
    let startAngle = Math.atan2(p1Cross.y - circlePoint.y, p1Cross.x - circlePoint.x);
    const endAngle = Math.atan2(p2Cross.y - circlePoint.y, p2Cross.x - circlePoint.x);

    //Sweep angle
    let sweepAngle = endAngle - startAngle;

    //Some additional checks
    if (sweepAngle < 0) {
      startAngle = endAngle;
      sweepAngle = -sweepAngle;
    }

    if (sweepAngle > Math.PI) {
      sweepAngle = sweepAngle - Math.PI;
    }

    if (i === 0) {
      path.moveTo(p1Cross.x + x, p1Cross.y + y);
    } else {
      path.lineTo(p1Cross.x + x, p1Cross.y + y);
    }

    if (sweepAngle) {
      path.arcTo(angularPoint.x + x, angularPoint.y + y, p2Cross.x + x, p2Cross.y + y, radius);
    }

    path.lineTo(p2Cross.x + x, p2Cross.y + y);
  }
}

function getLength(dx: number, dy: number) {
  return Math.sqrt(dx * dx + dy * dy);
}

function getProportionPoint(point: IPointLike, segment: number, length: number, dx: number, dy: number) {
  const factor = segment / length;

  return {
    x: point.x - dx * factor,
    y: point.y - dy * factor
  };
}
