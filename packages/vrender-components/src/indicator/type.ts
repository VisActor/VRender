import type { IGroupGraphicAttribute, ITextGraphicAttribute, IRichTextCharacter } from '@visactor/vrender-core';
import type { TextContent } from '../core/type';

export interface IndicatorAttributes extends IGroupGraphicAttribute {
  /**
   * 是否显示指标卡组件
   * @default true
   */
  visible?: boolean;
  /**
   * 内容尺寸
   */
  size: { width: number; height: number };
  /**
   * 指标卡 x 方向偏移
   * @default 0
   */
  dx?: number;
  /**
   * 指标卡 y 方向偏移
   * @default 0
   */
  dy?: number;
  /**
   * 指标卡宽度占内容区域的最大比值（从0到1）
   */
  limitRatio?: number;
  /**
   * 指标卡标题文字配置
   */
  title?: IndicatorItemSpec;
  /**
   * 指标卡内容文字配置
   */
  content?: IndicatorItemSpec[] | IndicatorItemSpec;
}

export interface IndicatorItemSpec {
  /**
   * 是否显示当前项
   * @default true
   */
  visible?: boolean;
  /**
   * title.space: title 和 content 之间的间距
   * contentItem.space: content 之间的间距
   */
  space?: number;
  /**
   * 是否自适应文字空间进行缩略
   * 按照原字体大小，根据空间大小缩略文字
   * @default false
   */
  autoLimit?: boolean;
  /**
   * 是否自适应文字空间缩放文字大小
   * 不缩略文字，改变字体大小以适应空间
   * @default false
   */
  autoFit?: boolean;
  /**
   * 自适应文字宽度与可用空间的比例
   * @default 0.5
   */
  fitPercent?: number;
  /**
   * 自适应文字策略
   * @default 'local'
   */
  fitStrategy?: 'default' | 'inscribed';
  /**
   * 格式化方法
   * @since 0.20.0
   * @param text 文本
   * @returns
   */
  formatMethod?: (text: string | number, textStyle: ITextGraphicAttribute) => TextContent;
  /**
   * 文字样式
   */
  style?: Omit<ITextGraphicAttribute, 'text'> & TextContent;
}
