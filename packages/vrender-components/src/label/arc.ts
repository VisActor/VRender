import type { IAABBBounds, IBoundsLike } from '@visactor/vutils';
import {
  merge,
  isValidNumber,
  isNil,
  isLess,
  isGreater,
  isNumberClose as isClose,
  polarToCartesian,
  computeQuadrant
} from '@visactor/vutils';
import { LabelBase } from './base';
import type { ArcLabelAttrs, IPoint, Quadrant, BaseLabelAttrs, LabelItem, IArcLabelLineSpec } from './type';
import type { IArc, IRichTextAttribute, ITextAttribute } from '@visactor/vrender-core';
// eslint-disable-next-line no-duplicate-imports
import { type IRichText, type IText, type IArcGraphicAttribute, type IGraphic } from '@visactor/vrender-core';
import {
  isQuadrantRight,
  isQuadrantLeft,
  lineCirclePoints,
  connectLineRadian,
  checkBoundsOverlap,
  getAlignOffset
} from './util';
import type { ComponentOptions } from '../interface';
import { registerLabelComponent } from './data-label-register';
import { isFunction } from '@visactor/vutils';

export class ArcInfo {
  key!: string;
  refDatum!: any;
  refArc!: IArc;
  /**
   * 绘图区圆弧中点
   */
  center!: IPoint;
  /**
   * label起始区圆弧中点
   */
  outerCenter!: IPoint;
  labelSize!: { width: number; height: number };
  labelPosition!: IPoint;
  labelLimit: number;
  labelVisible: boolean;
  lastLabelY!: number;
  labelYRange!: [number, number];
  labelText!: string | string[];
  pointA: IPoint;
  pointB: IPoint;
  pointC: IPoint;
  labelLine: IArcLabelLineSpec;
  /**
   * 象限
   */
  quadrant: Quadrant;
  radian: number;
  middleAngle: number;
  innerRadius: number;
  outerRadius: number;
  /** 扇形圆心点坐标 */
  circleCenter: IPoint;
  k: number;
  angle: number;

  constructor(
    refDatum: any,
    center: IPoint,
    outerCenter: IPoint,
    quadrant: Quadrant,
    radian: number,
    middleAngle: number,
    innerRadius: number,
    outerRadius: number,
    circleCenter: IPoint
  ) {
    this.refDatum = refDatum;
    this.center = center;
    this.outerCenter = outerCenter;
    this.quadrant = quadrant;
    this.radian = radian;
    this.middleAngle = middleAngle;
    this.innerRadius = innerRadius;
    this.outerRadius = outerRadius;
    this.circleCenter = circleCenter;
    this.labelVisible = true;
  }

  getLabelBounds(): IBoundsLike {
    if (!this.labelPosition || !this.labelSize) {
      return { x1: 0, x2: 0, y1: 0, y2: 0 };
    }
    return {
      x1: this.labelPosition.x - this.labelSize.width / 2,
      y1: this.labelPosition.y - this.labelSize.height / 2,
      x2: this.labelPosition.x + this.labelSize.width / 2,
      y2: this.labelPosition.y + this.labelSize.height / 2
    };
  }
}

type PriorityArc = {
  arc: ArcInfo;
  /**
   * 在初始 arc 数组中的索引
   */
  originIndex: number;
  priorityIndex: number;
};

export class ArcLabel extends LabelBase<ArcLabelAttrs> {
  name = 'arc-label';

  static defaultAttributes: Partial<ArcLabelAttrs> = {
    coverEnable: false,
    spaceWidth: 5,
    layoutArcGap: 6,
    textStyle: {
      visible: true,
      fontSize: 14,
      fontWeight: 'normal',
      fillOpacity: 1,
      // arc boundsPadding 宽度设大会家加剧旋转时，AABBbounds.width 大于无旋转角度的情况，导致 arc 内部标签被缩略的问题
      boundsPadding: [-1, 0, -1, 0],
      ellipsis: true
    },
    position: 'outside',
    line: {
      visible: true,
      line1MinLength: 20,
      line2MinLength: 10
    },
    layout: {
      align: 'arc',
      strategy: 'priority',
      tangentConstraint: true
    }
  };

  private _ellipsisWidth: number = 0;

  private _arcLeft: Map<any, ArcInfo> = new Map();
  private _arcRight: Map<any, ArcInfo> = new Map();
  private _line2MinLength: number = 0;
  private _alignOffset: number = 0;

  constructor(attributes: ArcLabelAttrs, options?: ComponentOptions) {
    const { data, ...restAttributes } = attributes;
    super(options?.skipDefault ? attributes : { data, ...merge({}, ArcLabel.defaultAttributes, restAttributes) });
  }

  protected _overlapping(labels: (IText | IRichText)[]) {
    if (['inside', 'inside-center'].includes(this.attribute.position as string)) {
      return super._overlapping(labels);
    }
    return labels;
  }

