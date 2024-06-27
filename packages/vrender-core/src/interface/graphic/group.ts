import type { ITheme, IThemeSpec } from './theme';
import type { IGraphicAttribute, IGraphic } from '../graphic';
import type { INode } from '../node-tree';
import type { GraphicAttributeMap } from './creator';

export type IGroupAttribute = {
  path: IGraphic[];
  width: number;
  height: number;
  cornerRadius: number | number[];
  clip: boolean;
  visibleAll: boolean;
  display?: 'relative' | 'inner-block' | 'flex';
  flexDirection?: 'row' | 'row-reverse' | 'column' | 'column-reverse';
  flexWrap?: 'nowrap' | 'wrap';
  justifyContent?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around';
  alignItems?: 'flex-start' | 'flex-end' | 'center';
  alignContent?: 'flex-start' | 'center' | 'space-between' | 'space-around';
  // 基准的透明度，用于控制group下面整体图元的透明度
  baseOpacity?: number;
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
