import type { PopTipAttributes } from './type';

export const theme: { poptip: PopTipAttributes } = {
  poptip: {
    visible: true,
    position: 'top',
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

      stroke: '#87e8de',
      lineWidth: 1,
      cornerRadius: 4
    }
  }
};
