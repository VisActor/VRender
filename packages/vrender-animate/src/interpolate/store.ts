import type { IGraphic } from '@visactor/vrender-core';
import { interpolateColor, interpolatePureColorArrayToStr, pointsInterpolation } from '@visactor/vrender-core';
import { interpolateNumber } from './number';
import type { IStep } from '../intreface/animate';
import type { IPointLike } from '@visactor/vutils';

// 直接设置，触发 隐藏类（Hidden Class）优化：
/**
 *
const a = { type: 1 };
const ITERATIONS = 1e7; // 测试次数

// 动态生成 keys 数组（确保引擎无法静态推断 key）
const keys = [];
for (let i = 0; i < ITERATIONS; i++) {
    // 通过条件确保 key 动态变化（但实际始终为 'type'，避免属性缺失的开销）
    keys.push(Math.random() < 0 ? 'other' : 'type');
}

// 测试字面量访问
function testLiteral() {
    let sum = 0;
    for (let i = 0; i < ITERATIONS; i++) {
        const key = keys[i]; // 读取 key（与动态测试完全一致）
        sum += a.type;       // 差异仅在此处：使用字面量访问
    }
    return sum;
}

// 测试变量动态访问
function testDynamic() {
    let sum = 0;
    for (let i = 0; i < ITERATIONS; i++) {
        const key = keys[i]; // 读取 key（与字面量测试完全一致）
        sum += a[key];       // 差异仅在此处：使用变量访问
    }
    return sum;
}

// 预热（避免 JIT 编译影响）
testLiteral();
testDynamic();

// 正式测试
console.time('literal');
testLiteral();
console.timeEnd('literal');

console.time('dynamic');
testDynamic();
console.timeEnd('dynamic');


// out:
// literal: 7.1259765625 ms
// dynamic: 9.322998046875 ms
 */

export class InterpolateUpdateStore {
  opacity = (key: string, from: number, to: number, ratio: number, step: IStep, target: IGraphic) => {
    target.attribute.opacity = interpolateNumber(from, to, ratio);
  };
  fillOpacity = (key: string, from: number, to: number, ratio: number, step: IStep, target: IGraphic) => {
    target.attribute.fillOpacity = interpolateNumber(from, to, ratio);
  };
  strokeOpacity = (key: string, from: number, to: number, ratio: number, step: IStep, target: IGraphic) => {
    target.attribute.strokeOpacity = interpolateNumber(from, to, ratio);
  };
  zIndex = (key: string, from: number, to: number, ratio: number, step: IStep, target: IGraphic) => {
    target.attribute.zIndex = interpolateNumber(from, to, ratio);
  };
  backgroundOpacity = (key: string, from: number, to: number, ratio: number, step: IStep, target: IGraphic) => {
    target.attribute.backgroundOpacity = interpolateNumber(from, to, ratio);
  };
  shadowOffsetX = (key: string, from: number, to: number, ratio: number, step: IStep, target: IGraphic) => {
    target.attribute.shadowOffsetX = interpolateNumber(from, to, ratio);
  };
  shadowOffsetY = (key: string, from: number, to: number, ratio: number, step: IStep, target: IGraphic) => {
    target.attribute.shadowOffsetY = interpolateNumber(from, to, ratio);
  };
  shadowBlur = (key: string, from: number, to: number, ratio: number, step: IStep, target: IGraphic) => {
    target.attribute.shadowBlur = interpolateNumber(from, to, ratio);
  };
  fill = (
    key: string,
    from: [number, number, number, number],
    to: [number, number, number, number],
    ratio: number,
    step: IStep,
    target: IGraphic
  ) => {
    target.attribute.fill = interpolateColor(from, to, ratio, false) as any;
  };
  fillPure = (
    key: string,
    from: [number, number, number, number],
    to: [number, number, number, number],
    ratio: number,
    step: IStep,
    target: IGraphic
  ) => {
    target.attribute.fill = step.fromParsedProps.fill
      ? (interpolatePureColorArrayToStr(step.fromParsedProps.fill, step.toParsedProps.fill, ratio) as any)
      : step.toParsedProps.fill;
  };
  stroke = (
    key: string,
    from: [number, number, number, number],
    to: [number, number, number, number],
    ratio: number,
    step: IStep,
    target: IGraphic
  ) => {
    target.attribute.stroke = interpolateColor(from, to, ratio, false);
  };
  strokePure = (
    key: string,
    from: [number, number, number, number],
    to: [number, number, number, number],
    ratio: number,
    step: IStep,
    target: IGraphic
  ) => {
    target.attribute.stroke = step.fromParsedProps.stroke
      ? (interpolatePureColorArrayToStr(step.fromParsedProps.stroke, step.toParsedProps.stroke, ratio) as any)
      : step.toParsedProps.stroke;
  };

