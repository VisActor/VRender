/**
 * @description 圆弧型坐标轴的网格线
 */

import { merge, mixin } from '@visactor/vutils';
import { BaseGrid } from './base';
import type { CircleAxisGridAttributes, GridItem } from './type';
import { POLAR_END_ANGLE, POLAR_START_ANGLE } from '../../constant';
import { CircleAxisMixin } from '../mixin/circle';
import type { ComponentOptions } from '../../interface';
import { loadCircleAxisGridComponent } from '../register';

export interface CircleAxisGrid
  extends Pick<CircleAxisMixin, 'isInValidValue' | 'getTickCoord' | 'getVerticalVector'>,
    BaseGrid<CircleAxisGridAttributes> {}

loadCircleAxisGridComponent();
export class CircleAxisGrid extends BaseGrid<CircleAxisGridAttributes> {
  constructor(attributes: CircleAxisGridAttributes, options?: ComponentOptions) {
    super(options?.skipDefault ? attributes : merge({}, BaseGrid.defaultAttributes, attributes), options);
  }

  protected getGridPointsByValue(value: number) {
    const basePoint = this.getTickCoord(value);
    const { radius, innerRadius = 0 } = this.attribute;

    return [basePoint, this.getVerticalCoord(basePoint, radius - innerRadius, true)];
  }

  protected getGridAttribute(isSubGrid: boolean) {
    let gridAttribute;
    let items: GridItem[] = [];
    const {
      radius,
      innerRadius = 0,
      startAngle = POLAR_START_ANGLE,
      endAngle = POLAR_END_ANGLE,
      center,
      subGrid,
      ...grid
    } = this.attribute;
    const { alignWithLabel = true } = grid || {};

    const length = radius - innerRadius;
    const tickSegment = this._parseTickSegment();
    if (!isSubGrid) {
      gridAttribute = grid as CircleAxisGridAttributes;
      // 计算 grid Items
      const gridItems: GridItem[] = [];
      let data;
      if (Math.abs(endAngle - startAngle) % (Math.PI * 2) === 0) {
        data = [...this.data].concat(this.data[0]);
      } else {
        data = this.data;
      }

      data.forEach(item => {
        let { point } = item;
        if (!alignWithLabel) {
          // tickLine 不同 tick 对齐时需要调整 point
          const value = item.value - tickSegment / 2;
          if (this.isInValidValue(value)) {
            return;
          }
          point = this.getTickCoord(value);
        }
        const endPoint = this.getVerticalCoord(point, length as number, true);
        gridItems.push({
          id: item.id,
          points: [point, endPoint],
          datum: item
        });
      });
      items = gridItems;
    } else {
      // 渲染 subGrid
      gridAttribute = merge({}, grid, subGrid);
      // 计算 grid Items
      const subGridItems: GridItem[] = [];
      const { count: subCount = 4 } = subGrid || {};
      const tickLineCount = this.data.length;
      // 刻度线的数量大于 2 时，才绘制子刻度
      if (tickLineCount >= 2) {
        const points = this._getPointsOfSubGrid(tickSegment, alignWithLabel);

        for (let i = 0; i < tickLineCount; i++) {
          const pre = points[i];
          const next = points[i + 1];
          subGridItems.push({
            id: `sub-${i}-${0}`,
            points: [this.getTickCoord(pre.value), this.getVerticalCoord(this.getTickCoord(pre.value), length, true)],
            datum: {}
          });
          for (let j = 0; j < subCount; j++) {
            const percent = (j + 1) / (subCount + 1);
            const value =
              (1 - percent) * pre.value + percent * (next ? next.value : alignWithLabel ? 1 : pre.value + tickSegment);
            const point = this.getTickCoord(value);
            const endPoint = this.getVerticalCoord(point, length, true);
            subGridItems.push({
              id: `sub-${i}-${j + 1}`,
              points: [point, endPoint],
              // TODO: 这里也需要，后续考虑如何加上
              datum: {}
            });
          }
        }

        if (Math.abs(endAngle - startAngle) % (Math.PI * 2) === 0) {
          subGridItems.push(subGridItems[0]);
        }

        items = subGridItems;
      }
    }
    return {
      ...gridAttribute,
      items,
      center,
      type: 'line'
    };
  }
}

mixin(CircleAxisGrid, CircleAxisMixin);
