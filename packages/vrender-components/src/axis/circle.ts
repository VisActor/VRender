/**
 * @description 圆弧型坐标轴
 */
import { IGroup, TextBaselineType, createCircle } from '@visactor/vrender';
import { isNil, get, merge, polarToCartesian, isNumberClose, isEmpty } from '@visactor/vutils';
import { Point } from '../core/type';
import { vec2 } from '../util/matrix';
import { TagAttributes } from '../tag';
import { POLAR_END_ANGLE, POLAR_START_ANGLE } from '../constant';
import {
  CircleAxisGridAttributes,
  CircleAxisAttributes,
  TitleAttributes,
  GridItem,
  SubTickAttributes,
  TickLineItem,
  TransformedAxisItem
} from './type';
import { AxisBase } from './base';
import { DEFAULT_AXIS_THEME } from './config';
import { AXIS_ELEMENT_NAME, DEFAULT_STATES } from './constant';

export class CircleAxis extends AxisBase<CircleAxisAttributes> {
  static defaultAttributes = DEFAULT_AXIS_THEME;

  constructor(attributes: CircleAxisAttributes) {
    super(merge({}, CircleAxis.defaultAttributes, attributes));
  }

  protected renderLine(container: IGroup): void {
    const {
      startAngle = POLAR_START_ANGLE,
      endAngle = POLAR_END_ANGLE,
      radius,
      center,
      innerRadius = 0,
      line,
      inside = false
    } = this.attribute as CircleAxisAttributes;

    let arcRadius = radius;
    let arcInnerRadius = innerRadius;
    if (inside && innerRadius > 0) {
      arcRadius = innerRadius;
      arcInnerRadius = 0;
    }

    const arcAttrs = {
      ...center,
      startAngle,
      endAngle,
      radius: arcRadius,
      innerRadius: arcInnerRadius,
      ...line?.style
    };
    const axisLine = createCircle(arcAttrs);
    axisLine.name = AXIS_ELEMENT_NAME.line;
    axisLine.id = this._getNodeId('line');

    if (!isEmpty(line?.state)) {
      axisLine.states = merge({}, DEFAULT_STATES, line.state);
    }
    container.add(axisLine);
  }

  protected isInValidValue(value: number) {
    const { startAngle = POLAR_START_ANGLE, endAngle = POLAR_END_ANGLE } = this.attribute as CircleAxisAttributes;
    if (Math.abs(endAngle - startAngle) % (Math.PI * 2) === 0) {
      return value > 1;
    }

    return value < 0 || value > 1;
  }

  protected getTickCoord(tickValue: number): Point {
    const {
      startAngle = POLAR_START_ANGLE,
      endAngle = POLAR_END_ANGLE,
      center,
      radius,
      inside = false,
      innerRadius = 0
    } = this.attribute as CircleAxisAttributes;
    const angle = startAngle + (endAngle - startAngle) * tickValue;
    return polarToCartesian(center, inside && innerRadius > 0 ? innerRadius : radius, angle);
  }

  protected getVerticalVector(offset: number, inside = false, point: Point) {
    const { inside: axisInside = false } = this.attribute;
    const { center } = this.attribute as CircleAxisAttributes;
    const vector: [number, number] = [point.x - center.x, point.y - center.y];
    vec2.scale(vector, vector, ((inside ? -1 : 1) * (axisInside ? -1 : 1) * offset) / vec2.length(vector));
    return vector;
  }

  protected getRelativeVector(point: Point): [number, number] {
    const { center } = this.attribute as CircleAxisAttributes;
    return [point.y - center.y, -1 * (point.x - center.x)];
  }

