import type {
  IGlobal,
  IGraphicService,
  ILayer,
  ILayerParams,
  IPickerService,
  IPluginService,
  IRenderService,
  IStage,
  IStageParams,
  IWindow
} from '../interface';
import type { ILayerService } from '../interface/core';
import type { IGraphic, IGraphicAttribute } from '../interface/graphic';

export interface IStageFactoryDeps {
  global?: IGlobal;
  window?: IWindow;
  windowFactory?: () => IWindow;
  renderService?: IRenderService;
  pickerService?: IPickerService;
  pickerServiceFactory?: () => IPickerService;
  pluginService?: IPluginService;
  layerService?: ILayerService;
  graphicService?: IGraphicService;
}

export type IStageDependenciesFactory = () => IStageFactoryDeps;

export type IStageConstructor<TStage extends IStage = IStage> = new (
  params: Partial<IStageParams>,
  deps?: IStageFactoryDeps
) => TStage;

export interface IStageFactory<TStage extends IStage = IStage> {
  create: (params: Partial<IStageParams>) => TStage;
}

export interface ILayerFactoryCreateParams {
  stage: IStage;
  global: IGlobal;
  window: IWindow;
  params: ILayerParams;
}

export type ILayerConstructor<TLayer extends ILayer = ILayer> = new (
  stage: IStage,
  global: IGlobal,
  window: IWindow,
  params: ILayerParams
) => TLayer;

export interface ILayerFactory<TLayer extends ILayer = ILayer> {
  create: (params: ILayerFactoryCreateParams) => TLayer;
}

export type IGraphicConstructor<
  TGraphic extends IGraphic = IGraphic,
  TAttributes extends Partial<IGraphicAttribute> = Partial<IGraphicAttribute>
> = new (attributes: TAttributes) => TGraphic;

export interface IGraphicFactory {
  create: <
    TGraphic extends IGraphic = IGraphic,
    TAttributes extends Partial<IGraphicAttribute> = Partial<IGraphicAttribute>
  >(
    type: string,
    attributes: TAttributes
  ) => TGraphic;
  register: <
    TGraphic extends IGraphic = IGraphic,
    TAttributes extends Partial<IGraphicAttribute> = Partial<IGraphicAttribute>
  >(
    type: string,
    ctor: IGraphicConstructor<TGraphic, TAttributes>
  ) => void;
}
