import type { IAABBBounds, Matrix } from '@visactor/vutils';
import type { GraphicType, IGraphic, IGroup } from '../interface';
import { Group } from './group';

export class ShadowRoot extends Group {
  type: GraphicType = 'shadowroot';
  declare shadowHost: IGraphic;

  constructor(graphic?: IGraphic) {
    super({ x: 0, y: 0 });
    this.shadowHost = graphic;
  }

  protected override clearUpdateBoundTag(): void {
    super.clearUpdateBoundTag();
    if (this.shadowHost) {
      this.shadowHost.clearUpdateBoundTag();
    }
  }

  override addUpdateBoundTag() {
    super.addUpdateBoundTag();

    if (this.shadowHost) {
      this.shadowHost.addUpdateBoundTag();
    }
  }

  override addUpdateShapeAndBoundsTag() {
    super.addUpdateShapeAndBoundsTag();
    if (this.shadowHost) {
      this.shadowHost.addUpdateBoundTag();
    }
  }

  // 计算localMatrix不受影响
  // 计算globalMatrix需要用到shadowHost的globalMatrix
  protected tryUpdateGlobalTransMatrix(clearTag: boolean = true): Matrix {
    if (this.shouldUpdateGlobalMatrix()) {
      const m = this.transMatrix;
      if (!this._globalTransMatrix) {
        this._globalTransMatrix = m.clone();
      } else {
        this._globalTransMatrix.setValue(m.a, m.b, m.c, m.d, m.e, m.f);
      }
      this.doUpdateGlobalMatrix();
      clearTag && this.clearUpdateGlobalPositionTag();
    }
    return this._globalTransMatrix;
  }
  protected doUpdateGlobalMatrix() {
    if (this.shadowHost) {
      // 基于shadowHost的matrix修改
      const parentMatrix = this.shadowHost.globalTransMatrix;
      this._globalTransMatrix.multiply(
        parentMatrix.a,
        parentMatrix.b,
        parentMatrix.c,
        parentMatrix.d,
        parentMatrix.e,
        parentMatrix.f
      );
    }
  }
  // 计算AABBBounds不受影响
  // 计算globalAABBBounds
  protected tryUpdateGlobalAABBBounds(): IAABBBounds {
    if (!this._globalAABBBounds) {
      this._globalAABBBounds = this._AABBBounds.clone();
    } else {
      this._globalAABBBounds.setValue(
        this._AABBBounds.x1,
        this._AABBBounds.y1,
        this._AABBBounds.x2,
        this._AABBBounds.y2
      );
    }
    // 使用shadowHost的grloalAABBBounds
    // todo: 考虑是否需要性能优化
    if (this.shadowHost) {
      this._globalAABBBounds.transformWithMatrix(this.shadowHost.globalTransMatrix);
    }
    return this._globalAABBBounds;
  }
}

export function createShadowRoot(graphic?: IGraphic): IGroup {
  return new ShadowRoot(graphic);
}
