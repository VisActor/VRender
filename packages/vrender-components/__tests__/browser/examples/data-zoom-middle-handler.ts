import { IPointLike } from '@visactor/vutils';
import '@visactor/vrender';
import render from '../../util/render';
import { DataZoom } from '../../../src';

const data: any[] = [];
for (let i = 0; i < 9; i++) {
  data.push({
    x: 50 + i * 50,
    y: 235 + Math.random() * 22
  });
}

export function run() {
  console.log('DataZoom');

  const dataZoom = new DataZoom({
    start: 0.2,
    end: 0.5,
    position: {
      x: 50,
      y: 235
    },
    size: {
      width: 400,
      height: 30
    },
    brushSelect: false,
    startTextStyle: {
      formatMethod: text => text + '_format'
    },
    showDetail: true,
    middleHandlerStyle: {
      visible: true
    }
  });
  dataZoom.setStatePointToData(state => state + '_value');
  dataZoom.setPreviewData(data);
  dataZoom.setPreviewCallbackX(d => d.x);
  dataZoom.setPreviewCallbackY(d => d.y + dataZoom.getMiddleHandlerSize());
  dataZoom.setPreviewCallbackX1(d => d.x);
  dataZoom.setPreviewCallbackY1(d => 265);

  const stage = render([dataZoom], 'main');
}
