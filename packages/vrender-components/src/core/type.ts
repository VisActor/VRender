import type { IGraphicStyle, IRichTextCharacter } from '@visactor/vrender-core';

export type Point = {
  x: number;
  y: number;
};

export interface LocationCfg {
  [key: string]: any;
}

export interface PointLocationCfg extends LocationCfg {
  /**
   * 位置 x
   * @type {number}
   */
  x: number;
  /**
   * 位置 y
   * @type {number}
   */
  y: number;
}

export interface RegionLocationCfg extends LocationCfg {
  /**
   * 起始点
   */
  start: Point;
  /**
   * 结束点
   */
  end: Point;
}

export type State<T> = {
  [key: string]: T;
};

export type BaseGraphicAttributes<T> = {
  /**
   * 基础样式设置
   */
  style?: T;
  /**
   * 状态样式设置
   */
  state?: State<T>;
};

export type Padding =
  | number
  | number[]
  | {
      /**
       * 上边距
       */
      top?: number;
      /**
       * 下边距
       */
      bottom?: number;
      /**
       * 左边距
       */
      left?: number;
      /**
       * 右边距
       */
      right?: number;
    };

type CommonTextContent = {
  text?:
    | string
    | string[]
    | number
    | number[]
    | {
        /**
         * 指定文本节点类型为'text'
         */
        type?: 'text';
        /**
         * 设置文本的内容
         */
        text: string | string[] | number | number[];
      };
};

export type RichTextContent = {
  text?: {
    type: 'rich';
    text: IRichTextCharacter[];
  };
};

/**
 * html supported @since 0.19.0
 */
export type HTMLTextContent = {
  text: {
    type: 'html';
    text: IGraphicStyle['html'];
  };
  _originText: string; // 原始 text，用于预估 bounds
};

/**
 * react supported @since 0.19.0
 */
export type ReactTextContent = {
  text: {
    type: 'react';
    text: IGraphicStyle['react'];
  };
  _originText: string; // 原始 text，用于预估 bounds
};

export type TextContent = (CommonTextContent | RichTextContent | HTMLTextContent | ReactTextContent) & {
  /** @deprecated */
  type?: 'text' | 'rich';
};
