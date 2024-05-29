/**
 * @description 标签组件
 */
import { isEmpty, merge } from '@visactor/vutils';
import type { IArc } from '@visactor/vrender-core';
// eslint-disable-next-line no-duplicate-imports
import { graphicCreator } from '@visactor/vrender-core';
import type { ArcSegmentAttributes, SymbolAttributes } from './type';
import type { Point } from '../core/type';
import type { ComponentOptions } from '../interface';
import { loadArcSegmentComponent } from './register';
import { Segment } from './segment';

loadArcSegmentComponent();
export class ArcSegment extends Segment {
  name = 'arc-segment';
  key = 'arc-segment';
  line?: IArc;
  isReverseArc: boolean = false;

  constructor(attributes: ArcSegmentAttributes, options?: ComponentOptions) {
    super(options?.skipDefault ? attributes : merge({}, Segment.defaultAttributes, attributes));
  }

  /**
   * 外部获取segment起点切线正方向
   */
  getStartAngle() {
    // 如果是顺时针弧, start切线方向 = 弧度方向 - Math.PI / 2, 反之相反
    const tangAng = this.isReverseArc ? this._startAngle + Math.PI / 2 : this._startAngle - Math.PI / 2;

    // 经过刚刚的计算角度范围: [0, 360] => [-90, 270] 或 [0, 450]
    // 将其规范范围到[0, 360]
    return tangAng < 0 ? tangAng + Math.PI * 2 : tangAng > Math.PI * 2 ? tangAng - Math.PI * 2 : tangAng;
  }

  /**
   * 外部获取segment终点切线正方向
   */
  getEndAngle() {
    // 如果是顺时针弧, end切线方向 = 弧度方向 + Math.PI / 2, 反之相反
    const tangAng = this.isReverseArc ? this._endAngle - Math.PI / 2 : this._endAngle + Math.PI / 2;

    // 经过刚刚的计算角度范围: [0, 360] => [-90, 270] 或 [0, 450]
    // 将其规范范围到[0, 360]
    return tangAng < 0 ? tangAng + Math.PI * 2 : tangAng > Math.PI * 2 ? tangAng - Math.PI * 2 : tangAng;
  }

  getMainSegmentPoints() {
    return this._mainSegmentPoints;
  }

  protected _computeStartRotate(angle: number) {
    return this.isReverseArc ? angle + Math.PI : angle;
  }

  protected _computeEndRotate(angle: number) {
    return this.isReverseArc ? angle : angle + Math.PI;
  }

  protected render() {
    this.removeAllChild(true);
    this._reset();
    const {
      // points,
      startSymbol,
      endSymbol,
      lineStyle,
      state,
      visible = true,
      radius,
      startAngle,
      endAngle,
      center
    } = this.attribute as ArcSegmentAttributes;

    if (!visible) {
      return;
    }

    this._startAngle = startAngle;
    this._endAngle = endAngle;
    this.isReverseArc = startAngle > endAngle;

    // 绘制start和end symbol
    const startPoint: Point = {
      x: center.x + radius * Math.cos(this._startAngle),
      y: center.y + radius * Math.sin(this._startAngle)
    };
    const endPoint: Point = {
      x: center.x + radius * Math.cos(this._endAngle),
      y: center.y + radius * Math.sin(this._endAngle)
    };
    this._mainSegmentPoints = [startPoint, endPoint];

    const startSymbolShape = this._renderSymbol(startSymbol as SymbolAttributes, this._mainSegmentPoints, 'start');
    const endSymbolShape = this._renderSymbol(endSymbol as SymbolAttributes, this._mainSegmentPoints, 'end');

    this.startSymbol = startSymbolShape;
    this.endSymbol = endSymbolShape;

    const line = graphicCreator.arc({
      x: center.x,
      y: center.y,
      // startAngle: Math.PI + 0.5,
      // endAngle: 0,
      startAngle,
      endAngle,
      innerRadius: radius,
      outerRadius: radius,
      ...lineStyle
    });

    line.name = `${this.name}-line`;
    line.id = this._getNodeId('arc');
    if (!isEmpty(state?.line)) {
      line.states = [].concat(state.line)[0];
    }
    this.add(line);
    this.line = line;
  }
}
