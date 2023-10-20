import type { IPoint, IPointLike } from '@visactor/vutils';
import { isArray, isNumber, pi, pi2, Point } from '@visactor/vutils';
import { application } from '../application';
import { AttributeUpdateType } from '../common/enums';
import type { CustomPath2D } from '../common/custom-path2d';
import type {
  EasingType,
  IArcGraphicAttribute,
  IGraphic,
  IGroup,
  ILinearGradient,
  IRect,
  IRectAttribute,
  IRectGraphicAttribute,
  IShadowRoot
} from '../interface';
import { ACustomAnimate } from './animate';
import { Easing } from './easing';
import { pointInterpolation } from '../common/utils';

export class IncreaseCount extends ACustomAnimate<{ text: string | number }> {
  declare valid: boolean;

  private fromNumber: number;
  private toNumber: number;

  constructor(
    from: { text: string | number },
    to: { text: string | number },
    duration: number,
    easing: EasingType,
    params?: { fixed?: boolean }
  ) {
    super(from, to, duration, easing, params);
  }

  getEndProps(): Record<string, any> | void {
    if (this.valid === false) {
      return {};
    }
    return {
      text: this.to
    };
  }

  onBind(): void {
    this.fromNumber = isNumber(this.from?.text) ? this.from?.text : Number.parseFloat(this.from?.text);
    this.toNumber = isNumber(this.to?.text) ? this.to?.text : Number.parseFloat(this.to?.text);
    if (!Number.isFinite(this.toNumber)) {
      this.fromNumber = 0;
    }
    if (!Number.isFinite(this.toNumber)) {
      this.valid = false;
    }
  }

  onEnd(): void {
    return;
  }

  onUpdate(end: boolean, ratio: number, out: Record<string, any>): void {
    if (this.valid === false) {
      return;
    }
    if (end) {
      out.text = this.toNumber.toFixed();
    } else {
      out.text = (this.fromNumber + (this.toNumber - this.fromNumber) * ratio).toFixed(this.params?.fixed ?? 0);
    }
  }
}

enum Direction {
  LEFT_TO_RIGHT = 0,
  RIGHT_TO_LEFT = 1,
  TOP_TO_BOTTOM = 2,
  BOTTOM_TO_TOP = 3,
  STROKE = 4
}
export class FadeInPlus extends ACustomAnimate<any> {
  declare direction: number;
  declare toFill: string;
  declare toStroke: string;
  declare fillGradient: ILinearGradient;
  declare strokeGradient: ILinearGradient;
  declare fill: boolean;
  declare stroke: boolean;
  constructor(
    from: any,
    to: any,
    duration: number,
    easing: EasingType,
    params?: { direction?: number; fill?: boolean; stroke?: boolean }
  ) {
    super(from, to, duration, easing, params);
    const { direction = Direction.LEFT_TO_RIGHT, fill = true, stroke = true } = params || {};
    this.direction = direction;
    this.fill = fill;
    this.stroke = stroke;
    this.fillGradient = {
      gradient: 'linear',
      stops: []
    };
    this.strokeGradient = {
      gradient: 'linear',
      stops: []
    };
  }

  getEndProps(): Record<string, any> {
    return {
      fill: this.toFill,
      stroke: this.toStroke
    };
  }

  onBind(): void {
    // this.to = parseFloat(this.target.getAnimatePropByName('text'));
    this.toFill = this.target.getComputedAttribute('fill');
    this.toStroke = this.target.getComputedAttribute('stroke');
  }

  onEnd(): void {
    return;
  }

  onUpdate(end: boolean, ratio: number, out: Record<string, any>): void {
    if (!this.toFill) {
      return;
    }
    if (!this.toStroke) {
      return;
    }
    switch (this.direction) {
      case Direction.RIGHT_TO_LEFT:
        this.rightToLeft(end, ratio, out);
        break;
      case Direction.TOP_TO_BOTTOM:
        this.topToBottom(end, ratio, out);
        break;
      case Direction.BOTTOM_TO_TOP:
        this.bottomToTop(end, ratio, out);
        break;
      case Direction.STROKE:
        this.strokePath(end, ratio, out);
        break;
      default:
        this.leftToRight(end, ratio, out);
        break;
    }
  }