  protected labeling(
    textBounds: IBoundsLike,
    graphicBounds: IBoundsLike,
    position = 'outside',
    offset = 0
  ): { x: number; y: number } | undefined {
    if (!textBounds || !graphicBounds) {
      return;
    }
    return { x: 0, y: 0 };
  }

  protected _layout(texts: (IText | IRichText)[]) {
    if (!texts || !texts.length) {
      return;
    }

    const labels = super._layout(texts);
    const textBoundsArray = labels.map(label => {
      return this.getGraphicBounds(label as any);
    });
    const ellipsisLabelAttribute = {
      ...this.attribute.textStyle,
      text: '…'
    };
    let ellipsisWidth = Infinity;
    if (ellipsisLabelAttribute.ellipsis !== false) {
      const ellipsisText = this._createLabelText(ellipsisLabelAttribute);
      const ellipsisTextBounds = this.getGraphicBounds(ellipsisText);
      ellipsisWidth = ellipsisTextBounds.x2 - ellipsisTextBounds.x1;
    }
    const data = labels.map(label => label.attribute as LabelItem);
    const currentMarks = Array.from(this._idToGraphic.values());
    this._line2MinLength = isFunction(this.attribute.line.line2MinLength)
      ? (
          this.attribute.line.line2MinLength as (
            texts: IGraphic[],
            arcs: IArc[],
            attrs: Partial<ArcLabelAttrs>
          ) => number
        )(texts, currentMarks as IArc[], this.attribute)
      : (this.attribute.line.line2MinLength as number);
    this._alignOffset =
      (isFunction(this.attribute.layout.alignOffset)
        ? (
            this.attribute.layout.alignOffset as (
              texts: IGraphic[],
              arcs: IArc[],
              attrs: Partial<ArcLabelAttrs>
            ) => number
          )(texts, currentMarks as IArc[], this.attribute)
        : (this.attribute.layout.alignOffset as number)) ?? 0;

    const arcs: ArcInfo[] = this.layoutArcLabels(
      this.attribute.position,
      this.attribute,
      currentMarks,
      data,
      textBoundsArray,
      ellipsisWidth
    );
    for (let i = 0; i < data.length; i++) {
      const textData = data[i];
      const basedArc = arcs.find(arc => arc.refDatum?.id === textData.id);
      if (basedArc) {
        const labelAttribute = {
          visible: basedArc.labelVisible,
          x: basedArc.labelPosition.x,
          y: basedArc.labelPosition.y,
          angle: basedArc.angle,
          points:
            basedArc.pointA && basedArc.pointB && basedArc.pointC
              ? [basedArc.pointA, basedArc.pointB, basedArc.pointC]
              : undefined,
          line: basedArc.labelLine
        };

        if (labels[i].type === 'richtext') {
          (labelAttribute as unknown as IRichTextAttribute).width =
            basedArc.labelLimit ?? (labels[i].attribute as IRichTextAttribute).width;
        } else {
          (labelAttribute as unknown as ITextAttribute).maxLineWidth =
            basedArc.labelLimit ?? (labels[i].attribute as ITextAttribute).maxLineWidth;
        }

        if (basedArc.refArc && basedArc.refArc.type === 'arc3d') {
          (labelAttribute as any).anchor3d = [
            basedArc.circleCenter.x - labelAttribute.x,
            basedArc.circleCenter.y - labelAttribute.y
          ];
          (labelAttribute as any).beta = basedArc.refArc.attribute.beta;
        }

        labels[i].setAttributes(labelAttribute);
      }
    }
    return labels;
  }

