import type { IText, Text } from '@visactor/vrender-core';
import type { IAABBBounds, IBoundsLike } from '@visactor/vutils';
import { isFunction, isValid } from '@visactor/vutils';
import type { PointLocationCfg } from '../../core/type';
import type { LabelBase } from '../base';
import type { BaseLabelAttrs, OverlapAttrs, Strategy } from '../type';
import type { Bitmap } from './bitmap';
import type { BitmapTool } from './scaler';
import { boundToRange, clampRangeByBitmap } from './scaler';

/**
 * 防重叠逻辑参考 https://github.com/vega/vega/
 * Copyright (c) 2015-2023, University of Washington Interactive Data Lab
  All rights reserved.

  Redistribution and use in source and binary forms, with or without
  modification, are permitted provided that the following conditions are met:

  1. Redistributions of source code must retain the above copyright notice, this
    list of conditions and the following disclaimer.

  2. Redistributions in binary form must reproduce the above copyright notice,
    this list of conditions and the following disclaimer in the documentation
    and/or other materials provided with the distribution.

  3. Neither the name of the copyright holder nor the names of its contributors
    may be used to endorse or promote products derived from this software
    without specific prior written permission.

  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
  AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
  IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
  DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE
  FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
  DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
  SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
  CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
  OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
  OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

export function canPlace($: BitmapTool, bitmap: Bitmap, bound: IBoundsLike, checkBound = true, pad = 0) {
  let range = bound;
  if (pad > 0) {
    range = {
      x1: bound.x1 - pad,
      x2: bound.x2 + pad,
      y1: bound.y1 - pad,
      y2: bound.y2 + pad
    };
  }
  range = boundToRange($, range);

  const outOfBounds = bitmap.outOfBounds(range);

  if (checkBound && outOfBounds) {
    return false;
  }

  // 超出边界，需要将判断区域调整到可视区域内
  if (outOfBounds) {
    range = clampRangeByBitmap($, range);
  }

  return !bitmap.getRange(range);
}

/**
 * 是否在图形内部
 * @param textBound
 * @param shapeBound
 * @returns
 */
export function canPlaceInside(textBound: IBoundsLike, shapeBound: IAABBBounds) {
  if (!textBound || !shapeBound) {
    return false;
  }
  return shapeBound.encloses(textBound);
}

export function placeToCandidates(
  $: BitmapTool,
  bitmap: Bitmap,
  text: Text,
  candidates: PointLocationCfg[] = [],
  clampForce = true,
  pad = 0,
  changePosition = false
): PointLocationCfg | false {
  const validCandidates = candidates.filter(candidate => isValid(candidate));
  for (let i = 0; i < validCandidates.length; i++) {
    let measureText;
    if (changePosition) {
      measureText = text;
    } else {
      measureText = text.clone();
    }
    measureText.setAttributes(validCandidates[i]);

    if (canPlace($, bitmap, measureText.AABBBounds, clampForce, pad)) {
      bitmap.setRange(boundToRange($, measureText.AABBBounds, true));
      return validCandidates[i];
    }
  }
  return false;
}

export function place<T extends BaseLabelAttrs>(
  $: BitmapTool,
  bitmap: Bitmap,
  s: Strategy,
  attrs: T,
  text: Text,
  bounds: IBoundsLike,
  labeling?: LabelBase<T>['labeling']
): PointLocationCfg | false {
  const clampForce = (attrs.overlap as OverlapAttrs)?.clampForce;
  const overlapPadding = (attrs.overlap as OverlapAttrs)?.overlapPadding;
  if (s.type === 'bound' || s.type === 'position') {
    if (isFunction(labeling)) {
      const userPosition = isFunction(s.position) ? s.position(text.attribute) : s.position;
      const positions = (userPosition || defaultLabelPosition(attrs.type)) as string[];
      const candidates = positions.map(p => labeling(text.AABBBounds, bounds, p, attrs.offset) as PointLocationCfg);
      const shouldClone = s.restorePosition === false;
      return placeToCandidates($, bitmap, text, candidates, clampForce, overlapPadding, shouldClone);
    }
    return false;
  }

  if (s.type === 'moveY') {
    const offset = s.offset ? (isFunction(s.offset) ? s.offset(text.attribute) : s.offset) : [];
    const candidates = offset.map(dy => {
      return { x: text.attribute.x as number, y: (text.attribute.y as number) + dy };
    });
    return placeToCandidates($, bitmap, text, candidates, clampForce, overlapPadding);
  }

  if (s.type === 'moveX') {
    const offset = s.offset ? (isFunction(s.offset) ? s.offset(text.attribute) : s.offset) : [];
    const candidates = offset.map(dx => {
      return { x: (text.attribute.x as number) + dx, y: text.attribute.y as number };
    });
    return placeToCandidates($, bitmap, text, candidates, clampForce, overlapPadding);
  }
  return false;
}

export const DefaultPositions = [
  'top',
  'bottom',
  'right',
  'left',
  'top-right',
  'bottom-right',
  'top-left',
  'bottom-left'
];
export const DefaultRectPositions = ['top', 'inside-top', 'inside'];

export function defaultLabelPosition(type?: string) {
  switch (type) {
    case 'rect':
      return DefaultRectPositions;
    default:
      return DefaultPositions;
  }
}

export function clampText(
  text: IText,
  width: number,
  height: number,
  padding: { top?: number; left?: number; right?: number; bottom?: number } = {}
) {
  const { x1, x2, y1, y2 } = text.AABBBounds;
  const { top = 0, left = 0, right = 0, bottom = 0 } = padding;

  const minX = Math.min(x1, x2);
  const maxX = Math.max(x1, x2);

  const minY = Math.min(y1, y2);
  const maxY = Math.max(y1, y2);

  const minXWithPadding = 0 - left;
  const maxXWithPadding = width + right;

  const minYWithPadding = 0 - top;
  const maxYWithPadding = height + bottom;

  let dx = 0;
  let dy = 0;

  // x 方向
  if (minX < minXWithPadding) {
    dx = -minX;
  } else if (maxX > maxXWithPadding) {
    dx = maxXWithPadding - maxX;
  }

  // y 方向
  if (minY < minYWithPadding) {
    dy = -minY;
  } else if (maxY > maxYWithPadding) {
    dy = maxYWithPadding - maxY;
  }

  return { dx, dy };
}
