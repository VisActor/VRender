import type { IMatrix, IPointLike } from '@visactor/vutils';
import {
  DefaultPickService,
  EmptyContext2d,
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
import { MathPickerContribution } from './contributions/constants';

// 默认的pick-service，提供基本的最优选中策略，尽量不需要用户自己实现contribution
// 用户可以写plugin
export class DefaultMathPickerService extends DefaultPickService implements IPickerService {
  declare type: 'default';
  // pick canvas
  declare pickCanvas: ICanvas;
  declare pickContext: IContext2d;
  declare pickerMap: Map<number, IGraphicPicker>;

  protected readonly contributions: IContributionProvider<IGraphicPicker>;

  constructor() {
    super();
    this.contributions = {
      getContributions: () => application.contributions.get<IGraphicPicker>(MathPickerContribution)
    } as IContributionProvider<IGraphicPicker>;

    this.global.hooks.onSetEnv.tap('math-picker-service', (lastEnv, env, global) => {
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
    this.pickContext = new EmptyContext2d(null, 1);
  }

  // todo: switch统一改为数字map
  pickItem(
    graphic: IGraphic,
    point: IPointLike,
    parentMatrix: IMatrix | null,
    params?: IPickParams
  ): PickResult | null {
    if (graphic.attribute.pickable === false) {
      return null;
    }
    const picker = this.pickerMap.get(graphic.numberType);
    if (!picker) {
      return null;
    }
    const pd = picker.contains(graphic, point, params);
    const g = pd ? graphic : null;
    if (g) {
      return {
        graphic: g,
        params: pd
      };
    }
    return null;
  }
}
