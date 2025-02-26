import { Matrix, type IMatrix } from '@visactor/vutils';
import type { ISkeletonJoint } from './interface';
import type { IGroup } from '@visactor/vrender-core';

export class SkeletonJoint implements ISkeletonJoint {
  private children: ISkeletonJoint[] = [];
  private localMatrix: Matrix = new Matrix();
  parent: ISkeletonJoint | null = null;
  private _graphic: IGroup | null = null;
  constructor(
    public name: string,
    public position: [number, number] = [0, 0],
    public rotation: number = 0,
    public scale: [number, number] = [1, 1],
    public pivot: [number, number] = [0, 0],
    public width: number = 0,
    public height: number = 0
  ) {}

  getLocalTransform(): Matrix {
    return this.localMatrix;
  }

  getChildren(): ISkeletonJoint[] {
    return this.children;
  }

  setGraphic(graphic: IGroup) {
    this._graphic = graphic;
  }

  getGraphic(): IGroup {
    return this._graphic;
  }

  setPosition(x: number, y: number) {
    this.position[0] = x;
    this.position[1] = y;
    this.updateTransforms();
  }

  setRotation(rotation: number) {
    this.rotation = rotation;
    this.updateTransforms();
  }

  setScale(x: number, y: number) {
    this.scale[0] = x;
    this.scale[1] = y;
    this.updateTransforms();
  }

  addChild(joint: ISkeletonJoint) {
    this.children.push(joint);
    joint.parent = this;
    joint.updateTransforms();
  }

  setPivot(x: number, y: number) {
    this.pivot[0] = x;
    this.pivot[1] = y;
    this.updateTransforms();
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

  updateTransforms() {
    // 计算局部变换矩阵
    this.localMatrix
      .reset()
      .translate(this.position[0], this.position[1])
      .translate(this.pivot[0], this.pivot[1])
      .rotate(this.rotation)
      .scale(this.scale[0], this.scale[1])
      .translate(-this.pivot[0], -this.pivot[1]);
  }

  release() {
    this.children.forEach(child => child.release());
    this.children = [];
    this.localMatrix.reset();
  }
}
