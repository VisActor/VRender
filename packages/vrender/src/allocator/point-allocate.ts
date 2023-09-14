// import { Point, IPoint, IPointLike } from '@visactor/vutils';
// import { IAllocate } from './interface';
// import { Disposable } from '../interface';

// export const PointLikeAllocate = Symbol.for('PointLikeAllocate');

// export type IPointLikeAllocate = IAllocate<IPointLike>;

// @injectable()
// export class DefaultPointLikeAllocate implements IAllocate<IPointLike>, Disposable {
//   protected pools: IPointLike[] = [];
//   allocate(x: number, y: number): IPointLike {
//     if (!this.pools.length) {
//       return { x, y };
//     }
//     const p = this.pools.pop() as any;
//     p.x = x;
//     p.y = y;
//     return p;
//   }
//   free(d: IPointLike) {
//     this.pools.push(d);
//   }
//   get length(): number {
//     return this.pools.length;
//   }
//   dispose(...params: any): void {
//     this.pools = [];
//   }
// }

// export const PointAllocate = Symbol.for('PointAllocate');

// export type IPointAllocate = IAllocate<IPoint>;

// @injectable()
// export class DefaultPointAllocate implements IAllocate<IPoint>, Disposable {
//   protected pools: IPoint[] = [];
//   allocate(x: number, y: number): IPoint {
//     if (!this.pools.length) {
//       return new Point(x, y);
//     }
//     const p = this.pools.pop() as any;
//     p.x = x;
//     p.y = y;
//     return p;
//   }
//   free(d: IPoint) {
//     this.pools.push(d);
//   }
//   get length(): number {
//     return this.pools.length;
//   }
//   dispose(...params: any): void {
//     this.pools = [];
//   }
// }
