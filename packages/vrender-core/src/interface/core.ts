import type { ICanvas } from './canvas';
import type { IContext2d } from './context';
import type { IGraphicAttribute } from './graphic';
import type { ITextAttribute } from './graphic/text';
import type { ILayer, ILayerParams } from './layer';
import type { IStage } from './stage';
import type { ITextMeasure, TextOptionsType } from './text';
import type { IMatrix, IPointLike, ITextMeasureOption, TextMeasure } from '@visactor/vutils';

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
  rotate: (angle: number, center?: IPointLike) => ITransformUtil;
  translate: (dx: number, dy: number) => ITransformUtil;
}

export interface ILayerService {
  createLayer: (stage: IStage, options?: Partial<ILayerParams>) => ILayer;
  // stage绘制前调用
  prepareStageLayer: (stage: IStage) => void;
  releaseLayer: (stage: IStage, layer: ILayer) => void;
  restLayerCount: (stage: IStage) => number;
  getStageLayer: (stage: IStage) => ILayer[];
  layerCount: (stage: IStage) => number;
}
