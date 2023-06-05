import type { ITheme, IThemeSpec } from './theme';
import type { GraphicAttributeMap, INode } from '../../interface';
import type { IGraphicAttribute, IGraphic } from '../graphic';

export type IGroupAttribute = {
  path: IGraphic[];
  width: number;
  height: number;
  borderRadius: number | number[];
  clip: boolean;
  visibleAll: boolean;
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
