/**
 * @description 直线型坐标轴
 */
import {
  IPointLike,
  get,
  isNil,
  merge,
  polarToCartesian,
  PointService,
  isNumberClose,
  isEmpty
} from '@visactor/vutils';
import { IGroup, INode, TextBaselineType } from '@visactor/vrender';
import { Segment, SegmentAttributes } from '../segment';
import { Point } from '../core/type';
import { angleTo, vec2 } from '../util/matrix';
import { TagAttributes } from '../tag';
import { POLAR_END_ANGLE, POLAR_START_ANGLE } from '../constant';
import {
  GridItem,
  LineAxisGridAttributes,
  LineAttributes,
  LineAxisAttributes,
  TitleAttributes,
  LineGridOfLineAxisAttributes,
  PolarGridOfLineAxisAttributes,
  TransformedAxisItem
} from './type';
import { AxisBase } from './base';
import { DEFAULT_AXIS_THEME } from './config';
import { AXIS_ELEMENT_NAME, DEFAULT_STATES } from './constant';

function getCirclePoints(center: Point, count: number, radius: number, startAngle: number, endAngle: number) {
  const points: Point[] = [];
  const range = endAngle - startAngle;
  for (let i = 0; i < count; i++) {
    const angle = startAngle + (i * range) / count;
    points.push(polarToCartesian(center, radius, angle));
  }
  return points;
}

export class LineAxis extends AxisBase<LineAxisAttributes> {
  static defaultAttributes = DEFAULT_AXIS_THEME;

  constructor(attributes: LineAxisAttributes, mode?: '2d' | '3d') {
    super(merge({}, LineAxis.defaultAttributes, attributes), mode);
    if (mode === '3d') {
      this.setMode(mode);
    }
  }

  // TODO: break
  protected renderLine(container: IGroup): void {
    const { start, end, line } = this.attribute as LineAxisAttributes;
    const { startSymbol, endSymbol, style, breakRange, breakShape, breakShapeStyle, state, ...restLineAttrs } =
      line as LineAttributes;
    const lineAttrs = {
      points: [start, end],
      startSymbol,
      endSymbol,
      lineStyle: style,
      ...restLineAttrs
    } as SegmentAttributes;

    if (!isEmpty(state)) {
      lineAttrs.state = {
        line: merge({}, DEFAULT_STATES, state),
        symbol: merge({}, DEFAULT_STATES, state)
      };
    }

    const axisLineGroup = new Segment(lineAttrs);
    axisLineGroup.name = AXIS_ELEMENT_NAME.line;
    axisLineGroup.id = this._getNodeId('line');
    container.add(axisLineGroup as unknown as INode);
  }

  protected isInValidValue(value: number) {
    return value < 0 || value > 1;
  }

  protected getTickCoord(tickValue: number): Point {
    const { start } = this.attribute as LineAxisAttributes;
    const axisVector = this.getRelativeVector();
    return {
      x: start.x + axisVector[0] * tickValue,
      y: start.y + axisVector[1] * tickValue
    };
  }

  protected getRelativeVector(): [number, number] {
    const { start, end } = this.attribute as LineAxisAttributes;
    return [end.x - start.x, end.y - start.y];
  }

  protected getVerticalVector(offset: number, inside = false) {
    const { verticalFactor = 1 } = this.attribute;
    const axisVector = this.getRelativeVector();
    const normalize = vec2.normalize([0, 0], axisVector);
    const verticalVector: [number, number] = [normalize[1], normalize[0] * -1];
    return vec2.scale([0, 0], verticalVector, offset * (inside ? 1 : -1) * verticalFactor);
  }

