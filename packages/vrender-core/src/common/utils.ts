import type { IBounds, IPointLike } from '@visactor/vutils';
import { isBoolean, halfPi, pi, pi2, sin, cos, isArray, pointAt, Point, isString } from '@visactor/vutils';
import type { IGraphicAttribute, IStrokeStyle } from '../interface';

// todo: 迁移到@visactor/vutils

export enum Edge {
  Top = 0b000001,
  Right = 0b000010,
  Bottom = 0b000100,
  Left = 0b001000,

  ALL = 0b001111
}

// 公共的stroke数组，避免大量数组生成
const _strokeVec4: [boolean | string, boolean | string, boolean | string, boolean | string] = [
  false,
  false,
  false,
  false
];
/**
 * 解析stroke配置
 * @param stroke
 * @returns
 */
export const parseStroke = (
  stroke: IStrokeStyle['stroke']
): {
  isFullStroke: boolean;
  stroke: (boolean | string)[];
} => {
  let isFullStroke: boolean = true;
  // 首先判断
  if (isBoolean(stroke, true)) {
    for (let i = 0; i < 4; i++) {
      _strokeVec4[i] = stroke as boolean;
      isFullStroke &&= !!(_strokeVec4[i] ?? true);
    }
    isFullStroke = stroke as boolean;
  } else if (Array.isArray(stroke)) {
    // array
    for (let i = 0; i < 4; i++) {
      _strokeVec4[i] = !!stroke[i];
      isFullStroke &&= !!_strokeVec4[i];
    }
  } else {
    _strokeVec4[0] = false;
    _strokeVec4[1] = false;
    _strokeVec4[2] = false;
    _strokeVec4[3] = false;
  }

  return {
    isFullStroke,
    stroke: _strokeVec4
  };
};

// 公共的padding数组，避免大量数组生成
const _paddingVec4: [number, number, number, number] = [0, 0, 0, 0];
/**
 * 解析padding配置
 * @param padding
 * @returns
 */
export const parsePadding = (
  padding: IGraphicAttribute['boundsPadding']
): number | [number, number, number, number] => {
  if (!padding) {
    return 0;
  }
  if (isArray(padding)) {
    if (padding.length === 0) {
      return 0;
    } else if (padding.length === 1) {
      return padding[0];
    } else if (padding.length === 2) {
      _paddingVec4[0] = padding[0];
      _paddingVec4[2] = padding[0];
      _paddingVec4[1] = padding[1];
      _paddingVec4[3] = padding[1];
      return _paddingVec4;
    }
    // 不考虑三个数的情况，三个数是用户传错了
    return padding as [number, number, number, number];
  }

  return padding as number;
};

const _coords: [IPointLike, IPointLike, IPointLike, IPointLike] = [
  { x: 0, y: 0 },
  { x: 0, y: 0 },
  { x: 0, y: 0 },
  { x: 0, y: 0 }
];
const indexList = [1, 2, 3, 0, 1, 2, 3, 0];
/**
 * 计算circle一段弧线的bounds
 * @param startAngle 小于2pi
 * @param endAngle
 * @param radius
 * @param bounds
 */
