import { ColorUtil } from '@visactor/vutils';
const { Color } = ColorUtil;

export function colorEqual(color1: string, color2: string): boolean {
  const c1 = Color.parseColorString(color1);
  const c2 = Color.parseColorString(color2);
  return c1 && c2 ? c1.r === c2.r && c1.g === c2.g && c1.b === c2.b && c1.opacity === c2.opacity : false;
}

export enum ColorType {
  Color255 = 0,
  Color1 = 1
}

export class ColorStore {
  private static store255: { [id: string]: [number, number, number, number] } = {};
  private static store1: { [id: string]: [number, number, number, number] } = {};
  static Get(
    str: string,
    size: number = ColorType.Color1,
    arr: [number, number, number, number] = [0, 0, 0, 1]
  ): [number, number, number, number] {
    if (size === ColorType.Color1) {
      const color: any = ColorStore.store1[str];
      if (color) {
        arr[0] = color[0];
        arr[1] = color[1];
        arr[2] = color[2];
        arr[3] = color[3];
        return arr;
      }
      const c = Color.parseColorString(str);
      if (c) {
        const data: [number, number, number, number] = [c.r / 255, c.g / 255, c.b / 255, c.opacity];
        ColorStore.store1[str] = data;
        // value[3] *= 255;
        ColorStore.store255[str] = [c.r, c.g, c.b, c.opacity];
        arr[0] = data[0];
        arr[1] = data[1];
        arr[2] = data[2];
        arr[3] = data[3];
      }
      return arr;
    }
    const color: any = ColorStore.store255[str];
    if (color) {
      arr[0] = color[0];
      arr[1] = color[1];
      arr[2] = color[2];
      arr[3] = color[3];
      return arr;
    }

    const c = Color.parseColorString(str);
    if (c) {
      ColorStore.store1[str] = [c.r / 255, c.g / 255, c.b / 255, c.opacity];
      // value[3] *= 255;
      ColorStore.store255[str] = [c.r, c.g, c.b, c.opacity];
      arr[0] = c.r;
      arr[1] = c.g;
      arr[2] = c.b;
      arr[3] = c.opacity;
    }
    return arr;
  }

  static Set(str: string, size: number, arr: [number, number, number, number]) {
    if (size === ColorType.Color1) {
      if (ColorStore.store1[str]) {
        return;
      }
      ColorStore.store1[str] = arr;
      ColorStore.store255[str] = [
        Math.floor(arr[0] * 255),
        Math.floor(arr[1] * 255),
        Math.floor(arr[2] * 255),
        Math.floor(arr[3] * 255)
      ];
    } else {
      if (ColorStore.store255[str]) {
        return;
      }
      ColorStore.store255[str] = arr;
      ColorStore.store1[str] = [arr[0] / 255, arr[1] / 255, arr[2] / 255, arr[3]];
    }
  }
}
