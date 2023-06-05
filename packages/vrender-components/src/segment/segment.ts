/**
 * @description 标签组件
 */
import { isEmpty, merge } from '@visactor/vutils';
import { createSymbol, ILine, ISymbol, createLine } from '@visactor/vrender';
import { AbstractComponent } from '../core/base';
import { SegmentAttributes, SymbolAttributes } from './type';

export class Segment extends AbstractComponent<Required<SegmentAttributes>> {
  name = 'segment';

  line!: ILine;
  startSymbol?: ISymbol;
  endSymbol?: ISymbol;

  private _startAngle!: number;
  private _endAngle!: number;

  static defaultAttributes: Partial<SegmentAttributes> = {
    lineStyle: {
      lineWidth: 1,
      strokeColor: '#000'
    },
    startSymbol: {
      visible: false,
      symbolType: 'triangle',
      size: 12,
      refX: 0,
      refY: 0,
      refAngle: 0,
      style: {
        fillColor: '#000',
        zIndex: 1 // 默认 symbol 绘制在 line 上面
      }
    },
    endSymbol: {
      visible: false,
      symbolType: 'triangle',
      size: 12,
      refX: 0,
      refY: 0,
      refAngle: 0,
      style: {
        fillColor: '#000',
        zIndex: 1 // 默认 symbol 绘制在 line 上面
      }
    }
  };

  constructor(attributes: SegmentAttributes) {
    super(merge({}, Segment.defaultAttributes, attributes));
  }

  protected computeLineAngle() {
    const { points } = this.attribute as SegmentAttributes;
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
  protected render() {
    this.removeAllChild();
    const { points, startSymbol, endSymbol, lineStyle, state } = this.attribute as SegmentAttributes;

    // 计算线的起点和终点角度
    // 计算角度的原因：
    // 1. segment symbol的自动旋转提供参数
    // 2. 使用segment时，需要根据line的角度对附加元素进行自动旋转（比如：markLine的标签, markPoint的装饰线）
    if (points.length > 1) {
      this.computeLineAngle();
    }

    // 绘制start和end symbol
    const startSymbolShape = this.renderSymbol(startSymbol as SymbolAttributes, 'start');
    const endSymbolShape = this.renderSymbol(endSymbol as SymbolAttributes, 'end');

    this.startSymbol = startSymbolShape;
    this.endSymbol = endSymbolShape;

    // 通过改变line起点和终点的方式达到symbol在fill为false的情况下，也可以遮盖line的效果
    let pointsAfterClip = points;
    if (startSymbol?.visible) {
      const startSize = startSymbol?.clip ? startSymbol?.size || 10 : 0;
      const pointsStart = {
        x: points[0].x - (startSize / 2) * (Math.cos(this._startAngle) || 0),
        y: points[0].y - (startSize / 2) * (Math.sin(this._startAngle) || 0)
      };
      pointsAfterClip = [pointsStart, ...pointsAfterClip.slice(1)];
    }
    if (endSymbol?.visible) {
      const endSize = endSymbol?.clip ? endSymbol?.size || 10 : 0;
      const pointsEnd = {
        x: points[points.length - 1].x - (endSize / 2) * (Math.cos(this._endAngle) || 0),
        y: points[points.length - 1].y - (endSize / 2) * (Math.sin(this._endAngle) || 0)
      };
      pointsAfterClip = [...pointsAfterClip.slice(0, pointsAfterClip.length - 1), pointsEnd];
    }

    const line = createLine({
      points: pointsAfterClip,
      fill: false,
      ...lineStyle
    });

    line.name = 'line';
    line.id = this._getNodeId('line');
    if (!isEmpty(state?.line)) {
      line.states = state.line;
    }
    this.line = line;
    this.add(line);
  }

  private renderSymbol(attribute: SymbolAttributes, dim: string): ISymbol | undefined {
    let symbol;
    if (attribute?.visible) {
      const startAngle = this._startAngle;
      const endAngle = this._endAngle;
      const { points, state } = this.attribute as SegmentAttributes;
      const start = points[0];
      const end = points[points.length - 1];
      const { refX = 0, refY = 0, refAngle = 0, style, symbolType, size = 12 } = attribute;
      let position;
      let rotate;
      if (dim === 'start') {
        position = {
          x: start.x + (startAngle ? refX * Math.cos(startAngle) + refY * Math.cos(startAngle - Math.PI / 2) : 0),
          y: start.y + (startAngle ? refX * Math.sin(startAngle) + refY * Math.sin(startAngle - Math.PI / 2) : 0)
        };
        rotate = startAngle + Math.PI / 2; // @chensiji - 加Math.PI / 2是因为：默认symbol的包围盒垂直于line，所以在做自动旋转时需要在line正方向基础上做90度偏移
      } else {
        position = {
          x: end.x + (endAngle ? refX * Math.cos(endAngle) + refY * Math.cos(endAngle - Math.PI / 2) : 0),
          y: end.y + (endAngle ? refX * Math.sin(endAngle) + refY * Math.sin(endAngle - Math.PI / 2) : 0)
        };
        rotate = endAngle + Math.PI / 2;
      }

      symbol = createSymbol({
        ...position,
        symbolType: symbolType as string,
        size,
        angle: rotate + refAngle,
        strokeBoundsBuffer: 0,
        ...style
      });
      symbol.name = `${dim}-symbol`;
      symbol.id = this._getNodeId(`${dim}-symbol`);

      if (!isEmpty(state?.symbol)) {
        symbol.states = state.symbol;
      }

      this.add(symbol);
    }
    return symbol;
  }

  /**
   * 外部获取segement起点正方向
   */
  getStartAngle() {
    return this._startAngle;
  }

  /**
   * 外部获取segement终点正方向
   */
  getEndAngle() {
    return this._endAngle;
  }
}
