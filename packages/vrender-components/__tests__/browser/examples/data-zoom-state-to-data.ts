import '@visactor/vrender';
import { IPointLike } from '@visactor/vutils';
import render from '../../util/render';
import { DataZoom } from '../../../src';

const data: any[] = [];
for (let i = 0; i < 9; i++) {
  data.push({
    x: 50 + i * 50,
    y: 235 + Math.random() * 30
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
    }
  });
  dataZoom.setStatePointToData(state => state + '_value');
  dataZoom.setPreviewData(data);
  dataZoom.setpreviewPointsX(d => d.x);
  dataZoom.setpreviewPointsY(d => d.y);
  dataZoom.setpreviewPointsX1(d => d.x);
  dataZoom.setpreviewPointsY1(d => 265);

  const stage = render([dataZoom], 'main');
}
