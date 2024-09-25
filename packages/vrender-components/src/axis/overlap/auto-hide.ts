/**
 * @description 自动隐藏
 */

import type { IText } from '@visactor/vrender-core';
import type { IBounds } from '@visactor/vutils';
// eslint-disable-next-line no-duplicate-imports
import { isEmpty, isFunction, last } from '@visactor/vutils';
import type { CustomMethod } from '../type';
import { genRotateBounds } from './util';

const methods = {
  parity: function (items: IText[]) {
    return items.filter((item, i) => (i % 2 ? item.setAttribute('opacity', 0) : 1));
  },
  greedy: function (items: IText[], sep: number) {
    let a: IText;
    return items.filter((b, i) => {
      if (!i || !intersect(a, b, sep)) {
        a = b;
        return 1;
      }
      return b.setAttribute('opacity', 0);
    });
  }
};

function intersect(textA: IText, textB: IText, sep: number) {
  let a: IBounds = textA.OBBBounds;
  let b: IBounds = textB.OBBBounds;
  if (a && b && !a.empty() && !b.empty()) {
    return a.intersects(b);
  }
  genRotateBounds([textA, textB]);
  a = textA.AABBBounds;
  b = textB.AABBBounds;
  return (
    sep > Math.max(b.x1 - a.x2, a.x1 - b.x2, b.y1 - a.y2, a.y1 - b.y2) &&
    (textA.rotatedBounds && textB.rotatedBounds
      ? sep >
        Math.max(
          textB.rotatedBounds.x1 - textA.rotatedBounds.x2,
          textA.rotatedBounds.x1 - textB.rotatedBounds.x2,
          textB.rotatedBounds.y1 - textA.rotatedBounds.y2,
          textA.rotatedBounds.y1 - textB.rotatedBounds.y2
        )
      : true)
  );
}

function hasOverlap(items: IText[], pad: number) {
  for (let i = 1, n = items.length, a = items[0], b; i < n; a = b, ++i) {
    if (intersect(a, (b = items[i]), pad)) {
      return true;
    }
  }
}

function hasBounds(item: IText) {
  let bounds;
  if (!item.OBBBounds.empty()) {
    bounds = item.OBBBounds;
  } else {
    bounds = item.AABBBounds;
  }
  return bounds.width() > 1 && bounds.height() > 1;
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
  /**
   * 保证最后的label展示
   */
  lastVisible?: boolean;
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
    /**
     * 0.17.10 之前，当最后label个数小于3 的时候，才做最后的label强制显示的策略
     */
    const checkLast = items.length < 3 || config.lastVisible;

    if (checkLast) {
      const lastSourceItem = last(source);

      if (!lastSourceItem.attribute.opacity) {
        const remainLength = items.length;
        if (remainLength > 1) {
          lastSourceItem.setAttribute('opacity', 1);

          for (let i = remainLength - 1; i >= 0; i--) {
            if (intersect(items[i], lastSourceItem, sep)) {
              items[i].setAttribute('opacity', 0);
            } else {
              // 当遇到第一个不相交的label的时候，就可以停止了
              break;
            }
          }
        }
      }
    }
  }

  source.forEach(item => {
    item.setAttribute('visible', !!item.attribute.opacity);
  });
}
