import { isEqual } from '@visactor/vutils';

/**
 * 比较两个对象的差异，深比较，返回差异的对象
 * @param oldAttrs 原始对象
 * @param newAttrs 目标对象
 * @param getAttr 获取属性值的函数（在于oldAttrs里有，newAttrs里没有的属性，调用函数获取，可选）
 * @returns 差异的对象
 */
export function diff<T extends Record<string, any>>(
  oldAttrs: T,
  newAttrs: T,
  getAttr?: (attr: keyof T) => any
): Record<string, any> {
  const diffObj: Record<string, any> = {};

  // 处理newAttrs中的属性
  for (const key in newAttrs) {
    // 如果oldAttrs不存在该属性或者属性值不同
    if (!(key in oldAttrs) || !isEqual(oldAttrs[key], newAttrs[key])) {
      diffObj[key] = newAttrs[key];
    }
  }

  // 处理oldAttrs中有但newAttrs中没有的属性
  if (getAttr) {
    for (const key in oldAttrs) {
      if (!(key in newAttrs)) {
        const value = getAttr(key);
        if (value !== undefined) {
          diffObj[key] = value;
        }
      }
    }
  }

  return diffObj;
}