  protected layoutArcLabels(
    position: BaseLabelAttrs['position'],
    attribute: any,
    currentMarks?: IGraphic[],
    data?: LabelItem[],
    textBoundsArray?: any,
    ellipsisWidth?: number
  ) {
    // setArcs : 根据 arc 设置 datum 中对应的标签数据
    this._arcLeft.clear();
    this._arcRight.clear();
    this._ellipsisWidth = ellipsisWidth;

    let maxRadius = 0;
    currentMarks.forEach(currentMarks => {
      if ((currentMarks.attribute as IArcGraphicAttribute).outerRadius > maxRadius) {
        maxRadius = (currentMarks.attribute as IArcGraphicAttribute).outerRadius;
      }
    });

    data.forEach((d, index) => {
      const currentMark = this._idToGraphic.get(d.id);
      const graphicAttribute = currentMark.attribute as IArcGraphicAttribute;
      const center = { x: graphicAttribute?.x ?? 0, y: graphicAttribute?.y ?? 0 };
      if (!isNil(data[index]) && !isNil(textBoundsArray[index])) {
        const item = data[index] ? data[index] : null;
        const textBounds = textBoundsArray[index] ? textBoundsArray[index] : { x1: 0, x2: 0, y1: 0, y2: 0 };

        const arcMiddleAngle = (graphicAttribute.startAngle + graphicAttribute.endAngle) / 2;
        const intervalAngle = graphicAttribute.endAngle - graphicAttribute.startAngle;
        const arcQuadrant = computeQuadrant(graphicAttribute.endAngle - intervalAngle / 2);

        const arcMiddle = polarToCartesian(center, graphicAttribute.outerRadius, arcMiddleAngle);
        const outerArcMiddle = polarToCartesian(center, maxRadius + attribute.line.line1MinLength, arcMiddleAngle);
        const arc = new ArcInfo(
          item,
          arcMiddle,
          outerArcMiddle,
          arcQuadrant,
          intervalAngle,
          arcMiddleAngle,
          graphicAttribute.innerRadius,
          graphicAttribute.outerRadius,
          center
        );
        arc.refArc = currentMark as IArc;
        arc.pointA = polarToCartesian(
          center as IPoint,
          this.computeDatumRadius(center.x * 2, center.y * 2, graphicAttribute.outerRadius),
          arc.middleAngle
        );

        arc.labelSize = {
          width: textBounds.x2 - textBounds.x1,
          height: textBounds.y2 - textBounds.y1
        };

        if (isQuadrantRight(arc.quadrant)) {
          this._arcRight.set(arc.refDatum, arc);
        } else if (isQuadrantLeft(arc.quadrant)) {
          this._arcLeft.set(arc.refDatum, arc);
        }
      }
    });

    // layoutLabels : 执行内部/外部标签的布局计算
    const leftArcs = Array.from(this._arcLeft.values());
    const rightArcs = Array.from(this._arcRight.values());
    const arcs: ArcInfo[] = [];
    switch (position) {
      case 'inside':
      case 'inside-inner':
      case 'inside-outer':
      case 'inside-center':
        arcs.push(...this._layoutInsideLabels(rightArcs, attribute, currentMarks));
        arcs.push(...this._layoutInsideLabels(leftArcs, attribute, currentMarks));
        break;
      case 'outside':
      default:
        arcs.push(...this._layoutOutsideLabels(rightArcs, attribute, currentMarks));
        arcs.push(...this._layoutOutsideLabels(leftArcs, attribute, currentMarks));
        break;
    }
    return arcs;
  }

  /**
   * 布局内部标签
   */
  private _layoutInsideLabels(arcs: ArcInfo[], attribute: ArcLabelAttrs, currentMarks: any[]) {
    const labelConfig = attribute;
    const spaceWidth = labelConfig.spaceWidth as number;
    const position = labelConfig.position ?? 'inside';
    const offsetRadius = labelConfig.offsetRadius ?? -spaceWidth;

    arcs.forEach((arc: ArcInfo) => {
      const { labelSize, radian } = arc;
      const innerRadius = arc.innerRadius;
      const outerRadius = arc.outerRadius;
      const minRadian = connectLineRadian(outerRadius, labelSize.height);
      let limit;
      if (radian < minRadian) {
        limit = 0;
      } else {
        let minRadius;
        if (radian >= Math.PI) {
          minRadius = innerRadius;
        } else {
          minRadius = Math.max(innerRadius, labelSize.height / 2 / Math.tan(radian / 2));
        }
        limit = outerRadius - minRadius - spaceWidth;
      }
      // TODO: 对于不旋转的内部标签设置 limit 为 outerRadius
      if (labelConfig.rotate !== true) {
        limit = outerRadius - spaceWidth;
      }
      const text = this._getFormatLabelText(arc.refDatum, limit);
      arc.labelText = text;
      const labelWidth = Math.min(limit, arc.labelSize.width);
      const align = this._computeAlign(arc, attribute);
      let alignOffset = 0;
      if (position === 'inside') {
        alignOffset = align === 'left' ? labelWidth : align === 'right' ? 0 : labelWidth / 2;
      }
      let labelRadius;
      if (position === 'inside-inner') {
        labelRadius = innerRadius - offsetRadius + alignOffset;
      } else if (position === 'inside-center') {
        labelRadius = innerRadius + (outerRadius - innerRadius) / 2;
      } else {
        labelRadius = outerRadius + offsetRadius - alignOffset;
      }
      arc.labelPosition = polarToCartesian(arc.circleCenter, labelRadius, arc.middleAngle);
      arc.labelLimit = labelWidth;
      if (!isGreater(labelWidth, 0)) {
        arc.labelVisible = false;
      }

      if (labelConfig.rotate !== false) {
        arc.angle = attribute.textStyle?.angle ?? arc.middleAngle;
        let offsetAngle = labelConfig.offsetAngle ?? 0;
        if (['inside-inner', 'inside-outer'].includes(position as string)) {
          offsetAngle += Math.PI / 2;
        }
        arc.angle += offsetAngle;
      }
    });
    return arcs;
  }

