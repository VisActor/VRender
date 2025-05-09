import { clamp, isValidNumber, Point, type IPointLike } from '@visactor/vutils';
import type { ISegment, ILineAttribute, EasingType } from '@visactor/vrender-core';
import { pointInterpolation } from '@visactor/vrender-core';
import { ACustomAnimate } from './custom-animate';

export class TagPointsUpdate extends ACustomAnimate<{ points?: IPointLike[]; segments?: ISegment[] }> {
  protected fromPoints: IPointLike[];
  protected toPoints: IPointLike[];
  protected points: IPointLike[];
  protected interpolatePoints: [IPointLike, IPointLike][];
  protected newPointAnimateType: 'grow' | 'appear' | 'clip';
  protected clipRange: number;
  protected shrinkClipRange: number;
  protected clipRangeByDimension: 'x' | 'y';
  protected segmentsCache: number[];

  constructor(
    from: any,
    to: any,
    duration: number,
    easing: EasingType,
    params?: { newPointAnimateType?: 'grow' | 'appear' | 'clip'; clipRangeByDimension?: 'x' | 'y' }
  ) {
    super(from, to, duration, easing, params);
    this.newPointAnimateType = params?.newPointAnimateType ?? 'grow';
    this.clipRangeByDimension = params?.clipRangeByDimension ?? 'x';
  }

  private getPoints(attribute: typeof this.from, cache = false): IPointLike[] {
    if (attribute.points) {
      return attribute.points;
    }

    if (attribute.segments) {
      const points = [] as IPointLike[];
      if (!this.segmentsCache) {
        this.segmentsCache = [];
      }
      attribute.segments.map((segment: any) => {
        if (segment.points) {
          points.push(...segment.points);
        }
        if (cache) {
          this.segmentsCache.push(segment.points?.length ?? 0);
        }
      });
      return points;
    }
    return [];
  }

  onBind(): void {
    super.onBind();
    const { points, segments } = this.target.attribute as any;
    const { points: pointsTo, segments: segmentsTo } = this.target.getFinalAttribute() as any;

    this.from = { points, segments };
    this.to = { points: pointsTo, segments: segmentsTo };
    this.props = this.to;

    const originFromPoints = this.getPoints(this.from);
    const originToPoints = this.getPoints(this.to, true);
    this.fromPoints = !originFromPoints ? [] : !Array.isArray(originFromPoints) ? [originFromPoints] : originFromPoints;
    this.toPoints = !originToPoints ? [] : !Array.isArray(originToPoints) ? [originToPoints] : originToPoints;

    const tagMap = new Map<string, IPointLike>();
    this.fromPoints.forEach(point => {
      if (point.context) {
        tagMap.set(point.context, point);
      }
    });
    let firstMatchedIndex = Infinity;
    let lastMatchedIndex = -Infinity;
    let firstMatchedPoint: IPointLike;
    let lastMatchedPoint: IPointLike;
    for (let i = 0; i < this.toPoints.length; i += 1) {
      if (tagMap.has(this.toPoints[i].context)) {
        firstMatchedIndex = i;
        firstMatchedPoint = tagMap.get(this.toPoints[i].context);
        break;
      }
    }
    for (let i = this.toPoints.length - 1; i >= 0; i -= 1) {
      if (tagMap.has(this.toPoints[i].context)) {
        lastMatchedIndex = i;
        lastMatchedPoint = tagMap.get(this.toPoints[i].context);
        break;
      }
    }

    if (this.newPointAnimateType === 'clip') {
      if (this.toPoints.length !== 0) {
        if (Number.isFinite(lastMatchedIndex)) {
          this.clipRange =
            this.toPoints[lastMatchedIndex][this.clipRangeByDimension] /
            this.toPoints[this.toPoints.length - 1][this.clipRangeByDimension];
          if (this.clipRange === 1) {
            this.shrinkClipRange =
              this.toPoints[lastMatchedIndex][this.clipRangeByDimension] /
              this.fromPoints[this.fromPoints.length - 1][this.clipRangeByDimension];
          }
          if (!isValidNumber(this.clipRange)) {
            this.clipRange = 0;
          } else {
            this.clipRange = clamp(this.clipRange, 0, 1);
          }
        } else {
          this.clipRange = 0;
        }
      }
    }
    // TODO: shrink removed points
    // if no point is matched, animation should start from toPoint[0]
    let prevMatchedPoint = this.toPoints[0];
    this.interpolatePoints = this.toPoints.map((point, index) => {
      const matchedPoint = tagMap.get(point.context);
      if (matchedPoint) {
        prevMatchedPoint = matchedPoint;
        return [matchedPoint, point];
      }
      // appear new point
      if (this.newPointAnimateType === 'appear' || this.newPointAnimateType === 'clip') {
        return [point, point];
      }
      // grow new point
      if (index < firstMatchedIndex && firstMatchedPoint) {
        return [firstMatchedPoint, point];
      } else if (index > lastMatchedIndex && lastMatchedPoint) {
        return [lastMatchedPoint, point];
      }
      return [prevMatchedPoint, point];
    });
    this.points = this.interpolatePoints.map(interpolate => {
      const fromPoint = interpolate[0];
      const toPoint = interpolate[1];
      const newPoint = new Point(fromPoint.x, fromPoint.y, fromPoint.x1, fromPoint.y1);
      newPoint.defined = toPoint.defined;
      newPoint.context = toPoint.context;
      return newPoint;
    });
  }

  onFirstRun(): void {
    const lastClipRange = (this.target.attribute as any).clipRange;
    if (isValidNumber(lastClipRange * this.clipRange)) {
      this.clipRange *= lastClipRange;
    }
  }

  onUpdate(end: boolean, ratio: number, out: Record<string, any>): void {
    // if not create new points, multi points animation might not work well.
    this.points = this.points.map((point, index) => {
      const newPoint = pointInterpolation(this.interpolatePoints[index][0], this.interpolatePoints[index][1], ratio);
      newPoint.context = point.context;
      return newPoint;
    });
    if (this.clipRange) {
      if (this.shrinkClipRange) {
        // 折线变短
        if (!end) {
          out.points = this.fromPoints;
          out.clipRange = this.clipRange - (this.clipRange - this.shrinkClipRange) * ratio;
        } else {
          out.points = this.toPoints;
          out.clipRange = 1;
        }
        return;
      }
      this.target.setAttributes({ clipRange: this.clipRange + (1 - this.clipRange) * ratio } as any);
    }
    if (this.segmentsCache && this.to.segments) {
      let start = 0;
      const segments = this.to.segments.map((segment: any, index: any) => {
        const end = start + this.segmentsCache[index];
        const points = this.points.slice(start, end);
        start = end;
        return {
          ...segment,
          points
        };
      });
      (this.target.attribute as ILineAttribute).segments = segments;
    } else {
      (this.target.attribute as ILineAttribute).points = this.points;
    }
    this.target.addUpdatePositionTag();
    this.target.addUpdateShapeAndBoundsTag();
  }
}