  leftToRight(end: boolean, ratio: number, out: Record<string, any>) {
    if (this.fill) {
      const toFillColor = this.toFill;
      this.fillGradient.x0 = 0;
      this.fillGradient.y0 = 0;
      this.fillGradient.x1 = 1;
      this.fillGradient.y1 = 0;
      this.fillGradient.stops = [
        { offset: 0, color: toFillColor },
        { offset: ratio, color: toFillColor },
        { offset: Math.min(1, ratio * 2), color: 'transparent' }
      ];
      out.fill = this.fillGradient;
    }
    if (this.stroke) {
      const toStrokeColor = this.toStroke;
      this.strokeGradient.x0 = 0;
      this.strokeGradient.y0 = 0;
      this.strokeGradient.x1 = 1;
      this.strokeGradient.y1 = 0;
      this.strokeGradient.stops = [
        { offset: 0, color: toStrokeColor },
        { offset: ratio, color: toStrokeColor },
        { offset: Math.min(1, ratio * 6), color: 'transparent' }
      ];
      out.stroke = this.strokeGradient;
      // const dashLen = 300;
      // const offset = ratio * dashLen;
      // out.lineDash = [offset, dashLen - offset];
    }
    return;
  }

  strokePath(end: boolean, ratio: number, out: Record<string, any>) {
    if (this.fill) {
      const toFillColor = this.toFill;
      this.fillGradient.x0 = 0;
      this.fillGradient.y0 = 0;
      this.fillGradient.x1 = 1;
      this.fillGradient.y1 = 0;
      this.fillGradient.stops = [
        { offset: 0, color: toFillColor },
        { offset: ratio, color: toFillColor },
        { offset: Math.min(1, ratio * 2), color: 'transparent' }
      ];
      out.fill = this.fillGradient;
    }
    if (this.stroke) {
      const dashLen = 300;
      const offset = ratio * dashLen;
      out.lineDash = [offset, dashLen - offset];
    }
    return;
  }
  rightToLeft(end: boolean, ratio: number, out: Record<string, any>) {
    return;
  }
  topToBottom(end: boolean, ratio: number, out: Record<string, any>) {
    return;
  }
  bottomToTop(end: boolean, ratio: number, out: Record<string, any>) {
    return;
  }
}

export class InputText extends ACustomAnimate<{ text: string }> {
  declare valid: boolean;
  declare target: IGraphic;

  private fromText: string = '';
  private toText: string = '';

  getEndProps(): Record<string, any> {
    if (this.valid === false) {
      return {};
    }
    return {
      text: this.to
    };
  }

  onBind(): void {
    this.fromText = this.from?.text ?? '';
    this.toText = this.to?.text ?? '';
    if (!this.toText || isArray(this.toText)) {
      this.valid = false;
    } else {
      this.toText = this.toText.toString();
      const root = this.target.attachShadow();
      const line = application.graphicService.creator.line({
        x: 0,
        y: 0,
        points: [
          { x: 0, y: 0 },
          { x: 0, y: this.target.getComputedAttribute('fontSize') }
        ],
        stroke: 'black',
        lineWidth: 1
      });
      root.add(line);
    }
  }

  onEnd(): void {
    this.target.detachShadow();
    return;
  }

  onUpdate(end: boolean, ratio: number, out: Record<string, any>): void {
    if (this.valid === false) {
      return;
    }
    // update text
    const fromCount = this.fromText.length;
    const toCount = this.toText.length;
    const count = Math.ceil(fromCount + (toCount - fromCount) * ratio);

    out.text = this.toText.substr(0, count);

    // update line position
    const line = this.target.shadowRoot?.at(0) as IGraphic;
    const endX = (this.target as any).clipedWidth + 2;
    line.setAttribute('x', endX);
  }
}

export class StreamLight extends ACustomAnimate<any> {
  declare valid: boolean;
  declare target: IGraphic;

  declare rect: IRect;
  constructor(
    from: any,
    to: any,
    duration: number,
    easing: EasingType,
    params?: { attribute?: Partial<IRectAttribute>; streamLength?: number }
  ) {
    super(from, to, duration, easing, params);
  }

  getEndProps(): Record<string, any> {
    return {};
  }

  onStart(): void {
    const root = this.target.attachShadow();

    const height = this.target.AABBBounds.height();

    const rect = application.graphicService.creator.rect({
      height: height,
      fill: '#bcdeff',
      shadowBlur: 30,
      shadowColor: '#bcdeff',
      ...this.params?.attribute,
      x: 0,
      y: 0,
      width: 0
    });
    this.rect = rect;
    root.add(rect);
  }

