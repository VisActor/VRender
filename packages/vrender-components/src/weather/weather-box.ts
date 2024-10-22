import { AbstractComponent } from '../core/base';
import type { IWeatherBoxAttrs } from './type';
import type { ComponentOptions } from '../interface';
import { merge } from '@visactor/vutils';
import type { IGroup, ISymbol } from '@visactor/vrender-core';
import { IGraphic } from '@visactor/vrender-core';

// todo 后续可能做成有随机数种子的伪随机，这样可以保证每次都生成一样的随机数
function random() {
  return Math.random();
}

function createUniformRandom(count: number) {
  const result: number[] = [];
  const step = 1 / count;
  for (let i = 0; i < count; i++) {
    result.push(((random() - 0.5) * step) / 2 + step * i);
  }
  result.sort(() => Math.random() - 0.5);
  let idx = 0;
  return function (i?: number) {
    if (idx > count - 1) {
      idx = 0;
    }
    if (i === void 0) {
      i = idx;
      idx++;
    }
    return result[i];
  };
}

export class WeatherBox extends AbstractComponent<Required<IWeatherBoxAttrs>> {
  name: string = 'weatherBox';

  static defaultAttributes: Partial<IWeatherBoxAttrs> = {
    snowIconPath:
      'M512 64c24.7 0 44.8 20.1 44.8 44.8v43.1l29.3-15.5c21.9-11.6 49-3.2 60.5 18.7s3.2 49-18.7 60.5l-71.2 37.6v85.2c32 8.2 60.6 25.1 83.1 48l73.8-42.6-3-80.4c-0.9-24.7 18.4-45.5 43.1-46.4 24.7-0.9 45.5 18.4 46.4 43.1l1.2 33.1 37.3-21.5c21.4-12.4 48.8-5 61.2 16.4 12.4 21.4 5 48.8-16.4 61.2l-37.3 21.5 28.1 17.6c21 13.2 27.3 40.8 14.1 61.8-13.2 20.9-40.8 27.3-61.8 14.1l-68.2-42.8-73.6 42.5c4.2 15.3 6.5 31.4 6.5 48s-2.3 32.7-6.5 48l73.8 42.6 68.2-42.8c20.9-13.2 48.6-6.8 61.8 14.1 13.2 21 6.8 48.6-14.1 61.8l-28.1 17.6 37.3 21.5c21.4 12.4 28.8 39.8 16.4 61.2-12.4 21.4-39.8 28.8-61.2 16.4l-37.3-21.5-1.2 33.1c-0.9 24.7-21.7 44-46.4 43.1-24.7-0.9-44-21.7-43.1-46.4l3-80.4-73.8-42.6c-22.5 22.9-51 39.8-83.1 48v85.2l71.2 37.6c21.9 11.6 30.2 38.7 18.7 60.5-11.6 21.9-38.7 30.2-60.5 18.7L557 872.2v43.1c0 24.7-20.1 44.8-44.8 44.8-24.7 0-44.8-20.1-44.8-44.8v-43.1l-29.3 15.5c-21.9 11.6-49 3.2-60.5-18.7-11.6-21.9-3.2-49 18.7-60.5l71.2-37.6v-85.2c-32-8.2-60.6-25.1-83.1-48l-73.8 42.6 3 80.4c0.9 24.7-18.4 45.5-43.1 46.4-24.7 0.9-45.5-18.4-46.4-43.1l-1.2-33.1-37.3 21.5c-21.4 12.4-48.8 5-61.2-16.4s-5-48.8 16.4-61.2l37.3-21.5-28.1-17.6c-21-13.2-27.3-40.8-14.1-61.8 13.2-20.9 40.8-27.3 61.8-14.1l68.2 42.8 73.8-42.6c-4.2-15.3-6.5-31.4-6.5-48s2.3-32.7 6.5-48l-73.8-42.6-68.2 42.8c-21 13.2-48.6 6.8-61.8-14.1-13.2-21-6.8-48.6 14.1-61.8l28.1-17.6-37.3-21.5C119 336.8 111.7 309.4 124 288c12.4-21.4 39.8-28.8 61.2-16.4l37.3 21.5 1.2-33.1c0.9-24.7 21.7-44 46.4-43.1 24.7 0.9 44 21.7 43.1 46.4l-3 80.4 73.8 42.6c22.5-22.9 51-39.8 83.1-48v-85.2L396 215.6c-21.9-11.6-30.2-38.7-18.7-60.5 11.6-21.9 38.7-30.2 60.5-18.7l29.3 15.5v-43.1C467.2 84.1 487.3 64 512 64z m0 537.6c49.5 0 89.6-40.1 89.6-89.6s-40.1-89.6-89.6-89.6-89.6 40.1-89.6 89.6 40.1 89.6 89.6 89.6z',
    rainIconPath:
      'M802.94208 583.04c19.328 38.016 29.056 78.336 29.056 120.96a313.216 313.216 0 0 1-44.032 161.536 324.48 324.48 0 0 1-114.56 114.944c-23.552 13.696-49.024 24.32-76.416 32-27.264 7.68-55.68 11.52-84.992 11.52-29.44 0-57.6-3.84-84.992-11.52a331.136 331.136 0 0 1-76.544-32 337.536 337.536 0 0 1-65.024-49.92 337.536 337.536 0 0 1-49.92-65.024 331.136 331.136 0 0 1-32-76.544A313.216 313.216 0 0 1 191.99808 704c0-42.24 9.344-82.56 28.032-120.448L509.43808 0l293.504 583.04z',
    windIconPath:
      'M686.624 143.072h-150.816a40.352 40.352 0 1 0 0 80.608h150.816a80.672 80.672 0 1 1 0 161.184H226.624a40.352 40.352 0 1 0 0 80.608h460a161.344 161.344 0 1 0 0-322.4z m168.768 725.344h-126.72a40.352 40.352 0 1 1 0-80.576h126.56a80.672 80.672 0 1 0 0-161.184H42.176a40.352 40.352 0 1 1 0-80.608h813.056a161.344 161.344 0 1 1 0 322.368z',
    windRatio: 0,
    rainRatio: 0,
    snowRatio: 0,
    rainCountThreshold: 10,
    snowCountThreshold: 10,
    rainSizeRange: [5, 10],
    snowSizeRange: [5, 13],
    windSize: 30,
    rainSpeed: 1,
    snowSpeed: 0.5,
    windSpeed: 1,
    rainStyle: {
      background: 'rgb(135, 160, 225)'
    },
    snowStyle: {
      background: 'rgb(64, 68, 144)'
    },
    rainSnowStyle: {
      background: 'rgb(130, 190, 210)'
    },
    defaultStyle: {
      background: 'rgb(184, 206, 239)'
    }
  };

