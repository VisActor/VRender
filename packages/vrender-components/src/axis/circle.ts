/**
 * @description 圆弧型坐标轴
 */
import type { IGroup, IText, ITextGraphicAttribute, TextAlignType, TextBaselineType } from '@visactor/vrender-core';
// eslint-disable-next-line no-duplicate-imports
import { graphicCreator } from '@visactor/vrender-core';
// eslint-disable-next-line no-duplicate-imports
import type { Point } from '@visactor/vutils';
import { isNil, get, merge, isNumberClose, isEmpty, mixin } from '@visactor/vutils';
import type { TagAttributes } from '../tag';
import { POLAR_END_ANGLE, POLAR_START_ANGLE } from '../constant';
import type { CircleAxisAttributes, TitleAttributes, SubTickAttributes, TickLineItem, AxisItem } from './type';
import { AxisBase } from './base';
import { DEFAULT_AXIS_THEME } from './config';
import { AXIS_ELEMENT_NAME, DEFAULT_STATES } from './constant';
import { CircleAxisMixin } from './mixin/circle';
import { getLabelPosition } from './util';
import type { ComponentOptions } from '../interface';

export interface CircleAxis
  extends Pick<CircleAxisMixin, 'isInValidValue' | 'getTickCoord' | 'getVerticalVector' | 'getRelativeVector'>,
    AxisBase<CircleAxisAttributes> {}

export class CircleAxis extends AxisBase<CircleAxisAttributes> {
  static defaultAttributes = DEFAULT_AXIS_THEME;

  constructor(attributes: CircleAxisAttributes, options?: ComponentOptions) {
    super(options?.skipDefault ? attributes : merge({}, CircleAxis.defaultAttributes, attributes));
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
    const axisLine = graphicCreator.circle(arcAttrs);
    axisLine.name = AXIS_ELEMENT_NAME.line;
    axisLine.id = this._getNodeId('line');

    if (!isEmpty(line?.state)) {
      axisLine.states = merge({}, DEFAULT_STATES, line.state);
    }
    container.add(axisLine);
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
    const attrs: any = {
      ...titlePoint,
      ...restAttrs,
      textStyle: {
        textBaseline,
        textAlign: 'center',
        ...textStyle
      },
      state: {
        text: merge({}, DEFAULT_STATES, state?.text),
        shape: merge({}, DEFAULT_STATES, state?.shape),
        panel: merge({}, DEFAULT_STATES, state?.background)
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

  protected beforeLabelsOverlap(
    labelShapes: IText[],
    labelData: AxisItem[],
    labelContainer: IGroup,
    layer: number,
    layerCount: number
  ): void {
    return;
  }
  protected handleLabelsOverlap(
    labelShapes: IText[],
    labelData: AxisItem[],
    labelContainer: IGroup,
    layer: number,
    layerCount: number
  ): void {
    // 暂不支持
    return;
  }
  protected afterLabelsOverlap(
    labelShapes: IText[],
    labelData: AxisItem[],
    labelContainer: IGroup,
    layer: number,
    layerCount: number
  ): void {
    return;
  }

  protected getLabelAlign(
    vector: [number, number],
    inside?: boolean,
    angle?: number
  ): { textAlign: TextAlignType; textBaseline: TextBaselineType } {
    return {
      textAlign: 'center', //'left',
      textBaseline: 'middle' //'top'
    };
  }

  protected getLabelPosition(
    point: Point,
    vector: [number, number],
    text: string | number,
    style: Partial<ITextGraphicAttribute>
  ) {
    return getLabelPosition(point, vector, text, style);
  }
}

mixin(CircleAxis, CircleAxisMixin);