  onBind(): void {
    return;
  }

  onEnd(): void {
    this.target.detachShadow();
  }

  onUpdate(end: boolean, ratio: number, out: Record<string, any>): void {
    const parentWidth = (this.target as any).attribute.width ?? 250;
    const streamLength = this.params?.streamLength ?? parentWidth;
    const maxLength = this.params?.attribute?.width ?? 60;
    const startX = -maxLength;
    const currentX = startX + (streamLength - startX) * ratio;
    const x = Math.max(currentX, 0);
    const w = Math.min(Math.min(currentX + maxLength, maxLength), streamLength - currentX);
    const width = w + x > parentWidth ? Math.max(parentWidth - x, 0) : w;
    this.rect.setAttributes(
      {
        x,
        width
      } as any,
      false,
      {
        type: AttributeUpdateType.ANIMATE_PLAY,
        animationState: {
          ratio,
          end
        }
      }
    );
  }
}

export class Meteor extends ACustomAnimate<any> {
  declare size: number;
  declare target: IGraphic;
  declare root: IShadowRoot;
  declare posList: IPoint[];

  get lastPos(): IPoint {
    return this.posList[this.posList.length - 1];
  }

  constructor(size: number, duration: number, easing: EasingType, params?: any) {
    super(null, null, duration, easing, params);
    this.size = size;
    this.posList = [];
  }

  onBind(): void {
    const root = this.target.attachShadow();
    this.root = root;
    for (let i = 0; i < this.size; i++) {
      const g = this.target.clone();
      const scale = Math.min(((this.size - i) / this.size) * 3, 1);
      const opacity = Math.min(0.2 + 0.7 / this.size);
      g.setAttributes({ x: 0, y: 0, dx: 0, dy: 0, scaleX: scale, scaleY: scale, opacity }, false, {
        type: AttributeUpdateType.ANIMATE_BIND
      });
      root.add(g);
    }
  }

  onUpdate(end: boolean, ratio: number, out: Record<string, any>): void {
    if (end) {
      this.target.detachShadow();
      this.posList.length = 0;
      return;
    }

    const x = this.target.getComputedAttribute('x');
    const y = this.target.getComputedAttribute('y');

    const nextPos = new Point(x, y);
    if (!this.posList.length) {
      this.posList.push(nextPos);
      return;
    }

    this.target.shadowRoot.forEachChildren((g: IGraphic, i) => {
      const pos = this.posList[Math.max(this.posList.length - i - 1, 0)];
      g.setAttributes(
        {
          x: pos.x - x,
          y: pos.y - y
        },
        false
      );
    });

    this.posList.push(nextPos);
  }
}

export class MotionPath extends ACustomAnimate<any> {
  declare valid: boolean;
  declare pathLength: number;
  declare path: CustomPath2D;
  declare distance: number;
  declare initAngle: number;
  declare changeAngle: boolean;
  declare cb?: (from: any, to: any, ratio: number, target: IGraphic) => void;
  constructor(
    from: any,
    to: any,
    duration: number,
    easing: EasingType,
    params?: {
      path: CustomPath2D;
      distance: number;
      cb?: (from: any, to: any, ratio: number, target: IGraphic) => void;
      initAngle?: number;
      changeAngle?: boolean;
    }
  ) {
    super(from, to, duration, easing, params);
    if (params) {
      this.pathLength = params.path.getLength();
      this.path = params.path;
      this.distance = params.distance;
      this.to = params.distance * this.pathLength;
      this.initAngle = params.initAngle ?? 0;
      this.changeAngle = !!params.changeAngle;
      this.cb = params.cb;
    }
  }

  onUpdate(end: boolean, ratio: number, out: Record<string, any>): void {
    // 计算位置
    const at = this.to * ratio;
    const { pos, angle } = this.path.getAttrAt(at);
    out.x = pos.x;
    out.y = pos.y;
    if (this.changeAngle) {
      out.angle = angle + this.initAngle;
    }
    this.cb && this.cb(this.from, this.to, ratio, this.target as IGraphic);
    // out.angle = angle + this.initAngle;
  }
}

export class TagPointsUpdate extends ACustomAnimate<{ points: IPointLike[] }> {
  protected fromPoints: IPointLike[];
  protected toPoints: IPointLike[];
  protected points: IPointLike[];
  protected interpolatePoints: [IPointLike, IPointLike][];
  protected newPointAnimateType: 'grow' | 'appear';

