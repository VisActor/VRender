import type { AABBBounds, OBBBounds } from '@visactor/vutils';
import { pi2, sin, epsilon, abs, asin, clampAngleByRadian, isNumber, cos, sqrt } from '@visactor/vutils';
import type { IArc, IArcGraphicAttribute } from '../interface/graphic/arc';
import { Graphic, GRAPHIC_UPDATE_TAG_KEY, NOWORK_ANIMATE_ATTR } from './graphic';
import { CustomPath2D } from '../common/custom-path2d';
import { parsePadding } from '../common/utils';
import { getTheme } from './theme';
import { application } from '../application';
import type { GraphicType } from '../interface';
import { ARC_NUMBER_TYPE } from './constants';

/**
 * 部分代码参考 https://github.com/d3/d3-shape/
 * Copyright 2010-2022 Mike Bostock

  Permission to use, copy, modify, and/or distribute this software for any purpose
  with or without fee is hereby granted, provided that the above copyright notice
  and this permission notice appear in all copies.

  THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
  REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND
  FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
  INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS
  OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER
  TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF
  THIS SOFTWARE.
 */

const ARC_UPDATE_TAG_KEY = [
  'innerRadius',
  'outerRadius',
  'startAngle',
  'endAngle',
  'cornerRadius',
  'padAngle',
  'padRadius',
  'cap',
  ...GRAPHIC_UPDATE_TAG_KEY
];

/**
 * 圆形图元
 * 默认顺时针绘制
 */
export class Arc extends Graphic<IArcGraphicAttribute> implements IArc {
  type: GraphicType = 'arc';

  static NOWORK_ANIMATE_ATTR = {
    cap: 1,
    ...NOWORK_ANIMATE_ATTR
  };

  // static parseCornerRadius(r: IArcGraphicAttribute['cornerRadius']) {
  //   if (isArray(r)) {
  //     if ((r as any[]).length === 1) {
  //       const value = r[0];
  //       return [value, value, value, value];
  //     }

  //     if ((r as any[]).length === 2) {
  //       return [r[0], r[0], r[1], r[1]];
  //     }

  //     if ((r as any[]).length === 3) {
  //       return [r[0], r[1], r[2], 0];
  //     }

  //     return (r as any[]).slice(0, 4);
  //   }

  //   return [r as string | number, r as string | number, r as string | number, r as string | number];
  // }

  // static isCornerRadiusEqual(oldR: IArcGraphicAttribute['cornerRadius'], newR: IArcGraphicAttribute['cornerRadius']) {
  //   throw new Error('暂不支持');
  //   if (oldR === newR) {
  //     return true;
  //   }

  //   if (isArray(oldR) && !isArray(newR)) {
  //     return (oldR as (string | number)[]).every(r => r === newR);
  //   }

  //   if (!isArray(oldR) && isArray(newR)) {
  //     return (newR as (string | number)[]).every(r => r === oldR);
  //   }

  //   return arrayEqual(oldR as (string | number)[], newR as (string | number)[]);
  // }

  constructor(params: IArcGraphicAttribute) {
    super(params);
    this.numberType = ARC_NUMBER_TYPE;
  }

  isValid(): boolean {
    return super.isValid() && this._isValid();
  }
  private _isValid(): boolean {
    const { startAngle, endAngle, outerRadius, innerRadius } = this.attribute;
    return (
      this._validNumber(startAngle) &&
      this._validNumber(endAngle) &&
      this._validNumber(outerRadius) &&
      this._validNumber(innerRadius)
    );
  }

  getParsedCornerRadius() {
    const arcTheme = getTheme(this).arc;
    const {
      cornerRadius = arcTheme.cornerRadius,
      outerRadius = arcTheme.outerRadius,
      innerRadius = arcTheme.innerRadius
    } = this.attribute;
    if (cornerRadius === 0 || cornerRadius === '0%') {
      return 0;
    }
    const deltaRadius = Math.abs(outerRadius - innerRadius);
    return Math.min(
      isNumber(cornerRadius, true)
        ? (cornerRadius as number)
        : (deltaRadius * parseFloat(cornerRadius as string)) / 100,
      deltaRadius / 2
    );
  }

  getParsedAngle() {
    const arcTheme = getTheme(this).arc;
    let { startAngle = arcTheme.startAngle, endAngle = arcTheme.endAngle } = this.attribute;
    const { cap = arcTheme.cap } = this.attribute;

    const sign = endAngle - startAngle >= 0 ? 1 : -1;
    const deltaAngle = endAngle - startAngle;

    startAngle = clampAngleByRadian(startAngle);
    endAngle = startAngle + deltaAngle;

    if (cap && abs(deltaAngle) < pi2 - epsilon) {
      let startCap = 1;
      let endCap = 1;
      if ((cap as boolean[]).length) {
        startCap = Number(cap[0]);
        endCap = Number(cap[1]);
      }
      const { outerRadius = arcTheme.outerRadius, innerRadius = arcTheme.innerRadius } = this.attribute;
      const capWidth = Math.abs(outerRadius - innerRadius) / 2;
      // 以外边界长度为准
      const capAngle = capWidth / outerRadius;

      if (capWidth > epsilon && outerRadius > epsilon) {
        return {
          startAngle: startAngle - sign * capAngle * startCap,
          endAngle: endAngle + sign * capAngle * endCap,
          sc: sign * capAngle * startCap,
          ec: sign * capAngle * endCap
        };
      }
    }

    return {
      startAngle: startAngle,
      endAngle: endAngle
    };
  }

