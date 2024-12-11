import type {
  IGroupGraphicAttribute,
  ILineGraphicAttribute,
  IRectGraphicAttribute,
  ISymbolGraphicAttribute,
  ITextGraphicAttribute
} from '@visactor/vrender-core';
import { ILineAttribute, ISymbolAttribute } from '@visactor/vrender-core';

export interface IStoryLabelItemAttrs extends IGroupGraphicAttribute {
  // 内容在X上的偏移量
  contentOffsetX: number;
  // 内容在Y上的偏移量
  contentOffsetY: number;
  lineStyle?: ILineGraphicAttribute;
  // 线段开始端点的样式
  symbolStartStyle?: ISymbolGraphicAttribute;
  // 线段结束端点的样式
  symbolEndStyle?: ISymbolGraphicAttribute;
  // 线段开始端点外面包裹symbol的样式
  symbolStartOuterStyle?: ISymbolGraphicAttribute;
  // 默认和简约两套主题
  theme?: 'default' | 'simple';
  // 顶部文字内容
  titleTop?: string | string[];
  // 底部文字内容
  titleBottom?: string | string[];
  // 顶部文字样式
  titleTopStyle?: ITextGraphicAttribute;
  // 底部文字样式
  titleBottomStyle?: ITextGraphicAttribute;
  // 水平和垂直方向的边距
  titleSpace?: [number, number];
  // 顶部的panel
  titleTopPanelStyle?: IRectGraphicAttribute & {
    padding: { left: number; right: number; top: number; bottom: number };
  };
  // 底部的panel
  titleBottomPanelStyle?: IRectGraphicAttribute & {
    padding: { left: number; right: number; top: number; bottom: number };
  };
}
