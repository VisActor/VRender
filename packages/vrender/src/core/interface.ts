import { ICanvas, IContext2d, ITextAttribute } from '../interface';
import { ITextMeasure, TextOptionsType } from './contributions/textMeasure/ITextMeasure';
import { ITextMeasureOption, TextMeasure } from '@visactor/vutils';

export interface IGraphicUtil {
  canvas?: ICanvas;
  context?: IContext2d | null;
  textMeasure: ITextMeasure;
  measureText: (text: string, tc: TextOptionsType) => { width: number; height: number };
  bindTextMeasure: (tm: ITextMeasure) => void;
  createTextMeasureInstance: (
    textSpec?: Partial<ITextAttribute>,
    option?: Partial<ITextMeasureOption>,
    getCanvasForMeasure?: () => any
  ) => TextMeasure<ITextAttribute>;
}
