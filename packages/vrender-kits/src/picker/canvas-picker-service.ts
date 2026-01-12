import type { IMatrix, IPointLike } from '@visactor/vutils';
import {
  DefaultPickService,
  canvasAllocate,
  type ICanvas,
  type IContext2d,
  type IGraphic,
  type EnvType,
  type IGlobal,
  type IGraphicPicker,
  type IPickerService,
  type IContributionProvider,
  type IPickParams,
  type PickResult,
  application
} from '@visactor/vrender-core';
import { CanvasPickerContribution } from './contributions/constants';

// 默认的pick-service，提供基本的最优选中策略，尽量不需要用户自己实现contribution
// 用户可以写plugin
export class DefaultCanvasPickerService extends DefaultPickService implements IPickerService {
  declare type: 'default';
  // pick canvas
  declare pickCanvas: ICanvas;
  declare pickContext: IContext2d;
  declare pickerMap: Map<number, IGraphicPicker>;

  protected readonly contributions: IContributionProvider<IGraphicPicker>;

  constructor() {
    super();
    // Use registry-only provider for canvas pickers
    this.contributions = {
      getContributions: () => application.contributions.get<IGraphicPicker>(CanvasPickerContribution)
    } as IContributionProvider<IGraphicPicker>;

    this.global.hooks.onSetEnv.tap('canvas-picker-service', (_, env, global) => {
      this.configure(global, env);
    });
    this.configure(this.global, this.global.env);
    this.pickerMap = new Map();
    this.init();
  }

  init() {
    this.contributions.getContributions().forEach(item => {
      this.pickerMap.set(item.numberType, item);
    });
    super._init();
  }

  configure(global: IGlobal, env: EnvType) {
    // 创建pick canvas
    this.pickCanvas = canvasAllocate.shareCanvas();
    this.pickContext = this.pickCanvas.getContext('2d');
  }

  // todo: switch统一改为数字map
  pickItem(graphic: IGraphic, point: IPointLike, parentMatrix: IMatrix | null, params: IPickParams): PickResult | null {
    if (graphic.attribute.pickable === false) {
      return null;
    }
    // 添加拦截器
    if (this.InterceptorContributions.length) {
      for (let i = 0; i < this.InterceptorContributions.length; i++) {
        const drawContribution = this.InterceptorContributions[i];
        if (drawContribution.beforePickItem) {
          const ret = drawContribution.beforePickItem(graphic, this, point, params, { parentMatrix });
          if (ret) {
            return ret;
          }
        }
      }
    }
    const picker = this.pickerMap.get(graphic.numberType);
    if (!picker) {
      return null;
    }
    const pd = picker.contains(graphic, point, params);
    const g = pd ? graphic : null;

    const data = {
      graphic: g,
      params: pd
    };
    if (g) {
      return data;
    }
    // 添加拦截器
    if (this.InterceptorContributions.length) {
      for (let i = 0; i < this.InterceptorContributions.length; i++) {
        const drawContribution = this.InterceptorContributions[i];
        if (drawContribution.afterPickItem) {
          const ret = drawContribution.afterPickItem(graphic, this, point, params, { parentMatrix });
          if (ret) {
            return ret;
          }
        }
      }
    }
    return data;
  }
}
