/**
 * @description 均值线的拖拽交互
 */

import { IBoundsLike } from '@visactor/vutils';
import type { GraphicEventType, IGroup } from '@visactor/vrender-core';

type ValueLineDragConfig = {
  /**
   * 交互的限制范围
   */
  limitBounds?: IBoundsLike;
  /**
   * 交互的方向
   */
  orient?: 'vertical' | 'horizontal';
  /**
   * 交互的对象
   */
  element: IGroup;
};

export class ValueLineDrag {
  private _element: IGroup;
  private _orient?: string;
  private _limitBounds?: IBoundsLike;
  constructor(cfg: ValueLineDragConfig) {
    const { limitBounds, orient, element } = cfg || {};

    if (element) {
      this._element = element;
      this._limitBounds = limitBounds;
      this._orient = orient;
    }
  }
}