  // 需要更新Bounds
  width = (key: string, from: number, to: number, ratio: number, step: IStep, target: IGraphic) => {
    (target.attribute as any).width = interpolateNumber(from, to, ratio);
    target.addUpdateBoundTag();
  };
  height = (key: string, from: number, to: number, ratio: number, step: IStep, target: IGraphic) => {
    (target.attribute as any).height = interpolateNumber(from, to, ratio);
    target.addUpdateBoundTag();
  };
  x = (key: string, from: number, to: number, ratio: number, step: IStep, target: IGraphic) => {
    target.attribute.x = interpolateNumber(from, to, ratio);
    target.addUpdateBoundTag();
    target.addUpdatePositionTag();
  };
  y = (key: string, from: number, to: number, ratio: number, step: IStep, target: IGraphic) => {
    target.attribute.y = interpolateNumber(from, to, ratio);
    target.addUpdateBoundTag();
    target.addUpdatePositionTag();
  };
  angle = (key: string, from: number, to: number, ratio: number, step: IStep, target: IGraphic) => {
    target.attribute.angle = interpolateNumber(from, to, ratio);
    target.addUpdateBoundTag();
    target.addUpdatePositionTag();
  };
  scaleX = (key: string, from: number, to: number, ratio: number, step: IStep, target: IGraphic) => {
    target.attribute.scaleX = interpolateNumber(from, to, ratio);
    target.addUpdateBoundTag();
    target.addUpdatePositionTag();
  };
  scaleY = (key: string, from: number, to: number, ratio: number, step: IStep, target: IGraphic) => {
    target.attribute.scaleY = interpolateNumber(from, to, ratio);
    target.addUpdateBoundTag();
    target.addUpdatePositionTag();
  };
  lineWidth = (key: string, from: number, to: number, ratio: number, step: IStep, target: IGraphic) => {
    target.attribute.lineWidth = interpolateNumber(from, to, ratio);
    target.addUpdateBoundTag();
  };
  startAngle = (key: string, from: number, to: number, ratio: number, step: IStep, target: IGraphic) => {
    (target.attribute as any).startAngle = interpolateNumber(from, to, ratio);
    target.addUpdateBoundTag();
  };
  endAngle = (key: string, from: number, to: number, ratio: number, step: IStep, target: IGraphic) => {
    (target.attribute as any).endAngle = interpolateNumber(from, to, ratio);
    target.addUpdateBoundTag();
  };
  radius = (key: string, from: number, to: number, ratio: number, step: IStep, target: IGraphic) => {
    (target.attribute as any).radius = interpolateNumber(from, to, ratio);
    target.addUpdateBoundTag();
  };
  outerRadius = (key: string, from: number, to: number, ratio: number, step: IStep, target: IGraphic) => {
    (target.attribute as any).outerRadius = interpolateNumber(from, to, ratio);
    target.addUpdateBoundTag();
  };
  innerRadius = (key: string, from: number, to: number, ratio: number, step: IStep, target: IGraphic) => {
    (target.attribute as any).innerRadius = interpolateNumber(from, to, ratio);
    target.addUpdateBoundTag();
  };
  size = (key: string, from: number, to: number, ratio: number, step: IStep, target: IGraphic) => {
    (target.attribute as any).size = interpolateNumber(from, to, ratio);
    target.addUpdateBoundTag();
  };
  points = (key: string, from: IPointLike[], to: IPointLike[], ratio: number, step: IStep, target: IGraphic) => {
    (target.attribute as any).points = pointsInterpolation(from, to, ratio);
    target.addUpdateBoundTag();
  };
}

export const interpolateUpdateStore = new InterpolateUpdateStore();

export function commonInterpolateUpdate(key: string, from: any, to: any, ratio: number, step: IStep, target: IGraphic) {
  if (Number.isFinite(to) && Number.isFinite(from)) {
    (target.attribute as any)[key] = from + (to - from) * ratio;
    return true;
  } else if (Array.isArray(to) && Array.isArray(from) && to.length === from.length) {
    const nextList = [];
    let valid = true;
    for (let i = 0; i < to.length; i++) {
      const v = from[i];
      const val = v + (to[i] - v) * ratio;
      if (!Number.isFinite(val)) {
        valid = false;
        break;
      }
      nextList.push(val);
    }
    if (valid) {
      (target.attribute as any)[key] = nextList;
    }
    return true;
  }
  return false;
}
