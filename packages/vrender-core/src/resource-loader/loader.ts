import type { IImage, ImagePayload, ResourceData } from '../interface';
import { application } from '../application';

const PARALLEL_NUMBER = 10;
export class ResourceLoader {
  private static cache: Map<string, ResourceData> = new Map();
  private static isLoading: boolean = false;
  private static toLoadAueue: { url: string; marks: ImagePayload[] }[] = [];
  private static onLoadSuccessCb: (() => void)[] = [];

  static GetImage(url: string, mark: ImagePayload) {
    const data = ResourceLoader.cache.get(url);
    if (data) {
      // 存在缓存
      if (data.loadState === 'fail') {
        // 资源请求失败，修改mark状态
        application.global.getRequestAnimationFrame()(() => {
          mark.imageLoadFail(url);
        });
      } else if (data.loadState === 'init' || data.loadState === 'loading') {
        // 资源padding队列加入mark信息
        data.waitingMark?.push(mark);
      } else if (mark) {
        mark.imageLoadSuccess(url, data.data as HTMLImageElement);
      }
    } else {
      ResourceLoader.loadImage(url, mark);
      // data = { type: 'image', loadState: 'init' };
      // ResourceLoader.cache.set(url, data);

      // data.dataPromise = application.global.loadImage(url);
      // if (!data.dataPromise) {
      //   // 无法获取资源，修改缓存和mark状态
      //   data.loadState = 'fail';
      //   mark.imageLoadFail(url);
      // } else {
      //   // 资源padding队列加入mark信息
      //   data.waitingMark = [mark];

      //   data.dataPromise.then(res => {
      //     data.loadState = res?.data ? 'success' : 'fail';
      //     data.data = res?.data;
      //     // 遍历资源padding队列，更新mark信息
      //     data.waitingMark?.map((mark: IImage, index) => {
      //       if (res?.data) {
      //         data.loadState = 'success';
      //         data.data = res.data;
      //         mark.imageLoadSuccess(url, res.data as HTMLImageElement);
      //       } else {
      //         data.loadState = 'fail';
      //         mark.imageLoadFail(url);
      //       }
      //     });
      //   });
      // }
    }
  }

  static GetSvg(svgStr: string, mark: IImage) {
    let data = ResourceLoader.cache.get(svgStr);
    if (data) {
      // 存在缓存
      if (data.loadState === 'fail') {
        // 资源请求失败，修改mark状态
        application.global.getRequestAnimationFrame()(() => {
          mark.imageLoadFail(svgStr);
        });
      } else if (data.loadState === 'init' || data.loadState === 'loading') {
        // 资源padding队列加入mark信息
        data.waitingMark?.push(mark);
      } else if (mark) {
        mark.imageLoadSuccess(svgStr, data.data as HTMLImageElement);
      }
    } else {
      data = { type: 'image', loadState: 'init' };
      ResourceLoader.cache.set(svgStr, data);

      data.dataPromise = application.global.loadSvg(svgStr);
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
          data.waitingMark && (data.waitingMark = []);
        });
      }
    }
  }

  static GetFile(url: string, type: 'json' | 'arrayBuffer' | 'blob') {
    let data = ResourceLoader.cache.get(url);
    if (data) {
      // 存在缓存
      if (data.loadState === 'fail') {
        return Promise.reject();
      } else if (data.loadState === 'init' || data.loadState === 'loading') {
        return data.dataPromise.then(data => data.data);
      }
      return Promise.resolve(data.data);
    }
    data = { type, loadState: 'init' };
    ResourceLoader.cache.set(url, data);

    if (type === 'arrayBuffer') {
      data.dataPromise = application.global.loadArrayBuffer(url);
    } else if (type === 'blob') {
      data.dataPromise = application.global.loadBlob(url);
    } else if (type === 'json') {
      data.dataPromise = application.global.loadJson(url);
    }

    return data.dataPromise.then(data => data.data);
  }

  static loading() {
    setTimeout(() => {
      if (!ResourceLoader.isLoading && ResourceLoader.toLoadAueue.length) {
        ResourceLoader.isLoading = true;
        const tasks = ResourceLoader.toLoadAueue.splice(0, PARALLEL_NUMBER);
        const promises: Promise<void>[] = [];
        tasks.forEach(task => {
          const { url, marks } = task;
          const data: ResourceData = { type: 'image', loadState: 'init' };
          ResourceLoader.cache.set(url, data);

          data.dataPromise = application.global.loadImage(url);
          if (!data.dataPromise) {
            // 无法获取资源，修改缓存和mark状态
            data.loadState = 'fail';
            // mark.imageLoadFail(url);
            marks.forEach(mark => mark.imageLoadFail(url));
          } else {
            // 资源padding队列加入mark信息
            // data.waitingMark = [mark];
            data.waitingMark = marks;

            const end = data.dataPromise.then(res => {
              data.loadState = res?.data ? 'success' : 'fail';
              data.data = res?.data;
              // 遍历资源padding队列，更新mark信息
              data.waitingMark?.map((mark: IImage, index) => {
                if (res?.data) {
                  data.loadState = 'success';
                  data.data = res.data;
                  // console.log(mark.attribute.y)
                  mark.imageLoadSuccess(url, res.data as HTMLImageElement);
                } else {
                  data.loadState = 'fail';
                  mark.imageLoadFail(url);
                }
              });

              data.waitingMark && (data.waitingMark = []);
            });

            promises.push(end);
          }
        });

        Promise.all(promises)
          .then(() => {
            ResourceLoader.isLoading = false;
            this.onLoadSuccessCb.forEach(cb => cb());
            ResourceLoader.loading();
          })
          .catch(error => {
            console.error(error);
            ResourceLoader.isLoading = false;
            this.onLoadSuccessCb.forEach(cb => cb());
            ResourceLoader.loading();
          });
      }
    }, 0);
  }

  static loadImage(url: string, mark: ImagePayload) {
    // find url in toLoadAueue
    const index = getIndex(url, ResourceLoader.toLoadAueue);
    if (index !== -1) {
      // add mark to aueue
      ResourceLoader.toLoadAueue[index].marks.push(mark);
      ResourceLoader.loading();
      return;
    }

    // add task to aueue
    ResourceLoader.toLoadAueue.push({ url, marks: [mark] });
    ResourceLoader.loading();
  }

  static improveImageLoading(url: string) {
    const index = getIndex(url, ResourceLoader.toLoadAueue);
    if (index !== -1) {
      const elememt = ResourceLoader.toLoadAueue.splice(index, 1);
      ResourceLoader.toLoadAueue.unshift(elememt[0]);
    }
  }

  static onLoadSuccess(cb: () => void) {
    this.onLoadSuccessCb.push(cb);
  }
}

function getIndex(url: string, arr: { url: string; marks: ImagePayload[] }[]) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i].url === url) {
      return i;
    }
  }
  return -1;
}
