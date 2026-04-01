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
  // 检查构造函数是否是它自己
  if (custom.prototype.constructor === custom) {
    // 检查prototype是否可写，原生class的prototype是不可写的
    const descriptor = Object.getOwnPropertyDescriptor(custom, 'prototype');
    if (descriptor && !descriptor.writable) {
      return 1;
    }
    // Babel/TypeScript 转译后的类，prototype 可写但仍有方法在 prototype 上
    // 通过检查 prototype 上是否有除 constructor 之外的自有属性来判断
    const protoKeys = Object.getOwnPropertyNames(custom.prototype);
    if (protoKeys.length > 1) {
      return 1;
    }
  }
  return 2;
}
