import type { IBounds, IMatrix, IPoint, IPointLike } from '@visactor/vutils';
import type { IGraphic } from './graphic';
import type { IContext2d } from './context';
import type { EnvType, IGlobal } from './global';
import type { IGroup } from './graphic/group';
import type { IDrawContribution } from './render';

type ISubPickEventParams =
  | boolean
  | {
      graphic?: any;
      group?: any;
      params: ISubPickEventParams;
    };

export type IPickEventParams =
  | {
      shadowTarget?: IGraphic;
    }
  | ISubPickEventParams;

export type PickResult = {
  graphic?: IGraphic | null;
  group?: IGroup | null;
  params?:
    | {
        shadowTarget?: IGraphic;
      }
    | ISubPickEventParams;
};

export interface IGraphicPicker {
  type: string;
  numberType: number;

  contains: (graphic: IGraphic, point: IPointLike, params?: IPickParams) => boolean | any;
}

export interface IPickParams {
  group?: boolean;
  graphic?: boolean;
  bounds?: IBounds;
  pickContext?: IContext2d;
  pickerService?: IPickerService;
  // 内部设置
  in3dInterceptor?: boolean;
  hack_pieFace?: string;
}

export interface IPickerService {
  type: string;

  pickContext?: IContext2d;
  pickerMap: Map<number, IGraphicPicker>;
  configure: (global: IGlobal, env: EnvType) => void;
  pick: (group: IGraphic[], point: IPoint, params?: IPickParams) => PickResult;
  pickGroup: (group: IGroup, point: IPointLike, parentMatrix: IMatrix, params: IPickParams) => PickResult;
  pickItem: (
    graphic: IGraphic,
    point: IPointLike,
    parentMatrix: IMatrix | null,
    params?: IPickParams
  ) => PickResult | null;
  containsPoint: (graphic: IGraphic, point: IPointLike, params?: IPickParams) => boolean;
  drawContribution?: IDrawContribution;
}

export interface IPickItemInterceptorContribution {
  order: number;
  // null代表没匹配到，boolean代表是否pick中
  beforePickItem?: (
    graphic: IGraphic,
    pickerService: IPickerService,
    point: IPointLike,
    drawContext: {
      in3dInterceptor?: boolean;
    },
    params?: {
      parentMatrix: IMatrix;
    }
  ) => PickResult | null;

  afterPickItem?: (
    graphic: IGraphic,
    pickerService: IPickerService,
    point: IPointLike,
    drawContext: {
      in3dInterceptor?: boolean;
    },
    params?: {
      parentMatrix: IMatrix;
    }
  ) => PickResult | null;
  // afterPickItem?: (
  //   graphic: IGraphic,
  //   pickerService: IPickerService,
  // ) => boolean;
}

export interface IBoundsPicker {
  type: string;
  numberType?: number;

  contains: (graphic: IGraphic, point: IPointLike, params?: IPickParams) => boolean;
}
