import type { AABBBounds, Matrix } from '@visactor/vutils';
import type { GraphicType, IGraphic, IGroup } from '../interface';
import { Group } from './group';

export class ShadowRoot extends Group {
  type: GraphicType = 'shadowroot';
  declare shadowHost: IGraphic;

  constructor(graphic?: IGraphic) {
    super({ x: 0, y: 0 });
    this.shadowHost = graphic;
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
  protected tryUpdateGlobalAABBBounds(): AABBBounds {
    const b = this.AABBBounds;
    if (!this._globalAABBBounds) {
      this._globalAABBBounds = b.clone();
    } else {
      this._globalAABBBounds.setValue(b.x1, b.y1, b.x2, b.y2);
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