  constructor(
    from: any,
    to: any,
    duration: number,
    easing: EasingType,
    params?: { newPointAnimateType?: 'grow' | 'appear' }
  ) {
    super(from, to, duration, easing, params);
    this.newPointAnimateType = params?.newPointAnimateType === 'appear' ? 'appear' : 'grow';
  }

  onBind(): void {
    const originFromPoints = this.from?.points;
    const originToPoints = this.to?.points;
    this.fromPoints = !originFromPoints ? [] : !Array.isArray(originFromPoints) ? [originFromPoints] : originFromPoints;
    this.toPoints = !originToPoints ? [] : !Array.isArray(originToPoints) ? [originToPoints] : originToPoints;

    const tagMap = new Map<string, IPointLike>();
    this.fromPoints.forEach(point => {
      if (point.context) {
        tagMap.set(point.context, point);
      }
    });
    let firstMatchedIndex = Infinity;
    let lastMatchedIndex = -Infinity;
    let firstMatchedPoint: IPointLike;
    let lastMatchedPoint: IPointLike;
    for (let i = 0; i < this.toPoints.length; i += 1) {
      if (tagMap.has(this.toPoints[i].context)) {
        firstMatchedIndex = i;
        firstMatchedPoint = tagMap.get(this.toPoints[i].context);
        break;
      }
    }
    for (let i = this.toPoints.length - 1; i >= 0; i -= 1) {
      if (tagMap.has(this.toPoints[i].context)) {
        lastMatchedIndex = i;
        lastMatchedPoint = tagMap.get(this.toPoints[i].context);
        break;
      }
    }
    // TODO: shrink removed points
    // if no point is matched, animation should start from toPoint[0]
    let prevMatchedPoint = this.toPoints[0];
    this.interpolatePoints = this.toPoints.map((point, index) => {
      const matchedPoint = tagMap.get(point.context);
      if (matchedPoint) {
        prevMatchedPoint = matchedPoint;
        return [matchedPoint, point];
      }
      // appear new point
      if (this.newPointAnimateType === 'appear') {
        return [point, point];
      }
      // grow new point
      if (index < firstMatchedIndex && firstMatchedPoint) {
        return [firstMatchedPoint, point];
      } else if (index > lastMatchedIndex && lastMatchedPoint) {
        return [lastMatchedPoint, point];
      }
      return [prevMatchedPoint, point];
    });
    this.points = this.interpolatePoints.map(interpolate => {
      const fromPoint = interpolate[0];
      const toPoint = interpolate[1];
      const newPoint = new Point(fromPoint.x, fromPoint.y, fromPoint.x1, fromPoint.y1);
      newPoint.defined = toPoint.defined;
      newPoint.context = toPoint.context;
      return newPoint;
    });
  }

  onUpdate(end: boolean, ratio: number, out: Record<string, any>): void {
    // if not create new points, multi points animation might not work well.
    this.points = this.points.map((point, index) => {
      const newPoint = pointInterpolation(this.interpolatePoints[index][0], this.interpolatePoints[index][1], ratio);
      newPoint.context = point.context;
      return newPoint;
    });
    out.points = this.points;
  }
}

export class GraphicAnimate extends ACustomAnimate<any> {
  graphic: IGraphic;

  constructor(from: any, to: any, duration: number, easing: EasingType, params?: { graphic: IGraphic }) {
    super(from, to, duration, easing, params);
    this.graphic = params?.graphic;
  }

  onUpdate(end: boolean, ratio: number, out: Record<string, any>): void {
    if (!this.graphic) {
      return;
    }
    Object.keys(this.from).forEach(k => {
      out[k] = this.from[k] + (this.to[k] - this.from[k]) * ratio;
    });
  }
}

export class ClipGraphicAnimate extends ACustomAnimate<any> {
  private _group?: IGroup;
  private _clipGraphic?: IGraphic;
  protected clipFromAttribute?: any;
  protected clipToAttribute?: any;

  private _lastClip?: boolean;
  private _lastPath?: IGraphic[];

  constructor(
    from: any,
    to: any,
    duration: number,
    easing: EasingType,
    params: { group: IGroup; clipGraphic: IGraphic }
  ) {
    super(null, null, duration, easing, params);
    this.clipFromAttribute = from;
    this.clipToAttribute = to;
    this._group = params?.group;
    this._clipGraphic = params?.clipGraphic;
  }

