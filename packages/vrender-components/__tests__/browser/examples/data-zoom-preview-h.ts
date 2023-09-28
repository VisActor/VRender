import '@visactor/vrender';
import render from '../../util/render';
import { DataZoom } from '../../../src';

const data: any[] = [];
for (let i = 0; i < 6; i++) {
  data.push({
    x: 265 - Math.random() * 30,
    y: 100 + i * 50
  });
}

export function run() {
  console.log('DataZoom');

  const dataZoom = new DataZoom({
    orient: 'left',
    start: 0.2,
    end: 0.5,
    position: {
      x: 235,
      y: 50
    },
    size: {
      width: 30,
      height: 400
    },
    brushSelect: false,
    previewData: data,
    previewCallbackX: d => d.x,
    previewCallbackY: d => d.y,
    previewCallbackX1: d => 265,
    previewCallbackY1: d => d.y
  });

  dataZoom.setUpdateStateCallback((start, end) => console.log('start: ' + start + ', end: ' + end));
  // dataZoom.setPreviewData(data);
  // dataZoom.setPreviewXCallback(d => d.x);
  // dataZoom.setPreviewYCallback(d => d.y);
  // dataZoom.setPreviewX1Callback(d => 265);
  // dataZoom.setPreviewY1Callback(d => d.y);

  const stage = render([dataZoom], 'main');
}
