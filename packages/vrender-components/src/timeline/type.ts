import type {
  IGroupGraphicAttribute,
  ILineGraphicAttribute,
  ISymbolGraphicAttribute,
  ITextGraphicAttribute
} from '@visactor/vrender-core';

export interface TimelineAttrs extends IGroupGraphicAttribute {
  width: number;
  // height?: number;
  times: { label: string; desc?: string }[];
  labelSpace?: number;
  symbolStyle?: Partial<ISymbolGraphicAttribute>;
  activeSymbolStyle?: Partial<ISymbolGraphicAttribute>;
  lineStyle?: Partial<ILineGraphicAttribute>;
  activeLineStyle?: Partial<ILineGraphicAttribute>;
  labelStyle?: Partial<ITextGraphicAttribute>;
  activeLabelStyle?: Partial<ITextGraphicAttribute>;
  pointLayoutMode?: 'space-around' | 'space-between';
  // 当前进度
  clipRange?: number;
  animation?: boolean;
}
