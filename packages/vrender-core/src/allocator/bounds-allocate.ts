import type { IAABBBounds } from '@visactor/vutils';
import { AABBBounds } from '@visactor/vutils';
import type { Releaseable, IAllocate } from '../interface';

export const BoundsAllocate = Symbol.for('BoundsAllocate');

export class DefaultBoundsAllocate implements IAllocate<IAABBBounds>, Releaseable {
  protected pools: IAABBBounds[] = [];
  constructor() {
    // 默认添加10个
    for (let i = 0; i < 10; i++) {
      this.pools.push(new AABBBounds());
    }
  }
  allocate(x1: number, y1: number, x2: number, y2: number): IAABBBounds {
    if (!this.pools.length) {
      return new AABBBounds().setValue(x1, y1, x2, y2);
    }
    const b = this.pools.pop();
    b.x1 = x1;
    b.y1 = y1;
    b.x2 = x2;
    b.y2 = y2;
    return b;
  }
  allocateByObj(b: IAABBBounds): IAABBBounds {
    if (!this.pools.length) {
      return new AABBBounds(b as any);
    }
    const _b = this.pools.pop() as any;
    _b.x1 = b.x1;
    _b.y1 = b.y1;
    _b.x2 = b.x2;
    _b.y2 = b.y2;
    return _b;
  }
  free(b: IAABBBounds) {
    this.pools.push(b);
  }
  get length(): number {
    return this.pools.length;
  }
  release(...params: any): void {
    this.pools = [];
  }
}

export const boundsAllocate = new DefaultBoundsAllocate();
