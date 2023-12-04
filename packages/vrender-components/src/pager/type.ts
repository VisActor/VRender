import type { ISymbolGraphicAttribute, IGroupGraphicAttribute, ITextGraphicAttribute } from '@visactor/vrender/es/core';
import type { Padding } from '../core/type';

export type PagerAttributes = {
  /**
   * 默认为水平布局
   * - 'horizontal' 水平布局
   * - 'vertical' 垂直布局
   */
  layout?: 'horizontal' | 'vertical' | string;
  // /**
  //  * 按钮大小，默认 15
  //  */
  // handlerSize?: number;
  // /**
  //  * 按钮同文本内容区的间距，默认为 8
  //  */
  // handlerSpace?: number;
  /**
   * handler 相关样式配置
   */
  handler?: {
    /**
     * 按钮同文本内容区的间距，默认为 8
     */
    space?: number;
    /**
     * 上一页按钮形状
     */
    preShape?: string;
    /**
     * 下一页按钮形状
     */
    nextShape?: string;
    style?: Omit<Partial<ISymbolGraphicAttribute>, 'symbolType'>;
    state?: {
      /**
       * hover 状态下的样式
       */
      hover?: Omit<Partial<ISymbolGraphicAttribute>, 'symbolType'>;
      /**
       * 不可用状态样式
       */
      disable?: Omit<Partial<ISymbolGraphicAttribute>, 'symbolType'>;
    };
  };
  /**
   * 总页数
   */
  total: number;
  /**
   * 默认当前页数
   */
  defaultCurrent?: number;
  /**
   * 文本样式配置
   */
  textStyle?: Partial<ITextGraphicAttribute>;
  /** 整体的内边距配置 */
  padding?: Padding;
  /**
   * 关闭交互效果
   * @default false
   */
  disableTriggerEvent?: boolean;
} & Partial<IGroupGraphicAttribute>;
