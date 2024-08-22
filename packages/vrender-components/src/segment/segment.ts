/**
 * @description 标签组件
 */
import { array, flattenArray, isArray, isEmpty, isValidNumber, merge } from '@visactor/vutils';
import type { ILine, ISymbol } from '@visactor/vrender-core';
// eslint-disable-next-line no-duplicate-imports
import { graphicCreator } from '@visactor/vrender-core';
import { AbstractComponent } from '../core/base';
import type { ILineGraphicWithCornerRadius, SegmentAttributes, SymbolAttributes } from './type';
import type { Point } from '../core/type';
import type { ComponentOptions } from '../interface';
import { loadSegmentComponent } from './register';
import { normalizeAngle } from '@visactor/vutils';

loadSegmentComponent();
export class Segment extends AbstractComponent<Required<SegmentAttributes>> {
  name = 'segment';
  key = 'segment';
  startSymbol?: ISymbol;
  endSymbol?: ISymbol;
  lines?: ILine[] = [];
  // animate?: (startSymbol, endSymbol, lines) => void;

  protected _startAngle!: number;
  /**
   * 外部获取segment起点正方向
   */
  getStartAngle() {
    return normalizeAngle(this._startAngle);
  }

  protected _endAngle!: number;
  /**
   * 外部获取segment终点正方向
   */
  getEndAngle() {
    return normalizeAngle(this._endAngle);
  }

  protected _mainSegmentPoints: Point[]; // 组成主线段的点
  getMainSegmentPoints() {
    return this._mainSegmentPoints;
  }

  static defaultAttributes: Partial<SegmentAttributes> = {
    visible: true,
    lineStyle: {
      lineWidth: 1,
      stroke: '#000'
    },
    startSymbol: {
      visible: false,
      autoRotate: true,
      symbolType: 'triangle',
      size: 12,
      refX: 0,
      refY: 0,
      refAngle: 0,
      style: {
        fill: '#000',
        zIndex: 1 // 默认 symbol 绘制在 line 上面
      }
    },
    endSymbol: {
      visible: false,
      autoRotate: true,
      symbolType: 'triangle',
      size: 12,
      refX: 0,
      refY: 0,
      refAngle: 0,
      style: {
        fill: '#000',
        zIndex: 1 // 默认 symbol 绘制在 line 上面
      }
    }
  };

  constructor(attributes: SegmentAttributes, options?: ComponentOptions) {
    super(options?.skipDefault ? attributes : merge({}, Segment.defaultAttributes, attributes));
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
      multiSegment,
      mainSegmentIndex
    } = this.attribute as SegmentAttributes;

    if (!visible) {
      return;
    }

    // 计算线的起点和终点角度
    // 计算角度的原因：
    // 1. segment symbol的自动旋转提供参数
    // 2. 使用segment时，需要根据line的角度对附加元素进行自动旋转（比如：markLine的标签, markPoint的装饰线）
    this._computeLineAngle();

    // 绘制start和end symbol
    const points = this._getMainSegmentPoints();
    const startSymbolShape = this._renderSymbol(startSymbol as SymbolAttributes, points, 'start');
    const endSymbolShape = this._renderSymbol(endSymbol as SymbolAttributes, points, 'end');

    this.startSymbol = startSymbolShape;
    this.endSymbol = endSymbolShape;