export function circleBounds(startAngle: number, endAngle: number, radius: number, bounds: IBounds) {
  // startAngle小于2pi
  // endAngle - startAngle小于2pi
  while (startAngle >= pi2) {
    startAngle -= pi2;
  }
  while (startAngle < 0) {
    startAngle += pi2;
  }
  while (startAngle > endAngle) {
    endAngle += pi2;
  }
  _coords[0].x = radius;
  // _coords[0].y = 0;
  // _coords[1].x = 0;
  _coords[1].y = radius;
  _coords[2].x = -radius;
  // _coords[2].y = -radius;
  // _coords[3].x = 0;
  _coords[3].y = -radius;

  // (0,pi/2], (pi/2, pi], (pi, pi/2*3], (pi/2*3, 2pi]
  // 1,         2,           3,           0
  const startIdx = Math.ceil(startAngle / halfPi) % 4;
  const endIdx = Math.ceil(endAngle / halfPi) % 4;
  // console.log(startAngle, endAngle, cos(startAngle), sin(startAngle), cos(endAngle), sin(endAngle));
  bounds.add(cos(startAngle) * radius, sin(startAngle) * radius);
  bounds.add(cos(endAngle) * radius, sin(endAngle) * radius);
  if (startIdx !== endIdx || endAngle - startAngle > pi) {
    let match = false;
    for (let i = 0; i < indexList.length; i++) {
      if (!match && startIdx === indexList[i]) {
        match = true;
        const p = _coords[startIdx];
        bounds.add(p.x, p.y);
        continue;
      } else if (match && endIdx === indexList[i]) {
        break;
      }
      if (match) {
        const p = _coords[indexList[i]];
        bounds.add(p.x, p.y);
      }
    }
  }
  // const delta = Math.floor((endAngle - startAngle) / halfPi);
  // for (let i = 0; i < delta; i++) {
  //   const p = _coords[(startIdx + i) % 4];
  //   bounds.add(p.x, p.y);
  // }

  // // 计算y1, y2
  // const y2 = halfPi >= startAngle && halfPi <= endAngle ? radius : max(sin(startAngle), sin(endAngle)) * radius;
  // const y1 =
  //   halfPi + pi >= startAngle && halfPi + pi <= endAngle ? -radius : min(sin(startAngle), sin(endAngle)) * radius;
  // const x2 = pi2 >= startAngle && pi2 <= endAngle ? radius : max(cos(startAngle), cos(endAngle)) * radius;
  // const x1 = pi >= startAngle && pi <= endAngle ? -radius : min(cos(startAngle), cos(endAngle)) * radius;

  // // bounds.set(x1, y1, x2, y2);
  // bounds.add(x1, y1);
  // bounds.add(x2, y2);
}

/**
 * 比较两个点数组是否相同
 * @param pointsA 数组A
 * @param pointsB 数组B
 */
export function pointsEqual(pointsA: IPointLike[] | IPointLike, pointsB: IPointLike[] | IPointLike): boolean {
  if (!pointsA || !pointsB) {
    return false;
  } // 需要传入pointsA和pointsB
  if (Array.isArray(pointsA) && Array.isArray(pointsB)) {
    // 如果pointsA和pointsB是数组
    if (pointsA.length !== pointsB.length) {
      return false;
    }
    return pointsA.every((point, index) => pointEqual(point, pointsB[index]));
  }
  if (!Number.isNaN((pointsA as IPointLike).x + (pointsA as IPointLike).y)) {
    // 如果pointA是IPoint（防止参数是undefined）
    return pointEqual(pointsA as IPointLike, pointsB as IPointLike);
  }
  return false;
}

/**
 * 比较两个点是否相同
 * @param pointA 点A
 * @param pointB 点B
 */
export function pointEqual(pointA: IPointLike, pointB: IPointLike): boolean {
  return (
    pointA.x === pointB.x &&
    pointA.y === pointB.y &&
    pointA.x1 === pointB.x1 &&
    pointA.y1 === pointB.y1 &&
    pointA.defined === pointB.defined
  );
}

/**
 * 两点插值
 * @param pointA 点A
 * @param pointB 点B
 * @param ratio 比例
 */
export function pointInterpolation(pointA: IPointLike, pointB: IPointLike, ratio: number): IPointLike {
  const { x, y } = pointAt(pointA.x, pointA.y, pointB.x, pointB.y, ratio);
  const { x: x1, y: y1 } = pointAt(pointA.x1, pointA.y1, pointB.x1, pointB.y1, ratio);

  const point = new Point(x as number, y as number, x1, y1);
  point.defined = pointB.defined;
  return point;
}

/**
 * 两点插值
 * @param pointA 点A
 * @param pointB 点B
 * @param ratio 比例
 */
