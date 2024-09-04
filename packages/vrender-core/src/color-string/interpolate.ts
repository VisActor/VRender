import { ColorStore, ColorType } from './store';
import type { IGradientColor, ILinearGradient, IRadialGradient, IConicalGradient } from '../interface';
import { isArray, isNumber } from '@visactor/vutils';

function colorArrayToString(
  color: string | IGradientColor | [number, number, number, number],
  alphaChannel: boolean = false
) {
  if (Array.isArray(color) && isNumber(color[0])) {
    return alphaChannel
      ? `rgb(${Math.round(color[0])},${Math.round(color[1])},${Math.round(color[2])},${color[3].toFixed(2)})`
      : `rgb(${Math.round(color[0])},${Math.round(color[1])},${Math.round(color[2])})`;
  }
  return color;
}

export function interpolateColor(
  from: [number, number, number, number] | [string, string, string, string] | string | IGradientColor,
  to: [number, number, number, number] | [string, string, string, string] | string | IGradientColor,
  ratio: number,
  alphaChannel: boolean,
  cb?: (fromArray: [number, number, number, number], toArray: [number, number, number, number]) => void
): false | string | IGradientColor | string[] {
  if ((Array.isArray(from) && !isNumber(from[0])) || (Array.isArray(to) && !isNumber(to[0]))) {
    // 待性能优化
    const out: string[] = new Array(4).fill(0).map((_, index) => {
      return _interpolateColor(
        isArray(from) ? (from[index] as string) : from,
        isArray(to) ? (to[index] as string) : to,
        ratio,
        alphaChannel
      ) as string;
    });
    return out;
    // cb && cb(from!, to!);
  }
  return _interpolateColor(from as any, to as any, ratio, alphaChannel, cb);
}

export function _interpolateColor(
  from: [number, number, number, number] | string | IGradientColor,
  to: [number, number, number, number] | string | IGradientColor,
  ratio: number,
  alphaChannel: boolean,
  cb?: (fromArray: [number, number, number, number], toArray: [number, number, number, number]) => void
): false | string | IGradientColor | string[] {
  if (!(from && to)) {
    return (from && colorArrayToString(from)) || (to && colorArrayToString(to)) || (false as any);
  }
  let fromArray: [number, number, number, number];
  let toArray: [number, number, number, number];
  let fromGradient: boolean = false;
  let toGradient: boolean = false;
  if (Array.isArray(from)) {
    fromArray = from as [number, number, number, number];
  } else if (typeof from === 'string') {
    fromArray = ColorStore.Get(from, ColorType.Color255);
  } else {
    fromGradient = true;
  }
  if (Array.isArray(to)) {
    toArray = to as [number, number, number, number];
  } else if (typeof to === 'string') {
    toArray = ColorStore.Get(to, ColorType.Color255);
  } else {
    toGradient = true;
  }
  if (fromGradient !== toGradient) {
    // 纯色到渐变色，那就将纯色转成渐变色
    const gradient: IGradientColor = (fromGradient ? from : to) as IGradientColor;
    const pure = (fromGradient ? to : from) as string | [number, number, number, number];
    const gradientFromPure: IGradientColor = {
      ...gradient,
      stops: gradient.stops.map(v => ({ ...v, color: colorArrayToString(pure) as string }))
    };
    return fromGradient
      ? interpolateColor(gradient, gradientFromPure, ratio, alphaChannel, cb)
      : interpolateColor(gradientFromPure, gradient, ratio, alphaChannel, cb);
  }

  if (fromGradient) {
    if ((from as IGradientColor).gradient === (to as IGradientColor).gradient) {
      const fc: IGradientColor = from as IGradientColor;
      const tc: IGradientColor = to as IGradientColor;
      // 渐变色插值，只支持相同数量stopColor的插值，并且认为当前的stopColor数量是和from、to相同
      const fromStops = fc.stops;
      const toStops = tc.stops;
      if (fromStops.length !== toStops.length) {
        return false;
      }
      if (fc.gradient === 'linear') {
        return interpolateGradientLinearColor(fc, tc as ILinearGradient, ratio);
      } else if (fc.gradient === 'radial') {
        return interpolateGradientRadialColor(fc, tc as IRadialGradient, ratio);
      } else if (fc.gradient === 'conical') {
        return interpolateGradientConicalColor(fc, tc as IConicalGradient, ratio);
      }
    }
    return false;
  }
  cb && cb(fromArray!, toArray!);
  const result = interpolatePureColorArray(fromArray!, toArray!, ratio);
  return colorArrayToString(result, alphaChannel) as any;
}

