import type { IGraphic } from '../interface';

function parseChildMap(graphic: IGraphic, defaultZIndex: number, reverse: boolean) {
  const childMap: { [id: number]: IGraphic[] } = {};
  const zIdxArray: number[] = [];

  graphic.forEachChildren((item: IGraphic) => {
    const { zIndex = defaultZIndex } = item.attribute;
    if (childMap[zIndex]) {
      childMap[zIndex].push(item);
    } else {
      childMap[zIndex] = [item];
      zIdxArray.push(zIndex);
    }
  }, reverse);
  zIdxArray.sort((a, b) => (reverse ? b - a : a - b));

  return { childMap, zIdxArray };
}

export function foreach(
  graphic: IGraphic,
  defaultZIndex: number,
  cb: (...data: any) => boolean | void,
  reverse: boolean = false,
  sort3d: boolean = false
) {
  // 遍历一遍查看是否有zIndex不同的
  let needSort = false;
  if (sort3d) {
    needSort = true;
  } else {
    let lastZIndex: number;
    graphic.forEachChildren((item: IGraphic, i: number) => {
      const { zIndex = defaultZIndex } = item.attribute;
      if (i === 0) {
        lastZIndex = zIndex;
      } else if (lastZIndex !== zIndex) {
        needSort = true;
        return true;
      }
      return false;
    }, reverse);
  }
  if (needSort) {
    const { childMap, zIdxArray } = parseChildMap(graphic, defaultZIndex, reverse);
    let skip = false;
    for (let i = 0; i < zIdxArray.length; i++) {
      if (skip) {
        break;
      }
      const idx = zIdxArray[i];
      const children = childMap[idx];
      // 根据z进行排序
      if (sort3d) {
        children.sort((a, b) => {
          return (reverse ? -1 : 1) * ((b.attribute.z ?? 0) - (a.attribute.z ?? 0));
        });
      }
      for (let i = 0; i < children.length; i++) {
        if (cb(children[i], i)) {
          skip = true;
          break;
        }
      }
    }
  } else {
    graphic.forEachChildren(cb, reverse);
  }
}

export async function foreachAsync(
  graphic: IGraphic,
  defaultZIndex: number,
  cb: (data: any, i: number) => boolean | void | Promise<boolean | void>,
  reverse: boolean = false
) {
  // 不支持zIndex
  await graphic.forEachChildrenAsync(cb, reverse);
  // const childMap: { [id: number]: IGraphic[] } = {};
  // const zIdxArray: number[] = [];
  // // 遍历一遍查看是否有zIndex不同的
  // let needSort = false;
  // let lastZIndex: number;
  // graphic.forEachChildren((item: IGraphic, i: number) => {
  //   const { zIndex = defaultZIndex } = item.attribute;
  //   if (i === 0) {
  //     lastZIndex === zIndex;
  //   } else if (lastZIndex !== zIndex) {
  //     needSort = true;
  //     return true;
  //   }
  //   return false;
  // }, reverse);
  // if (needSort) {
  //   graphic.forEachChildren((item: IGraphic) => {
  //     const { zIndex = defaultZIndex } = item.attribute;
  //     if (childMap[zIndex]) {
  //       childMap[zIndex].push(item);
  //     } else {
  //       childMap[zIndex] = [item];
  //       zIdxArray.push(zIndex);
  //     }
  //   }, reverse);
  //   zIdxArray.sort((a, b) => (reverse ? b - a : a - b));
  //   let skip = false;
  //   for (let i = 0; i < zIdxArray.length; i++) {
  //     if (skip) {
  //       break;
  //     }
  //     const idx = zIdxArray[i];
  //     const children = childMap[idx];
  //     for (let i = 0; i < children.length; i++) {
  //       let d = cb(children[i], i);
  //       if ((d as any).then) {
  //         d = await d;
  //       }
  //       if (d) {
  //         skip = true;
  //         break;
  //       }
  //     }
  //   }
  // } else {
  //   await graphic.forEachChildrenAsync(cb, reverse);
  // }
}

export function findNextGraphic(graphic: IGraphic, id: number, defaultZIndex: number, reverse: boolean = false) {
  // 遍历一遍查看是否有zIndex不同的
  let needSort = false;
  let lastZIndex: number;
  graphic.forEachChildren((item: IGraphic, i: number) => {
    const { zIndex = defaultZIndex } = item.attribute;
    if (i === 0) {
      lastZIndex === zIndex;
    } else if (lastZIndex !== zIndex) {
      needSort = true;
      return true;
    }
    return false;
  }, reverse);
  let result: IGraphic | null = null;
  let next: boolean = false;
  if (needSort) {
    const { childMap, zIdxArray } = parseChildMap(graphic, defaultZIndex, reverse);
    let skip = false;
    for (let i = 0; i < zIdxArray.length; i++) {
      if (skip) {
        break;
      }
      const idx = zIdxArray[i];
      const children = childMap[idx];
      for (let i = 0; i < children.length; i++) {
        if (next) {
          skip = true;
          result = children[i];
          break;
        }
        if (children[i]._uid === id) {
          next = true;
          continue;
        }
      }
    }
  } else {
    graphic.forEachChildren(item => {
      if (next) {
        result = item as IGraphic;
        return true;
      }
      if (item._uid === id) {
        next = true;
      }
      return false;
    }, reverse);
  }

  return result;
}