export function pointInterpolationHighPerformance(
  pointA: IPointLike,
  pointB: IPointLike,
  ratio: number,
  point: IPointLike
): IPointLike {
  const { x, y } = pointAt(pointA.x, pointA.y, pointB.x, pointB.y, ratio);
  const { x: x1, y: y1 } = pointAt(pointA.x1, pointA.y1, pointB.x1, pointB.y1, ratio);
  // const point = new Point(x as number, y as number, x1, y1);
  point.x = x as number;
  point.y = y as number;
  point.x1 = x1;
  point.y1 = y1;
  point.defined = pointB.defined;
  return point;
}

/**
 * 点数组插值
 * @param pointsA 点数组A
 * @param pointsB 点数组B
 * @param ratio 比例
 */
export function pointsInterpolation(
  pointsA: IPointLike[] | IPointLike,
  pointsB: IPointLike[] | IPointLike,
  ratio: number
): IPointLike[] {
  if (!pointsA || !pointsB) {
    return [];
  } // 需要传入pointsA和pointsB
  if (!Array.isArray(pointsA)) {
    pointsA = [pointsA];
  }
  if (!Array.isArray(pointsB)) {
    pointsB = [pointsB];
  }

  let points: IPointLike[] = [];
  if (pointsA.length > pointsB.length) {
    // 如果变短了，那么后面点的直接clip
    points = pointsB.map(point => {
      const p = new Point(point.x, point.y, point.x1, point.y1);
      p.defined = point.defined;
      return p;
    });
    for (let i = 0; i < pointsB.length; i++) {
      points[i] = pointInterpolation(pointsA[i], pointsB[i], ratio);
    }
  } else {
    // 如果变长了，加上后面的点
    points = pointsB.map(point => {
      const p = new Point(point.x, point.y, point.x1, point.y1);
      p.defined = point.defined;
      return p;
    });
    for (let i = 0; i < pointsA.length; i++) {
      points[i] = pointInterpolation(pointsA[i], pointsB[i], ratio);
    }
  }
  return points;
}

export const transformKeys = [
  'x',
  'y',
  'dx',
  'dy',
  'scaleX',
  'scaleY',
  'angle',
  'anchor',
  'postMatrix',
  'scrollX',
  'scrollY'
];
export const isTransformKey = (key: string) => {
  return transformKeys.includes(key);
};

export function getAttributeFromDefaultAttrList(attr: Record<string, any> | Record<string, any>[], key: string) {
  if (isArray(attr)) {
    let val;
    for (let i = 0; i < attr.length && val === undefined; i++) {
      val = attr[i][key];
    }
    return val;
  }
  return attr[key];
}

export class RafBasedSTO {
  static TimeOut = 1000 / 60;
  durations: number[];
  timeout: number;
  lastDate: number;
  durationsListThreshold: number;

  constructor(timeout: number = RafBasedSTO.TimeOut) {
    this.durations = [];
    this.timeout = timeout;
    this.lastDate = 0;
    this.durationsListThreshold = 30;
  }

  call(cb: FrameRequestCallback) {
    this.lastDate = Date.now();
    return setTimeout(
      () => {
        this.appendDuration(Date.now() - this.lastDate);
        cb(0);
      },
      this.timeout,
      true
    );
  }

  clear(h: number) {
    clearTimeout(h);
  }

  appendDuration(d: number) {
    this.durations.push(d);
    if (this.durations.length > this.durationsListThreshold) {
      this.durations.shift();
    }
    // 最多60fps, 最少30fps
    this.timeout = Math.min(
      Math.max(this.durations.reduce((a, b) => a + b, 0) / this.durations.length, 1000 / 60),
      1000 / 30
    );
  }
}

export const rafBasedSto = new RafBasedSTO();

export const _calculateLineHeight = (lineHeight: string | number, fontSize: number): number => {
  if (isString(lineHeight) && lineHeight[lineHeight.length - 1] === '%') {
    const scale = Number.parseFloat(lineHeight.substring(0, lineHeight.length - 1)) / 100;
    return fontSize * scale;
  }
  return lineHeight as number;
};

export const calculateLineHeight = (lineHeight: string | number, fontSize: number): number => {
  const _lh = _calculateLineHeight(lineHeight, fontSize);
  return isNaN(_lh) ? _lh : Math.max(fontSize, _lh);
};
