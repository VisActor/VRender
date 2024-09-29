/**
 * @description 直线型坐标轴的网格线
 * - `type: 'line'` 用于直角坐标系下的坐标轴网格线绘制
 * - `type: 'circle'` 或者 `type: 'polygon'` 用于极坐标半径轴的网格线绘制
 */
import type { IPointLike } from '@visactor/vutils';
import { PointService, merge, mixin } from '@visactor/vutils';
import { BaseGrid } from './base';
import type {
  GridItem,
  LineAxisGridAttributes,
  LineGridOfLineAxisAttributes,
  PolarGridOfLineAxisAttributes
} from './type';
import type { Point } from '../../core/type';
import { POLAR_START_ANGLE, POLAR_END_ANGLE } from '../../constant';
import { LineAxisMixin } from '../mixin/line';
import type { ComponentOptions } from '../../interface';
import { loadLineAxisGridComponent } from '../register';
import { getCirclePoints } from '../util';

export interface LineAxisGrid
  extends Pick<LineAxisMixin, 'isInValidValue' | 'getTickCoord' | 'getVerticalVector'>,
    BaseGrid<LineAxisGridAttributes> {}

loadLineAxisGridComponent();
export class LineAxisGrid extends BaseGrid<LineAxisGridAttributes> {
  constructor(attributes: LineAxisGridAttributes, options?: ComponentOptions) {
    super(options?.skipDefault ? attributes : merge({}, BaseGrid.defaultAttributes, attributes), options);
  }

  private _getGridPoint(gridType: string, point: IPointLike): Point[] {
    let gridPoints;
    if (gridType === 'line') {
      const { length } = this.attribute as LineGridOfLineAxisAttributes;
      const endPoint = this.getVerticalCoord(point, length as number, true);

      gridPoints = [point, endPoint];
    } else if (gridType === 'circle' || gridType === 'polygon') {
      const {
        center,
        sides = 6,
        startAngle = POLAR_START_ANGLE,
        endAngle = POLAR_END_ANGLE
      } = this.attribute as PolarGridOfLineAxisAttributes;
      const distance = PointService.distancePP(center as Point, point);
      gridPoints = getCirclePoints(center as Point, sides as number, distance, startAngle, endAngle);
    }

    return gridPoints;
  }

  protected getGridPointsByValue(value: number) {
    const basePoint = this.getTickCoord(value);

    return this._getGridPoint(this.attribute.type, basePoint);
  }

  protected getGridAttribute(isSubGrid: boolean) {
    const { type: gridType, alignWithLabel = true } = this.attribute;

    const tickSegment = this._parseTickSegment();

    let gridAttribute;
    let items: GridItem[] = [];
    if (!isSubGrid) {
      gridAttribute = this.attribute;
      // 计算 grid Items
      const gridItems: GridItem[] = [];
      this.data.forEach(item => {
        let { point } = item;

        if (!alignWithLabel) {
          // tickLine 不同 tick 对齐时需要调整 point
          const value = item.value - tickSegment / 2;
          if (this.isInValidValue(value)) {
            return;
          }
          point = this.getTickCoord(value);
        }

        gridItems.push({
          id: item.label,
          datum: item,
          points: this._getGridPoint(gridType, point)
        });
      });
      items = gridItems;
    } else {
      // 渲染 subGrid
      gridAttribute = merge({}, this.attribute, this.attribute.subGrid);
      // 计算 grid Items
      const subGridItems: GridItem[] = [];
      const { count: subCount = 4 } = gridAttribute;
      const tickLineCount = this.data.length;
      // 刻度线的数量大于 2 时，才绘制子刻度
      if (tickLineCount >= 2) {
        const points = this._getPointsOfSubGrid(tickSegment, alignWithLabel);

        for (let i = 0; i < points.length - 1; i++) {
          const pre = points[i];
          const next = points[i + 1];
          subGridItems.push({
            id: `sub-${i}-0`,
            points: this.getGridPointsByValue(pre.value),
            // TODO: 其实这里也需要，后续需要考虑怎么挂上 data
            datum: {}
          });
          for (let j = 0; j < subCount; j++) {
            const percent = (j + 1) / (subCount + 1);
            const value = (1 - percent) * pre.value + percent * next.value;
            subGridItems.push({
              id: `sub-${i}-${j + 1}`,
              points: this.getGridPointsByValue(value),
              // TODO: 其实这里也需要，后续需要考虑怎么挂上 data
              datum: {}
            });
          }
          if (i === points.length - 2) {
            subGridItems.push({
              id: `sub-${i}-${subCount + 1}`,
              points: this.getGridPointsByValue(next.value),
              // TODO: 其实这里也需要，后续需要考虑怎么挂上 data
              datum: {}
            });
          }
        }
        items = subGridItems;
      }
    }

    return {
      ...gridAttribute,
      items
    };
  }
}

mixin(LineAxisGrid, LineAxisMixin);
