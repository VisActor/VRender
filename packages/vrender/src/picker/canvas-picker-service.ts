import type { IMatrix, IPointLike } from '@visactor/vutils';
// eslint-disable-next-line
import { ContributionProvider } from '../common/contribution-provider';
import { inject, injectable, named, postConstruct } from '../common/inversify-lite';
import { BrowserCanvas } from '../canvas/contributions/browser';
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
  IPickParams
} from '../interface';
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
import { DefaultPickService } from './picker-service';
import { DrawContribution } from '../render';
import { PickItemInterceptor } from './pick-interceptor';
import { VGlobal } from '../constants';

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
    @inject(CanvasCirclePicker) private readonly circlePicker: IGraphicPicker, // 默认的circlePicker
    @inject(CanvasRectPicker) private readonly rectPicker: IGraphicPicker, // 默认的rectPicker
    @inject(CanvasArcPicker) private readonly arcPicker: IGraphicPicker, // 默认的arcPicker
    @inject(CanvasAreaPicker) private readonly areaPicker: IGraphicPicker, // 默认的areaPicker
    @inject(CanvasImagePicker) private readonly imagePicker: IGraphicPicker, // 默认的imagePicker
    @inject(CanvasLinePicker) private readonly linePicker: IGraphicPicker, // 默认的linePicker
    @inject(CanvasPathPicker) private readonly pathPicker: IGraphicPicker, // 默认的pathPicker
    @inject(CanvasSymbolPicker) private readonly symbolPicker: IGraphicPicker, // 默认的symbolPicker
    @inject(CanvasTextPicker) private readonly textPicker: IGraphicPicker, // 默认的textPicker
    @inject(CanvasPolygonPicker) private readonly polygonPicker: IGraphicPicker, // 默认的polygonPicker
    @inject(CanvasRichTextPicker) private readonly richtextPicker: IGraphicPicker, // 默认的richtextPicker

    @inject(DrawContribution)
    public readonly drawContribution: IDrawContribution,
    @inject(VGlobal) public readonly global: IGlobal,
    // 拦截器
    @inject(ContributionProvider)
    @named(PickItemInterceptor)
    protected readonly pickItemInterceptorContributions: IContributionProvider<IPickItemInterceptorContribution>
  ) {
    super(global, pickItemInterceptorContributions);
    this.global.hooks.onSetEnv.tap('canvas-picker-service', (_, env, global) => {
      this.configure(global, env);
    });
    this.configure(this.global, this.global.env);
    this.pickerMap = new Map();
  }

  @postConstruct()
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
    const options = {
      width: 100,
      height: 100,
      nativeCanvas: global.createCanvas({ width: 100, height: 100 }),
      id: 'for-pick'
    };
    this.pickCanvas = new BrowserCanvas(options);
    this.pickContext = this.pickCanvas.getContext('2d');
  }

  // todo: switch统一改为数字map
  pickItem(graphic: IGraphic, point: IPointLike, parentMatrix: IMatrix | null, params: IPickParams): IGraphic | null {
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
            return ret === true ? graphic : ret.graphic;
          }
        }
      }
    }
    const picker = this.pickerMap.get(graphic.numberType);
    if (!picker) {
      return null;
    }
    const data = picker.contains(graphic, point, params) ? graphic : null;

    if (data) {
      return data;
    }
    // 添加拦截器
    if (this.InterceptorContributions.length) {
      for (let i = 0; i < this.InterceptorContributions.length; i++) {
        const drawContribution = this.InterceptorContributions[i];
        if (drawContribution.afterPickItem) {
          const ret = drawContribution.afterPickItem(graphic, this, point, params, { parentMatrix });
          if (ret) {
            return ret === true ? graphic : ret.graphic;
          }
        }
      }
    }
    return data;
  }
}
