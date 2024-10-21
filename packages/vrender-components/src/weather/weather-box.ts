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
      'M174.5 394.1h331.2c91 0 166-73.2 166.3-164.2 0.3-91-73.7-165.1-164.7-165.1-43.2 0-84 16.6-114.9 46.7-15.5 15.1-27.7 32.9-36.2 52.2-12.7 29.1 8.4 61.7 40.1 62.6 18.5 0.5 35.2-10.4 42.6-27.3 11.6-26.2 37.7-44.2 68.3-44.2 41.4 0 75.1 33.9 74.7 75.4-0.4 41.1-34.5 73.9-75.6 73.9H174.5c-24.9 0-45 20.1-45 45s20.2 45 45 45zM189.3 634.2l0.6 45-0.6-45zM682 626.9c-0.6 0-0.8 0-427.3 6.3-7.3 0.1-14.2 0.2-20.5 0.3-24.8 0.4-44.7 20.8-44.3 45.6 0.3 24.9 20.8 44.8 45.7 44.4 6.3-0.1 13.2-0.2 20.5-0.3 124.9-1.9 415.3-6.2 426.2-6.3 42.8 0.2 77.2 36.5 74.2 80-2.8 39.8-35.9 70-75.7 69.3-30.2-0.5-55.9-18.5-67.2-44.5-7.3-16.8-24.1-27.5-42.5-27-31.7 0.9-52.8 33.5-40.1 62.6 8.4 19.4 20.6 37.1 36.2 52.2 30.9 30.1 71.8 46.7 115 46.7 91.8-0.1 166.8-77 164.5-168.8-2.3-88.9-75.3-160.5-164.7-160.5z M856.6 240.3c-29-11.5-60.5 10.1-60.5 41.4v1.3c0 18 10.9 34.4 27.6 41.1 27.5 11 47 38 47 69.4 0 41.2-33.5 74.7 74.7 74.7H112.6c-24.9 0-45 20.1-45 45s20.1 45 45 45h683.5c90.8 0 164.7-73.9 164.7-164.7-0.1-69.5-43.3-129-104.2-153.2z',
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

    const duration = (1 - windRatio) * (speed / 4) + (speed / 4) * 1000;

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