  protected getTitleAttribute() {
    const { center, radius, innerRadius = 0 } = this.attribute as CircleAxisAttributes;
    const {
      space = 4,
      textStyle = {},
      shape,
      background,
      state,
      ...restAttrs
    } = this.attribute.title as TitleAttributes;
    let titlePoint = center;
    let labelHeight = 0;
    if (this.attribute.label?.visible && this.attribute.label?.inside === false) {
      // 这里取 label 的最大长度
      labelHeight = get(this.attribute.label, 'style.fontSize', 12) + get(this.attribute.label, 'space', 4);
    }
    let tickLength = 0;
    if (this.attribute.tick?.visible && this.attribute.tick?.inside === false) {
      tickLength = this.attribute.tick?.length || 4;
    }
    if (this.attribute.subTick?.visible && this.attribute.subTick?.inside === false) {
      tickLength = Math.max(tickLength, this.attribute.subTick?.length || 2);
    }
    const offset = radius + tickLength + labelHeight + space;
    let textBaseline: TextBaselineType = 'middle';
    let { position } = this.attribute.title as TitleAttributes;
    if (isNil(position)) {
      position = innerRadius === 0 ? 'end' : 'middle';
    }
    if (position === 'start') {
      textBaseline = 'bottom';
      titlePoint = {
        x: center.x,
        y: center.y - offset
      };
    } else if (position === 'end') {
      textBaseline = 'top';
      titlePoint = {
        x: center.x,
        y: center.y + offset
      };
    }
    const attrs: TagAttributes = {
      ...titlePoint,
      ...restAttrs,
      textStyle: {
        textBaseline,
        textAlign: 'center',
        ...textStyle
      },
      state: isEmpty(state)
        ? null
        : {
            text: state.text,
            shape: state.shape,
            panel: state.background
          }
    };

    const { angle } = restAttrs; // 用户设置的是角度
    attrs.angle = angle;

    if (shape && shape.visible) {
      attrs.shape = {
        visible: true,
        ...shape.style
      };
      if (shape.space) {
        attrs.space = shape.space;
      }
    }

    if (background && background.visible) {
      attrs.panel = {
        visible: true,
        ...background.style
      };
    }

    return attrs;
  }

  protected getSubTickLineItems() {
    const { subTick } = this.attribute as CircleAxisAttributes;
    const subTickLineItems: TickLineItem[] = [];
    const { count: subCount = 4, inside = false, length = 2 } = subTick as SubTickAttributes;
    const tickLineItems = this.tickLineItems;
    const tickLineCount = tickLineItems.length;
    // 刻度线的数量大于 2 时，才绘制子刻度
    if (tickLineCount >= 2) {
      const tickSegment = this.data[1].value - this.data[0].value;
      const isAlignWithLable = this.attribute?.tick?.alignWithLabel;
      for (let i = 0; i < tickLineCount; i++) {
        const pre = tickLineItems[i];
        const next = tickLineItems[i + 1];
        for (let j = 0; j < subCount; j++) {
          const percent = (j + 1) / (subCount + 1);
          const value =
            (1 - percent) * pre.value + percent * (next ? next.value : isAlignWithLable ? 1 : pre.value + tickSegment);
          const point = this.getTickCoord(value);
          const endPoint = this.getVerticalCoord(point, length, inside);
          subTickLineItems.push({
            start: point,
            end: endPoint,
            value
          });
        }
      }
    }

    return subTickLineItems;
  }

  protected getGridAttribute(type: string) {
    let gridAttribute;
    let items: GridItem[] = [];
    const {
      radius,
      innerRadius = 0,
      startAngle = POLAR_START_ANGLE,
      endAngle = POLAR_END_ANGLE,
      center,
      grid
    } = this.attribute as CircleAxisAttributes;
    const { alignWithLabel = true } = grid || {};

    const length = radius - innerRadius;
    let tickSegment = 1;
    const count = this.data.length;
    if (count >= 2) {
      tickSegment = this.data[1].value - this.data[0].value;
    }
    if (type === 'grid') {
      gridAttribute = this.attribute.grid as CircleAxisGridAttributes;
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
      gridAttribute = merge({}, this.attribute.grid, this.attribute.subGrid);
      // 计算 grid Items
      const subGridItems: GridItem[] = [];
      const { count: subCount = 4 } = this.attribute.subTick || {};
      const tickLineCount = this.data.length;
      // 刻度线的数量大于 2 时，才绘制子刻度
      if (tickLineCount >= 2) {
        const points: { value: number }[] = [];
        this.data.forEach((item: TransformedAxisItem) => {
          let tickValue = item.value;
          if (!alignWithLabel) {
            // tickLine 不同 tick 对齐时需要调整 point
            const value = item.value - tickSegment / 2;
            if (this.isInValidValue(value)) {
              return;
            }
            tickValue = value;
          }
          points.push({
            value: tickValue
          });
        });

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
      center
    };
  }
  protected getTextBaseline(vector: number[]): TextBaselineType {
    let base: TextBaselineType = 'middle';
    if (isNumberClose(vector[1], 0)) {
      base = 'middle';
    } else if (vector[1] > 0 && vector[1] > Math.abs(vector[0])) {
      base = 'top';
    } else if (vector[1] < 0 && Math.abs(vector[1]) > Math.abs(vector[0])) {
      base = 'bottom';
    }
    return base;
  }
}