    if (multiSegment) {
      const points = [...this.attribute.points];
      if (isValidNumber(mainSegmentIndex)) {
        points[mainSegmentIndex] = this._clipPoints(points[mainSegmentIndex] as Point[]);
      } else {
        const clipPoints = this._clipPoints(flattenArray(points) as Point[]);
        points[0][0] = clipPoints[0];
        (points[points.length - 1] as Point[])[(points[points.length - 1] as Point[]).length - 1] =
          clipPoints[clipPoints.length - 1];
      }
      points.forEach((point: Point[], index) => {
        const line = graphicCreator.line({
          points: point,
          ...(isArray(lineStyle) ? lineStyle[index] ?? lineStyle[lineStyle.length - 1] : lineStyle),
          fill: false
        });

        line.name = `${this.name}-line`;
        line.id = this._getNodeId('line' + index);
        if (!isEmpty(state?.line)) {
          line.states = isArray(state.line) ? state.line[index] ?? state.line[state.line.length - 1] : state.line;
        }
        this.add(line);
        this.lines.push(line);
      });
    } else {
      // 如果配置了cornerRadius, 则绘制polygon, 否则绘制line
      let lineCreator = graphicCreator.line;
      if ((array(lineStyle)[0] as ILineGraphicWithCornerRadius).cornerRadius) {
        lineCreator = graphicCreator.polygon;
      }
      const line = lineCreator({
        points: this._clipPoints(this.attribute.points as Point[]),
        ...array(lineStyle)[0],
        fill: false,
        closePath: false
      });

      line.name = `${this.name}-line`;
      line.id = this._getNodeId('line');
      if (!isEmpty(state?.line)) {
        line.states = [].concat(state.line)[0];
      }
      this.add(line);
      this.lines.push(line);
    }
  }

  protected _computeStartRotate(angle: number) {
    return angle + Math.PI / 2;
  }

  protected _computeEndRotate(angle: number) {
    return angle + Math.PI / 2;
  }

  protected _renderSymbol(attribute: SymbolAttributes, points: Point[], dim: string): ISymbol | undefined {
    if (!points.length) {
      return;
    }
    const { autoRotate = true } = attribute;
    let symbol;
    if (attribute && attribute.visible) {
      const startAngle = this.getStartAngle();
      const endAngle = this.getEndAngle();
      const { state } = this.attribute as SegmentAttributes;
      const start = points[0];
      const end = points[points.length - 1];
      const { refX = 0, refY = 0, refAngle = 0, style, symbolType, size = 12 } = attribute;
      let position;
      let rotate;
      if (dim === 'start') {
        position = {
          x:
            start.x +
            (isValidNumber(startAngle) ? refX * Math.cos(startAngle) + refY * Math.cos(startAngle - Math.PI / 2) : 0),
          y:
            start.y +
            (isValidNumber(startAngle) ? refX * Math.sin(startAngle) + refY * Math.sin(startAngle - Math.PI / 2) : 0)
        };
        rotate = this._computeStartRotate(this._startAngle); // @chensiji - 加Math.PI / 2是因为：默认symbol的包围盒垂直于line，所以在做自动旋转时需要在line正方向基础上做90度偏移
      } else {
        position = {
          x:
            end.x + (isValidNumber(endAngle) ? refX * Math.cos(endAngle) + refY * Math.cos(endAngle - Math.PI / 2) : 0),
          y: end.y + (isValidNumber(endAngle) ? refX * Math.sin(endAngle) + refY * Math.sin(endAngle - Math.PI / 2) : 0)
        };
        rotate = this._computeEndRotate(this._endAngle);
      }

      symbol = graphicCreator.symbol({
        ...position,
        symbolType: symbolType as string,
        size,
        angle: autoRotate ? rotate + refAngle : 0,
        strokeBoundsBuffer: 0,
        ...style
      });
      symbol.name = `${this.name}-${dim}-symbol`;
      symbol.id = this._getNodeId(`${dim}-symbol`);

      // 兼容旧逻辑, state.symbol同时应用到startSymbol和endSymbol
      if (!isEmpty(state?.symbol)) {
        symbol.states = state.symbol;
      }

      // 新逻辑, state.startSymbol和state.endSymbol做不同匹配
      if (dim === 'start') {
        if (!isEmpty(state?.startSymbol)) {
          symbol.states = state.startSymbol;
        }
      } else {
        if (!isEmpty(state?.endSymbol)) {
          symbol.states = state.endSymbol;
        }
      }

      this.add(symbol);
    }
    return symbol;
  }

  private _getMainSegmentPoints(): Point[] {
    if (this._mainSegmentPoints) {
      return this._mainSegmentPoints;
    }
    const { points: originPoints, multiSegment, mainSegmentIndex } = this.attribute as SegmentAttributes;

    let points: Point[];
    // 需要做下约束判断
    if (multiSegment) {
      if (isValidNumber(mainSegmentIndex)) {
        points = originPoints[mainSegmentIndex] as Point[];
      } else {
        points = flattenArray(originPoints);
      }
    } else {
      points = originPoints as Point[];
    }
    this._mainSegmentPoints = points;
    // 去除重复的点, 目前发现计算startAngle和endAngle时会有问题

    return points;
  }

  private _clipPoints(points: Point[]) {
    const { startSymbol = {} as SegmentAttributes['startSymbol'], endSymbol = {} as SegmentAttributes['endSymbol'] } =
      this.attribute as SegmentAttributes;
    // 通过改变line起点和终点的方式达到symbol在fill为false的情况下，也可以遮盖line的效果
    let pointsAfterClip = points;
    if (startSymbol.visible) {
      const startSize = startSymbol.clip ? startSymbol.size || 10 : 0;
      const pointsStart = {
        x: points[0].x - (startSize / 2) * (Math.cos(this._startAngle) || 0),
        y: points[0].y - (startSize / 2) * (Math.sin(this._startAngle) || 0)
      };
      pointsAfterClip = [pointsStart, ...pointsAfterClip.slice(1)];
    }
    if (endSymbol.visible) {
      const endSize = endSymbol.clip ? endSymbol.size || 10 : 0;
      const pointsEnd = {
        x: points[points.length - 1].x - (endSize / 2) * (Math.cos(this._endAngle) || 0),
        y: points[points.length - 1].y - (endSize / 2) * (Math.sin(this._endAngle) || 0)
      };
      pointsAfterClip = [...pointsAfterClip.slice(0, pointsAfterClip.length - 1), pointsEnd];
    }

    return pointsAfterClip;
  }

  private _computeLineAngle() {
    const points = this._getMainSegmentPoints();
    if (points.length <= 1) {
      return;
    }
    const start = points[0];
    const startInside = points[1];
    const endInside = points[points.length - 2];
    const end = points[points.length - 1];
    const startVector = [start.x - startInside.x, start.y - startInside.y]; // 起点正方向向量
    const startAngle = Math.atan2(startVector[1], startVector[0]); // 起点正方向角度
    const endVector = [end.x - endInside.x, end.y - endInside.y]; // 终点正方向向量
    const endAngle = Math.atan2(endVector[1], endVector[0]); // 终点正方向角度

    this._startAngle = startAngle;
    this._endAngle = endAngle;
  }

  protected _reset() {
    this.startSymbol = null;
    this.endSymbol = null;
    this._startAngle = null;
    this._endAngle = null;
    this._mainSegmentPoints = null;
  }
}