  onBind() {
    if (this._group && this._clipGraphic) {
      this._lastClip = this._group.attribute.clip;
      this._lastPath = this._group.attribute.path;
      this._group.setAttributes(
        {
          clip: true,
          path: [this._clipGraphic]
        },
        false,
        { type: AttributeUpdateType.ANIMATE_BIND }
      );
    }
  }

  onEnd() {
    if (this._group) {
      this._group.setAttributes(
        {
          clip: this._lastClip,
          path: this._lastPath
        },
        false,
        { type: AttributeUpdateType.ANIMATE_END }
      );
    }
    return;
  }

  onUpdate(end: boolean, ratio: number, out: Record<string, any>): void {
    if (!this._clipGraphic) {
      return;
    }
    const res: any = {};
    Object.keys(this.clipFromAttribute).forEach(k => {
      res[k] = this.clipFromAttribute[k] + (this.clipToAttribute[k] - this.clipFromAttribute[k]) * ratio;
    });
    this._clipGraphic.setAttributes(res, false, {
      type: AttributeUpdateType.ANIMATE_UPDATE,
      animationState: { ratio, end }
    });
  }
}

export class ClipAngleAnimate extends ClipGraphicAnimate {
  constructor(
    from: any,
    to: any,
    duration: number,
    easing: EasingType,
    params: {
      group: IGroup;
      center?: { x: number; y: number };
      startAngle?: number;
      radius?: number;
      orient?: 'clockwise' | 'anticlockwise';
      animationType?: 'in' | 'out';
    }
  ) {
    const groupAttribute = params?.group?.attribute ?? {};
    const width = groupAttribute.width ?? 0;
    const height = groupAttribute.height ?? 0;

    const animationType = params?.animationType ?? 'in';
    const startAngle = params?.startAngle ?? 0;
    const orient = params?.orient ?? 'clockwise';

    let arcStartAngle = 0;
    let arcEndAngle = 0;
    if (orient === 'anticlockwise') {
      arcEndAngle = animationType === 'in' ? startAngle + Math.PI * 2 : startAngle;
      arcEndAngle = startAngle + Math.PI * 2;
    } else {
      arcStartAngle = startAngle;
      arcEndAngle = animationType === 'out' ? startAngle + Math.PI * 2 : startAngle;
    }
    const arc = application.graphicService.creator.arc({
      x: params?.center?.x ?? width / 2,
      y: params?.center?.y ?? height / 2,
      outerRadius: params?.radius ?? (width + height) / 2,
      innerRadius: 0,
      startAngle: arcStartAngle,
      endAngle: arcEndAngle,
      fill: true
    });
    let fromAttributes: Partial<IArcGraphicAttribute>;
    let toAttributes: Partial<IArcGraphicAttribute>;
    if (orient === 'anticlockwise') {
      fromAttributes = { startAngle: startAngle + Math.PI * 2 };
      toAttributes = { startAngle: startAngle };
    } else {
      fromAttributes = { endAngle: startAngle };
      toAttributes = { endAngle: startAngle + Math.PI * 2 };
    }
    super(
      animationType === 'in' ? fromAttributes : toAttributes,
      animationType === 'in' ? toAttributes : fromAttributes,
      duration,
      easing,
      { group: params?.group, clipGraphic: arc }
    );
  }
}

export class ClipRadiusAnimate extends ClipGraphicAnimate {
  constructor(
    from: any,
    to: any,
    duration: number,
    easing: EasingType,
    params: {
      group: IGroup;
      center?: { x: number; y: number };
      startRadius?: number;
      endRadius?: number;
      animationType?: 'in' | 'out';
    }
  ) {
    const groupAttribute = params?.group?.attribute ?? {};
    const width = groupAttribute.width ?? 0;
    const height = groupAttribute.height ?? 0;

    const animationType = params?.animationType ?? 'in';
    const startRadius = params?.startRadius ?? 0;
    const endRadius = params?.endRadius ?? Math.sqrt((width / 2) ** 2 + (height / 2) ** 2);

    const arc = application.graphicService.creator.arc({
      x: params?.center?.x ?? width / 2,
      y: params?.center?.y ?? height / 2,
      outerRadius: animationType === 'out' ? endRadius : startRadius,
      innerRadius: 0,
      startAngle: 0,
      endAngle: Math.PI * 2,
      fill: true
    });
    const fromAttributes: Partial<IArcGraphicAttribute> = { outerRadius: startRadius };
    const toAttributes: Partial<IArcGraphicAttribute> = { outerRadius: endRadius };
    super(
      animationType === 'in' ? fromAttributes : toAttributes,
      animationType === 'in' ? toAttributes : fromAttributes,
      duration,
      easing,
      { group: params?.group, clipGraphic: arc }
    );
  }
}

