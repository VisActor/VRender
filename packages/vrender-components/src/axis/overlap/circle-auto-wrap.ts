import type { IText } from '@visactor/vrender-core';
import { isEmpty, isValidNumber } from '@visactor/vutils';
import { isAngleHorizontal, isAngleVertical } from './util';
import type { Point } from '../../core/type';
import type { AxisItem } from '../type';

type WrapConfig = {
  center: Point;
  inside?: boolean;
  ellipsis?: string;
  bounds: { x1: number; x2: number; y1: number; y2: number };
};

export function circleAutoWrap(labels: IText[], labelData: AxisItem[], config: WrapConfig) {
  const { center, inside, bounds } = config;
  if (isEmpty(labels)) {
    return;
  }

  if (inside) {
  } else {
  }
}
