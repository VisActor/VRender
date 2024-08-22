import type { IMatrix, IPointLike } from '@visactor/vutils';
import { Point } from '@visactor/vutils';
import { injectable } from '../common/inversify-lite';
import type {
  IContext2d,
  IGraphic,
  IGroup,
  IPickItemInterceptorContribution,
  IPickParams,
  IPickerService,
  PickResult
} from '../interface';
import { matrixAllocate } from '../allocator/matrix-allocate';
import { draw3dItem } from '../common/3d-interceptor';
import { getTheme } from '../graphic';

// 拦截器
export const PickItemInterceptor = Symbol.for('PickItemInterceptor');

/**
 * 影子节点拦截器，用于渲染影子节点
 */
@injectable()
export class ShadowRootPickItemInterceptorContribution implements IPickItemInterceptorContribution {
  order: number = 1;
  afterPickItem(
    graphic: IGraphic,
    pickerService: IPickerService,
    point: IPointLike,
    pickParams: IPickParams,
    params?: {
      parentMatrix: IMatrix;
    }
  ): null | PickResult {
    if (graphic.attribute.shadowRootIdx > 0 || !graphic.attribute.shadowRootIdx) {
      return this._pickItem(graphic, pickerService, point, pickParams, params);
    }
    return null;
  }

  beforePickItem(
    graphic: IGraphic,
    pickerService: IPickerService,
    point: IPointLike,
    pickParams: IPickParams,
    params?: {
      parentMatrix: IMatrix;
    }
  ): null | PickResult {
    if (graphic.attribute.shadowRootIdx < 0) {
      return this._pickItem(graphic, pickerService, point, pickParams, params);
    }
    return null;
  }

  protected _pickItem(
    graphic: IGraphic,
    pickerService: IPickerService,
    point: IPointLike,
    pickParams: IPickParams,
    params?: {
      parentMatrix: IMatrix;
    }
  ): PickResult | null {
    if (!graphic.shadowRoot) {
      return null;
    }
    const { parentMatrix } = params || {};
    if (!parentMatrix) {
      return null;
    }

    const context = pickerService.pickContext;
    context.highPerformanceSave();

    const theme = (getTheme(graphic) as any)?.[graphic.type];
    const { shadowPickMode = theme?.shadowPickMode } = graphic.attribute;
    const g = graphic.shadowRoot;
    const currentGroupMatrix = matrixAllocate.allocateByObj(parentMatrix);
    const newPoint = new Point(
      currentGroupMatrix.a * point.x + currentGroupMatrix.c * point.y + currentGroupMatrix.e,
      currentGroupMatrix.b * point.x + currentGroupMatrix.d * point.y + currentGroupMatrix.f
    );
    // const transMatrix = graphic.transMatrix;
    // currentGroupMatrix.multiply(
    //   transMatrix.a,
    //   transMatrix.b,
    //   transMatrix.c,
    //   transMatrix.d,
    //   transMatrix.e,
    //   transMatrix.f
    // );

    // currentGroupMatrix.transformPoint(newPoint, newPoint);
    const result = pickerService.pickGroup(g, newPoint, currentGroupMatrix, pickParams);

    context.highPerformanceRestore();

    // 影子节点pick到group也算pick到graphic
    if (!result.graphic && result.group && shadowPickMode === 'full') {
      result.graphic = result.group;
    }

    return result;
  }
}

@injectable()
export class InteractivePickItemInterceptorContribution implements IPickItemInterceptorContribution {
  order: number = 1;

  beforePickItem(
    graphic: IGraphic,
    pickerService: IPickerService,
    point: IPointLike,
    pickParams: IPickParams,
    params?: {
      parentMatrix: IMatrix;
    }
  ): null | PickResult {
    const originGraphic = graphic.baseGraphic;
    if (originGraphic && originGraphic.parent) {
      const newPoint = new Point(point.x, point.y);
      const context = pickerService.pickContext;
      context.highPerformanceSave();
      const parentMatrix = originGraphic.parent.globalTransMatrix;
      parentMatrix.transformPoint(newPoint, newPoint);

      const result = originGraphic.isContainer
        ? pickerService.pickGroup(originGraphic, newPoint.clone(), parentMatrix, pickParams)
        : pickerService.pickItem(originGraphic, newPoint.clone(), parentMatrix, pickParams);
      context.highPerformanceRestore();
      return result;
    }
    return null;
  }
}

/**
 * 3d拦截器，用于渲染3d视角
 */
@injectable()
export class Canvas3DPickItemInterceptor implements IPickItemInterceptorContribution {
  // canvas?: ICanvas;
  order: number = 1;

  beforePickItem(
    graphic: IGraphic,
    pickerService: IPickerService,
    point: IPointLike,
    pickParams: IPickParams,
    params?: {
      parentMatrix: IMatrix;
    }
  ) {
    if (!graphic.in3dMode || pickParams.in3dInterceptor) {
      return null;
    }

    const context = pickerService.pickContext;
    const stage = graphic.stage;
    if (!(context && stage)) {
      return null;
    }
    pickParams.in3dInterceptor = true;

    // 使用3d模式渲染
    context.save();
    this.initCanvasCtx(context);
    context.camera = stage.camera;

    // 设置context的transform到上一个节点
    if (graphic.isContainer) {
      const result = draw3dItem(
        context,
        graphic,
        () => {
          return pickerService.pickGroup(graphic as IGroup, point, params.parentMatrix, pickParams);
        },
        pickParams
      );

      context.camera = null;

      pickParams.in3dInterceptor = false;
      context.restore();
      return result;
    }
    context.restore();
    return null;
  }

  initCanvasCtx(context: IContext2d) {
    context.setTransformForCurrent();
  }
}