export function interpolateGradientLinearColor(
  fc: ILinearGradient,
  tc: ILinearGradient,
  ratio: number
): false | ILinearGradient {
  const fStops = fc.stops;
  const tStops = tc.stops;
  const color: ILinearGradient = {
    gradient: 'linear',
    x0: fc.x0 + (tc.x0 - fc.x0) * ratio,
    x1: fc.x1 + (tc.x1 - fc.x1) * ratio,
    y0: fc.y0 + (tc.y0 - fc.y0) * ratio,
    y1: fc.y1 + (tc.y1 - fc.y1) * ratio,
    stops: new Array(fStops.length).fill(0).map((_, i) => {
      return {
        color: colorStringInterpolationToStr(fStops[i].color, tStops[i].color, ratio),
        offset: fStops[i].offset + (tStops[i].offset - fStops[i].offset) * ratio
      };
    })
  };
  return color;
}

export function interpolateGradientRadialColor(
  fc: IRadialGradient,
  tc: IRadialGradient,
  ratio: number
): false | IRadialGradient {
  const fStops = fc.stops;
  const tStops = tc.stops;
  const color: IRadialGradient = {
    gradient: 'radial',
    x0: fc.x0 + (tc.x0 - fc.x0) * ratio,
    x1: fc.x1 + (tc.x1 - fc.x1) * ratio,
    y0: fc.y0 + (tc.y0 - fc.y0) * ratio,
    y1: fc.y1 + (tc.y1 - fc.y1) * ratio,
    r0: fc.r0 + (tc.r0 - fc.r0) * ratio,
    r1: fc.r1 + (tc.r1 - fc.r1) * ratio,
    stops: new Array(fStops.length).fill(0).map((_, i) => {
      return {
        color: colorStringInterpolationToStr(fStops[i].color, tStops[i].color, ratio),
        offset: fStops[i].offset + (tStops[i].offset - fStops[i].offset) * ratio
      };
    })
  };
  return color;
}

export function interpolateGradientConicalColor(
  fc: IConicalGradient,
  tc: IConicalGradient,
  ratio: number
): false | IConicalGradient {
  const fStops = fc.stops;
  const tStops = tc.stops;
  const color: IConicalGradient = {
    gradient: 'conical',
    startAngle: fc.startAngle + (tc.startAngle - fc.startAngle) * ratio,
    endAngle: fc.endAngle + (tc.endAngle - fc.endAngle) * ratio,
    x: fc.x + (tc.x - fc.x) * ratio,
    y: fc.y + (tc.y - fc.y) * ratio,
    stops: new Array(fStops.length).fill(0).map((_, i) => {
      return {
        color: colorStringInterpolationToStr(fStops[i].color, tStops[i].color, ratio),
        offset: fStops[i].offset + (tStops[i].offset - fStops[i].offset) * ratio
      };
    })
  };
  return color;
}

export function interpolatePureColorArray(
  from: [number, number, number, number],
  to: [number, number, number, number],
  ratio: number
): [number, number, number, number] {
  return [
    from[0] + (to[0] - from[0]) * ratio,
    from[1] + (to[1] - from[1]) * ratio,
    from[2] + (to[2] - from[2]) * ratio,
    from[3] + (to[3] - from[3]) * ratio
  ];
}

const _fromColorRGB: [number, number, number, number] = [0, 0, 0, 0];
const _toColorRGB: [number, number, number, number] = [0, 0, 0, 0];
export function colorStringInterpolationToStr(fromColor: string, toColor: string, ratio: number): string {
  ColorStore.Get(fromColor, ColorType.Color255, _fromColorRGB);
  ColorStore.Get(toColor, ColorType.Color255, _toColorRGB);
  return `rgba(${Math.round(_fromColorRGB[0] + (_toColorRGB[0] - _fromColorRGB[0]) * ratio)},${Math.round(
    _fromColorRGB[1] + (_toColorRGB[1] - _fromColorRGB[1]) * ratio
  )},${Math.round(_fromColorRGB[2] + (_toColorRGB[2] - _fromColorRGB[2]) * ratio)},${
    _fromColorRGB[3] + (_toColorRGB[3] - _fromColorRGB[3]) * ratio
  })`;
}
