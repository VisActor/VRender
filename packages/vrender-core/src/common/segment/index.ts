import type { IPointLike } from '@visactor/vutils';
import type { ICurveType, IGenSegmentParams, ISegPath2D } from '../../interface';
import { genLinearSegments } from './linear';
import { genBasisSegments } from './basis';
import { genMonotoneXSegments, genMonotoneYSegments } from './monotone';
import { genStepSegments } from './step';
import { genLinearClosedSegments } from './linear-closed';
import { genCatmullRomSegments } from './catmull-rom';
import { genCatmullRomClosedSegments } from './catmull-rom-close';

export * from './linear';
export * from './linear-closed';
export * from './basis';
export * from './monotone';
export * from './step';
export * from './curve/curve-context';

export function calcLineCache(
  points: IPointLike[],
  curveType: ICurveType,
  params?: { startPoint?: IPointLike; curveTension?: number }
): ISegPath2D | null {
  switch (curveType) {
    case 'linear':
      return genLinearSegments(points, params);
    case 'basis':
      return genBasisSegments(points, params);
    case 'monotoneX':
      return genMonotoneXSegments(points, params);
    case 'monotoneY':
      return genMonotoneYSegments(points, params);
    case 'step':
      return genStepSegments(points, 0.5, params);
    case 'stepBefore':
      return genStepSegments(points, 0, params);
    case 'stepAfter':
      return genStepSegments(points, 1, params);
    case 'catmullRom':
      return genCatmullRomSegments(points, params?.curveTension ?? 0.5, params);
    case 'catmullRomClosed':
      return genCatmullRomClosedSegments(points, params?.curveTension ?? 0.5, params);
    case 'linearClosed':
      return genLinearClosedSegments(points, params);
    default:
      return genLinearSegments(points, params);
  }
}
