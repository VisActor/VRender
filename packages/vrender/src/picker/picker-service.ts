import type { IMatrix, IPoint, IPointLike } from '@visactor/vutils';
import { Matrix, Point, IBounds } from '@visactor/vutils';
import { inject, injectable, named } from 'inversify';
import { foreach } from '../common/sort';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { ContributionProvider } from '../common/contribution-provider';
import type {
  IContext2d,
  IGraphic,
  IGroup,
  EnvType,
  IGlobal,
  IPickerService,
  IGraphicPicker,
  IPickParams,
  PickResult,
  IPickItemInterceptorContribution,
  IContributionProvider
} from '../interface';
import { DefaultAttribute, getTheme, mat3Tomat4, multiplyMat4Mat4 } from '../graphic';
import { mat4Allocate, matrixAllocate } from '../allocator/matrix-allocate';
import { PickItemInterceptor } from './pick-interceptor';
import { Global } from '../constants';

export const GraphicPicker = Symbol.for('GraphicPicker');

export const PickerService = Symbol.for('PickerService');

@injectable()
export abstract class DefaultPickService implements IPickerService {
  type: string = 'default';
  declare pickerMap: Map<number, IGraphicPicker>;
  declare pickContext?: IContext2d;
  declare InterceptorContributions: IPickItemInterceptorContribution[];

  constructor(
    @inject(Global) public readonly global: IGlobal,
    // 拦截器
    @inject(ContributionProvider)
    @named(PickItemInterceptor)
    protected readonly pickItemInterceptorContributions: IContributionProvider<IPickItemInterceptorContribution>
  ) {}

  protected _init() {
    this.InterceptorContributions = this.pickItemInterceptorContributions
      .getContributions()
      .sort((a, b) => a.order - b.order);
  }

  abstract configure(global: IGlobal, env: EnvType): void;

  // todo: params支持
  // todo: 性能优化
  pick(graphics: IGraphic[], point: IPoint, params: IPickParams): PickResult {
    let result: PickResult = {
      graphic: null,
      group: null
    };
    params.pickerService = this;
    let offsetX = 0;
    let offsetY = 0;
    if (params && params.bounds) {
      if (!params.bounds.contains(point.x, point.y)) {
        return result;
      }
      offsetX = params.bounds.x1;
      offsetY = params.bounds.y1;
    }
    if (this.pickContext) {
      this.pickContext.inuse = true;
    }
    params.pickContext = this.pickContext;
    this.pickContext && this.pickContext.clearMatrix(true, 1);

    const parentMatrix = new Matrix(1, 0, 0, 1, offsetX, offsetY);
    let group: IGroup;
    for (let i = graphics.length - 1; i >= 0; i--) {
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
    if (this.pickContext) {
      this.pickContext.inuse = false;
    }
    return result;
  }

  containsPoint(graphic: IGraphic, point: IPointLike, params: IPickParams): boolean {
    return !!this.pickItem(graphic, point, params);
  }

  // TODO: 支持3d模式的拾取和自定义path的拾取
  pickGroup(group: IGroup, point: IPointLike, parentMatrix: IMatrix, params: IPickParams): PickResult {
    let result: PickResult = {
      group: null,
      graphic: null
    };
    if (group.attribute.visibleAll === false) {
      return result;
    }
    const context = params.pickContext;
    const lastMatrix = context.modelMatrix;
    // 如果是3d，那么需要生成modelMatrix
    if (context.camera) {
      const m = group.transMatrix;
      const matrix = mat4Allocate.allocate();
      mat3Tomat4(matrix, m);
      if (lastMatrix) {
        if (matrix) {
          const m = mat4Allocate.allocate();
          context.modelMatrix = multiplyMat4Mat4(m, lastMatrix, matrix);
          mat4Allocate.free(matrix);
        }
      } else {
        // 转化context的matrix为lastMatrix
        mat3Tomat4(matrix, group.globalTransMatrix);
        context.modelMatrix = matrix;
      }
    }
    // 添加拦截器
    if (this.InterceptorContributions.length) {
      for (let i = 0; i < this.InterceptorContributions.length; i++) {
        const drawContribution = this.InterceptorContributions[i];
        if (drawContribution.beforePickItem) {
          const result = drawContribution.beforePickItem(group, this, point, params, { parentMatrix });
          if (result) {
            if (context.modelMatrix !== lastMatrix) {
              mat4Allocate.free(context.modelMatrix);
            }
            context.modelMatrix = lastMatrix;
            return result as PickResult;
          }
        }
      }
    }
    // 转换坐标空间
    const transMatrix = group.transMatrix;
    const currentGroupMatrix = matrixAllocate.allocateByObj(parentMatrix);
    const newPoint: IPoint = new Point(point.x, point.y);
    currentGroupMatrix.transformPoint(newPoint, newPoint);
    // todo: 支持带有path的group的选中
    const insideGroup = group.AABBBounds.containsPoint(newPoint);
    // 如果group没有被选中，直接跳过（如果是3d模式，那么继续）
    if (!insideGroup && !group.stage.camera) {
      return result;
    }
    const groupPicked = group.attribute.pickable !== false && insideGroup;

    currentGroupMatrix.multiply(
      transMatrix.a,
      transMatrix.b,
      transMatrix.c,
      transMatrix.d,
      transMatrix.e,
      transMatrix.f
    );
    if (group.attribute.childrenPickable !== false) {
      foreach(
        group,
        DefaultAttribute.zIndex,
        (graphic: IGraphic) => {
          if (graphic.isContainer) {
            // 偏移scrollX和scrollY
            const newPoint: IPoint = new Point(point.x, point.y);
            const theme = getTheme(group).group;
            const { scrollX = theme.scrollX, scrollY = theme.scrollY } = group.attribute;
            newPoint.x -= scrollX;
            newPoint.y -= scrollY;
            result = this.pickGroup(graphic as IGroup, newPoint, currentGroupMatrix, params);
          } else {
            const newPoint: IPoint = new Point(point.x, point.y);
            currentGroupMatrix.transformPoint(newPoint, newPoint);
            // 偏移scrollX和scrollY
            const theme = getTheme(group).group;
            const { scrollX = theme.scrollX, scrollY = theme.scrollY } = group.attribute;
            newPoint.x -= scrollX;
            newPoint.y -= scrollY;
            const pickedItem = this.pickItem(graphic, newPoint, params);
            result.graphic = pickedItem;
          }
          return !!result.graphic || !!result.group;
        },
        true,
        !!context.camera
      );
    }
    if (context.modelMatrix !== lastMatrix) {
      mat4Allocate.free(context.modelMatrix);
    }
    context.modelMatrix = lastMatrix;

    if (!result.graphic && !result.group && groupPicked && !group.stage.camera) {
      result.group = group;
    }
    matrixAllocate.free(currentGroupMatrix);
    return result;
  }

  // todo: switch统一改为数字map
  abstract pickItem(graphic: IGraphic, point: IPointLike, params: IPickParams): IGraphic | null;

  protected selectPicker(graphic: IGraphic): IGraphicPicker | null {
    const picker = this.pickerMap.get(graphic.numberType);
    if (!picker) {
      return null;
    }
    return picker;
  }
}
