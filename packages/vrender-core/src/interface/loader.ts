export type SupportResourceType =
  | 'json'
  | 'image'
  | 'svg'
  | 'bitmap'
  | 'canvas'
  | 'arrayBuffer'
  | 'blob'
  | 'imageData'
  | 'offscreenCanvas';

export interface ResourceData {
  type: SupportResourceType; // 资源类型
  data?:
    | HTMLImageElement
    | ImageBitmap
    | OffscreenCanvas
    | ArrayBuffer
    | Blob
    | ImageData
    | { [id: string]: any }
    | null; // 资源的数据
  dataPromise?: Promise<{
    loadState: 'success' | 'fail';
    data: HTMLImageElement | ImageData | ArrayBuffer | Blob | Record<string, unknown> | null;
  }>; // loader返回的promise，可能会修改原始loader的返回值
  loadState: 'init' | 'loading' | 'success' | 'fail'; // 资源的状态
  waitingMark?: ImagePayload[]; // 使用该资源的VRender Mark，资源加载完成后，逐一处理Mark中的逻辑
}

export interface ImagePayload {
  imageLoadFail: (url: string) => void;
  imageLoadSuccess: (url: string, data: HTMLImageElement) => void;
}
