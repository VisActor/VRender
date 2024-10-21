import type { IGroupGraphicAttribute } from '@visactor/vrender-core';

export interface IWeatherBoxAttrs extends IGroupGraphicAttribute {
  rainIconPath?: string;
  snowIconPath?: string;
  windIconPath?: string;
  width: number;
  height: number;
  rainSizeRange?: [number, number];
  snowSizeRange?: [number, number];
  windSize?: number;
  rainSpeed?: number;
  snowSpeed?: number;
  windSpeed?: number;

  rainRatio?: number;
  rainCountThreshold?: number;
  snowRatio?: number;
  snowCountThreshold?: number;
  windRatio?: number;

  rainStyle?: {
    background?: string;
  };
  snowStyle?: {
    background?: string;
  };
  rainSnowStyle?: {
    background?: string;
  };
}
