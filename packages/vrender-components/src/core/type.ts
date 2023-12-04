import type { IRichTextCharacter } from '@visactor/vrender/es/core';

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
      top?: number;
      bottom?: number;
      left?: number;
      right?: number;
    };

type CommonTextContent = {
  type?: 'text';
  text?: string | string[] | number | number[];
};

type RichTextContent = {
  type?: 'rich';
  text?: IRichTextCharacter[];
};

type HtmlTextContent = {
  type?: 'html';
  text?: string | HTMLElement;
};

export type TextContent = CommonTextContent | RichTextContent | HtmlTextContent;
