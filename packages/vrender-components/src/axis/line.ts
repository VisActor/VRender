/**
 * @description 直线型坐标轴
 */
import type { IPointLike } from '@visactor/vutils';
// eslint-disable-next-line no-duplicate-imports
import {
  get,
  isNil,
  merge,
  polarToCartesian,
  PointService,
  isNumberClose,
  isEmpty,
  isFunction,
  isValidNumber,
  isValid,
  normalizePadding
} from '@visactor/vutils';
import { createRect, type IGroup, type INode, type IText, type TextBaselineType } from '@visactor/vrender';
import type { SegmentAttributes } from '../segment';
// eslint-disable-next-line no-duplicate-imports
import { Segment } from '../segment';
import type { Point } from '../core/type';
import { angleTo, normalize, scale } from '../util/matrix';
import type { TagAttributes } from '../tag';
import { POLAR_END_ANGLE, POLAR_START_ANGLE } from '../constant';
import type {
  GridItem,
  LineAxisGridAttributes,
  LineAttributes,
  LineAxisAttributes,
  TitleAttributes,
  LineGridOfLineAxisAttributes,
  PolarGridOfLineAxisAttributes,
  TransformedAxisItem,
  AxisItem
} from './type';
import { AxisBase } from './base';
import { DEFAULT_AXIS_THEME } from './config';
import { AXIS_ELEMENT_NAME, DEFAULT_STATES } from './constant';
import { measureTextSize } from '../util';
import { autoHide as autoHideFunc } from './overlap/auto-hide';
import { autoRotate as autoRotateFunc, rotateXAxis, rotateYAxis } from './overlap/auto-rotate';
import { autoLimit as autoLimitFunc } from './overlap/auto-limit';
import { alignAxisLabels } from '../util/align';

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

  protected _renderInner(container: IGroup) {
    super._renderInner(container);
    const { panel } = this.attribute;

    // TODO: 目前是通过包围盒绘制，在一些情况下会有那问题，比如圆弧轴、带了箭头的坐标轴等
    // 坐标轴主体 panel
    if (panel && panel.visible) {
      const axisContainer = this.axisContainer;
      const axisContainerBounds = axisContainer.AABBBounds;
      const bgRect = createRect({
        x: axisContainerBounds.x1,
        y: axisContainerBounds.y1,
        width: axisContainerBounds.width(),
        height: axisContainerBounds.height(),
        ...panel.style
      });
      bgRect.name = AXIS_ELEMENT_NAME.background;
      bgRect.id = this._getNodeId('background');

      if (!isEmpty(panel.state)) {
        bgRect.states = merge({}, DEFAULT_STATES, panel.state);
      }
      axisContainer.insertBefore(bgRect, axisContainer.firstChild);
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
    const normalizedAxisVector = normalize(axisVector);
    const verticalVector: [number, number] = [normalizedAxisVector[1], normalizedAxisVector[0] * -1];
    return scale(verticalVector, offset * (inside ? 1 : -1) * verticalFactor);
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
      const layerCount = Object.keys(this.axisLabelLayerSize).length;
      if (axisVector[1] === 0) {
        const labelBoundsHeight = this.axisLabelsContainer.AABBBounds.height();
        if (isFinite(labelBoundsHeight)) {
          labelLength += labelBoundsHeight + (layerCount - 1) * space;
        } else {
          labelLength = 0;
        }
      } else {
        if (axisVector[0] === 0) {
          const boundsWidth = this.axisLabelsContainer.AABBBounds.width();
          if (isFinite(boundsWidth)) {
            labelLength += boundsWidth + (layerCount - 1) * space;
          } else {
            labelLength = 0;
          }
        } else {
          // 发生了旋转
          Object.keys(this.axisLabelLayerSize).forEach((layer, index) => {
            labelLength += this.axisLabelLayerSize[layer].width + (index > 0 ? space : 0);
          });
        }

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
              : space
            : isTextAlignStart
            ? space
            : isTextCenter
            ? labelLength / 2
            : labelLength;
        } else {
          labelLength = isReverse
            ? isTextAlignStart
              ? space
              : isTextCenter
              ? labelLength / 2
              : labelLength
            : isTextAlignStart
            ? labelLength
            : isTextCenter
            ? labelLength / 2
            : space;
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

  protected beforeLabelsOverlap(
    labelShapes: IText[],
    labelData: AxisItem[],
    labelContainer: IGroup,
    layer: number,
    layerCount: number
  ): void {
    // 调整对齐方式
    const orient = this.attribute.orient;
    if (orient === 'left' || orient === 'right') {
      rotateYAxis(orient, labelShapes);
    } else if (orient === 'bottom' || orient === 'top') {
      rotateXAxis(orient, labelShapes);
    }
  }
  protected handleLabelsOverlap(
    labelShapes: IText[],
    labelData: AxisItem[],
    labelContainer: IGroup,
    layer: number,
    layerCount: number
  ): void {
    if (isEmpty(labelShapes)) {
      return;
    }

    const { verticalLimitSize, label, orient } = this.attribute;
    const limitLength = this._getAxisLabelLimitLength(verticalLimitSize, layerCount);

    const {
      layoutFunc,
      autoRotate,
      autoRotateAngle,
      autoLimit,
      limitEllipsis,
      autoHide,
      autoHideMethod,
      autoHideSeparation
    } = label;

    if (isFunction(layoutFunc)) {
      // 自定义布局
      layoutFunc(labelShapes, labelData, layer, this);
    } else {
      // order: autoRotate -> autoLimit -> autoHide
      if (autoRotate) {
        autoRotateFunc(labelShapes, {
          labelRotateAngle: autoRotateAngle,
          orient
        });
      }
      if (autoLimit && isValidNumber(limitLength) && limitLength > 0) {
        autoLimitFunc(labelShapes, {
          limitLength,
          ellipsis: limitEllipsis,
          orient
        });
      }
      if (autoHide) {
        autoHideFunc(labelShapes, {
          orient,
          method: autoHideMethod,
          separation: autoHideSeparation
        });
      }
    }
  }

  protected afterLabelsOverlap(
    labelShapes: IText[],
    labelData: AxisItem[],
    labelContainer: IGroup,
    layer: number,
    layerCount: number
  ) {
    const { verticalLimitSize, orient } = this.attribute;

    // 处理 verticalMinSize，根据 verticalMinSize 调整 labelContainer 的大小
    const isHorizontal = orient === 'bottom' || orient === 'top';
    const axisLabelContainerBounds = labelContainer.AABBBounds;
    let axisLabelContainerSize = isHorizontal ? axisLabelContainerBounds.height() : axisLabelContainerBounds.width();
    const { verticalMinSize } = this.attribute;

    if (isValidNumber(verticalMinSize) && (!isValidNumber(verticalLimitSize) || verticalMinSize <= verticalLimitSize)) {
      const minSize = this._getAxisLabelLimitLength(verticalMinSize, layerCount);
      axisLabelContainerSize = Math.max(axisLabelContainerSize, minSize);

      let x;
      let y;
      if (orient === 'left') {
        x = axisLabelContainerBounds.x2 - axisLabelContainerSize;
        y = axisLabelContainerBounds.y1;
      } else if (orient === 'right') {
        x = axisLabelContainerBounds.x1;
        y = axisLabelContainerBounds.y1;
      } else if (orient === 'top') {
        x = axisLabelContainerBounds.x1;
        y = axisLabelContainerBounds.y2 - axisLabelContainerSize;
      } else if (orient === 'bottom') {
        x = axisLabelContainerBounds.x1;
        y = axisLabelContainerBounds.y1;
      }

      const bgRect = createRect({
        x,
        y,
        width: isHorizontal ? axisLabelContainerBounds.width() : axisLabelContainerSize,
        height: isHorizontal ? axisLabelContainerSize : axisLabelContainerBounds.height(),
        pickable: false
      });
      bgRect.name = AXIS_ELEMENT_NAME.axisLabelBackground;
      bgRect.id = this._getNodeId('axis-label-background');
      labelContainer.insertBefore(bgRect, labelContainer.firstChild);
    }

    // 处理 align，进行整体的对齐操作
    if (isValid(this.attribute.label.containerAlign)) {
      let start;
      if (orient === 'left') {
        start = axisLabelContainerBounds.x2;
      } else if (orient === 'right') {
        start = axisLabelContainerBounds.x1;
      } else if (orient === 'top') {
        start = axisLabelContainerBounds.y2;
      } else if (orient === 'bottom') {
        start = axisLabelContainerBounds.y1;
      }

      alignAxisLabels(labelShapes, start, axisLabelContainerSize, orient, this.attribute.label.containerAlign);
    }
  }

  private _getAxisLabelLimitLength(limitSize: number, layerCount: number): number {
    const { label, title, line, tick } = this.attribute;
    const labelSpace = label.space ?? 4;
    let limitLength = limitSize;
    let titleHeight = 0;
    let titleSpacing = 0;
    const axisLineWidth = line?.visible ? line.style.lineWidth ?? 1 : 0;
    const tickLength = tick?.visible ? tick.length ?? 4 : 0;
    if (title?.visible) {
      titleHeight = measureTextSize(title.text, title.textStyle).height;
      const padding = normalizePadding(title.padding);
      titleSpacing = title.space + padding[0] + padding[2];
    }
    if (limitLength) {
      limitLength = (limitLength - labelSpace - titleSpacing - titleHeight - axisLineWidth - tickLength) / layerCount;
    }
    return limitLength;
  }
}