  // 参考 https://github.com/d3/d3-shape/blob/main/src/arc.js
  getParsePadAngle(startAngle: number, endAngle: number) {
    const arcTheme = getTheme(this).arc;
    const {
      outerRadius = arcTheme.outerRadius,
      innerRadius = arcTheme.innerRadius,
      padAngle = arcTheme.padAngle
    } = this.attribute;

    const { padRadius = sqrt(outerRadius * outerRadius + innerRadius * innerRadius) } = this.attribute;
    const deltaAngle = abs(endAngle - startAngle);

    // Or is it a circular or annular sector?
    let outerStartAngle = startAngle;
    let outerEndAngle = endAngle;
    let innerStartAngle = startAngle;
    let innerEndAngle = endAngle;
    const halfPadAngle = padAngle / 2;
    let innerDeltaAngle = deltaAngle;
    let outerDeltaAngle = deltaAngle;

    // Apply padding? Note that since r1 ≥ r0, outerDeltaAngle ≥ innerDeltaAngle.
    if (halfPadAngle > epsilon && padRadius > epsilon) {
      const sign = endAngle > startAngle ? 1 : -1;

      let p0 = asin((Number(padRadius) / innerRadius) * sin(halfPadAngle));
      let p1 = asin((Number(padRadius) / outerRadius) * sin(halfPadAngle));
      if ((innerDeltaAngle -= p0 * 2) > epsilon) {
        p0 *= sign;
        innerStartAngle += p0;
        innerEndAngle -= p0;
      } else {
        innerDeltaAngle = 0;
        innerStartAngle = innerEndAngle = (startAngle + endAngle) / 2;
      }
      if ((outerDeltaAngle -= p1 * 2) > epsilon) {
        p1 *= sign;
        outerStartAngle += p1;
        outerEndAngle -= p1;
      } else {
        outerDeltaAngle = 0;
        outerStartAngle = outerEndAngle = (startAngle + endAngle) / 2;
      }

      return {
        outerStartAngle,
        outerEndAngle,
        innerStartAngle,
        innerEndAngle,
        innerDeltaAngle,
        outerDeltaAngle
      };
    }

    return {
      outerStartAngle,
      outerEndAngle,
      innerStartAngle,
      innerEndAngle,
      innerDeltaAngle,
      outerDeltaAngle
    };
  }

  protected doUpdateAABBBounds(full?: boolean): AABBBounds {
    const arcTheme = getTheme(this).arc;
    this._AABBBounds.setValue(Infinity, Infinity, -Infinity, -Infinity);
    const attribute = this.attribute;
    const bounds = application.graphicService.updateArcAABBBounds(
      attribute,
      getTheme(this).arc,
      this._AABBBounds,
      full,
      this
    ) as AABBBounds;

    const { boundsPadding = arcTheme.boundsPadding } = attribute;
    const paddingArray = parsePadding(boundsPadding);
    if (paddingArray) {
      bounds.expand(paddingArray);
    }
    this.clearUpdateBoundTag();
    return bounds;
  }

  protected tryUpdateOBBBounds(): OBBBounds {
    throw new Error('暂不支持');
  }

  protected needUpdateTags(keys: string[]): boolean {
    return super.needUpdateTags(keys, ARC_UPDATE_TAG_KEY);
  }
  protected needUpdateTag(key: string): boolean {
    return super.needUpdateTag(key, ARC_UPDATE_TAG_KEY);
  }

  getDefaultAttribute(name: string) {
    const arcTheme = getTheme(this).arc;
    return arcTheme[name];
  }

  toCustomPath() {
    const x = 0;
    const y = 0;

    const attribute = this.attribute;
    const { startAngle, endAngle } = this.getParsedAngle();
    let innerRadius = attribute.innerRadius;
    let outerRadius = attribute.outerRadius;
    const deltaAngle = abs(endAngle - startAngle);
    const clockwise: boolean = endAngle > startAngle;

    if (outerRadius < innerRadius) {
      const temp = outerRadius;
      outerRadius = innerRadius;
      innerRadius = temp;
    }

    const path = new CustomPath2D();

    if (outerRadius <= epsilon) {
      path.moveTo(x, y);
    } else if (deltaAngle >= pi2 - epsilon) {
      // 是个完整的圆环
      // Or is it a circle or annulus?
      path.moveTo(x + outerRadius * cos(startAngle), y + outerRadius * sin(startAngle));
      path.arc(x, y, outerRadius, startAngle, endAngle, !clockwise);
      if (innerRadius > epsilon) {
        path.moveTo(x + innerRadius * cos(endAngle), y + innerRadius * sin(endAngle));
        path.arc(x, y, innerRadius, endAngle, startAngle, clockwise);
      }
    } else {
      const xors = outerRadius * cos(startAngle);
      const yors = outerRadius * sin(startAngle);
      const xire = innerRadius * cos(endAngle);
      const yire = innerRadius * sin(endAngle);

      path.moveTo(x + xors, y + yors);
      path.arc(x, y, outerRadius, startAngle, endAngle, !clockwise);
      path.lineTo(x + xire, y + yire);
      path.arc(x, y, innerRadius, endAngle, startAngle, clockwise);
      path.closePath();
    }

    return path;
  }

  clone() {
    return new Arc({ ...this.attribute });
  }

  getNoWorkAnimateAttr(): Record<string, number> {
    return Arc.NOWORK_ANIMATE_ATTR;
  }
}

// addAttributeToPrototype(DefaultCircleStyle, Circle, PURE_STYLE_KEY);
