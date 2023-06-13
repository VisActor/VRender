import { ICanvas, IContext2d, IGraphicAttribute, ILayer, IStage, ITextAttribute } from '../interface';
import { ITextMeasure, TextOptionsType } from './contributions/textMeasure/ITextMeasure';
import { IMatrix, IPointLike, ITextMeasureOption, Matrix, TextMeasure } from '@visactor/vutils';

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

export type TransformType = Pick<IGraphicAttribute, 'x' | 'y' | 'scaleX' | 'scaleY' | 'angle' | 'dx' | 'dy'> & {
  anchor?: IGraphicAttribute['anchor'];
};
export interface ITransformUtil {
  init: (origin: TransformType) => ITransformUtil;
  fromMatrix: (source: IMatrix, target: IMatrix) => ITransformUtil;
  scale: (sx: number, sy: number, center?: IPointLike) => ITransformUtil;
  translate: (dx: number, dy: number) => ITransformUtil;
}

export interface ILayerService {
  createLayer: (stage: IStage) => ILayer;
  releaseLayer: (stage: IStage, layer: ILayer) => void;
  restLayerCount: (stage: IStage) => number;
  getStageLayer: (stage: IStage) => ILayer[];
  layerCount: (stage: IStage) => number;
}