  /**
   * 布局外部标签
   */
  private _layoutOutsideLabels(arcs: ArcInfo[], attribute: ArcLabelAttrs, currentMarks: any[]) {
    const center = { x: currentMarks[0].attribute.x ?? 0, y: currentMarks[0].attribute.y ?? 0 };
    const height = center.y * 2;
    const labelLayout = attribute.layout;
    const spaceWidth = attribute.spaceWidth as number;

    arcs.forEach(arc => {
      const direction = isQuadrantLeft(arc.quadrant) ? -1 : 1;
      arc.labelPosition = {
        x: arc.outerCenter.x + direction * (arc.labelSize.width / 2 + this._line2MinLength + spaceWidth),
        y: arc.outerCenter.y
      };
    });
    arcs.sort((a, b) => {
      return a.labelPosition.y - b.labelPosition.y;
    });

    if (attribute.coverEnable !== false || labelLayout.strategy === 'none') {
      for (const arc of arcs) {
        const { labelPosition, labelSize } = arc;
        arc.labelLimit = labelSize.width;
        arc.pointB = isQuadrantLeft(arc.quadrant)
          ? {
              x: labelPosition.x + labelSize.width / 2 + this._line2MinLength + spaceWidth,
              y: labelPosition.y
            }
          : {
              x: labelPosition.x - labelSize.width / 2 - this._line2MinLength - spaceWidth,
              y: labelPosition.y
            };
        this._computeX(arc, attribute, currentMarks);
      }
      if (attribute.coverEnable === false && labelLayout.strategy === 'none') {
        this._coverLabels(arcs);
      }
    } else {
      // 由于可能存在多行标签，这里仅仅估计一个最大标签数量用于避免冗余计算
      const maxLabels = height / ((attribute.textStyle?.fontSize as number) || 16);
      // 布局圆弧半径
      this._adjustY(arcs, maxLabels, attribute, currentMarks);

      const { minY, maxY } = arcs.reduce(
        (yInfo, arc) => {
          const { y1, y2 } = arc.getLabelBounds();
          yInfo.minY = Math.max(0, Math.min(y1, yInfo.minY));
          yInfo.maxY = Math.min(height, Math.max(y2, yInfo.maxY));
          return yInfo;
        },
        { minY: Infinity, maxY: -Infinity }
      );
      const halfY = Math.max(Math.abs(height / 2 - minY), Math.abs(maxY - height / 2));
      // pointB 与 label 的 y 值相同，但是 label 的 x 值依赖于 pointB 的 x 值
      const r = this._computeLayoutRadius(halfY, attribute, currentMarks);
      for (const arc of arcs) {
        this._computePointB(arc, r, attribute, currentMarks);
        this._computeX(arc, attribute, currentMarks);
      }
    }
    const width = center.x * 2;
    arcs.forEach(arc => {
      if (
        arc.labelVisible &&
        (isLess(arc.pointB.x, this._line2MinLength + spaceWidth) ||
          isGreater(arc.pointB.x, width - this._line2MinLength - spaceWidth))
      ) {
        arc.labelVisible = false;
      }
      arc.angle = attribute.textStyle?.angle ?? 0;
      if (attribute.offsetAngle) {
        arc.angle += attribute.offsetAngle;
      }

      arc.labelLine = {
        ...attribute.line,
        visible: arc.labelVisible
      };
    });

    return arcs;
  }

  /**
   * 计算 pointC 以及 label limit 与 position
   */
  private _computeX(arc: ArcInfo, attribute: any, currentMarks: any[]) {
    const center = arc.circleCenter;
    const plotLayout = {
      x1: 0,
      x2: this.attribute.width,
      y1: 0,
      y2: this.attribute.height
    };

    let maxRadius = 0;
    currentMarks.forEach((currentMark: IGraphic) => {
      if ((currentMark.attribute as IArcGraphicAttribute).outerRadius > maxRadius) {
        maxRadius = (currentMark.attribute as IArcGraphicAttribute).outerRadius;
      }
    });

    const radiusRatio = this.computeLayoutOuterRadius(maxRadius, attribute.width, attribute.height);

    const line1MinLength = attribute.line.line1MinLength as number;
    const labelLayoutAlign = attribute.layout?.align;
    const spaceWidth = attribute.spaceWidth as number;

    const { labelPosition, quadrant, pointB } = arc;
    if (!isValidNumber(pointB.x * pointB.y)) {
      arc.pointC = { x: NaN, y: NaN };
      labelPosition.x = NaN;
      arc.labelLimit = 0;
    }
    const radius = this.computeRadius(radiusRatio, attribute.width, attribute.height);
    const flag = isQuadrantLeft(quadrant) ? -1 : 1;
    let cx: number = 0;
    let limit =
      (flag > 0 ? plotLayout.x2 - pointB.x : pointB.x - plotLayout.x1) +
      this._alignOffset -
      this._line2MinLength -
      spaceWidth;

    if (labelLayoutAlign === 'labelLine') {
      cx = (radius + line1MinLength + this._line2MinLength) * flag + (center as IPoint).x;
      limit = (flag > 0 ? plotLayout.x2 - cx : cx - plotLayout.x1) - spaceWidth;
    }

    const text = this._getFormatLabelText(arc.refDatum, limit);
    arc.labelText = text;
    let labelWidth = Math.min(limit, arc.labelSize.width);
    switch (labelLayoutAlign) {
      case 'labelLine':
        break;
      case 'edge':
        cx = flag > 0 ? plotLayout.x2 - labelWidth - spaceWidth : plotLayout.x1 + labelWidth + spaceWidth;
        break;
      case 'arc':
      default:
        cx = pointB.x + flag * this._line2MinLength;
        break;
    }
    labelWidth = Math.max(this._ellipsisWidth, labelWidth);
    const needAdjustLimit = labelWidth < arc.labelSize.width - 1;

    if (needAdjustLimit) {
      arc.labelLimit = labelWidth;
    } else {
      arc.labelLimit = null;
    }

    arc.pointC = { x: cx, y: labelPosition.y };

    const align = this._computeAlign(arc, attribute);
    const targetCenterOffset = getAlignOffset(align) * (needAdjustLimit ? labelWidth : arc.labelSize.width);

    if (labelLayoutAlign === 'edge') {
      // edge 模式下的多行文本对齐方向与其他模式相反
      // 贴近画布边缘的布局结果可能会由于 cx 的小数 pixel 导致被部分裁剪，因此额外做计算
      labelPosition.x =
        (flag > 0 ? plotLayout.x2 : plotLayout.x1) - flag * targetCenterOffset + flag * this._alignOffset;

      arc.pointC.x += flag * this._alignOffset;
    } else {
      labelPosition.x = cx + flag * (this._alignOffset + spaceWidth + targetCenterOffset);
    }
  }

