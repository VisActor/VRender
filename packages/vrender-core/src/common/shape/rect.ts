import type { vec2, vec4 } from '@visactor/vutils';
import { isNumber, arrayEqual, pi, abs, isString } from '@visactor/vutils';
import type { IContext2d, ICustomPath2D } from '../../interface';

const halfPi = pi / 2;

type IEdgeCb = (x1: number, y1: number, x2: number, y2: number) => void;
export function createRectPath(
  path: ICustomPath2D | IContext2d,
  x: number,
  y: number,
  width: number,
  height: number,
  rectCornerRadius: number | string | (number | string)[],
  // @since 0.22.0
  roundCorner: boolean = true,
  edgeCb?: IEdgeCb[]
) {
  // TODO 避免breakChange，旧版本的roundCorner位置是edgeCb
  if (Array.isArray(roundCorner)) {
    edgeCb = roundCorner;
    roundCorner = true;
  }
  if (width < 0) {
    x += width;
    width = -width;
  }
  if (height < 0) {
    y += height;
    height = -height;
  }
  // 匹配cornerRadius
  let cornerRadius: vec4;
  if (isNumber(rectCornerRadius, true)) {
    cornerRadius = [
      <number>rectCornerRadius,
      <number>rectCornerRadius,
      <number>rectCornerRadius,
      <number>rectCornerRadius
    ];
  } else if (Array.isArray(rectCornerRadius)) {
    const cornerRadiusArr: number[] = rectCornerRadius as number[];
    let cr0;
    let cr1;
    let cr2;
    let cr3;
    switch (cornerRadiusArr.length) {
      case 0:
        cornerRadius = [0, 0, 0, 0];
        break;
      case 1:
        cr0 = cornerRadiusArr[0];
        cornerRadius = [cr0, cr0, cr0, cr0];
        break;
      case 2:
      case 3:
        cr0 = cornerRadiusArr[0];
        cr1 = cornerRadiusArr[1];
        cornerRadius = [cr0, cr1, cr0, cr1];
        break;
      default:
        cornerRadius = cornerRadiusArr.slice() as [number, number, number, number];
        break;
    }
  } else {
    cornerRadius = [0, 0, 0, 0];
  }

  // 当宽度小于0 或者 cornerRadius 极小时，不绘制 cornerRadius
  if (width < 0 || abs(cornerRadius[0]) + abs(cornerRadius[1]) + abs(cornerRadius[2]) + abs(cornerRadius[3]) < 1e-12) {
    return path.rect(x, y, width, height);
  }

  const [leftTop, rightTop, rightBottom, leftBottom]: [vec2, vec2, vec2, vec2] = [
    [x, y],
    [x + width, y],
    [x + width, y + height],
    [x, y + height]
  ];
  //
  // *(leftTopPoint1)******************(rightTopPoint1)
  // (leftTopPoint2)                  (rightTopPoint2)
  // *                                *
  // *                                *
  // (leftBottomPoint2)               (rightBottomPoint2)
  // *(leftBottomPoint1)***************(rightBottomPoint1)
  //
  const maxCornerRadius = Math.min(width / 2, height / 2);
  if (isString(cornerRadius[0])) {
    cornerRadius[0] = (parseFloat(cornerRadius[0]) / 100) * maxCornerRadius;
  }
  if (isString(cornerRadius[1])) {
    cornerRadius[1] = (parseFloat(cornerRadius[1]) / 100) * maxCornerRadius;
  }
  if (isString(cornerRadius[2])) {
    cornerRadius[2] = (parseFloat(cornerRadius[2]) / 100) * maxCornerRadius;
  }
  if (isString(cornerRadius[3])) {
    cornerRadius[3] = (parseFloat(cornerRadius[3]) / 100) * maxCornerRadius;
  }

  const _cornerRadius: vec4 = [
    Math.sign(cornerRadius[0]) * Math.min(maxCornerRadius, abs(cornerRadius[0])),
    Math.sign(cornerRadius[1]) * Math.min(maxCornerRadius, abs(cornerRadius[1])),
    Math.sign(cornerRadius[2]) * Math.min(maxCornerRadius, abs(cornerRadius[2])),
    Math.sign(cornerRadius[3]) * Math.min(maxCornerRadius, abs(cornerRadius[3]))
  ];
  const leftTopPoint1: vec2 = [leftTop[0] + abs(_cornerRadius[0]), leftTop[1]];
  const leftTopPoint2: vec2 = [leftTop[0], leftTop[1] + abs(_cornerRadius[0])];
  const rightTopPoint1: vec2 = [rightTop[0] - abs(_cornerRadius[1]), rightTop[1]];
  const rightTopPoint2: vec2 = [rightTop[0], rightTop[1] + abs(_cornerRadius[1])];
  const rightBottomPoint1: vec2 = [rightBottom[0] - abs(_cornerRadius[2]), rightBottom[1]];
  const rightBottomPoint2: vec2 = [rightBottom[0], rightBottom[1] - abs(_cornerRadius[2])];
  const leftBottomPoint1: vec2 = [leftBottom[0] + abs(_cornerRadius[3]), leftBottom[1]];
  const leftBottomPoint2: vec2 = [leftBottom[0], leftBottom[1] - abs(_cornerRadius[3])];

  path.moveTo(leftTopPoint1[0], leftTopPoint1[1]);

  if (!roundCorner) {
    // 上边
    edgeCb && edgeCb[0]
      ? edgeCb[0](leftTopPoint1[0], leftTopPoint1[1], rightTopPoint1[0], rightTopPoint1[1])
      : path.lineTo(rightTopPoint1[0], rightTopPoint1[1]);
    // 右边
    edgeCb && edgeCb[1]
      ? edgeCb[1](rightTopPoint1[0], rightTopPoint1[1], rightBottomPoint1[0], rightBottomPoint1[1])
      : path.lineTo(rightBottomPoint1[0], rightBottomPoint1[1]);
    // 下边
    edgeCb && edgeCb[2]
      ? edgeCb[2](rightBottomPoint1[0], rightBottomPoint1[1], leftBottomPoint1[0], leftBottomPoint1[1])
      : path.lineTo(leftBottomPoint1[0], leftBottomPoint1[1]);

    // 左边
    edgeCb && edgeCb[2]
      ? edgeCb[2](leftBottomPoint1[0], leftBottomPoint1[1], leftTopPoint1[0], leftTopPoint1[1])
      : path.lineTo(leftTopPoint1[0], leftTopPoint1[1]);
  } else {
    // 上边
    edgeCb && edgeCb[0]
      ? edgeCb[0](leftTopPoint1[0], leftTopPoint1[1], rightTopPoint1[0], rightTopPoint1[1])
      : path.lineTo(rightTopPoint1[0], rightTopPoint1[1]);
    if (!arrayEqual(rightTopPoint1, rightTopPoint2)) {
      // arc from rightTopPoint1 to rightTopPoint2
      edgeCb && edgeCb[0] && path.moveTo(rightTopPoint1[0], rightTopPoint1[1]);
      const centerX = _cornerRadius[1] >= 0 ? rightTopPoint1[0] : rightTop[0];
      const centerY = _cornerRadius[1] >= 0 ? rightTopPoint1[1] + _cornerRadius[1] : rightTop[1];
      const startAngle = _cornerRadius[1] >= 0 ? -halfPi : -halfPi * 2;
      const endAngle = _cornerRadius[1] >= 0 ? 0 : -halfPi * 3;
      const anticlockwise = _cornerRadius[1] < 0;
      path.arc(
        centerX,
        centerY,
        abs(_cornerRadius[1]),
        startAngle,
        endAngle,
        // Math.atan2(rightTopPoint1[1] - centerY, rightTopPoint1[0] - centerX),
        // Math.atan2(rightTopPoint2[1] - centerY, rightTopPoint2[0] - centerX),
        anticlockwise
      );
      // path.arcTo(rightTop[0], rightTop[1], rightTopPoint2[0], rightTopPoint2[1], _cornerRadius[1]);
    }

    // 右边
    edgeCb && edgeCb[1]
      ? edgeCb[1](rightTopPoint2[0], rightTopPoint2[1], rightBottomPoint2[0], rightBottomPoint2[1])
      : path.lineTo(rightBottomPoint2[0], rightBottomPoint2[1]);
    if (!arrayEqual(rightBottomPoint1, rightBottomPoint2)) {
      // arc from rightBottomPoint2 to rightTopPoint1
      const centerX = _cornerRadius[2] >= 0 ? rightBottomPoint2[0] - _cornerRadius[2] : rightBottom[0];
      const centerY = _cornerRadius[2] >= 0 ? rightBottomPoint2[1] : rightBottom[1];
      edgeCb && edgeCb[1] && path.moveTo(rightBottomPoint2[0], rightBottomPoint2[1]);
      const startAngle = _cornerRadius[2] >= 0 ? 0 : -halfPi;
      const endAngle = _cornerRadius[2] >= 0 ? halfPi : -halfPi * 2;
      const anticlockwise = _cornerRadius[2] < 0;
      path.arc(
        centerX,
        centerY,
        abs(_cornerRadius[2]),
        startAngle,
        endAngle,
        // Math.atan2(rightBottomPoint2[1] - centerY, rightBottomPoint2[0] - centerX),
        // Math.atan2(rightBottomPoint1[1] - centerY, rightBottomPoint1[0] - centerX),
        anticlockwise
      );
      // path.arcTo(rightBottom[0], rightBottom[1], rightBottomPoint1[0], rightBottomPoint1[1], _cornerRadius[2]);
    }

    edgeCb && edgeCb[2]
      ? edgeCb[2](rightBottomPoint1[0], rightBottomPoint1[1], leftBottomPoint1[0], leftBottomPoint1[1])
      : path.lineTo(leftBottomPoint1[0], leftBottomPoint1[1]);
    if (!arrayEqual(leftBottomPoint1, leftBottomPoint2)) {
      // arc from leftBottomPoint1 to leftBottomPoint2
      const centerX = _cornerRadius[3] >= 0 ? leftBottomPoint1[0] : leftBottom[0];
      const centerY = _cornerRadius[3] >= 0 ? leftBottomPoint1[1] - _cornerRadius[3] : leftBottom[1];
      const startAngle = _cornerRadius[3] >= 0 ? halfPi : 0;
      const endAngle = _cornerRadius[3] >= 0 ? pi : -halfPi;
      const anticlockwise = _cornerRadius[3] < 0;
      edgeCb && edgeCb[2] && path.moveTo(leftBottomPoint1[0], leftBottomPoint1[1]);
      path.arc(
        centerX,
        centerY,
        abs(_cornerRadius[3]),
        startAngle,
        endAngle,
        // Math.atan2(leftBottomPoint1[1] - centerY, leftBottomPoint1[0] - centerX),
        // Math.atan2(leftBottomPoint2[1] - centerY, leftBottomPoint2[0] - centerX),
        anticlockwise
      );
      // path.arcTo(leftBottom[0], leftBottom[1], leftBottomPoint2[0], leftBottomPoint2[1], _cornerRadius[3]);
    }

    edgeCb && edgeCb[3]
      ? edgeCb[3](leftBottomPoint2[0], leftBottomPoint2[1], leftTopPoint2[0], leftTopPoint2[1])
      : path.lineTo(leftTopPoint2[0], leftTopPoint2[1]);
    if (!arrayEqual(leftTopPoint1, leftTopPoint2)) {
      const centerX = _cornerRadius[0] >= 0 ? leftTopPoint1[0] : leftTop[0];
      const centerY = _cornerRadius[0] >= 0 ? leftTopPoint1[1] + _cornerRadius[0] : leftTop[1];
      const startAngle = _cornerRadius[0] >= 0 ? pi : halfPi;
      const endAngle = _cornerRadius[0] >= 0 ? halfPi * 3 : 0;
      const anticlockwise = _cornerRadius[0] < 0;
      edgeCb && edgeCb[3] && path.moveTo(leftTopPoint2[0], leftTopPoint2[1]);
      path.arc(
        centerX,
        centerY,
        abs(_cornerRadius[0]),
        startAngle,
        endAngle,
        // Math.atan2(leftTopPoint2[1] - centerY, leftTopPoint2[0] - centerX),
        // Math.atan2(leftTopPoint1[1] - centerY, leftTopPoint1[0] - centerX) + Math.PI * 2,
        anticlockwise
      );
      // path.arcTo(leftTop[0], leftTop[1], leftTopPoint1[0], leftTopPoint1[1], _cornerRadius[0]);
    }
  }
  !edgeCb && path.closePath();
  return path;
}