export class ClipDirectionAnimate extends ClipGraphicAnimate {
  constructor(
    from: any,
    to: any,
    duration: number,
    easing: EasingType,
    params: {
      group: IGroup;
      direction?: 'x' | 'y';
      orient?: 'positive' | 'negative';
      width?: number;
      height?: number;
      animationType?: 'in' | 'out';
    }
  ) {
    const groupAttribute = params?.group?.attribute ?? {};
    const width = params?.width ?? groupAttribute.width ?? 0;
    const height = params?.height ?? groupAttribute.height ?? 0;

    const animationType = params?.animationType ?? 'in';
    const direction = params?.direction ?? 'x';
    const orient = params?.orient ?? 'positive';

    const rect = application.graphicService.creator.rect({
      x: 0,
      y: 0,
      width: animationType === 'in' && direction === 'x' ? 0 : width,
      height: animationType === 'in' && direction === 'y' ? 0 : height,
      fill: true
    });
    let fromAttributes: Partial<IRectGraphicAttribute> = {};
    let toAttributes: Partial<IRectGraphicAttribute> = {};
    if (direction === 'y') {
      if (orient === 'negative') {
        fromAttributes = { y: height, height: 0 };
        toAttributes = { y: 0, height: height };
      } else {
        fromAttributes = { height: 0 };
        toAttributes = { height: height };
      }
    } else {
      if (orient === 'negative') {
        fromAttributes = { x: width, width: 0 };
        toAttributes = { x: 0, width: width };
      } else {
        fromAttributes = { width: 0 };
        toAttributes = { width: width };
      }
    }
    super(
      animationType === 'in' ? fromAttributes : toAttributes,
      animationType === 'in' ? toAttributes : fromAttributes,
      duration,
      easing,
      { group: params?.group, clipGraphic: rect }
    );
  }
}

type RotateSphereParams =
  | {
      center: { x: number; y: number; z: number };
      r: number;
    }
  | (() => any);

export class RotateBySphereAnimate extends ACustomAnimate<any> {
  declare params: RotateSphereParams;
  declare theta: number;
  declare phi: number;

  onStart(): void {
    const { center, r } = typeof this.params === 'function' ? this.params() : this.params;
    const startX = this.target.getComputedAttribute('x');
    const startY = this.target.getComputedAttribute('y');
    const startZ = this.target.getComputedAttribute('z');
    const phi = Math.acos((startY - center.y) / r);
    let theta = Math.acos((startX - center.x) / r / Math.sin(phi));
    if (startZ - center.z < 0) {
      theta = pi2 - theta;
    }
    this.theta = theta;
    this.phi = phi;
  }

  onBind() {
    return;
  }

  onEnd() {
    return;
  }

  onUpdate(end: boolean, ratio: number, out: Record<string, any>): void {
    if (this.phi == null || this.theta == null) {
      return;
    }
    const { center, r } = typeof this.params === 'function' ? this.params() : this.params;
    const deltaAngle = Math.PI * 2 * ratio;
    const theta = this.theta + deltaAngle;
    const phi = this.phi;
    const x = r * Math.sin(phi) * Math.cos(theta) + center.x;
    const y = r * Math.cos(phi) + center.y;
    const z = r * Math.sin(phi) * Math.sin(theta) + center.z;
    out.x = x;
    out.y = y;
    out.z = z;
    // out.beta = phi;
    out.alpha = theta + pi / 2;
    while (out.alpha > pi2) {
      out.alpha -= pi2;
    }
    out.alpha = pi2 - out.alpha;

    out.zIndex = out.z * -10000;
  }
}

export class GroupFadeIn extends ACustomAnimate<any> {
  declare target: IGroup;

  getEndProps(): Record<string, any> {
    return {};
  }

  onBind(): void {
    this.target.setTheme({
      common: {
        opacity: 0
      }
    });
    return;
  }

