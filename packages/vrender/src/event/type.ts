import { IEventTarget } from './interface';
import { ICanvas, IDomRectLike, IEventElement, IGlobal } from '../interface';
import { IBounds } from '@visactor/vutils';
export type LooseFunction = (...args: any[]) => any;

export type IElementLike = Omit<IEventElement, 'on' | 'off' | 'once' | 'emit' | 'removeAllListeners'> & {
  style: CSSStyleDeclaration | Record<string, any>;
  getNativeHandler?: () => ICanvas;
  getBoundingClientRect: () => IDomRectLike;
};

export type RenderConfig = {
  /**
   * 事件绑定的 canvas 元素
   */
  targetElement: IElementLike;
  /**
   * 环境分辨率
   */
  resolution: number;
  /**
   * 场景树根节点
   */
  rootNode: IEventTarget;
  global: IGlobal;
  /** 是否自动阻止事件 */
  autoPreventDefault?: boolean;
  /** 绘图视口 */
  viewport: {
    x: number;
    y: number;
    width: number;
    height: number;
    viewBox?: IBounds;
  };
};

export type NativeEvent = MouseEvent | PointerEvent | TouchEvent;
