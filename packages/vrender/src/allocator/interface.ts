export interface IAllocate<T> {
  allocate: (...d: any) => T;
  allocateByObj: (obj: T) => T;
  free: (d: T) => void;
  length: number;
}
