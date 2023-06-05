import { IGraphic, IImage } from '../interface';
import { global } from '../modules';

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

interface ImagePayload {
  imageLoadFail: (url: string) => void;
  imageLoadSuccess: (url: string, data: HTMLImageElement) => void;
}

export class ResourceLoader {
  private static cache: Map<string, ResourceData> = new Map();

  static GetImage(url: string, mark: ImagePayload) {
    let data = ResourceLoader.cache.get(url);
    if (data) {
      // 存在缓存
      if (data.loadState === 'fail') {
        // 资源请求失败，修改mark状态
        global.getRequestAnimationFrame()(() => {
          mark.imageLoadFail(url);
        });
      } else if (data.loadState === 'init' || data.loadState === 'loading') {
        // 资源padding队列加入mark信息
        data.waitingMark?.push(mark);
      } else if (mark) {
        global.getRequestAnimationFrame()(() => {
          mark.imageLoadSuccess(url, data.data as HTMLImageElement);
        });
      }
    } else {
      data = { type: 'image', loadState: 'init' };
      ResourceLoader.cache.set(url, data);

      data.dataPromise = global.loadImage(url);
      if (!data.dataPromise) {
        // 无法获取资源，修改缓存和mark状态
        data.loadState = 'fail';
        mark.imageLoadFail(url);
      } else {
        // 资源padding队列加入mark信息
        data.waitingMark = [mark];

        data.dataPromise.then(res => {
          data.loadState = res?.data ? 'success' : 'fail';
          data.data = res?.data;
          // 遍历资源padding队列，更新mark信息
          data.waitingMark?.map((mark: IImage, index) => {
            if (res?.data) {
              data.loadState = 'success';
              data.data = res.data;
              mark.imageLoadSuccess(url, res.data as HTMLImageElement);
            } else {
              data.loadState = 'fail';
              mark.imageLoadFail(url);
            }
          });
        });
      }
    }
  }

  static GetSvg(svgStr: string, mark: IImage) {
    let data = ResourceLoader.cache.get(svgStr);
    if (data) {
      // 存在缓存
      if (data.loadState === 'fail') {
        // 资源请求失败，修改mark状态
        global.getRequestAnimationFrame()(() => {
          mark.imageLoadFail(svgStr);
        });
      } else if (data.loadState === 'init' || data.loadState === 'loading') {
        // 资源padding队列加入mark信息
        data.waitingMark?.push(mark);
      } else if (mark) {
        global.getRequestAnimationFrame()(() => {
          mark.imageLoadSuccess(svgStr, data.data as HTMLImageElement);
        });
      }
    } else {
      data = { type: 'image', loadState: 'init' };
      ResourceLoader.cache.set(svgStr, data);

      data.dataPromise = global.loadSvg(svgStr);
      if (!data.dataPromise) {
        // 无法获取资源，修改缓存和mark状态
        data.loadState = 'fail';
        mark.imageLoadFail(svgStr);
      } else {
        // 资源padding队列加入mark信息
        data.waitingMark = [mark];

        data.dataPromise.then(res => {
          data.loadState = res?.data ? 'success' : 'fail';
          data.data = res?.data;
          // 遍历资源padding队列，更新mark信息
          data.waitingMark?.map((mark: IImage, index) => {
            if (res?.data) {
              data.loadState = 'success';
              data.data = res.data;
              mark.imageLoadSuccess(svgStr, res.data as HTMLImageElement);
            } else {
              data.loadState = 'fail';
              mark.imageLoadFail(svgStr);
            }
          });
        });
      }
    }
  }

  static GetFile(url: string, type: 'json' | 'arrayBuffer' | 'blob') {
    let data = ResourceLoader.cache.get(url);
    if (data) {
      // 存在缓存
      if (data.loadState === 'init' || data.loadState === 'fail') {
        return Promise.reject();
      } else if (data.loadState === 'loading') {
        return data.dataPromise.then(data => data.data);
      }
      return Promise.resolve(data.data);
    }
    data = { type, loadState: 'init' };
    ResourceLoader.cache.set(url, data);

    if (type === 'arrayBuffer') {
      data.dataPromise = global.loadArrayBuffer(url);
    } else if (type === 'blob') {
      data.dataPromise = global.loadBlob(url);
    } else if (type === 'json') {
      data.dataPromise = global.loadJson(url);
    }

    return data.dataPromise.then(data => data.data);
  }
}
