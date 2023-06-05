/**
 * @description 翻页器
 */
import {
  createGroup,
  createSymbol,
  createText,
  ISymbol,
  IText,
  FederatedPointerEvent,
  CustomEvent
} from '@visactor/vrender';
import { merge, normalizePadding, get, isNumber } from '@visactor/vutils';
import { AbstractComponent } from '../core/base';
import { measureTextSize } from '../util';
import { PagerAttributes } from './type';

const DEFAULT_HANDLER_STYLE: PagerAttributes['handler'] = {
  space: 8,
  style: {
    fill: true,
    fillColor: 'rgb(47, 69, 84)',
    cursor: 'pointer',
    size: 15
  },
  state: {
    disable: {
      fillColor: 'rgb(170, 170, 170)',
      cursor: 'not-allowed'
    },
    hover: {}
  }
};

export class Pager extends AbstractComponent<Required<PagerAttributes>> {
  name = 'pager';

  private _current = 1;
  getCurrent() {
    return this._current;
  }

  private _total!: number;
  preHandler!: ISymbol | null;
  nextHandler!: ISymbol | null;
  text!: IText | null;

  static defaultAttributes: Partial<PagerAttributes> = {
    handler: DEFAULT_HANDLER_STYLE,
    textStyle: {
      fillColor: 'rgb(51, 51, 51)',
      fontSize: 12
    }
  };

  constructor(attributes: PagerAttributes) {
    super(merge({}, Pager.defaultAttributes, attributes));
  }

  protected render() {
    this._reset();
    const {
      layout = 'horizontal',
      handler = DEFAULT_HANDLER_STYLE,
      total,
      defaultCurrent = 1,
      textStyle,
      padding = 0
    } = this.attribute;

    this._current = defaultCurrent;
    const parsedPadding = normalizePadding(padding);
    const isHorizontal = layout === 'horizontal';

    const container = createGroup({
      x: 0,
      y: 0
    });

    const handlerStyle = handler.style || {};
    const handlerSize = handlerStyle.size || 15;
    const handlerSpace = handler.space ?? 8;
    const handlerState = handler.state || {};

    let { preShape, nextShape } = handler;
    if (!preShape) {
      preShape = isHorizontal ? 'triangleLeft' : 'triangleUp';
    }
    if (!nextShape) {
      nextShape = isHorizontal ? 'triangleRight' : 'triangleDown';
    }

    const preHandler = createSymbol({
      strokeBoundsBuffer: 0,
      ...handlerStyle,
      x: 0,
      y: 0,
      symbolType: preShape,
      size: handlerSize
    });
    preHandler.states = handlerState;
    preHandler.name = 'preHandler';
    this.preHandler = preHandler;
    container.add(preHandler);

    // 获取文本的最大长度，如果不固定的话随着文本的变化整体会发生抖动
    const { width: maxTextWidth, height: maxTextHeight } = measureTextSize(`${total}/${total}`, {
      textAlign: 'center',
      textBaseline: 'middle',
      ...textStyle
    });

    const handlerSizeX = isNumber(handlerSize) ? handlerSize : handlerSize[0];
    const handlerSizeY = isNumber(handlerSize) ? handlerSize : handlerSize[1];

    const text = createText({
      x: isHorizontal ? handlerSizeX / 2 + handlerSpace + maxTextWidth / 2 : 0,
      y: isHorizontal ? 0 : handlerSizeY / 2 + handlerSpace + maxTextHeight / 2,
      text: `${defaultCurrent}/${total}`,
      textAlign: 'center',
      textBaseline: 'middle',
      lineHeight: textStyle?.fontSize,
      ...textStyle
    });
    this.text = text;
    container.add(text);

    const nextHandler = createSymbol({
      strokeBoundsBuffer: 0,
      ...handlerStyle,
      x: isHorizontal ? handlerSizeX + handlerSpace * 2 + maxTextWidth : 0,
      y: isHorizontal ? 0 : handlerSizeY + handlerSpace * 2 + maxTextHeight,
      symbolType: nextShape,
      size: handlerSize
    });
    nextHandler.name = 'nextHandler';
    nextHandler.states = handlerState;
    this.nextHandler = nextHandler;

    container.add(nextHandler);

    if (this._total === 1) {
      preHandler.addState('disable');
      nextHandler.addState('disable');
    } else if (this._current === 1) {
      preHandler.addState('disable');
    } else if (this._current === total) {
      nextHandler.addState('disable');
    }

    const containerBounds = container.AABBBounds;
    const width = containerBounds.width();
    const height = containerBounds.height();

    container.translateTo(0 - containerBounds.x1 + parsedPadding[3], 0 - containerBounds.y1 + parsedPadding[0]);
    this.add(container);

    this.attribute.width = width + parsedPadding[1] + parsedPadding[3];
    this.attribute.height = height + parsedPadding[0] + parsedPadding[2];

    this._bindEvents();
  }

  private _bindEvents(): void {
    if (this.preHandler) {
      this.preHandler.addEventListener('pointerenter', this._onHover as EventListenerOrEventListenerObject);
      this.preHandler.addEventListener('pointerleave', this._onUnHover as EventListenerOrEventListenerObject);
      this.preHandler.addEventListener('pointerdown', this._onClick as EventListenerOrEventListenerObject);
    }

    if (this.nextHandler) {
      this.nextHandler.addEventListener('pointerenter', this._onHover as EventListenerOrEventListenerObject);
      this.nextHandler.addEventListener('pointerleave', this._onUnHover as EventListenerOrEventListenerObject);
      this.nextHandler.addEventListener('pointerdown', this._onClick as EventListenerOrEventListenerObject);
    }
  }

  private _onHover = (e: FederatedPointerEvent) => {
    const target = e.target as unknown as ISymbol;
    if (!target.hasState('disable')) {
      target.addState('hover');
    }
  };

  private _onUnHover = (e: FederatedPointerEvent) => {
    const target = e.target as unknown as ISymbol;
    target.removeState('hover');
  };

  private _onClick = (e: FederatedPointerEvent) => {
    const target = e.target as unknown as ISymbol;
    if (target.name === 'preHandler') {
      if (this._current === 1) {
        return;
      }
      this._current -= 1;
      if (this._current === 1) {
        target.addState('disable');
      } else {
        target.removeState('disable');
      }
      const changeEvent = new CustomEvent('toPrev', {
        current: this._current,
        total: this._total,
        direction: 'pre'
      });
      // FIXME: 需要在 vrender 的事件系统支持
      // @ts-ignore
      changeEvent.manager = this.stage?.eventSystem.manager;
      this.dispatchEvent(changeEvent);
    }

    if (target.name === 'nextHandler') {
      if (this._current === this._total) {
        return;
      }
      this._current += 1;

      if (this._current === this._total) {
        target.addState('disable');
      } else {
        target.removeState('disable');
      }

      const changeEvent = new CustomEvent('toNext', {
        current: this._current,
        total: this._total,
        direction: 'next'
      });
      // FIXME: 需要在 vrender 的事件系统支持
      // @ts-ignore
      changeEvent.manager = this.stage?.eventSystem.manager;
      this.dispatchEvent(changeEvent);
    }

    if (this._current > 1) {
      (this.preHandler as ISymbol).removeState('disable');
    }
    if (this._current < this._total) {
      (this.nextHandler as ISymbol).removeState('disable');
    }

    (this.text as IText).setAttribute('text', `${this._current}/${this._total}`);
  };

  private _reset() {
    this.removeAllChild();
    this._current = 1;
    this._total = this.attribute.total as number;
    this.preHandler = this.nextHandler = this.text = null;
  }
}
