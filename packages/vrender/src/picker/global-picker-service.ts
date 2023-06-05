import { Matrix, Point, IMatrix, IPoint, IPointLike } from '@visactor/vutils';
import { inject, injectable } from 'inversify';
import { IGraphic, IGroup, EnvType, Global, IGlobal } from '../interface';
import { IGraphicPicker, IPickerService, IPickParams } from './picker-service';
import { PickResult } from './type';

export const BoundsPicker = Symbol.for('BoundsPicker');

export interface IBoundsPicker {
  type: string;
  numberType?: number;

  contains: (graphic: IGraphic, point: IPointLike, params?: IPickParams) => boolean;
}

export const GlobalPickerService = Symbol.for('GlobalPickerService');

// 默认的pick-service，提供基本的最优选中策略，尽量不需要用户自己实现contribution
// 用户可以写plugin
@injectable()
export class DefaultGlobalPickerService implements IPickerService {
  type: 'global';

  declare pickerMap: Map<number, IGraphicPicker>;

  constructor(
    // @inject(ContributionProvider)
    // @named(PickerContribution)
    // protected readonly contributions: ContributionProvider<IPickerContribution>,
    @inject(Global) public readonly global: IGlobal
  ) {
    this.global.hooks.onSetEnv.tap('global-picker-service', (lastEnv, env, global) => {
      this.configure(global, env);
    });
    this.configure(this.global, this.global.env);
  }

  configure(global: IGlobal, env: EnvType) {
    // if (!this.global.env) return;
    // this.contributions.getContributions().forEach(handlerContribution => {
    //   handlerContribution.configure(this, this.global);
    // });
  }

  // todo: params支持
  // todo: 性能优化
  pick(graphics: IGraphic[], point: IPointLike, params?: IPickParams): PickResult {
    let result: PickResult = {
      graphic: null,
      group: null
    };
    const parentMatrix = new Matrix(1, 0, 0, 1, 0, 0);
    let group: IGroup;
    for (let i = 0; i < graphics.length; i++) {
      if (graphics[i].isContainer) {
        result = this.pickGroup(graphics[i] as IGroup, point, parentMatrix, params);
      } else {
        result.graphic = this.pickItem(graphics[i], point, params);
      }
      if (result.graphic) {
        break;
      }
      if (!group) {
        group = result.group;
      }
    }
    if (!result.graphic) {
      result.group = group;
    }
    return result;
  }

  containsPoint(graphic: IGraphic, point: IPointLike, params?: IPickParams): boolean {
    return !!this.pickItem(graphic, point, params);
  }

  pickGroup(group: IGroup, point: IPointLike, parentMatrix: IMatrix, params?: IPickParams): PickResult {
    let result: PickResult = {
      group: null,
      graphic: null
    };
    if (group.attribute.visibleAll === false) {
      return result;
    }
    // 转换坐标空间
    const transMatrix = group.transMatrix;

    const newPoint: IPoint = new Point(point.x, point.y);
    parentMatrix.transformPoint(newPoint, newPoint);
    const insideGroup = group.AABBBounds.containsPoint(newPoint);
    // 如果group没有被选中，直接跳过
    if (!insideGroup) {
      return result;
    }
    // todo: 支持带有path的group的选中
    const groupPicked = group.attribute.pickable !== false && insideGroup;

    parentMatrix.multiply(transMatrix.a, transMatrix.b, transMatrix.c, transMatrix.d, transMatrix.e, transMatrix.f);

    if (group.attribute.childrenPickable !== false) {
      group.forEachChildren((graphic: IGraphic) => {
        if (graphic.isContainer) {
          result = this.pickGroup(graphic as IGroup, point, parentMatrix, params);
        } else {
          const newPoint: IPoint = new Point(point.x, point.y);
          parentMatrix.transformPoint(newPoint, newPoint);
          result.graphic = this.pickItem(graphic, newPoint, params);
        }
        return !!result.graphic || !!result.group;
      });
    }

    if (!result.graphic && !result.group && groupPicked) {
      result.group = group;
    }

    return result;
  }

  // todo: switch统一改为数字map
  pickItem(graphic: IGraphic, point: IPointLike, params?: IPickParams): IGraphic | null {
    if (graphic.attribute.pickable === false) {
      return null;
    }
    if (graphic.AABBBounds.containsPoint(point)) {
      return graphic;
    }
    return null;
  }
}
