/**
 * @description 直线型坐标轴
 */
// eslint-disable-next-line no-duplicate-imports
import {
  get,
  isNil,
  merge,
  isNumberClose,
  isEmpty,
  isFunction,
  isValidNumber,
  isValid,
  normalizePadding,
  mixin,
  last as peek
} from '@visactor/vutils';
import { graphicCreator } from '@visactor/vrender/es/core';
// eslint-disable-next-line no-duplicate-imports
import type { TextAlignType, IGroup, INode, IText, TextBaselineType } from '@visactor/vrender/es/core';
import type { SegmentAttributes } from '../segment';
// eslint-disable-next-line no-duplicate-imports
import { Segment } from '../segment';
import { angleTo } from '../util/matrix';
import type { TagAttributes } from '../tag';
import type { LineAttributes, LineAxisAttributes, TitleAttributes, AxisItem } from './type';
import { AxisBase } from './base';
import { DEFAULT_AXIS_THEME } from './config';
import { AXIS_ELEMENT_NAME, DEFAULT_STATES } from './constant';
import { measureTextSize } from '../util';
import { autoHide as autoHideFunc } from './overlap/auto-hide';
import { autoRotate as autoRotateFunc, getXAxisLabelAlign, getYAxisLabelAlign } from './overlap/auto-rotate';
import { autoLimit as autoLimitFunc } from './overlap/auto-limit';
import { alignAxisLabels } from '../util/align';
import { LineAxisMixin } from './mixin/line';
import type { ComponentOptions } from '../interface';
import { loadLineAxis } from './register';

loadLineAxis();
export interface LineAxis
  extends Pick<LineAxisMixin, 'isInValidValue' | 'getTickCoord' | 'getVerticalVector' | 'getRelativeVector'>,
    AxisBase<LineAxisAttributes> {}

export class LineAxis extends AxisBase<LineAxisAttributes> {
  static defaultAttributes = DEFAULT_AXIS_THEME;

  constructor(attributes: LineAxisAttributes, options?: ComponentOptions) {
    super(options?.skipDefault ? attributes : merge({}, LineAxis.defaultAttributes, attributes), options);
  }

  protected _renderInner(container: IGroup) {
    super._renderInner(container);
    const { panel } = this.attribute;

    // TODO: 目前是通过包围盒绘制，在一些情况下会有那问题，比如圆弧轴、带了箭头的坐标轴等
    // 坐标轴主体 panel
    if (panel && panel.visible) {
      const axisContainer = this.axisContainer;
      const axisContainerBounds = axisContainer.AABBBounds;
      const bgRect = graphicCreator.rect({
        x: axisContainerBounds.x1,
        y: axisContainerBounds.y1,
        width: axisContainerBounds.width(),
        height: axisContainerBounds.height(),
        ...panel.style
      });
      bgRect.name = AXIS_ELEMENT_NAME.background;
      bgRect.id = this._getNodeId('background');

      bgRect.states = merge({}, DEFAULT_STATES, panel.state ?? {});
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
    const vector = this.getVerticalVector(offset, false, { x: 0, y: 0 });

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
      state: {
        text: merge({}, DEFAULT_STATES, state?.text),
        shape: merge({}, DEFAULT_STATES, state?.shape),
        panel: merge({}, DEFAULT_STATES, state?.background)
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

  protected getTextBaseline(vector: number[], inside?: boolean): TextBaselineType {
    let base: TextBaselineType = 'middle';
    const { verticalFactor = 1 } = this.attribute;
    const factor = (inside ? 1 : -1) * verticalFactor;
    if (isNumberClose(vector[1], 0)) {
      if (isNumberClose(vector[0], 0) && !Object.is(vector[0], -0) && !Object.is(vector[1], -0)) {
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

  protected getLabelAlign(
    vector: [number, number],
    inside?: boolean,
    angle?: number
  ): { textAlign: TextAlignType; textBaseline: TextBaselineType } {
    const orient = this.attribute.orient;
    if (isValidNumber(angle)) {
      if (orient === 'top' || orient === 'bottom') {
        return getXAxisLabelAlign(orient, angle);
      }
      if (orient === 'left' || orient === 'right') {
        return getYAxisLabelAlign(orient, angle);
      }
    }

    return {
      textAlign: this.getTextAlign(vector),
      textBaseline: this.getTextBaseline(vector, inside)
    };
  }

  protected beforeLabelsOverlap(
    labelShapes: IText[],
    labelData: AxisItem[],
    labelContainer: IGroup,
    layer: number,
    layerCount: number
  ): void {
    const { flush = false } = this.attribute.label || {};
    if (flush && labelShapes.length) {
      // 首尾标签向内偏移
      const { orient, start: axisStart, end: axisEnd } = this.attribute;
      const isX = orient === 'bottom' || orient === 'top';
      const first = labelShapes[0];
      const last = peek(labelShapes);
      const isInverse = isX ? first.attribute.x > last.attribute.x : first.attribute.y < last.attribute.y;
      if (isX) {
        if (isInverse) {
          const start = axisEnd.x;
          const end = axisStart.x;
          const startBound = first.AABBBounds.x2;
          const endBound = last.AABBBounds.x1;

          if (startBound > start) {
            first.setAttributes({
              x: start,
              textAlign: 'right'
            });
          }

          if (endBound < end) {
            last.setAttributes({
              x: end,
              textAlign: 'left'
            });
          }
        } else {
          const start = axisStart.x;
          const end = axisEnd.x;
          const startBound = first.AABBBounds.x1;
          const endBound = last.AABBBounds.x2;
          if (startBound < start) {
            first.setAttributes({
              x: start,
              textAlign: 'left'
            });
          }

          if (endBound > end) {
            last.setAttributes({
              x: end,
              textAlign: 'right'
            });
          }
        }
      } else {
        if (isInverse) {
          const startBound = first.AABBBounds.y1;
          const endBound = last.AABBBounds.y2;
          const start = axisStart.y;
          const end = axisEnd.y;

          if (startBound < start) {
            first.setAttributes({
              y: start,
              textBaseline: 'top'
            });
          }

          if (endBound > end) {
            last.setAttributes({
              y: end,
              textBaseline: 'bottom'
            });
          }
        } else {
          const start = axisEnd.y;
          const end = axisStart.y;
          const startBound = first.AABBBounds.y2;
          const endBound = last.AABBBounds.y1;

          if (startBound > start) {
            first.setAttributes({
              y: start,
              textBaseline: 'bottom'
            });
          }

          if (endBound < end) {
            last.setAttributes({
              y: end,
              textBaseline: 'top'
            });
          }
        }
      }
    }

    return;
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

      const bgRect = graphicCreator.rect({
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
    if (title?.visible && typeof title.text === 'string') {
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

mixin(LineAxis, LineAxisMixin);
