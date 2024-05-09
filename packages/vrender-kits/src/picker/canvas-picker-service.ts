import type { IMatrix, IPointLike } from '@visactor/vutils';
// eslint-disable-next-line
import {
  ContributionProvider,
  inject,
  injectable,
  named,
  DefaultPickService,
  DrawContribution,
  PickItemInterceptor,
  canvasAllocate,
  application
} from '@visactor/vrender-core';
import type {
  ICanvas,
  IContext2d,
  IGraphic,
  EnvType,
  IGlobal,
  IGraphicPicker,
  IPickerService,
  IDrawContribution,
  IContributionProvider,
  IPickItemInterceptorContribution,
  IPickParams,
  PickResult
} from '@visactor/vrender-core';
import {
  CanvasArcPicker,
  CanvasAreaPicker,
  CanvasCirclePicker,
  CanvasImagePicker,
  CanvasLinePicker,
  CanvasPathPicker,
  CanvasPickerContribution,
  CanvasPolygonPicker,
  CanvasRectPicker,
  CanvasSymbolPicker,
  CanvasTextPicker,
  CanvasRichTextPicker
} from './contributions/constants';

// 默认的pick-service，提供基本的最优选中策略，尽量不需要用户自己实现contribution
// 用户可以写plugin
@injectable()
export class DefaultCanvasPickerService extends DefaultPickService implements IPickerService {
  declare type: 'default';
  // pcik canvas
  declare pickCanvas: ICanvas;
  declare pickContext: IContext2d;
  declare pickerMap: Map<number, IGraphicPicker>;

  constructor(
    @inject(ContributionProvider)
    @named(CanvasPickerContribution)
    protected readonly contributions: IContributionProvider<IGraphicPicker>,

    @inject(DrawContribution)
    public readonly drawContribution: IDrawContribution,
    // 拦截器
    @inject(ContributionProvider)
    @named(PickItemInterceptor)
    protected readonly pickItemInterceptorContributions: IContributionProvider<IPickItemInterceptorContribution>
  ) {
    super(pickItemInterceptorContributions);
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
    // if (!this.global.env) return;
    // this.contributions.getContributions().forEach(handlerContribution => {
    //   handlerContribution.configure(this, this.global);
    // });

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
