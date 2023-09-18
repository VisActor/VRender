import type { vec2, vec4 } from '@visactor/vutils';
import { isNumber, arrayEqual, pi } from '@visactor/vutils';
import type { IContext2d, ICustomPath2D } from '../../interface';

const halfPi = pi / 2;

export function createRectPath(
  path: ICustomPath2D | IContext2d,
  x: number,
  y: number,
  width: number,
  height: number,
  rectCornerRadius: number | number[]
) {
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
    switch (cornerRadiusArr.length) {
      case 0:
        cornerRadius = [0, 0, 0, 0];
        break;
      case 1:
        cornerRadius = [cornerRadiusArr[0], cornerRadiusArr[0], cornerRadiusArr[0], cornerRadiusArr[0]];
        break;
      case 2:
      case 3:
        cornerRadius = [cornerRadiusArr[0], cornerRadiusArr[1], cornerRadiusArr[0], cornerRadiusArr[1]];
        break;
      default:
        cornerRadius = cornerRadiusArr.slice(0, 5) as [number, number, number, number];
        break;
    }
  } else {
    cornerRadius = [0, 0, 0, 0];
  }

  // 当宽度小于0 或者 cornerRadius 极小时，不绘制 cornerRadius
  if (
    width < 0 ||
    Math.abs(cornerRadius[0]) + Math.abs(cornerRadius[1]) + Math.abs(cornerRadius[2]) + Math.abs(cornerRadius[3]) <
      1e-12
  ) {
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
  const _cornerRadius: vec4 = [
    Math.min(maxCornerRadius, cornerRadius[0]),
    Math.min(maxCornerRadius, cornerRadius[1]),
    Math.min(maxCornerRadius, cornerRadius[2]),
    Math.min(maxCornerRadius, cornerRadius[3])
  ];
  const leftTopPoint1: vec2 = [leftTop[0] + _cornerRadius[0], leftTop[1]];
  const leftTopPoint2: vec2 = [leftTop[0], leftTop[1] + _cornerRadius[0]];
  const rightTopPoint1: vec2 = [rightTop[0] - _cornerRadius[1], rightTop[1]];
  const rightTopPoint2: vec2 = [rightTop[0], rightTop[1] + _cornerRadius[1]];
  const rightBottomPoint1: vec2 = [rightBottom[0] - _cornerRadius[2], rightBottom[1]];
  const rightBottomPoint2: vec2 = [rightBottom[0], rightBottom[1] - _cornerRadius[2]];
  const leftBottomPoint1: vec2 = [leftBottom[0] + _cornerRadius[3], leftBottom[1]];
  const leftBottomPoint2: vec2 = [leftBottom[0], leftBottom[1] - _cornerRadius[3]];

  path.moveTo(leftTopPoint1[0], leftTopPoint1[1]);
  path.lineTo(rightTopPoint1[0], rightTopPoint1[1]);
  if (!arrayEqual(rightTopPoint1, rightTopPoint2)) {
    const centerX = rightTopPoint1[0];
    const centerY = rightTopPoint1[1] + _cornerRadius[1];
    path.arc(
      centerX,
      centerY,
      _cornerRadius[1],
      -halfPi,
      0,
      // Math.atan2(rightTopPoint1[1] - centerY, rightTopPoint1[0] - centerX),
      // Math.atan2(rightTopPoint2[1] - centerY, rightTopPoint2[0] - centerX),
      false
    );
    // path.arcTo(rightTop[0], rightTop[1], rightTopPoint2[0], rightTopPoint2[1], _cornerRadius[1]);
  }

  path.lineTo(rightBottomPoint2[0], rightBottomPoint2[1]);
  if (!arrayEqual(rightBottomPoint1, rightBottomPoint2)) {
    const centerX = rightBottomPoint2[0] - _cornerRadius[2];
    const centerY = rightBottomPoint2[1];
    path.arc(
      centerX,
      centerY,
      _cornerRadius[2],
      0,
      halfPi,
      // Math.atan2(rightBottomPoint2[1] - centerY, rightBottomPoint2[0] - centerX),
      // Math.atan2(rightBottomPoint1[1] - centerY, rightBottomPoint1[0] - centerX),
      false
    );
    // path.arcTo(rightBottom[0], rightBottom[1], rightBottomPoint1[0], rightBottomPoint1[1], _cornerRadius[2]);
  }

  path.lineTo(leftBottomPoint1[0], leftBottomPoint1[1]);
  if (!arrayEqual(leftBottomPoint1, leftBottomPoint2)) {
    const centerX = leftBottomPoint1[0];
    const centerY = leftBottomPoint1[1] - _cornerRadius[3];
    path.arc(
      centerX,
      centerY,
      _cornerRadius[3],
      halfPi,
      pi,
      // Math.atan2(leftBottomPoint1[1] - centerY, leftBottomPoint1[0] - centerX),
      // Math.atan2(leftBottomPoint2[1] - centerY, leftBottomPoint2[0] - centerX),
      false
    );
    // path.arcTo(leftBottom[0], leftBottom[1], leftBottomPoint2[0], leftBottomPoint2[1], _cornerRadius[3]);
  }

  path.lineTo(leftTopPoint2[0], leftTopPoint2[1]);
  if (!arrayEqual(leftTopPoint1, leftTopPoint2)) {
    const centerX = leftTopPoint1[0];
    const centerY = leftTopPoint1[1] + _cornerRadius[0];
    path.arc(
      centerX,
      centerY,
      _cornerRadius[0],
      pi,
      pi + halfPi,
      // Math.atan2(leftTopPoint2[1] - centerY, leftTopPoint2[0] - centerX),
      // Math.atan2(leftTopPoint1[1] - centerY, leftTopPoint1[0] - centerX) + Math.PI * 2,
      false
    );
    // path.arcTo(leftTop[0], leftTop[1], leftTopPoint1[0], leftTopPoint1[1], _cornerRadius[0]);
  }
  path.closePath();
  return path;
}
