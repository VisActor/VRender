import type {
  EasingType,
  IGroupGraphicAttribute,
  ISymbolGraphicAttribute,
  ITextGraphicAttribute
} from '@visactor/vrender-core';
import type { BaseGraphicAttributes, Padding } from '../../core/type';
import type { PagerAttributes } from '../../pager';
import type { LegendBaseAttributes } from '../type';
import type { ScrollBarAttributes } from '../../scrollbar/type';

export interface LegendSwitchComponentAttributes {
  /**
   * 翻页组件同图例内容项之间的间距
   */
  space?: number;
  /**
   * the default page
   */
  defaultCurrent?: number;
  /**
   * 翻页是否开启动画
   */
  animation?: boolean;
  /**
   * 动画执行时间
   */
  animationDuration?: number;
  /**
   * 动画执行效果
   */
  animationEasing?: EasingType;
}

export type LegendPagerAttributes = Omit<PagerAttributes, 'total'> &
  LegendSwitchComponentAttributes & {
    /**
     * 分页器的显示位置，默认 'middle'
     * @default 'middle'
     */
    position?: 'start' | 'middle' | 'end';
  };

export type LegendScrollbarAttributes = Omit<ScrollBarAttributes, 'range' | 'limitRange'> &
  LegendSwitchComponentAttributes & {
    type: 'scrollbar';
    scrollByPosition?: boolean;
    /**
     * 是否支持鼠标/触控板滚动
     * @default false
     */
    roamScroll?: boolean;
  };

export type LegendItemDatum = {
  /**
   * 该条数据的唯一标识，可用于动画或者查找
   */
  id?: string;
  /** 显示文本 */
  label: string;
  /** 显示数据 */
  value?: string | number;
  /** 图例项前的 shape 形状定义 */
  shape: {
    symbolType?: string;
    fill?: string;
    stroke?: string;
  };
  [key: string]: any;
};

export type StyleCallback<T> = (
  item: LegendItemDatum,
  isSelected: boolean,
  index: number,
  allItems: LegendItemDatum[]
) => T;

export type formatterCallback = (text: string | number, item: LegendItemDatum, index: number) => any;

export type LegendItem = {
  /**
   * 是否展示图例项
   * @default true
   */
  visible?: boolean;
  /**
   * 图例项的列间距 水平间距
   */
  spaceCol?: number;
  /**
   * 图例项的行间距 垂直间距
   */
  spaceRow?: number;
  /**
   * 图例项的最大宽度，默认为 null，由上层传入
   */
  maxWidth?: number;
  /**
   * 图例项的宽度, 默认自动计算
   */
  width?: number;
  /**
   * 图例的高度，默认自动计算
   */
  height?: number;
  /**
   * 图例项自身的内边距
   */
  padding?: Padding;
  /**
   * 图例项背景配置
   */
  background?: {
    visible?: boolean;
  } & BaseGraphicAttributes<Partial<IGroupGraphicAttribute> | StyleCallback<Partial<IGroupGraphicAttribute>>>;
  /**
   * 图例项的 shape 图标的配置
   */
  shape?: {
    visible?: boolean;
    /** shape 同后面 label 的间距 */
    space?: number;
  } & BaseGraphicAttributes<Partial<ISymbolGraphicAttribute> | StyleCallback<Partial<ISymbolGraphicAttribute>>>;

  /**
   * 当label+ value同时存在的时候，自动省略的策略
   * 'labelFirst' - 尽量保证完整展示`label`
   * 'valueFirst' - 尽量保证完整展示`value`
   * 'none' - 按照`widthRatio`展示label 和 value
   */
  autoEllipsisStrategy?: 'labelFirst' | 'valueFirst' | 'none';

  /**
   * 图例项的 label 文本配置
   */
  label?: {
    /**
     * 当 label + value 同时展示，切超长的时候，label的宽度占比
     */
    widthRatio?: number;
    /**
     * 图例项 label 同后面 value 的间距
     */
    space?: number;
    /**
     * 格式化文本函数
     */
    formatMethod?: formatterCallback;
  } & BaseGraphicAttributes<Partial<ITextGraphicAttribute> | StyleCallback<Partial<ITextGraphicAttribute>>>;
  /**
   * 图例项 value 配置
   */
  value?: {
    /**
     * 当 label + value 同时展示，切超长的时候，label的宽度占比
     */
    widthRatio?: number;
    /** value 同后面元素的间距 */
    space?: number;
    /**
     * 是否右对齐显示，仅当设置图例项宽度 itemWidth 时生效
     * 默认为 false，
     */
    alignRight?: boolean;
    /**
     * 格式化文本函数
     */
    formatMethod?: formatterCallback;
  } & BaseGraphicAttributes<Partial<ITextGraphicAttribute> | StyleCallback<Partial<ITextGraphicAttribute>>>;
  /**
   * 是否开启聚焦功能，默认关闭
   */
  focus?: boolean;
  /**
   * 聚焦按钮配置
   */
  focusIconStyle?: Partial<ISymbolGraphicAttribute>;
  /**
   * 指定图例项中图标和文字的摆放位置，可选值为：
   * 'left' 图标在左侧
   * 'right' 图标在右侧
   */
  align?: 'left' | 'right';
};

export type DiscreteLegendAttrs = {
  /**
   * 是否开启选中交互
   */
  select?: boolean;
  /**
   * 是否开启 hover 交互
   */
  hover?: boolean;
  /**
   * 图例数据
   */
  items: LegendItemDatum[];
  /**
   * 默认选中的图例项
   */
  defaultSelected?: (string | number)[];
  /**
   * 单选/多选模式配置，默认 'multiple'。
   * - `single` 表示单选
   * - `multiple` 表示多选
   * - `focus` 表示聚焦模式 （自 0.19.2版本开始支持）
   */
  selectMode?: 'single' | 'multiple' | 'focus';
  /**
   * 是否允许图例全部取消，多选模式下生效
   */
  allowAllCanceled?: boolean;
  /**
   * 图例项的顺序是否要逆序，默认为 false
   */
  reversed?: boolean;
  /**
   * 图例项相关的配置
   */
  item?: LegendItem;
  /**
   * 最大宽度，决定 layout : 'horizontal' 是否自动换行
   */
  maxWidth?: number;
  /**
   * 最大高度，决定是否分页
   */
  maxHeight?: number;
  /**
   * 最大行数，当且仅当 layout 为 'horizontal' 时生效
   */
  maxRow?: number;
  /**
   * 最大列数，当且仅当 layout 为 'vertical' 时生效
   */
  maxCol?: number;
  /**
   * 延迟渲染，按需渲染图例项目
   */
  lazyload?: boolean;
  /**
   * 是否进行自动分页，默认为 true
   */
  autoPage?: boolean;
  /**
   * 翻页器配置
   */
  pager?: LegendPagerAttributes | LegendScrollbarAttributes;
} & LegendBaseAttributes;