  // TODO: 太 hack 了，需要静心优化
  protected getTitleAttribute() {
    const {
      position = 'middle',
      space = 4,
      textStyle = {},
      autoRotate = true,
      shape,
      background,
      state,
      ...restAttrs
    } = this.attribute.title as TitleAttributes;
    let percent = 0.5;
    if (position === 'start') {
      percent = 0;
    } else if (position === 'end') {
      percent = 1;
    }
    const { verticalFactor = 1 } = this.attribute;
    const factor = -1 * verticalFactor;
    const point = this.getTickCoord(percent);
    const axisVector = this.getRelativeVector();
    // HACK;
    let labelLength = 0;
    if (this.attribute.label?.visible && this.attribute.label?.inside === false) {
      const space = +get(this.attribute, 'label.space', 4);
      labelLength += space;
      if (axisVector[1] === 0) {
        Object.keys(this.axisLabelLayerSize).forEach((layer, index) => {
          labelLength += this.axisLabelLayerSize[layer].height + (index > 0 ? space : 0);
        });
      } else {
        Object.keys(this.axisLabelLayerSize).forEach((layer, index) => {
          labelLength += this.axisLabelLayerSize[layer].width + (index > 0 ? space : 0);
        });

        const textAlign = this.axisLabelLayerSize[0].textAlign;
        const isTextAlignStart = textAlign === 'start' || textAlign === 'left';
        const isTextCenter = textAlign === 'center';
        const isReverse = axisVector[1] > 0;
        if (factor === 1) {
          labelLength = isReverse
            ? isTextAlignStart
              ? labelLength
              : isTextCenter
              ? labelLength / 2
              : 0
            : isTextAlignStart
            ? space
            : isTextCenter
            ? labelLength / 2
            : labelLength;
        } else {
          labelLength = isReverse
            ? isTextAlignStart
              ? 0
              : isTextCenter
              ? labelLength / 2
              : labelLength
            : isTextAlignStart
            ? labelLength
            : isTextCenter
            ? labelLength / 2
            : 0;
        }
      }
    }

    // 标题都默认朝外
    let tickLength = 0;
    if (this.attribute.tick?.visible && this.attribute.tick?.inside === false) {
      tickLength = this.attribute.tick?.length || 4;
    }
    if (this.attribute.subTick?.visible && this.attribute.subTick?.inside === false) {
      tickLength = Math.max(tickLength, this.attribute.subTick?.length || 2);
    }

    const offset = tickLength + labelLength + space;
    const titlePoint = this.getVerticalCoord(point, offset, false); // 标题的点
    const vector = this.getVerticalVector(offset, false);

    let { angle } = restAttrs; // 用户设置的是角度
    let textAlign;
    if (position === 'start') {
      textAlign = 'start';
    } else if (position === 'end') {
      textAlign = 'end';
    } else {
      textAlign = 'center';
    }
    let textBaseline;
    if (isNil(angle) && autoRotate) {
      const v1: [number, number] = [1, 0]; // 水平方向的向量
      const radian = angleTo(axisVector, v1, true);
      angle = radian;
      const { verticalFactor = 1 } = this.attribute;
      const factor = -1 * verticalFactor;
      if (factor === 1) {
        textBaseline = 'bottom';
      } else {
        textBaseline = 'top';
      }
    } else {
      // if (isValid(angle)) {
      //   angle = degreeToRadian(angle);
      // }
      textAlign = this.getTextAlign(vector as number[]);
      textBaseline = this.getTextBaseline(vector as number[], false);
    }

    const attrs: TagAttributes = {
      ...titlePoint,
      ...restAttrs,
      textStyle: {
        // @ts-ignore
        textAlign,
        // @ts-ignore
        textBaseline,
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

  private _getGridPoint(gridType: string, point: IPointLike): Point[] {
    let gridPoints;
    if (gridType === 'line') {
      const { length } = this.attribute.grid as LineGridOfLineAxisAttributes;
      const endPoint = this.getVerticalCoord(point, length as number, true);

      gridPoints = [point, endPoint];
    } else if (gridType === 'circle' || gridType === 'polygon') {
      const {
        center,
        sides,
        startAngle = POLAR_START_ANGLE,
        endAngle = POLAR_END_ANGLE
      } = this.attribute.grid as PolarGridOfLineAxisAttributes;
      const distance = PointService.distancePP(center as Point, point);
      gridPoints = getCirclePoints(center as Point, sides as number, distance, startAngle, endAngle);
    }

    return gridPoints;
  }

  protected getGridAttribute(type: string) {
    const { type: gridType, alignWithLabel = true } = this.attribute.grid as LineAxisGridAttributes;

    let tickSegment = 1;
    const count = this.data.length;
    if (count >= 2) {
      tickSegment = this.data[1].value - this.data[0].value;
    }
    let gridAttribute;
    let items: GridItem[] = [];
    if (type === 'grid') {
      gridAttribute = this.attribute.grid;
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

        for (let i = 0; i < points.length - 1; i++) {
          const pre = points[i];
          const next = points[i + 1];
          subGridItems.push({
            id: `sub-${i}-0`,
            points: this._getGridPoint(gridType, this.getTickCoord(pre.value)),
            // TODO: 其实这里也需要，后续需要考虑怎么挂上 data
            datum: {}
          });
          for (let j = 0; j < subCount; j++) {
            const percent = (j + 1) / (subCount + 1);
            const value = (1 - percent) * pre.value + percent * next.value;
            const point = this.getTickCoord(value);
            subGridItems.push({
              id: `sub-${i}-${j + 1}`,
              points: this._getGridPoint(gridType, point),
              // TODO: 其实这里也需要，后续需要考虑怎么挂上 data
              datum: {}
            });
          }
          if (i === points.length - 2) {
            subGridItems.push({
              id: `sub-${i}-${subCount + 1}`,
              points: this._getGridPoint(gridType, this.getTickCoord(next.value)),
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

  protected getTextBaseline(vector: number[], inside?: boolean): TextBaselineType {
    let base: TextBaselineType = 'middle';
    const { verticalFactor = 1 } = this.attribute;
    const factor = (inside ? 1 : -1) * verticalFactor;
    if (isNumberClose(vector[1], 0)) {
      if (isNumberClose(vector[0], 0)) {
        base = factor === 1 ? 'bottom' : 'top';
      } else {
        base = 'middle';
      }
    } else if (vector[1] > 0) {
      base = 'top';
    } else if (vector[1] < 0) {
      base = 'bottom';
    }
    return base;
  }
}
