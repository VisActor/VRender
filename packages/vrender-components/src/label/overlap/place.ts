import { Text, createText } from '@visactor/vrender';
import { IAABBBounds, IBoundsLike, isFunction } from '@visactor/vutils';
import { PointLocationCfg } from '../../core/type';
import type { LabelBase } from '../base';
import type { BaseLabelAttrs, OverlapAttrs, Strategy } from '../type';
import type { Bitmap } from './bitmap';
import { BitmapTool, boundToRange } from './scaler';

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

export function canPlace($: BitmapTool, bitmap: Bitmap, bound: IBoundsLike, checkBound = true) {
  const range = boundToRange($, bound);
  const outOfBounds = checkBound && bitmap.outOfBounds(range);

  if (outOfBounds) {
    return false;
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
  clampForce = true
) {
  for (let i = 0; i < candidates.length; i++) {
    const tempText = createText(text.attribute) as Text;
    tempText.setAttributes(candidates[i]);
    tempText.update();

    if (canPlace($, bitmap, boundToRange($, tempText.AABBBounds), clampForce)) {
      bitmap.setRange(boundToRange($, tempText.AABBBounds));
      text.setAttributes(candidates[i]);
      return true;
    }
  }
}

export function place<T extends BaseLabelAttrs>(
  $: BitmapTool,
  bitmap: Bitmap,
  s: Strategy,
  attrs: T,
  text: Text,
  bounds: IBoundsLike,
  labeling?: LabelBase<T>['labeling']
): boolean {
  if (s.type === 'bound' || s.type === 'position') {
    if (isFunction(labeling)) {
      // TODO：这里可以 filter 掉初始位置，提升一部分性能
      const userPosition = isFunction(s.position) ? s.position(text.attribute) : s.position;
      const positions = (userPosition || defaultLabelPosition(attrs.type)) as string[];
      const candidates = positions.map(p => labeling(text.AABBBounds, bounds, p, attrs.offset) as PointLocationCfg);
      return !!placeToCandidates($, bitmap, text, candidates, (attrs.overlap as OverlapAttrs)?.clampForce);
    }
    return false;
  }

  if (s.type === 'moveY') {
    const offset = s.offset ? (isFunction(s.offset) ? s.offset(text.attribute) : s.offset) : [];
    const candidates = offset.map(dy => {
      return { x: text.attribute.x as number, y: (text.attribute.y as number) + dy };
    });
    return !!placeToCandidates($, bitmap, text, candidates, (attrs.overlap as OverlapAttrs)?.clampForce);
  }

  if (s.type === 'moveX') {
    const offset = s.offset ? (isFunction(s.offset) ? s.offset(text.attribute) : s.offset) : [];
    const candidates = offset.map(dx => {
      return { x: (text.attribute.x as number) + dx, y: text.attribute.y as number };
    });
    return !!placeToCandidates($, bitmap, text, candidates, (attrs.overlap as OverlapAttrs)?.clampForce);
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
