import type { Point } from '../../core/type';
import { normalize, scale } from '../../util';

export interface LineAxisMixin {
  attribute: { start: Point; end: Point; verticalFactor?: number };
}

export class LineAxisMixin {
  isInValidValue(value: number) {
    return value < 0 || value > 1;
  }

  getTickCoord(tickValue: number): Point {
    const { start } = this.attribute;
    const axisVector = this.getRelativeVector();
    return {
      x: start.x + axisVector[0] * tickValue,
      y: start.y + axisVector[1] * tickValue
    };
  }

  getRelativeVector(point?: Point): [number, number] {
    const { start, end } = this.attribute;
    return [end.x - start.x, end.y - start.y];
  }

  getVerticalVector(offset: number, inside = false, point: Point): [number, number] {
    const { verticalFactor = 1 } = this.attribute;
    const axisVector = this.getRelativeVector();
    const normalizedAxisVector = normalize(axisVector);
    const verticalVector: [number, number] = [normalizedAxisVector[1], normalizedAxisVector[0] * -1];
    return scale(verticalVector, offset * (inside ? 1 : -1) * verticalFactor);
  }
}
