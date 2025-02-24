import type { ITheme, IThemeSpec } from './theme';
import type { IGraphicAttribute, IGraphic } from '../graphic';
import type { INode } from '../node-tree';
import type { GraphicAttributeMap } from './creator';

export type IGroupAttribute = {
  /**
   * 路径，用于绘制路径图形或者设置裁剪图形
   */
  path: IGraphic[];
  /**
   * 宽度
   */
  width: number;
  /**
   * 高度
   */
  height: number;
  /**
   * 圆角半径
   */
  cornerRadius: number | number[];
  /**
   * 圆角类型，
   * 'round' - 圆弧
   * 'bevel' - 斜角
   */
  cornerType: 'round' | 'bevel';
  /**
   * 是否剪裁
   */
  clip: boolean;
  /**
   * 所有的子节点是否可见
   */
  visibleAll: boolean;
  /**
   * 布局方式
   */
  display?: 'relative' | 'inner-block' | 'flex';
  /**
   * flex布局的方向
   */
  flexDirection?: 'row' | 'row-reverse' | 'column' | 'column-reverse';
  /**
   * flex布局的换行
   */
  flexWrap?: 'nowrap' | 'wrap';
  /**
   * flex布局中，子元素在主轴上的对齐方式
   */
  justifyContent?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around';
  /**
   * flex布局中，子元素在交叉轴上的对齐方式
   */
  alignItems?: 'flex-start' | 'flex-end' | 'center';
  /**
   * flex布局中，多行内容的垂直对齐方式
   */
  alignContent?: 'flex-start' | 'center' | 'space-between' | 'space-around';
  /**
   * 基准的透明度，用于控制group下面整体图元的透明度
   */
  baseOpacity?: number;
  /**
   * 绘制模式
   * 0 - 直接绘制
   * 1 - 绘制到新Canvas上，再绘制回来，需要绘制背景，然后绘制group
   * 2 - 绘制到新Canvas上，再绘制回来，不需要绘制背景，只需要绘制group
   */
  drawMode?: 0 | 1 | 2;
};

export type IGroupGraphicAttribute = Partial<IGraphicAttribute> & Partial<IGroupAttribute>;

export interface IGroup extends IGraphic<IGroupGraphicAttribute> {
  childrenPickable?: boolean; // 子元素是否可以被pick

  theme?: ITheme;

  createTheme: () => void;
  hideAll: () => void;
  showAll: () => void;

  setTheme: (t: IThemeSpec) => void;

  incrementalAppendChild: (node: INode, highPerformance?: boolean) => INode | null;
  incrementalClearChild: () => void;

  createOrUpdateChild: <T extends keyof GraphicAttributeMap>(
    graphicName: string,
    attributes: GraphicAttributeMap[T],
    graphicType: T
  ) => INode;
}
