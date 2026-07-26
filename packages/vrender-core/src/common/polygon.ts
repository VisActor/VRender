import type { IPointLike } from '@visactor/vutils';
import type { IPath2D } from '../interface';

type NormalizedPolygonPoints = {
  points: IPointLike[];
  cornerRadius: number | number[];
};

type OffsetLine = {
  x: number;
  y: number;
  dx: number;
  dy: number;
  len: number;
  offsetX: number;
  offsetY: number;
};

/**
 * 绘制闭合的常规多边形
 * TODO polygon 图元的xy属性没有意义
 * @param path
 * @param points
 * @param x
 * @param y
 */
export function drawPolygon(path: IPath2D, points: IPointLike[], x: number, y: number) {
  if (!points || !points.length) {
    return;
  }
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
  cornerRadius: number | number[],
  closePath: boolean = true
) {
  const normalized = normalizePolygonPoints(points, cornerRadius, closePath);
  if (normalized) {
    drawRoundedPolygon(path, normalized.points, x, y, normalized.cornerRadius, closePath);
    return;
  }

  if (points.length < 3) {
    drawPolygon(path, points, x, y);
    return;
  }

  let startI = 0;
  let endI = points.length - 1;
  if (!closePath) {
    startI += 1;
    endI -= 1;
    path.moveTo(points[0].x + x, points[0].y + y);
  }
  for (let i = startI; i <= endI; i++) {
    const p1 = points[i === 0 ? endI : (i - 1) % points.length];
    const angularPoint = points[i % points.length];
    const p2 = points[(i + 1) % points.length];

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
    let radius = Array.isArray(cornerRadius) ? cornerRadius[i % points.length] ?? 0 : cornerRadius;
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

  if (!closePath) {
    path.lineTo(points[endI + 1].x + x, points[endI + 1].y + y);
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

/**
 * 合并连续重复点，避免圆角计算在零长度边上产生 0 / 0。
 * 仅在确实存在退化边时创建新数组，正常绘制路径不增加额外分配。
 */
export function normalizePolygonPoints(
  points: IPointLike[],
  cornerRadius: number | number[],
  closePath: boolean = true
): NormalizedPolygonPoints | null {
  let hasDuplicate = false;

  for (let i = 1; i < points.length; i++) {
    if (isSamePoint(points[i - 1], points[i])) {
      hasDuplicate = true;
      break;
    }
  }
  if (!hasDuplicate && closePath && points.length > 1 && isSamePoint(points[0], points[points.length - 1])) {
    hasDuplicate = true;
  }
  if (!hasDuplicate) {
    return null;
  }

  const normalizedPoints: IPointLike[] = [];
  const normalizedCornerRadius: number[] | null = Array.isArray(cornerRadius) ? [] : null;
  for (let i = 0; i < points.length; i++) {
    if (normalizedPoints.length && isSamePoint(normalizedPoints[normalizedPoints.length - 1], points[i])) {
      continue;
    }
    normalizedPoints.push(points[i]);
    normalizedCornerRadius?.push((cornerRadius as number[])[i] ?? 0);
  }

  if (
    closePath &&
    normalizedPoints.length > 1 &&
    isSamePoint(normalizedPoints[0], normalizedPoints[normalizedPoints.length - 1])
  ) {
    normalizedPoints.pop();
    normalizedCornerRadius?.pop();
  }

  return {
    points: normalizedPoints,
    cornerRadius: normalizedCornerRadius ?? cornerRadius
  };
}

function isSamePoint(a: IPointLike, b: IPointLike) {
  return a.x === b.x && a.y === b.y;
}

export function getPolygonWinding(points: IPointLike[]) {
  let signedArea = 0;
  for (let i = 0; i < points.length; i++) {
    const current = points[i];
    const next = points[(i + 1) % points.length];
    signedArea += current.x * next.y - next.x * current.y;
  }
  return signedArea > 0 ? 1 : -1;
}

/**
 * 把多边形的每条边沿法线平移 distance，再用相邻两条平移后的直线求交点得到等距轮廓。
 * distance 为正表示向外扩（outerBorder），为负表示向内缩（innerBorder）。
 * 退化边会被跳过；相邻边共线（求交无解）时使用平移后的原始点，避免边框凹回原轮廓。
 */
export function offsetPolygonPoints(points: IPointLike[], distance: number, closePath: boolean = true): IPointLike[] {
  const n = points?.length ?? 0;
  if (n < 2 || (closePath && n < 3) || !distance) {
    return points;
  }

  // 用带符号面积判断顶点绕向，保证 distance > 0 时法线一致朝外
  const sign = getPolygonWinding(points);

  // 每条边平移后的直线，用点 + 方向表示；开放路径不创建末点到首点的边
  const edgeCount = closePath ? n : n - 1;
  const lines: (OffsetLine | null)[] = [];
  for (let i = 0; i < edgeCount; i++) {
    const cur = points[i];
    const next = points[(i + 1) % n];
    const dx = next.x - cur.x;
    const dy = next.y - cur.y;
    const len = Math.sqrt(dx * dx + dy * dy);
    if (!len) {
      lines.push(null);
      continue;
    }
    const offsetX = (sign * dy * distance) / len;
    const offsetY = (-sign * dx * distance) / len;
    lines.push({ x: cur.x + offsetX, y: cur.y + offsetY, dx, dy, len, offsetX, offsetY });
  }

  // 预先找出每个顶点前后的有效边，避免连续退化边导致逐点回溯成 O(n²)
  const prevLines: (OffsetLine | null)[] = new Array(n);
  let prevLine: OffsetLine | null = null;
  if (closePath) {
    for (let i = edgeCount - 1; i >= 0; i--) {
      if (lines[i]) {
        prevLine = lines[i];
        break;
      }
    }
  }
  for (let i = 0; i < n; i++) {
    prevLines[i] = prevLine;
    if (i < edgeCount && lines[i]) {
      prevLine = lines[i];
    }
  }

  const nextLines: (OffsetLine | null)[] = new Array(n);
  let nextLine: OffsetLine | null = null;
  if (closePath) {
    for (let count = 0; count < edgeCount; count++) {
      const line = lines[(n - 1 + count) % edgeCount];
      if (line) {
        nextLine = line;
        break;
      }
    }
  }
  for (let i = n - 1; i >= 0; i--) {
    if (i < edgeCount && lines[i]) {
      nextLine = lines[i];
    }
    nextLines[i] = nextLine;
  }

  const offsetPointByLine = (point: IPointLike, line: OffsetLine) => ({
    x: point.x + line.offsetX,
    y: point.y + line.offsetY
  });

  const result: IPointLike[] = [];
  for (let i = 0; i < n; i++) {
    const prev = prevLines[i];
    const cur = nextLines[i];
    const line = prev || cur;
    if (!line) {
      result.push(points[i]);
      continue;
    }
    if (!prev || !cur) {
      result.push(offsetPointByLine(points[i], line));
      continue;
    }

    const denominator = prev.dx * cur.dy - prev.dy * cur.dx;
    if (Math.abs(denominator) <= 1e-12 * prev.len * cur.len) {
      // 平行边没有唯一交点，沿有效边的法线平移原顶点
      result.push(offsetPointByLine(points[i], cur));
      continue;
    }
    const t = ((cur.x - prev.x) * cur.dy - (cur.y - prev.y) * cur.dx) / denominator;
    const point = { x: prev.x + prev.dx * t, y: prev.y + prev.dy * t };
    result.push(Number.isFinite(point.x) && Number.isFinite(point.y) ? point : offsetPointByLine(points[i], cur));
  }
  return result;
}
