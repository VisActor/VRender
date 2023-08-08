import { merge } from '@visactor/vutils';
import type { PopTipAttributes } from './type';

export const DEFAULT_THEME: PopTipAttributes = {
  visible: true,
  position: 'auto',
  titleStyle: {
    fontSize: 16,
    fill: '#08979c'
  },
  contentStyle: {
    fontSize: 12,
    fill: 'green'
  },
  panel: {
    visible: true,

    fill: '#e6fffb',
    size: 12,
    space: 0,
    stroke: '#87e8de',
    lineWidth: 1,
    cornerRadius: 4
  }
};

export const theme: { poptip: PopTipAttributes } = {
  poptip: merge({}, DEFAULT_THEME)
};
