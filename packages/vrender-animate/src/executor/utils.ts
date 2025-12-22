import { isFunction } from '@visactor/vutils';

/**
 * 获取自定义类型
 * @param custom 自定义动画对象
 * @returns 0: 不是函数/类, 1: 是类, 2: 是函数
 */
export function getCustomType(custom: any): number {
  if (!custom || !isFunction(custom)) {
    return 0;
  }
  // 正则表达式检查是最快的，优先使用
  const functionStr = Function.prototype.toString.call(custom);
  if (/^class\s/.test(functionStr)) {
    return 1;
  }
  // 检查箭头函数（没有prototype）
  if (!custom.prototype) {
    return 2;
  }
  // 检查构造函数是否是它自己（ES5类）
  if (custom.prototype.constructor === custom) {
    // 检查prototype是否可写，类的prototype是不可写的
    const descriptor = Object.getOwnPropertyDescriptor(custom, 'prototype');
    if (descriptor && !descriptor.writable) {
      return 1;
    }
  }
  return 2;
}
