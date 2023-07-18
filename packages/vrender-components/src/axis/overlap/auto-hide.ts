/**
 * @description 自动隐藏
 */

import type { IText } from '@visactor/vrender';
import type { IBounds } from '@visactor/vutils';
// eslint-disable-next-line no-duplicate-imports
import { isEmpty, isFunction, isRectIntersect, isRotateAABBIntersect, last } from '@visactor/vutils';
import type { CustomMethod } from '../type';

function itemIntersect(item1: IText, item2: IText) {
  return (
    isRectIntersect(item1.AABBBounds, item2.AABBBounds, false) &&
    (item1.rotatedBounds && item2.rotatedBounds
      ? isRotateAABBIntersect(item1.rotatedBounds, item2.rotatedBounds, true)
      : true)
  );
}

const methods = {
  parity: function (items: IText[]) {
    return items.filter((item, i) => (i % 2 ? item.setAttribute('opacity', 0) : 1));
  },
  greedy: function (items: IText[], sep: number) {
    let a: IText;
    return items.filter((b, i) => {
      if (!i || !intersect(a.AABBBounds, b.AABBBounds, sep)) {
        a = b;
        return 1;
      }
      return b.setAttribute('opacity', 0);
    });
  }
};

function intersect(a: IBounds, b: IBounds, sep: number) {
  return sep > Math.max(b.x1 - a.x2, a.x1 - b.x2, b.y1 - a.y2, a.y1 - b.y2);
}

function hasOverlap(items: IText[], pad: number) {
  for (let i = 1, n = items.length, a = items[0].AABBBounds, b; i < n; a = b, ++i) {
    if (intersect(a, (b = items[i].AABBBounds), pad)) {
      return true;
    }
  }
}

function hasBounds(item: IText) {
  const b = item.AABBBounds;
  return b.width() > 1 && b.height() > 1;
}

// reset all items to be fully opaque
function reset(items: IText[]) {
  items.forEach(item => item.setAttribute('opacity', 1));
  return items;
}

type HideConfig = {
  /**
   * 轴的方向
   */
  orient: string;
  /**
   * 防重叠策略。
   * - 'parity': 奇偶校验，使用删除所有其他标签的策略（这对于标准线性轴非常有效）。
   * - 'greedy': 将执行标签的线性扫描，并删除与最后一个可见标签重叠的所有标签。
   * - 也可以传入函数用于自定义策略
   */
  method?: 'parity' | 'greedy' | CustomMethod;
  /**
   * 设置文本之间的间隔距离，单位 px
   */
  separation?: number;
};

export function autoHide(labels: IText[], config: HideConfig) {
  if (isEmpty(labels)) {
    return;
  }

  const source = labels.filter(hasBounds);
  if (isEmpty(source)) {
    return;
  }

  let items;

  items = reset(source);

  const { method = 'parity', separation: sep = 0 } = config;

  const reduce = isFunction(method) ? method : methods[method] || methods.parity;

  if (items.length >= 3 && hasOverlap(items, sep)) {
    do {
      items = reduce(items, sep);
    } while (items.length >= 3 && hasOverlap(items, sep));

    if (items.length < 3 && !last(source).attribute.opacity) {
      if (items.length > 1) {
        last(items).setAttribute('opacity', 0);
      }
      last(source).setAttribute('opacity', 1);
    }
  }

  source.forEach(item => {
    item.setAttribute('visible', !!item.attribute.opacity);
  });
}
