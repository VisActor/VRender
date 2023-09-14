import type { IMatrix, IPointLike } from '@visactor/vutils';
// eslint-disable-next-line
import { ContributionProvider } from '../common/contribution-provider';
import { inject, injectable, named, postConstruct } from '../common/inversify-lite';
import type {
  ICanvas,
  IContext2d,
  IGraphic,
  EnvType,
  IGlobal,
  IGraphicPicker,
  IPickerService,
  IContributionProvider,
  IPickItemInterceptorContribution,
  IPickParams
} from '../interface';
import { DefaultPickService } from './picker-service';
import { EmptyContext2d } from '../canvas';
import { MathPickerContribution } from './contributions/constants';
import { VGlobal } from '../constants';
import { PickItemInterceptor } from './pick-interceptor';

// 默认的pick-service，提供基本的最优选中策略，尽量不需要用户自己实现contribution
// 用户可以写plugin
@injectable()
export class DefaultMathPickerService extends DefaultPickService implements IPickerService {
  declare type: 'default';
  // pcik canvas
  declare pickCanvas: ICanvas;
  declare pickContext: IContext2d;
  declare pickerMap: Map<number, IGraphicPicker>;

  constructor(
    @inject(ContributionProvider)
    @named(MathPickerContribution)
    protected readonly contributions: IContributionProvider<IGraphicPicker>,
    @inject(VGlobal) public readonly global: IGlobal,
    // 拦截器
    @inject(ContributionProvider)
    @named(PickItemInterceptor)
    protected readonly pickItemInterceptorContributions: IContributionProvider<IPickItemInterceptorContribution>
  ) {
    super(global, pickItemInterceptorContributions);
    this.global.hooks.onSetEnv.tap('math-picker-service', (lastEnv, env, global) => {
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
    this.pickContext = new EmptyContext2d(null, 1);
  }

  // todo: switch统一改为数字map
  pickItem(graphic: IGraphic, point: IPointLike, parentMatrix: IMatrix | null, params?: IPickParams): IGraphic | null {
    if (graphic.attribute.pickable === false) {
      return null;
    }
    const picker = this.pickerMap.get(graphic.numberType);
    if (!picker) {
      return null;
    }
    return picker.contains(graphic, point, params) ? graphic : null;
  }
}