  private _computeAlign(arc: ArcInfo, attribute: any) {
    const labelConfig = attribute;
    // 暂时兼容两种配置方式
    const textAlign = labelConfig.textStyle?.textAlign ?? labelConfig.textStyle?.align;
    const layoutAlign = labelConfig.layout?.textAlign ?? labelConfig.layout?.align;
    if (labelConfig.position !== 'inside') {
      if (isNil(textAlign) || textAlign === 'auto') {
        // edge 模式下沿着画布对齐，与 labelLine & edge 模式相反
        if (layoutAlign === 'edge') {
          return isQuadrantLeft(arc.quadrant) ? 'left' : 'right';
        }
        return isQuadrantLeft(arc.quadrant) ? 'right' : 'left';
      }
      return textAlign;
    }
    return isNil(textAlign) || textAlign === 'auto' ? 'center' : textAlign;
  }

  private _getFormatLabelText(value: any, limit?: number) {
    return value?.text ?? '';
  }

  /**
   * 调整标签位置的 Y 值
   */
  private _adjustY(arcs: ArcInfo[], maxLabels: number, attribute: any, currentMarks: any[]) {
    const center = { x: currentMarks[0].attribute.x ?? 0, y: currentMarks[0].attribute.y ?? 0 };
    const plotRect = { width: center.x * 2, height: center.y * 2 };
    const labelLayout = attribute.layout;
    if (labelLayout.strategy === 'vertical') {
      // vertical 策略类似 echarts 方案，没有切线限制策略，没有优先级，执行整体调整没有标签数量限制
      let lastY = 0;
      let delta;
      const len = arcs.length;
      if (len <= 0) {
        return;
      }
      // 偏移 y 值以避免遮挡
      for (let i = 0; i < len; i++) {
        const { y1 } = arcs[i].getLabelBounds();
        delta = y1 - lastY;
        if (isLess(delta, 0)) {
          const index = this._shiftY(arcs, i, len - 1, -delta);
          this._shiftY(arcs, index, 0, delta / 2);
        }
        const { y2 } = arcs[i].getLabelBounds();
        lastY = y2;
      }
      // 将超出上界的标签下移
      const { y1: firstY1 } = arcs[0].getLabelBounds();
      delta = firstY1 - 0;
      if (isLess(delta, 0)) {
        this._shiftY(arcs, 0, len - 1, -delta);
      }
      for (let i = arcs.length - 1; i >= 0; i--) {
        if (arcs[i].getLabelBounds().y2 > plotRect.height) {
          arcs[i].labelVisible = false;
        } else {
          break;
        }
      }
    } else if (labelLayout.strategy !== 'none') {
      const priorityArcs: PriorityArc[] = arcs.map((arc, i) => {
        return {
          arc,
          originIndex: i,
          priorityIndex: 0
        };
      });
      priorityArcs.sort((a, b) => {
        return b.arc.radian - a.arc.radian;
      });
      priorityArcs.forEach((priorityArc, i) => {
        priorityArc.priorityIndex = i;
        // 首先隐藏所有标签
        priorityArc.arc.labelVisible = false;
      });

      let topLabelIndex = Infinity;
      let bottomLabelIndex = -Infinity;
      // 按照优先级依次布局标签
      for (let i = 0; i < maxLabels && i < arcs.length; i++) {
        this._storeY(arcs);
        const arc = priorityArcs[i].arc;
        this._computeYRange(arc, attribute, currentMarks);
        arc.labelVisible = true;
        const curY = arc.labelPosition.y;
        // 寻找标签在布局前垂直方向上的上下邻居，也就是饼图上的邻居关系
        const { lastIndex, nextIndex } = this._findNeighborIndex(arcs, priorityArcs[i]);
        const lastArc = arcs[lastIndex];
        const nextArc = arcs[nextIndex];
        if (lastIndex === -1 && nextIndex !== -1) {
          const nextY = nextArc.labelPosition.y;
          if (curY > nextY) {
            arc.labelPosition.y = nextY - nextArc.labelSize.height / 2 - arc.labelSize.height / 2;
          } else {
            this._twoWayShift(arcs, arc, nextArc, nextIndex);
          }
        } else if (lastIndex !== -1 && nextIndex === -1) {
          const lastY = lastArc.labelPosition.y;
          if (curY < lastY) {
            arc.labelPosition.y = lastY + lastArc.labelSize.height / 2 + arc.labelSize.height / 2;
          } else {
            this._twoWayShift(arcs, lastArc, arc, priorityArcs[i].originIndex);
          }
        } else if (lastIndex !== -1 && nextIndex !== -1) {
          const lastY = lastArc.labelPosition.y;
          const nextY = nextArc.labelPosition.y;
          if (curY > nextY) {
            arc.labelPosition.y = nextY - nextArc.labelSize.height / 2 - arc.labelSize.height / 2;
            this._twoWayShift(arcs, lastArc, arc, priorityArcs[i].originIndex);
          } else if (curY < lastY) {
            arc.labelPosition.y = lastY + lastArc.labelSize.height / 2 + arc.labelSize.height / 2;
            this._twoWayShift(arcs, arc, nextArc, nextIndex);
          } else {
            this._twoWayShift(arcs, lastArc, arc, priorityArcs[i].originIndex);
            this._twoWayShift(arcs, arc, nextArc, nextIndex);
          }
        }

        const nextTopIndex = Math.min(topLabelIndex, priorityArcs[i].originIndex);
        const nextBottomIndex = Math.max(bottomLabelIndex, priorityArcs[i].originIndex);
        let delta;
        // 将超出下界的标签上移
        delta = arcs[nextBottomIndex].getLabelBounds().y2 - plotRect.height;
        if (isGreater(delta, 0)) {
          this._shiftY(arcs, nextBottomIndex, 0, -delta);
        }
        // 将超出上界的标签下移
        delta = arcs[nextTopIndex].getLabelBounds().y1 - 0;
        if (isLess(delta, 0)) {
          this._shiftY(arcs, nextTopIndex, arcs.length - 1, -delta);
        }
        delta = arcs[nextBottomIndex].getLabelBounds().y2 - plotRect.height;
        // 当整体上下移一次之后仍然无法容纳所有标签，则当前标签应当舍去
        if (isGreater(delta, 0)) {
          arc.labelVisible = false;
          this._restoreY(arcs);
          break;
        } else if (labelLayout.tangentConstraint && !this._checkYRange(arcs)) {
          // 当标签由于 Y 方向调节范围过大而舍弃时不应当终止布局过程
          arc.labelVisible = false;
          this._restoreY(arcs);
        } else {
          topLabelIndex = nextTopIndex;
          bottomLabelIndex = nextBottomIndex;
        }
      }
    }
  }

