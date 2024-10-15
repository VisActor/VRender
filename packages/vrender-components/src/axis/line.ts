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
import { graphicCreator } from '@visactor/vrender-core';
// eslint-disable-next-line no-duplicate-imports
import type { TextAlignType, IGroup, INode, IText, TextBaselineType } from '@visactor/vrender-core';
import type { SegmentAttributes } from '../segment';
// eslint-disable-next-line no-duplicate-imports
import { Segment } from '../segment';
import { angleTo } from '../util/matrix';
import type { TagAttributes } from '../tag';
import type { LineAttributes, LineAxisAttributes, TitleAttributes, AxisItem, TransformedAxisBreak } from './type';
import { AxisBase } from './base';
import { DEFAULT_AXIS_THEME } from './config';
import { AXIS_ELEMENT_NAME, DEFAULT_STATES, TopZIndex } from './constant';
import { measureTextSize } from '../util';
import { autoHide as autoHideFunc } from './overlap/auto-hide';
import { autoRotate as autoRotateFunc, getXAxisLabelAlign, getYAxisLabelAlign } from './overlap/auto-rotate';
import { autoLimit as autoLimitFunc } from './overlap/auto-limit';
import { autoWrap as autoWrapFunc } from './overlap/auto-wrap';

import { alignAxisLabels } from '../util/align';
import { LineAxisMixin } from './mixin/line';
import type { ComponentOptions } from '../interface';
import { loadLineAxisComponent } from './register';
import { getAxisBreakSymbolAttrs } from './util';

loadLineAxisComponent();
export interface LineAxis
  extends Pick<LineAxisMixin, 'isInValidValue' | 'getTickCoord' | 'getVerticalVector' | 'getRelativeVector'>,
    AxisBase<LineAxisAttributes> {}

export class LineAxis extends AxisBase<LineAxisAttributes> {
  static defaultAttributes = DEFAULT_AXIS_THEME;

  constructor(attributes: LineAxisAttributes, options?: ComponentOptions) {
    super(options?.skipDefault ? attributes : merge({}, LineAxis.defaultAttributes, attributes), options);
  }

  private _breaks: TransformedAxisBreak[];

