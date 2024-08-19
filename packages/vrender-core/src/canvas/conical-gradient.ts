/**
 * 环形渐变部分源码借鉴https://github.com/parksben/create-conical-gradient/blob/master/LICENSE
 * MIT License

 * Copyright (c) 2020 parksben

 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:

 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.

 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
import { pi2, LRU } from '@visactor/vutils';
import { application } from '../application';
import type { IConicalGradient, IContext2d } from '../interface';
import { interpolateColor } from '../color-string';

class ConicalCanvas {
  static canvas: HTMLCanvasElement;
  static ctx: CanvasRenderingContext2D | null;

  static GetCanvas() {
    try {
      if (!ConicalCanvas.canvas) {
        ConicalCanvas.canvas = application.global.createCanvas({});
      }
      return ConicalCanvas.canvas;
    } catch (err) {
      return null;
    }
  }

  static GetCtx() {
    if (!ConicalCanvas.ctx) {
      const conicalCanvas = ConicalCanvas.GetCanvas();
      ConicalCanvas.ctx = conicalCanvas.getContext('2d');
    }
    return ConicalCanvas.ctx;
  }
}

// todo 目前环形渐变缓存还是依赖于x和y，后续优化环形渐变
export class ColorInterpolate extends LRU {
  private readonly rgbaSet: Uint8ClampedArray;
  private cacheParams: {
    CLEAN_THRESHOLD?: number;
    L_TIME?: number;
    R_COUNT?: number;
    R_TIMESTAMP_MAX_SIZE?: number;
  } = { CLEAN_THRESHOLD: 100, L_TIME: 1e3 };
  static _instance: ColorInterpolate;

  static getInstance() {
    if (!ColorInterpolate._instance) {
      ColorInterpolate._instance = new ColorInterpolate();
    }
    return ColorInterpolate._instance;
  }

  constructor(stops: [number, string][] = [], precision = 100) {
    super();
    const canvas = ConicalCanvas.GetCanvas();
    const conicalCtx = ConicalCanvas.GetCtx();
    canvas.width = precision;
    canvas.height = 1;
    if (!conicalCtx) {
      return;
    }
    conicalCtx.translate(0, 0);
    if (!conicalCtx) {
      throw new Error('获取ctx发生错误');
    }

    const gradient = conicalCtx.createLinearGradient(0, 0, precision, 0);
    stops.forEach(stop => {
      gradient.addColorStop(stop[0], stop[1]);
    });

    conicalCtx.fillStyle = gradient;
    conicalCtx.fillRect(0, 0, precision, 1);

    this.rgbaSet = conicalCtx.getImageData(0, 0, precision, 1).data;
  }

  getColor(offset: number): string {
    const rgba = this.rgbaSet.slice(4 * offset, 4 * offset + 4);
    return `rgba(${rgba[0]}, ${rgba[1]}, ${rgba[2]}, ${rgba[3] / 255})`;
  }

  dataMap: Map<string, { data: ColorInterpolate; timestamp: number[] }> = new Map();
  // static lastCache: {
  //   stops: [number, string][],
  //   precision: number,
  //   colorInter: ColorInterpolate,
  //   step: number,
  //   stepNum: number,
  //   r: number,
  //   lineWidth: number,
  // } | null = null;

  GetOrCreate(x: number, y: number, w: number, h: number, stops: [number, string][] = [], precision = 100) {
    let str = `${x}${y}${w}${h}`;
    stops.forEach(item => (str += item.join()));
    str += precision;
    let colorInter = this.dataMap.get(str);
    if (!colorInter) {
      const data = new ColorInterpolate(stops, precision);
      colorInter = { data, timestamp: [] };
      this.addLimitedTimestamp(colorInter, Date.now(), {});
      this.dataMap.set(str, colorInter);
    }
    this.clearCache(this.dataMap, this.cacheParams);
    return colorInter.data;
  }
}

class ConicalPatternStore {
  private static cache: {
    [key: string]: {
      width: number;
      height: number;
      pattern: CanvasPattern;
    }[];
  } = {};
  private static ImageSize = [20, 40, 80, 160, 320, 640, 1280, 2560];

  static GetSize(minSize: number): number {
    for (let i = 0; i < ConicalPatternStore.ImageSize.length; i++) {
      if (ConicalPatternStore.ImageSize[i] >= minSize) {
        return ConicalPatternStore.ImageSize[i];
      }
    }
    return minSize;
  }

  static Get(
    stops: Array<[number, string]>,
    x: number,
    y: number,
    startAngle: number,
    endAngle: number,
    w: number,
    h: number
  ): CanvasPattern | null {
    const key = ConicalPatternStore.GenKey(stops, x, y, startAngle, endAngle);
    const data = ConicalPatternStore.cache[key];
    if (!data || data.length === 0) {
      return null;
    }
    for (let i = 0; i < data.length; i++) {
      if (data[i].width >= w && data[i].height >= h) {
        return data[i].pattern;
      }
    }
    return null;
  }

  static Set(
    stops: Array<[number, string]>,
    x: number,
    y: number,
    startAngle: number,
    endAngle: number,
    pattern: CanvasPattern,
    w: number,
    h: number
  ) {
    const key = ConicalPatternStore.GenKey(stops, x, y, startAngle, endAngle);
    // 必然是顺序的，因为如果能get到的话就不需要set
    if (!ConicalPatternStore.cache[key]) {
      ConicalPatternStore.cache[key] = [
        {
          width: w,
          height: h,
          pattern
        }
      ];
    } else {
      ConicalPatternStore.cache[key].push({
        width: w,
        height: h,
        pattern
      });
    }
  }

  static GenKey(stops: Array<[number, string]>, x: number, y: number, startAngle: number, endAngle: number): string {
    return `${x},${y},${startAngle},${endAngle},${stops.join()}`;
  }
}

export function getConicGradientAt(x: number, y: number, angle: number, color: IConicalGradient) {
  const { stops, startAngle, endAngle } = color;

  // TODO 格式化angle
  while (angle < 0) {
    angle += pi2;
  }
  while (angle > pi2) {
    angle -= pi2;
  }

  if (angle < startAngle) {
    return stops[0].color;
  }
  if (angle > endAngle) {
    return stops[0].color;
  }
  let percent = (angle - startAngle) / (endAngle - startAngle);
  let startStop: any;
  let endStop: any;
  for (let i = 0; i < stops.length; i++) {
    if (stops[i].offset >= percent) {
      startStop = stops[i - 1];
      endStop = stops[i];
      break;
    }
  }
  percent = (percent - startStop.offset) / (endStop.offset - startStop.offset);
  return interpolateColor(startStop.color, endStop.color, percent, false);
}

/**
 * 环形渐变效果
 * @param context
 * @param stops
 * @param x
 * @param y
 * @param deltaAngle 用于细分出颜色插值数组[start,,,,,,end, (没有用到的颜色)]
 * @param startAngle 实际开始的angle
 * @param endAngle 实际结束的angle
 * @param minW
 * @param minH
 * @returns
 */