  /**
   * 向某一方向调整局部标签的 Y 值
   */
  private _shiftY(arcs: ArcInfo[], start: number, end: number, delta: number) {
    const direction = start < end ? 1 : -1;
    let index = start;
    while (index !== -1) {
      arcs[index].labelPosition.y += delta;
      const nextIndex = this._findNextVisibleIndex(arcs, index, end, direction);
      if (nextIndex >= 0 && nextIndex < arcs.length) {
        const { y1: curY1, y2: curY2 } = arcs[index].getLabelBounds();
        const { y1: nextY1, y2: nextY2 } = arcs[nextIndex].getLabelBounds();
        if ((direction > 0 && curY2 < nextY1) || (direction < 0 && curY1 > nextY2)) {
          return index;
        }
      }
      index = nextIndex;
    }
    return end;
  }

  /**
   * 寻找下一个显示标签索引
   */
  private _findNextVisibleIndex(arcs: ArcInfo[], start: number, end: number, direction: number) {
    const diff = (end - start) * direction;
    for (let i = 1; i <= diff; i++) {
      const index = start + i * direction;
      if (arcs[index].labelVisible) {
        return index;
      }
    }
    return -1;
  }

  /**
   * 计算 pointB，其 y 值在 adjustY 中确定，也即是 label 的 y 值
   */
  private _computePointB(arc: ArcInfo, r: number, attribute: any, currentMarks: any[]) {
    const labelConfig = attribute;

    let maxRadius = 0;
    currentMarks.forEach((currentMark: IGraphic) => {
      if ((currentMark.attribute as IArcGraphicAttribute).outerRadius > maxRadius) {
        maxRadius = (currentMark.attribute as IArcGraphicAttribute).outerRadius;
      }
    });

    const radiusRatio = this.computeLayoutOuterRadius(maxRadius, attribute.width, attribute.height);
    const line1MinLength = labelConfig.line.line1MinLength as number;
    const labelLayout = labelConfig.layout;

    if (labelLayout.strategy === 'none') {
      // 不执行躲避策略或者不显示引导线时紧挨着圆弧布局
      arc.pointB = {
        x: arc.outerCenter.x,
        y: arc.outerCenter.y
      };
    } else {
      const center = arc.circleCenter;
      const radius = this.computeRadius(radiusRatio, attribute.width, attribute.height);
      const { labelPosition, quadrant } = arc;
      const outerR = Math.max(radius + line1MinLength, arc.outerRadius);
      const rd = r - outerR;
      // x 为 pointB.x 与圆心的差值
      const x = Math.sqrt(r ** 2 - Math.abs((center as IPoint).y - labelPosition.y) ** 2) - rd;
      if (isValidNumber(x)) {
        arc.pointB = {
          x: (center as IPoint).x + x * (isQuadrantLeft(quadrant) ? -1 : 1),
          y: labelPosition.y
        };
      } else {
        arc.pointB = { x: NaN, y: NaN };
      }
    }
  }

