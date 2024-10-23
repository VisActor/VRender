/**
 * @description 自动隐藏
 */

import { createRect, type IText } from '@visactor/vrender-core';
// eslint-disable-next-line no-duplicate-imports
import { isEmpty, isFunction, last } from '@visactor/vutils';
import type { CustomMethod } from '../type';
import { textIntersect as intersect, hasOverlap } from '../util';

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

function forceItemVisible(sourceItem: IText, items: IText[], check: boolean, comparator: any, inverse = false) {
  if (check && !sourceItem.attribute.opacity) {
    const remainLength = items.length;
    if (remainLength > 1) {
      sourceItem.setAttribute('opacity', 1);
      for (let i = 0; i < remainLength; i++) {
        const item = inverse ? items[remainLength - 1 - i] : items[i];
        if (comparator(item)) {
          item.setAttribute('opacity', 0);
        } else {
          break;
        }
      }
    }
  }
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
  /**
   * 保证第一个的label展示
   */
  firstVisible?: boolean;
};

export function autoHide(labels: IText[], config: HideConfig) {
  if (isEmpty(labels)) {
    return;
  }

  const source = labels.filter(hasBounds);
  if (isEmpty(source)) {
    return;
  }

  let items: IText[];

  items = reset(source);

  const { method = 'parity', separation: sep = 0 } = config;

  const reduce = isFunction(method) ? method : methods[method] || methods.parity;

  if (items.length >= 3 && hasOverlap(items, sep)) {
    do {
      items = reduce(items, sep);
    } while (items.length >= 3 && hasOverlap(items, sep));

    const shouldCheck = (length: number, visibility: boolean, checkLength: boolean = true) => {
      return checkLength ? length < 3 || visibility : visibility;
    };

    const checkFirst = shouldCheck(items.length, config.firstVisible, false);
    /**
     * 0.17.10 之前，当最后 label 个数小于 3 的时候，才做最后的label强制显示的策略
     */
    let checkLast = shouldCheck(items.length, config.lastVisible);

    const firstSourceItem = source[0];
    const lastSourceItem = last(source);

    if (intersect(firstSourceItem, lastSourceItem, sep) && checkFirst && checkLast) {
      lastSourceItem.setAttribute('opacity', 0); // Or firstSourceItem, depending on preference
      checkLast = false;
    }

    forceItemVisible(firstSourceItem, items, checkFirst, (item: IText) => intersect(item, firstSourceItem, sep));

    forceItemVisible(
      lastSourceItem,
      items,
      checkLast,
      (item: IText) =>
        intersect(item, lastSourceItem, sep) ||
        (checkFirst && item !== firstSourceItem ? intersect(item, firstSourceItem, sep) : false),
      true
    );
  }

  source.forEach(item => {
    item.setAttribute('visible', !!item.attribute.opacity);
  });
}
