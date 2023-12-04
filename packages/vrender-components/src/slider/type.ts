import type {
  ISymbolGraphicAttribute,
  IRectGraphicAttribute,
  ITextGraphicAttribute,
  IGroupGraphicAttribute
} from '@visactor/vrender/es/core';

type Text = string | number;

export type TextAttribute = {
  /** 是否展示 */
  visible?: boolean;
  /** 文本内容 */
  text?: Text;
  /**
   * 文本同滑块的间距，默认为 6
   */
  space?: number;
  /**
   * 文本样式
   */
  style?: Omit<Partial<ITextGraphicAttribute>, 'text'>;
};

export type HandlerTextAttribute = {
  /** 是否展示 */
  visible?: boolean;
  /**
   * 数据展示的小数精度，默认为0，无小数点。
   */
  precision?: number;
  /** 文本内容格式化函数 */
  formatter?: (text: Text) => Text;
  /**
   * 文本同滑块的间距，默认为 6
   */
  space?: number;
  /**
   * 文本样式
   */
  style?: Omit<Partial<ITextGraphicAttribute>, 'text'>;
};

export type TooltipConfig = {
  // /**
  //  * 是否始终展示
  //  */
  // alwaysShow?: boolean;
  /**
   * 格式化函数
   */
  formatter?: (value: Text) => Text;
  // TODO： 待补充一些样式属性
};

export type RangeType =
  | boolean
  | {
      /**
       * 范围刻度是否可被拖拽，默认值为 false
       */
      draggableTrack?: boolean;
    };

export type SliderAttributes = {
  /**
   * 是否允许拖动，默认为 true
   */
  slidable?: boolean;
  /**
   * TODO: 这个类型有问题
   * 布局方式。
   * - 'horizontal' 水平布局
   * - 'vertical' 垂直布局
   */
  layout?: 'horizontal' | 'vertical' | string;
  /**
   * 指定组件中手柄和文字的摆放位置，可选值为：
   * 'left' 手柄和label在滑块左侧，layout 为 vertical 时有效。
   * 'right' 手柄和label在滑块右侧，layout 为 vertical 时有效。
   * 'top' 手柄和label在滑块上侧，layout 为 horizontal 时有效。
   * 'bottom' 手柄和label在滑块下侧，layout 为 horizontal 时有效。
   */
  align?: 'top' | 'bottom' | 'left' | 'right';
  /**
   * 双滑块模式，默认为 false，单滑块模式
   */
  range?: RangeType;
  /**
   * 最小值
   */
  min: number;
  /**
   * 最大值
   */
  max: number;
  /**
   * 设置当前取值。当 range 为 false 时，使用 number，否则用 [number, number]
   */
  value?: number | [number, number];
  /**
   * TODO:
   * 步长，取值必须大于 0，并且可被 (max - min) 整除。
   * 用于离散连续场景
   */
  step?: number;

  /**
   * 滑块的宽度
   */
  railWidth: number;
  /**
   * 滑块的高度
   */
  railHeight: number;

  /**
   * 是否绘制 handler，默认为 true
   */
  showHandler?: boolean;

  /**
   * handler 操作按钮的大小
   */
  handlerSize?: number;

  /**
   * 滑块手柄的样式配置
   */
  handlerStyle?: Partial<ISymbolGraphicAttribute>;
  /**
   * 背景轨道样式配置
   */
  railStyle?: Omit<Partial<IRectGraphicAttribute>, 'width' | 'height'>;
  /**
   * 选中区域样式配置
   */
  trackStyle?: Omit<Partial<IRectGraphicAttribute>, 'width' | 'height'>;

  /**
   * 滑块首部文本配置
   */
  startText?: TextAttribute;
  /**
   * 滑块尾部文本配置
   */
  endText?: TextAttribute;

  /**
   * 滑块对应的文本配置项
   */
  handlerText?: HandlerTextAttribute;

  /**
   * TODO
   * 是否显示 hander 上的 tooltip
   */
  showTooltip?: boolean;
  /**
   * handler tooltip 配置
   */
  tooltip?: TooltipConfig;
  /**
   * 关闭交互效果
   * @default false
   */
  disableTriggerEvent?: boolean;
} & IGroupGraphicAttribute;