  /**
   * 存储当前所有显示标签的 Y 值
   */
  private _storeY(arcs: ArcInfo[]) {
    for (const arc of arcs) {
      if (arc.labelVisible) {
        arc.lastLabelY = arc.labelPosition.y;
      }
    }
  }

  /**
   * 计算圆弧切线所限制的标签 Y 值范围
   */
  private _computeYRange(arc: ArcInfo, attribute: any, currentMarks: any[]) {
    const center = arc.circleCenter;
    const plotRect = { width: center.x * 2, height: center.y * 2 };

    let maxRadius = 0;
    currentMarks.forEach((currentMark: IGraphic) => {
      if ((currentMark.attribute as IArcGraphicAttribute).outerRadius > maxRadius) {
        maxRadius = (currentMark.attribute as IArcGraphicAttribute).outerRadius;
      }
    });

    const radiusRatio = this.computeLayoutOuterRadius(maxRadius, attribute.width, attribute.height);
    const line1MinLength = attribute.line.line1MinLength as number;

    const { width, height } = plotRect;

    const radius = this.computeRadius(radiusRatio, attribute.width, attribute.height);
    // 出现 y 方向挤压过度必然是由于画布上下某一端被占满，此时半径是确定的
    const r = this._computeLayoutRadius(height / 2, attribute, currentMarks);
    // 所有坐标转化到以圆心为原点的坐标系计算
    // 在饼图上左右计算对称，可以全都转化到右侧计算
    const cx = Math.abs(arc.center.x - width / 2);
    const cy = arc.center.y - height / 2;
    let a;
    let b;
    let c;
    if (isClose(width / 2, cx)) {
      a = 0;
      b = 1;
      c = -cy;
    } else if (isClose(height / 2, cy)) {
      a = 1;
      b = 0;
      c = -cx;
    } else {
      // 斜截式转为一般式
      const k = -1 / (cy / cx);
      a = k;
      b = -1;
      c = cy - k * cx;
    }
    const points = lineCirclePoints(a, b, c, line1MinLength + radius - r, 0, r);
    // 由于饼图上切点在布局圆内部，交点必然有两个
    if (points.length < 2) {
      return;
    }
    let min;
    let max;
    if (points[0].x > points[1].x) {
      points.reverse();
    }
    if (points[0].x < 0) {
      if (isClose(points[0].y, points[1].y)) {
        if (
          (isGreater(arc.middleAngle, -Math.PI) && isLess(arc.middleAngle, 0)) ||
          (isGreater(arc.middleAngle, Math.PI) && isLess(arc.middleAngle, Math.PI * 2))
        ) {
          min = 0;
          max = points[1].y + height / 2;
        } else {
          min = points[1].y + height / 2;
          max = height;
        }
      } else if (points[0].y < points[1].y) {
        min = 0;
        max = points[1].y + height / 2;
      } else {
        min = points[1].y + height / 2;
        max = plotRect.height;
      }
    } else {
      min = Math.min(points[0].y, points[1].y) + height / 2;
      max = Math.max(points[0].y, points[1].y) + height / 2;
    }
    arc.labelYRange = [min, max];
  }

  /**
   * 计算标签布局圆弧半径，即 pointB 所落在的圆弧
   */
  private _computeLayoutRadius(halfYLength: number, attribute: any, currentMarks: any[]) {
    const labelConfig = attribute;
    const layoutArcGap = labelConfig.layoutArcGap as number;
    const line1MinLength = labelConfig.line.line1MinLength as number;

    let maxRadius = 0;
    currentMarks.forEach((currentMark: IGraphic) => {
      if ((currentMark.attribute as IArcGraphicAttribute).outerRadius > maxRadius) {
        maxRadius = (currentMark.attribute as IArcGraphicAttribute).outerRadius;
      }
    });

    const radiusRatio = this.computeLayoutOuterRadius(maxRadius, attribute.width, attribute.height);
    const radius = this.computeRadius(radiusRatio, attribute.width, attribute.height);
    const outerR = radius + line1MinLength;

    const a = outerR - layoutArcGap;

    return Math.max((a ** 2 + halfYLength ** 2) / (2 * a), outerR);
  }