  protected _renderInner(container: IGroup) {
    this._breaks = null; // 置空，防止轴更新时缓存了旧值
    if (this.attribute.breaks && this.attribute.breaks.length) {
      const transformedBreaks = [];
      for (let index = 0; index < this.attribute.breaks.length; index++) {
        const aBreak = this.attribute.breaks[index];
        const { range, breakSymbol, rawRange } = aBreak;
        transformedBreaks.push({
          startPoint: this.getTickCoord(range[0]),
          endPoint: this.getTickCoord(range[1]),
          range,
          breakSymbol,
          rawRange
        });
      }
      this._breaks = transformedBreaks;
    }
    super._renderInner(container);

    // 渲染 break symbol
    if (this._breaks && this._breaks.length) {
      this._breaks.forEach((b, index) => {
        const { startPoint, endPoint, breakSymbol, rawRange } = b;

        if (breakSymbol?.visible !== false) {
          const axisBreakGroup = graphicCreator.group({
            zIndex: TopZIndex // 层级需要高于轴线
          });
          axisBreakGroup.name = AXIS_ELEMENT_NAME.axisBreak;
          axisBreakGroup.id = this._getNodeId(`${AXIS_ELEMENT_NAME.axisBreak}-${index}`);
          axisBreakGroup.data = rawRange;
          const symbolStyle = getAxisBreakSymbolAttrs(breakSymbol);
          const shape1 = graphicCreator.symbol({
            x: startPoint.x,
            y: startPoint.y,
            ...symbolStyle
          });
          shape1.name = AXIS_ELEMENT_NAME.axisBreakSymbol;
          const shape2 = graphicCreator.symbol({
            x: endPoint.x,
            y: endPoint.y,
            ...symbolStyle
          });
          shape2.name = AXIS_ELEMENT_NAME.axisBreakSymbol;

          axisBreakGroup.add(shape1);
          axisBreakGroup.add(shape2);

          container.add(axisBreakGroup);
        }
      });
    }

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

  protected renderLine(container: IGroup): void {
    const { start, end, line } = this.attribute as LineAxisAttributes;
    const { startSymbol, endSymbol, style, state, ...restLineAttrs } = line as LineAttributes;

    const lineAttrs = {
      startSymbol,
      endSymbol,
      lineStyle: style,
      ...restLineAttrs
    } as SegmentAttributes;

    if (this._breaks && this._breaks.length) {
      // 配置了轴截断
      const linePoints = [];
      let lastStartPoint = start;
      this._breaks.forEach(b => {
        const { startPoint, endPoint } = b;
        linePoints.push([lastStartPoint, startPoint]);
        lastStartPoint = endPoint;
      });
      linePoints.push([lastStartPoint, end]);
      lineAttrs.points = linePoints;
      lineAttrs.multiSegment = true;
    } else {
      lineAttrs.points = [start, end];
    }

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

  protected getTextAlign(vector: number[]): TextAlignType {
    let align: TextAlignType = 'center';

    if (isNumberClose(vector[0], 0)) {
      if (isNumberClose(vector[1], 0)) {
        if (Object.is(vector[1], -0)) {
          align = 'start';
        } else if (Object.is(vector[0], -0)) {
          align = 'end';
        }
      } else {
        align = 'center';
      }
    } else if (vector[0] > 0) {
      align = 'start';
    } else if (vector[0] < 0) {
      align = 'end';
    }
    return align;
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
      state = {},
      maxWidth,
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
    if (this.attribute.label?.visible && this.attribute.label.inside === false) {
      const space = +get(this.attribute, 'label.space', 4);
      labelLength += space;
      const layerCount = Object.keys(this.axisLabelLayerSize).length;
      if (axisVector[1] === 0) {
        const labelBoundsHeight = this.axisLabelsContainer ? this.axisLabelsContainer.AABBBounds.height() : 0;
        if (isFinite(labelBoundsHeight)) {
          labelLength += labelBoundsHeight + (layerCount - 1) * space;
        } else {
          labelLength = 0;
        }
      } else {
        if (axisVector[0] === 0) {
          if (
            this.axisLabelsContainer &&
            this.axisLabelsContainer.AABBBounds &&
            !this.axisLabelsContainer.AABBBounds.empty()
          ) {
            const baseX = this.axisLabelLayerSize[0].labelPos;
            const bounds = this.axisLabelsContainer.AABBBounds;

            labelLength +=
              (factor === 1
                ? bounds.x2 > baseX
                  ? Math.min(bounds.x2 - baseX, bounds.width())
                  : 0
                : bounds.x1 < baseX
                ? Math.min(baseX - bounds.x1, bounds.width())
                : 0) +
              (layerCount - 1) * space;
          } else {
            labelLength = 0;
          }
        } else {
          // 发生了旋转
          Object.keys(this.axisLabelLayerSize).forEach((layer, index) => {
            labelLength += this.axisLabelLayerSize[layer].width + (index > 0 ? space : 0);
          });
        }
      }
    }

    // 标题都默认朝外
    let tickLength = 0;
    if (this.attribute.tick?.visible && this.attribute.tick.inside === false) {
      tickLength = this.attribute.tick.length || 4;
    }
    if (this.attribute.subTick?.visible && this.attribute.subTick.inside === false) {
      tickLength = Math.max(tickLength, this.attribute.subTick.length || 2);
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

    // 计算标题缩略
    let maxTagWidth = maxWidth;
    if (isNil(maxTagWidth)) {
      const { verticalLimitSize, verticalMinSize, orient } = this.attribute;
      const limitSize = Math.min(verticalLimitSize || Infinity, verticalMinSize || Infinity);
      if (isValidNumber(limitSize)) {
        const isX = orient === 'bottom' || orient === 'top';
        if (isX) {
          if (angle !== Math.PI / 2) {
            const cosValue = Math.abs(Math.cos(angle ?? 0));
            maxTagWidth = cosValue < 1e-6 ? Infinity : this.attribute.end.x / cosValue;
          } else {
            maxTagWidth = limitSize - offset;
          }
        } else {
          if (angle && angle !== 0) {
            const sinValue = Math.abs(Math.sin(angle));
            maxTagWidth = sinValue < 1e-6 ? Infinity : this.attribute.end.y / sinValue;
          } else {
            maxTagWidth = limitSize - offset;
          }
        }
      }
    }

    const attrs: TagAttributes = {
      ...titlePoint,
      ...restAttrs,
      maxWidth: maxTagWidth,
      textStyle: {
        // @ts-ignore
        textAlign,
        // @ts-ignore
        textBaseline,
        ...textStyle
      },
      state: {
        text: merge({}, DEFAULT_STATES, state.text),
        shape: merge({}, DEFAULT_STATES, state.shape),
        panel: merge({}, DEFAULT_STATES, state.background)
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
    const isCartesian = ['top', 'bottom', 'right', 'left'].includes(orient);
    // 目前的向量方法暂无法返回正确的笛卡尔坐标轴下文本旋转后的问题，所以通过这种方法判断，保证旋转后 textAlign 和 textBaseline 也正确
    if (isCartesian || (vector[0] === 0 && vector[1] === 0)) {
      if (orient === 'top' || orient === 'bottom') {
        return getXAxisLabelAlign(inside ? (orient === 'bottom' ? 'top' : 'bottom') : orient, angle);
      }
      if (orient === 'left' || orient === 'right') {
        return getYAxisLabelAlign(inside ? (orient === 'left' ? 'right' : 'left') : orient, angle);
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
        const leftMostLabel = isInverse ? last : first;
        const rightMostLabel = isInverse ? first : last;
        const left = axisStart.x;
        const right = axisEnd.x;
        const leftBound = leftMostLabel.AABBBounds.x1;
        const rightBound = rightMostLabel.AABBBounds.x2;

        if (leftBound < left) {
          const angle = leftMostLabel.attribute.angle;

          if (angle) {
            leftMostLabel.setAttributes({ dx: (leftMostLabel.attribute.dx ?? 0) + left - leftBound });
          } else {
            leftMostLabel.setAttributes({
              x: left,
              textAlign: 'left'
            });
          }
        }

        if (rightBound > right) {
          const angle = rightMostLabel.attribute.angle;

          if (angle) {
            rightMostLabel.setAttributes({ dx: (rightMostLabel.attribute.dx ?? 0) + right - rightBound });
          } else {
            rightMostLabel.setAttributes({
              x: right,
              textAlign: 'right'
            });
          }
        }
      } else {
        const bottomMostLabel = isInverse ? last : first;
        const topMostLabel = isInverse ? first : last;
        const bottomBound = bottomMostLabel.AABBBounds.y2;
        const topBound = topMostLabel.AABBBounds.y1;
        const top = axisStart.y;
        const bottom = axisEnd.y;

        if (topBound < top) {
          const angle = topMostLabel.attribute.angle;

          if (angle) {
            // has rotate
            topMostLabel.setAttributes({
              dy: (topMostLabel.attribute.dy ?? 0) + top - topBound
            });
          } else {
            topMostLabel.setAttributes({
              y: top,
              textBaseline: 'top'
            });
          }
        }

        if (bottomBound > bottom) {
          const angle = bottomMostLabel.attribute.angle;

          if (angle) {
            bottomMostLabel.setAttributes({
              dy: (bottomMostLabel.attribute.dy ?? 0) + bottom - bottomBound
            });
          } else {
            bottomMostLabel.setAttributes({
              y: bottom,
              textBaseline: 'bottom'
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
      autoHideSeparation,
      lastVisible,
      firstVisible,
      autoWrap,
      overflowLimitLength
    } = label;

    if (isFunction(layoutFunc)) {
      // 自定义布局
      layoutFunc(labelShapes, labelData, layer, this);
    } else {
      // order: autoRotate Or autoRotate -> autoLimit -> autoHide
      // priority: autoRotate > autoWrap
      if (autoRotate) {
        autoRotateFunc(labelShapes, {
          labelRotateAngle: autoRotateAngle,
          orient
        });
      } else if (autoWrap) {
        const isVertical = orient === 'left' || orient === 'right';
        const axisLength = isVertical
          ? Math.abs(this.attribute.start.y - this.attribute.end.y)
          : Math.abs(this.attribute.start.x - this.attribute.end.x);
        autoWrapFunc(labelShapes, { orient, limitLength, axisLength, ellipsis: limitEllipsis });
      }

      // autoWrap has computed width & height limit
      if (!autoWrap && autoLimit && isValidNumber(limitLength) && limitLength > 0) {
        const isVertical = orient === 'left' || orient === 'right';
        const axisLength = isVertical
          ? Math.abs(this.attribute.start.y - this.attribute.end.y)
          : Math.abs(this.attribute.start.x - this.attribute.end.x);

        const verticalLimitLength = isVertical
          ? axisLength / labelShapes.length
          : !autoHide && !autoRotate
          ? axisLength / labelShapes.length
          : Infinity;

        autoLimitFunc(labelShapes, {
          limitLength,
          verticalLimitLength,
          ellipsis: limitEllipsis,
          orient,
          axisLength,
          overflowLimitLength
        });
      }
      if (autoHide) {
        autoHideFunc(labelShapes, {
          orient,
          method: autoHideMethod,
          separation: autoHideSeparation,
          lastVisible,
          firstVisible
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
        start = axisLabelContainerBounds.x2 - axisLabelContainerSize;
      } else if (orient === 'right') {
        start = axisLabelContainerBounds.x1;
      } else if (orient === 'top') {
        start = axisLabelContainerBounds.y2 - axisLabelContainerSize;
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
    const axisLineWidth = line && line.visible ? line.style.lineWidth ?? 1 : 0;
    const tickLength = tick && tick.visible ? tick.length ?? 4 : 0;
    if (title && title.visible && typeof title.text === 'string') {
      titleHeight = measureTextSize(title.text, title.textStyle, this.stage?.getTheme()?.text).height;
      const padding = normalizePadding(title.padding);
      titleSpacing = title.space + padding[0] + padding[2];
    }
    if (limitLength) {
      limitLength = (limitLength - labelSpace - titleSpacing - titleHeight - axisLineWidth - tickLength) / layerCount;
    }
    return limitLength;
  }

  release(): void {
    super.release();
    this._breaks = null;
  }
}

mixin(LineAxis, LineAxisMixin);
