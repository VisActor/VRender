import { Matrix, type IMatrix } from '@visactor/vutils';
import type { ISkeletonJoint } from './interface';

export class SkeletonJoint implements ISkeletonJoint {
  private children: ISkeletonJoint[] = [];
  private localMatrix: Matrix = new Matrix();
  private worldMatrix: Matrix = new Matrix();
  parent: ISkeletonJoint | null = null;

  constructor(
    public name: string,
    public position: [number, number] = [0, 0],
    public rotation: number = 0,
    public scale: [number, number] = [1, 1],
    public pivot: [number, number] = [0, 0],
    public width: number = 0,
    public height: number = 0
  ) {}

  getWorldTransform(): Matrix {
    return this.worldMatrix;
  }

  getLocalTransform(): Matrix {
    return this.localMatrix;
  }

  setPosition(x: number, y: number) {
    this.position[0] = x;
    this.position[1] = y;
    this.updateWorldTransforms();
  }

  setRotation(rotation: number) {
    this.rotation = rotation;
    this.updateWorldTransforms();
  }

  setScale(x: number, y: number) {
    this.scale[0] = x;
    this.scale[1] = y;
    this.updateWorldTransforms();
  }

  addChild(joint: ISkeletonJoint) {
    this.children.push(joint);
    joint.parent = this;
    joint.updateWorldTransforms(this.worldMatrix);
  }

  setPivot(x: number, y: number) {
    this.pivot[0] = x;
    this.pivot[1] = y;
    this.updateWorldTransforms();
  }

  // 查找子节点
  findJoint(name: string, recursive: boolean = true): ISkeletonJoint | null {
    if (this.name === name) {
      return this;
    }
    if (recursive) {
      for (const child of this.children) {
        const result = child.findJoint(name, recursive);
        if (result) {
          return result;
        }
      }
    }
    return null;
  }

  updateWorldTransforms(parentMatrix?: IMatrix) {
    // 计算局部变换矩阵
    this.localMatrix
      .reset()
      .translate(this.position[0], this.position[1])
      .translate(this.pivot[0], this.pivot[1])
      .rotate(this.rotation)
      .scale(this.scale[0], this.scale[1])
      .translate(-this.pivot[0], -this.pivot[1]);

    // 计算世界矩阵
    if (parentMatrix) {
      this.worldMatrix.setValue(
        parentMatrix.a,
        parentMatrix.b,
        parentMatrix.c,
        parentMatrix.d,
        parentMatrix.e,
        parentMatrix.f
      );
      this.worldMatrix.multiply(
        this.localMatrix.a,
        this.localMatrix.b,
        this.localMatrix.c,
        this.localMatrix.d,
        this.localMatrix.e,
        this.localMatrix.f
      );
    } else {
      this.worldMatrix.setValue(
        this.localMatrix.a,
        this.localMatrix.b,
        this.localMatrix.c,
        this.localMatrix.d,
        this.localMatrix.e,
        this.localMatrix.f
      );
    }

    // 递归更新子节点
    this.children.forEach(child => child.updateWorldTransforms(this.worldMatrix));
  }

  release() {
    this.children.forEach(child => child.release());
    this.children = [];
    this.localMatrix.reset();
    this.worldMatrix.reset();
  }
}