  onEnd(): void {
    this.target.setTheme({
      common: {
        opacity: 1
      }
    });
    return;
  }

  onUpdate(end: boolean, ratio: number, out: Record<string, any>): void {
    this.target.setTheme({
      common: {
        opacity: ratio
      }
    });
  }
}

export class GroupFadeOut extends ACustomAnimate<any> {
  declare target: IGroup;

  getEndProps(): Record<string, any> {
    return {};
  }

  onBind(): void {
    this.target.setTheme({
      common: {
        opacity: 1
      }
    });
    return;
  }

  onEnd(): void {
    this.target.setTheme({
      common: {
        opacity: 0
      }
    });
    return;
  }

  onUpdate(end: boolean, ratio: number, out: Record<string, any>): void {
    this.target.setTheme({
      common: {
        opacity: 1 - ratio
      }
    });
  }
}

export class AttributeAnimate extends ACustomAnimate<any> {
  declare target: IGroup;

  constructor(to: Record<string, any>, duration: number, easing: EasingType) {
    super({}, to, duration, easing);
  }

  getEndProps(): Record<string, any> {
    return this.to;
  }

  onBind(): void {
    Object.keys(this.to).forEach(k => {
      this.from[k] = this.target.getComputedAttribute(k);
    });
    return;
  }

  onEnd(): void {
    return;
  }

  onUpdate(end: boolean, ratio: number, out: Record<string, any>): void {
    this.target.stepInterpolate(
      this.subAnimate,
      this.subAnimate.animate,
      out,
      this.step,
      ratio,
      end,
      this.to,
      this.from
    );
  }
}

export class AnimateGroup extends ACustomAnimate<any> {
  declare customAnimates: ACustomAnimate<any>[];
  declare updating: boolean;

  constructor(duration: number, customAnimates: ACustomAnimate<any>[]) {
    super(null, null, duration, 'linear');
    this.customAnimates = customAnimates;
  }

  initAnimates() {
    this.customAnimates.forEach(a => {
      a.step = this.step;
      a.subAnimate = this.subAnimate;
      a.target = this.target;
    });
  }

  getEndProps(): Record<string, any> {
    const props = {};
    this.customAnimates.forEach(a => {
      Object.assign(props, a.getEndProps());
    });
    return props;
  }

  onBind(): void {
    this.initAnimates();
    this.customAnimates.forEach(a => {
      a.onBind();
    });
    return;
  }

  onEnd(): void {
    this.customAnimates.forEach(a => {
      a.onEnd();
    });
    return;
  }

  onStart(): void {
    this.customAnimates.forEach(a => {
      a.onStart();
    });
  }

  onUpdate(end: boolean, ratio: number, out: Record<string, any>): void {
    if (this.updating) {
      return;
    }
    this.updating = true;
    this.customAnimates.forEach(a => {
      const easing = a.easing;
      const easingFunc = typeof easing === 'string' ? Easing[easing] : easing;
      ratio = easingFunc(ratio);
      a.onUpdate(end, ratio, out);
    });
    this.updating = false;
    return;
  }
}

export class AnimateGroup1 extends ACustomAnimate<any> {
  declare customAnimates: ACustomAnimate<any>[];
  declare updating: boolean;

  constructor(duration: number, customAnimates: ACustomAnimate<any>[]) {
    super(null, null, duration, 'linear');
    this.customAnimates = customAnimates;
  }

  initAnimates() {
    this.customAnimates.forEach(a => {
      a.step = this.step;
      a.subAnimate = this.subAnimate;
      a.target = this.target;
    });
  }

  getEndProps(): Record<string, any> {
    const props = {};
    this.customAnimates.forEach(a => {
      Object.assign(props, a.getEndProps());
    });
    return props;
  }

  onBind(): void {
    this.initAnimates();
    this.customAnimates.forEach(a => {
      a.onBind();
    });
    return;
  }

  onEnd(): void {
    this.customAnimates.forEach(a => {
      a.onEnd();
    });
    return;
  }

  onUpdate(end: boolean, ratio: number, out: Record<string, any>): void {
    if (this.updating) {
      return;
    }
    this.updating = true;
    this.customAnimates.forEach(a => {
      const easing = a.easing;
      const easingFunc = typeof easing === 'string' ? Easing[easing] : easing;
      ratio = easingFunc(ratio);
      a.onUpdate(end, ratio, out);
    });
    this.updating = false;
    return;
  }
}