  constructor(attributes: IWeatherBoxAttrs, options?: ComponentOptions) {
    super(options?.skipDefault ? attributes : merge({}, WeatherBox.defaultAttributes, attributes));
  }

  protected render(): void {
    const {
      rainRatio,
      rainIconPath,
      snowRatio,
      snowIconPath,
      rainCountThreshold,
      snowCountThreshold,
      windRatio,
      rainSizeRange,
      snowSizeRange,
      rainSpeed,
      snowSpeed,
      width,
      height,
      rainSnowStyle,
      rainStyle,
      snowStyle,
      defaultStyle,
      windIconPath,
      windSize,
      windSpeed
    } = this.attribute as IWeatherBoxAttrs;

    if (rainRatio && snowRatio) {
      this.attribute.background = rainSnowStyle?.background;
    } else if (rainRatio) {
      this.attribute.background = rainStyle?.background;
    } else if (snowRatio) {
      this.attribute.background = snowStyle?.background;
    } else {
      this.attribute.background = defaultStyle?.background;
    }
    this.attribute.clip = true;

    // 计算风速导致的偏转角度
    const windAngle = (-windRatio * Math.PI) / 4;

    const rainGroup = this.createOrUpdateChild('rain-container', { zIndex: 1, width, height }, 'group') as IGroup;
    if (rainRatio > 0) {
      this.generateRainOrSnow(
        'rain',
        rainRatio,
        rainCountThreshold,
        windRatio,
        rainGroup,
        rainIconPath,
        windAngle,
        rainSizeRange,
        rainSpeed
      );
    }
    const snowGroup = this.createOrUpdateChild('snow-container', { zIndex: 1, width, height }, 'group') as IGroup;
    if (snowRatio > 0) {
      this.generateRainOrSnow(
        'snow',
        snowRatio,
        snowCountThreshold,
        windRatio,
        snowGroup,
        snowIconPath,
        windAngle,
        snowSizeRange,
        snowSpeed
      );
    }

    const windGroup = this.createOrUpdateChild('wind-container', { zIndex: 0, width, height }, 'group') as IGroup;
    if (windRatio > 0) {
      this.generateWind(windRatio, windIconPath, windGroup, windSize, windSpeed);
    }
  }

  protected generateWind(windRatio: number, windIconPath: string, group: IGroup, size: number, speed: number) {
    const { width, height } = group.attribute;

    const wind = group.createOrUpdateChild(
      `wind`,
      {
        x: (width - size) / 2,
        y: (height - size) / 2,
        symbolType: windIconPath,
        size,
        fill: 'white',
        opacity: 0
      },
      'symbol'
    ) as ISymbol;

    const duration = (speed / 4) * 1000;

    wind.animate().to({ opacity: 1 }, duration, 'linear').to({ opacity: 0 }, duration, 'linear').loop(Infinity);
  }

  protected generateRainOrSnow(
    type: string,
    ratio: number,
    threshold: number,
    windRatio: number,
    group: IGroup,
    path: string,
    windAngle: number,
    sizeRange: [number, number],
    speed: number
  ) {
    let { width } = group.attribute;
    const { height } = group.attribute;
    let maxCount = Math.round(ratio * threshold);
    // 由于风速，雨雪粒子会偏转，所以需要增加粒子数量
    if (windRatio > 0) {
      maxCount = maxCount * Math.round(1 + windRatio);
    }
    width = width * Math.round(1 + windRatio);
    const uniformRandomX = createUniformRandom(maxCount);
    const uniformRandomY = createUniformRandom(maxCount);
    for (let i = 0; i < maxCount; i++) {
      const x = uniformRandomX();
      const y = uniformRandomY();
      const size = sizeRange[0] + random() * (sizeRange[1] - sizeRange[0]);

      const deltaX = windAngle ? height * Math.tan(Math.abs(windAngle)) : 0;
      const startX = x * width - deltaX;
      const startY = -y * height;
      const particle = group.createOrUpdateChild(
        `${type}-${i}`,
        {
          x: startX,
          y: startY,
          symbolType: path,
          size,
          fill: 'white',
          angle: windAngle
        },
        'symbol'
      ) as ISymbol;
      const duration = (1 / speed / 2) * (1 + y) * 1000;
      let endX = x * width;
      if (type === 'rain' && windAngle) {
        endX = startX + (1 + y) * height * Math.tan(Math.abs(windAngle));
      }
      particle.animate().to({ x: endX, y: height }, duration, 'linear').loop(Infinity);
    }
  }
}
