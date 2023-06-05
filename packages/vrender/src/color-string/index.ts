/* MIT license */
/**
 * Copyright (c) 2011 Heather Arthur <fayearthur@gmail.com>

  Permission is hereby granted, free of charge, to any person obtaining
  a copy of this software and associated documentation files (the
  "Software"), to deal in the Software without restriction, including
  without limitation the rights to use, copy, modify, merge, publish,
  distribute, sublicense, and/or sell copies of the Software, and to
  permit persons to whom the Software is furnished to do so, subject to
  the following conditions:

  The above copyright notice and this permission notice shall be
  included in all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
  MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
  NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
  LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
  OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
  WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
// 基于color-string
// https://github.com/Qix-/color-string
import { has } from '@visactor/vutils';
import colorNames from './colorName';

const reverseNames = {};

// create a list of reverse color names
for (const name in colorNames) {
  if (has(colorNames, name)) {
    reverseNames[colorNames[name]] = name;
  }
}

const cs: any = {
  to: {},
  get: {}
};

interface ColorParseType {
  model: string;
  value: [number, number, number, number];
}

cs.get = function (str: string, arr: [number, number, number, number] = [0, 0, 0, 1]) {
  const prefix = str.substring(0, 3).toLowerCase();
  let val;
  let model;
  switch (prefix) {
    case 'hsl':
      val = cs.get.hsl(str, arr);
      model = 'hsl';
      break;
    case 'hwb':
      val = cs.get.hwb(str, arr);
      model = 'hwb';
      break;
    default:
      val = cs.get.rgb(str, arr);
      model = 'rgb';
      break;
  }

  if (!val) {
    return null;
  }

  return { model: model, value: val };
};

cs.get.rgb = function (str: string, arr: [number, number, number, number] = [0, 0, 0, 1]) {
  if (!str) {
    return null;
  }

  const abbr = /^#([a-f0-9]{3,4})$/i;
  const hex = /^#([a-f0-9]{6})([a-f0-9]{2})?$/i;
  const rgba = /^rgba?\(\s*([+-]?\d+)\s*,\s*([+-]?\d+)\s*,\s*([+-]?\d+)\s*(?:,\s*([+-]?[\d.]+)\s*)?\)$/;
  const per = /^rgba?\(\s*([+-]?[\d.]+)%\s*,\s*([+-]?[\d.]+)%\s*,\s*([+-]?[\d.]+)%\s*(?:,\s*([+-]?[\d.]+)\s*)?\)$/;
  const keyword = /(\D+)/;

  const rgb = arr;
  let match;
  let i;
  let hexAlpha;

  if ((match = str.match(hex))) {
    hexAlpha = match[2];
    match = match[1];

    for (i = 0; i < 3; i++) {
      // https://jsperf.com/slice-vs-substr-vs-substring-methods-long-string/19
      const i2 = i * 2;
      rgb[i] = parseInt(match.slice(i2, i2 + 2), 16);
    }

    if (hexAlpha) {
      rgb[3] = Math.round((parseInt(hexAlpha, 16) / 255) * 100) / 100;
    }
  } else if ((match = str.match(abbr))) {
    match = match[1];
    hexAlpha = match[3];

    for (i = 0; i < 3; i++) {
      rgb[i] = parseInt(match[i] + match[i], 16);
    }

    if (hexAlpha) {
      rgb[3] = Math.round((parseInt(hexAlpha + hexAlpha, 16) / 255) * 100) / 100;
    }
  } else if ((match = str.match(rgba))) {
    for (i = 0; i < 3; i++) {
      rgb[i] = parseInt(match[i + 1], 10);
    }

    if (match[4]) {
      rgb[3] = parseFloat(match[4]);
    }
  } else if ((match = str.match(per))) {
    for (i = 0; i < 3; i++) {
      rgb[i] = Math.round(parseFloat(match[i + 1]) * 2.55);
    }

    if (match[4]) {
      rgb[3] = parseFloat(match[4]);
    }
  } else if ((match = str.match(keyword))) {
    if (match[1] === 'transparent') {
      return [0, 0, 0, 0];
    }

    const _color = colorNames[match[1]];
    rgb[0] = _color[0];
    rgb[1] = _color[1];
    rgb[2] = _color[2];
    rgb[3] = _color[3];

    if (!rgb) {
      return null;
    }

    rgb[3] = 1;

    return rgb;
  } else {
    return null;
  }

  for (i = 0; i < 3; i++) {
    rgb[i] = clamp(rgb[i], 0, 255);
  }
  rgb[3] = clamp(rgb[3], 0, 1);

  return rgb;
};

cs.get.hsl = function (str: string, arr: [number, number, number, number] = [0, 0, 0, 1]) {
  if (!str) {
    return null;
  }

  const hsl =
    /^hsla?\(\s*([+-]?(?:\d*\.)?\d+)(?:deg)?\s*,\s*([+-]?[\d.]+)%\s*,\s*([+-]?[\d.]+)%\s*(?:,\s*([+-]?[\d.]+)\s*)?\)$/;
  const match = str.match(hsl);

  if (match) {
    const alpha = parseFloat(match[4]);
    // var h = (parseFloat(match[1]) + 360) % 360;
    // var s = clamp(parseFloat(match[2]), 0, 100);
    // var l = clamp(parseFloat(match[3]), 0, 100);
    // var a = clamp(isNaN(alpha) ? 1 : alpha, 0, 1);

    // return [h, s, l, a];
    arr[0] = (parseFloat(match[1]) + 360) % 360;
    arr[1] = clamp(parseFloat(match[2]), 0, 100);
    arr[2] = clamp(parseFloat(match[3]), 0, 100);
    arr[3] = clamp(isNaN(alpha) ? 1 : alpha, 0, 1);
    return arr;
  }

  return null;
};

cs.get.hwb = function (str: string, arr: [number, number, number, number] = [0, 0, 0, 1]) {
  if (!str) {
    return null;
  }

  const hwb =
    /^hwb\(\s*([+-]?\d*[.]?\d+)(?:deg)?\s*,\s*([+-]?[\d.]+)%\s*,\s*([+-]?[\d.]+)%\s*(?:,\s*([+-]?[\d.]+)\s*)?\)$/;
  const match = str.match(hwb);

  if (match) {
    const alpha = parseFloat(match[4]);
    // var h = ((parseFloat(match[1]) % 360) + 360) % 360;
    // var w = clamp(parseFloat(match[2]), 0, 100);
    // var b = clamp(parseFloat(match[3]), 0, 100);
    // var a = clamp(isNaN(alpha) ? 1 : alpha, 0, 1);
    // return [h, w, b, a];
    arr[0] = ((parseFloat(match[1]) % 360) + 360) % 360;
    arr[1] = clamp(parseFloat(match[2]), 0, 100);
    arr[2] = clamp(parseFloat(match[3]), 0, 100);
    arr[3] = clamp(isNaN(alpha) ? 1 : alpha, 0, 1);
    return arr;
  }

  return null;
};

cs.to.hex = function (...args: number[]) {
  const rgba = args;

  return (
    '#' +
    hexDouble(rgba[0]) +
    hexDouble(rgba[1]) +
    hexDouble(rgba[2]) +
    (rgba[3] < 1 ? hexDouble(Math.round(rgba[3] * 255)) : '')
  );
};

cs.to.rgb = function (...args: number[]) {
  const rgba = args;

  return rgba.length < 4 || rgba[3] === 1
    ? 'rgb(' + Math.round(rgba[0]) + ', ' + Math.round(rgba[1]) + ', ' + Math.round(rgba[2]) + ')'
    : 'rgba(' + Math.round(rgba[0]) + ', ' + Math.round(rgba[1]) + ', ' + Math.round(rgba[2]) + ', ' + rgba[3] + ')';
};

cs.to.rgb.percent = function (...args: number[]) {
  const rgba = args;

  const r = Math.round((rgba[0] / 255) * 100);
  const g = Math.round((rgba[1] / 255) * 100);
  const b = Math.round((rgba[2] / 255) * 100);

  return rgba.length < 4 || rgba[3] === 1
    ? 'rgb(' + r + '%, ' + g + '%, ' + b + '%)'
    : 'rgba(' + r + '%, ' + g + '%, ' + b + '%, ' + rgba[3] + ')';
};

cs.to.hsl = function (...args: any[]) {
  const hsla = args;
  return hsla.length < 4 || hsla[3] === 1
    ? 'hsl(' + hsla[0] + ', ' + hsla[1] + '%, ' + hsla[2] + '%)'
    : 'hsla(' + hsla[0] + ', ' + hsla[1] + '%, ' + hsla[2] + '%, ' + hsla[3] + ')';
};

// hwb is a bit different than rgb(a) & hsl(a) since there is no alpha specific syntax
// (hwb have alpha optional & 1 is default value)
cs.to.hwb = function (...args: any[]) {
  const hwba = args;

  let a = '';
  if (hwba.length >= 4 && hwba[3] !== 1) {
    a = ', ' + hwba[3];
  }

  return 'hwb(' + hwba[0] + ', ' + hwba[1] + '%, ' + hwba[2] + '%' + a + ')';
};

cs.to.keyword = function (rgb: any) {
  return reverseNames[rgb.slice(0, 3)];
};

// helpers
function clamp(num: number, min: number, max: number) {
  return Math.min(Math.max(min, num), max);
}

function hexDouble(num: number) {
  const str = num.toString(16).toUpperCase();
  return str.length < 2 ? '0' + str : str;
}

export default cs;

export const colorString = cs;

export function colorEqual(color1: string, color2: string): boolean {
  const { value: c1 = [0, 0, 0, 0] } = cs.get(color1) || {};
  const { value: c2 = [0, 0, 0, 0] } = cs.get(color2) || {};
  // console.log(c1, c2)
  return c1.every((item: number, index: number) => item === c2[index]);
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
      let color: any = ColorStore.store1[str];
      if (color) {
        arr[0] = color[0];
        arr[1] = color[1];
        arr[2] = color[2];
        arr[3] = color[3];
        return arr;
      }
      color = cs.get(str);
      if (color && color.value) {
        const value = color.value;
        const data: [number, number, number, number] = [value[0] / 255, value[1] / 255, value[2] / 255, value[3]];
        ColorStore.store1[str] = data;
        // value[3] *= 255;
        ColorStore.store255[str] = value;
        arr[0] = data[0];
        arr[1] = data[1];
        arr[2] = data[2];
        arr[3] = data[3];
      }
      return arr;
    }
    let color: any = ColorStore.store255[str];
    if (color) {
      arr[0] = color[0];
      arr[1] = color[1];
      arr[2] = color[2];
      arr[3] = color[3];
      return arr;
    }

    color = cs.get(str);
    if (color && color.value) {
      const value = color.value;
      ColorStore.store1[str] = [value[0] / 255, value[1] / 255, value[2] / 255, value[3]];
      // value[3] *= 255;
      ColorStore.store255[str] = value;
      arr[0] = value[0];
      arr[1] = value[1];
      arr[2] = value[2];
      arr[3] = value[3];
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
