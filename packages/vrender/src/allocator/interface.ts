import { IArc, IArea, ICircle, ILine, IPath, IRect, ISymbol, IText, ICanvas } from '../interface';

export interface IAllocate<T> {
  allocate: (...d: any) => T;
  allocateByObj: (obj: T) => T;
  free: (d: T) => void;
  length: number;
}

export type ICanvasAllocate = IAllocate<ICanvas>;
export type IRectAllocate = IAllocate<IRect>;
export type IArcAllocate = IAllocate<IArc>;
export type IAreaAllocate = IAllocate<IArea>;
export type ICircleAllocate = IAllocate<ICircle>;
export type ILineAllocate = IAllocate<ILine>;
export type IPathAllocate = IAllocate<IPath>;
export type ISymbolAllocate = IAllocate<ISymbol>;
export type ITextAllocate = IAllocate<IText>;
