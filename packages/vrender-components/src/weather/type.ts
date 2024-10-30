import type { IGroupGraphicAttribute, IRectGraphicAttribute, ISymbolGraphicAttribute } from '@visactor/vrender-core';

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

  snowRainBottomPadding?: number;

  rainRatio?: number;
  rainCountThreshold?: number;
  snowRatio?: number;
  snowCountThreshold?: number;
  windRatio?: number;

  windAnimateEffect?: 'fade' | 'clipRange';

  rainStyle?: ISymbolGraphicAttribute;
  snowStyle?: ISymbolGraphicAttribute;
  windStyle?: ISymbolGraphicAttribute;
}