export function createConicalGradient(
  context: IContext2d,
  stops: Array<[number, string]>,
  x: number,
  y: number,
  deltaAngle: number,
  startAngle: number,
  endAngle: number,
  minW: number,
  minH: number
): null | CanvasPattern {
  const deltaDeg = Math.floor((deltaAngle * 180) / Math.PI);

  const conicalCanvas = ConicalCanvas.GetCanvas();
  const conicalCtx = ConicalCanvas.GetCtx();

  if (!conicalCtx) {
    return null;
  }
  const width = ConicalPatternStore.GetSize(minW);
  const height = ConicalPatternStore.GetSize(minH);
  let pattern = ConicalPatternStore.Get(stops, x, y, startAngle, endAngle, width, height);
  if (pattern) {
    return pattern;
  }

  const r = Math.sqrt(
    Math.max(
      Math.max(Math.pow(x, 2) + Math.pow(y, 2), Math.pow(width - x, 2) + Math.pow(y, 2)),
      Math.max(Math.pow(width - x, 2) + Math.pow(height - y, 2), Math.pow(x, 2) + Math.pow(height - y, 2))
    )
  );
  // 每一度一个三角形
  const stepNum = deltaDeg + 1;
  const step = deltaAngle / Math.max(1, stepNum - 1);
  const colorInter = ColorInterpolate.getInstance().GetOrCreate(x, y, width, height, stops, stepNum);

  const lineWidth = (2 * Math.PI * r) / 360;

  conicalCanvas.width = width;
  conicalCanvas.height = height;
  conicalCtx.setTransform(1, 0, 0, 1, 0, 0);
  conicalCtx.clearRect(0, 0, width, height);
  conicalCtx.translate(x, y);
  conicalCtx.rotate(startAngle);
  for (let i = 0, len = stepNum - 1; i < len; i++) {
    if (startAngle + i * step > endAngle) {
      break;
    }
    const color = colorInter.getColor(i);
    conicalCtx.beginPath();
    conicalCtx.rotate(step);
    conicalCtx.moveTo(0, 0);
    conicalCtx.lineTo(r, -2 * lineWidth);
    conicalCtx.lineTo(r, 0);
    conicalCtx.fillStyle = color;
    conicalCtx.closePath();
    conicalCtx.fill();
  }

  const imageData = conicalCtx.getImageData(0, 0, width, height);

  conicalCanvas.width = imageData.width;
  conicalCanvas.height = imageData.height;
  conicalCtx.putImageData(imageData, 0, 0);
  pattern = context.createPattern(conicalCanvas, 'no-repeat');
  pattern && ConicalPatternStore.Set(stops, x, y, startAngle, endAngle, pattern, width, height);
  return pattern;
}
