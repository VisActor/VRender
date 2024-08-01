import { polarToCartesian } from '@visactor/vutils';
import { POLAR_START_ANGLE, POLAR_END_ANGLE } from '../../constant';
import type { Point } from '../../core/type';
import { getCircleVerticalVector } from '../util';

export interface CircleAxisMixin {
  attribute: {
    /**
     * 当配置了 innerRadius 时，可以通过设置 inside: true，将坐标轴战士在内圆半径上。
     * @default false
     */
    inside?: boolean;
    /**
     * 圆心坐标
     */
    center: Point;
    /**
     * **弧度值**，起始弧度，默认 -0.5 * Math.PI
     *
     */
    startAngle?: number;
    /**
     * **弧度值**，结束弧度，默认 1.5 * Math.PI
     */
    endAngle?: number;
    /**
     * 半径
     */
    radius: number;
    /** 内半径 */
    innerRadius?: number;
  };
}

export class CircleAxisMixin {
  isInValidValue(value: number) {
    const { startAngle = POLAR_START_ANGLE, endAngle = POLAR_END_ANGLE } = this.attribute;
    if (Math.abs(endAngle - startAngle) % (Math.PI * 2) === 0) {
      return value > 1;
    }

    return value < 0 || value > 1;
  }

  getTickCoord(tickValue: number): Point {
    const {
      startAngle = POLAR_START_ANGLE,
      endAngle = POLAR_END_ANGLE,
      center,
      radius,
      inside = false,
      innerRadius = 0
    } = this.attribute;
    const angle = startAngle + (endAngle - startAngle) * tickValue;
    return polarToCartesian(center, inside && innerRadius > 0 ? innerRadius : radius, angle);
  }

  getVerticalVector(offset: number, inside = false, point: Point): [number, number] {
    return getCircleVerticalVector(offset, point, this.attribute.center, inside, this.attribute.inside);
  }

  getRelativeVector(point?: Point): [number, number] {
    const { center } = this.attribute;
    return [point.y - center.y, -1 * (point.x - center.x)];
  }
}