  /**
   * 依据初始的标签排序，寻找某一标签上下最近的显示标签索引
   */
  private _findNeighborIndex(arcs: ArcInfo[], priorityArc: PriorityArc) {
    const index = priorityArc.originIndex;
    let lastIndex = -1;
    let nextIndex = -1;
    for (let i = index - 1; i >= 0; i--) {
      if (arcs[i].labelVisible) {
        lastIndex = i;
        break;
      }
    }
    for (let i = index + 1; i < arcs.length; i++) {
      if (arcs[i].labelVisible) {
        nextIndex = i;
        break;
      }
    }
    return {
      lastIndex,
      nextIndex
    };
  }

  /**
   * 执行给定标签 Y 值的 shiftDown 以及 shiftUp
   */
  private _twoWayShift(arcs: ArcInfo[], lastArc: ArcInfo, nextArc: ArcInfo, nextIndex: number) {
    const delta = nextArc.getLabelBounds().y1 - lastArc.getLabelBounds().y2;
    if (isLess(delta, 0)) {
      const i = this._shiftY(arcs, nextIndex, arcs.length - 1, -delta);
      this._shiftY(arcs, i, 0, delta / 2);
    }
  }

  /**
   * 恢复所有显示标签在之前存储的 Y 值
   */
  private _restoreY(arcs: ArcInfo[]) {
    for (const arc of arcs) {
      if (arc.labelVisible) {
        arc.labelPosition.y = arc.lastLabelY;
      }
    }
  }

  /**
   * 检查每个显示的标签的 Y 值是否在切线限制范围内
   */
  private _checkYRange(arcs: ArcInfo[]) {
    for (const arc of arcs) {
      const { labelYRange, labelPosition } = arc;
      if (
        arc.labelVisible &&
        labelYRange &&
        (isLess(labelPosition.y, labelYRange[0]) || isGreater(labelPosition.y, labelYRange[1]))
      ) {
        return false;
      }
    }
    return true;
  }

  /**
   * 自上至下计算被遮盖的标签
   */
  private _coverLabels(arcs: ArcInfo[]) {
    if (arcs.length <= 1) {
      return;
    }
    let lastBounds = arcs[0].getLabelBounds();
    for (let i = 1; i < arcs.length; i++) {
      const bounds = arcs[i].getLabelBounds();
      if (!checkBoundsOverlap(lastBounds, bounds)) {
        lastBounds = bounds;
      } else {
        arcs[i].labelVisible = false;
      }
    }
  }

  protected _getLabelLinePoints(text: IText | IRichText, baseMark?: IGraphic) {
    return (text.attribute as ArcLabelAttrs).points;
  }

  protected _createLabelLine(text: IText, baseMark?: IGraphic) {
    const { line = {}, visible } = text.attribute as ArcLabelAttrs;
    const lineGraphic = super._createLabelLine(text, baseMark);
    if (lineGraphic) {
      lineGraphic.setAttributes({
        visible: (line.visible && visible) ?? text.attribute?.visible ?? true,
        lineWidth: line.style?.lineWidth ?? 1
      });
      if (line.smooth) {
        lineGraphic.setAttributes({
          curveType: 'basis'
        });
      }

      if (baseMark.type === 'arc3d' && baseMark) {
        const { beta, x, y } = baseMark.attribute;
        lineGraphic.setAttributes({
          beta,
          anchor3d: [x, y]
        });
      }
    }

    return lineGraphic;
  }

  protected computeRadius(r: number, width?: number, height?: number, k?: number): number {
    return this.computeLayoutRadius(width ? width : 0, height ? height : 0) * r * (isNil(k) ? 1 : k);
  }

  protected computeLayoutRadius(width: number, height: number) {
    return Math.min(width / 2, height / 2);
  }

  protected _canPlaceInside(textBound: IBoundsLike, shapeBound: IAABBBounds) {
    return this.attribute.position === 'inside' || this.attribute.position === 'inside-center';
  }

  private computeLayoutOuterRadius(r: number, width: number, height: number) {
    return r / (Math.min(width, height) / 2);
  }

  private computeDatumRadius(width?: number, height?: number, outerRadius?: any): number {
    const outerRadiusRatio = this.computeLayoutOuterRadius(outerRadius, width, height); //this.getRadius(state)
    return this.computeLayoutRadius(width ? width : 0, height ? height : 0) * outerRadiusRatio;
  }
}

export const registerArcDataLabel = () => {
  registerLabelComponent('arc', ArcLabel);
};
