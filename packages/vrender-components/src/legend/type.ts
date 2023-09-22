import type {
  IGroupGraphicAttribute,
  IRectGraphicAttribute,
  ISymbolGraphicAttribute,
  ITextGraphicAttribute
} from '@visactor/vrender-core';
import type { Padding } from '../core/type';

export type LegendTitle = {
  /**
   * 是否显示 title
   */
  visible?: boolean;
  /**
   * 标题在当前显示区域的对齐方式，起始 | 居中 | 末尾
   */
  align?: 'start' | 'center' | 'end';
  /**
   * 标题与内容的距离
   */
  space?: number;
  /**
   * 内部边距
   */
  padding?: Padding;
  /**
   * 标题内容，如果需要进行换行，则使用数组形式，如 ['abc', '123']
   */
  text?: string | string[] | number | number[];
  /** 标题文本样式 */
  textStyle?: Partial<ITextGraphicAttribute>;
  /** 文本前 mark 图元 */
  shape?: {
    /**
     * 是否展示 shape
     */
    visible?: boolean;
    /**
     * shape 同 文本的间距
     */
    space?: number;
    style?: Omit<Partial<ISymbolGraphicAttribute>, 'visible'>;
  };
  /**
   * 标题的背景面板配置
   */
  background?: {
    /**
     * 是否绘制背景层
     */
    visible?: boolean;
    /**
     * 背景层样式
     */
    style?: Omit<Partial<IRectGraphicAttribute>, 'visible' | 'width' | 'height'>;
  };
  /**
   * 最小宽度，像素值
   * @default 30
   */
  minWidth?: number;
  /**
   * 最大宽度，像素值。当文字超过最大宽度时，会自动省略。
   */
  maxWidth?: number;
};

export type LegendBaseAttributes = IGroupGraphicAttribute & {
  /**
   * 是否禁止交互，默认为 true
   */
  interactive?: boolean;
  /**
   * 图例布局方式。
   * - 'horizontal' 水平布局
   * - 'vertical' 垂直布局
   */
  layout?: 'horizontal' | 'vertical' | string;
  /**
   * 图例标题
   */
  title?: LegendTitle;
  /**
   * 图例容器内边距， [top, right, bottom, left]
   */
  padding?: Padding;
};
