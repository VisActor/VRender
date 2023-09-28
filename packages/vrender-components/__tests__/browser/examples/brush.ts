import GUI from 'lil-gui';
import '@visactor/vrender';
import render from '../../util/render';
import { Brush } from '../../../src';

export function run() {
  console.log('Brush');

  const guiObject = {
    name: 'Brush',
    brushMode: 'multiple',
    brushType: 'x',
    brushMoved: true,
    removeOnClick: true,
    xRange0: 0,
    xRange1: 500,
    yRange0: 0,
    yRange1: 500,
    delayType: 'throttle',
    delayTime: 10,
    interactiveRangeY1: 0,
    interactiveRangeY2: 5000,
    interactiveRangeX1: 0,
    interactiveRangeX2: 5000
  };

  const attr = {
    brushMode: guiObject.brushMode,
    brushType: guiObject.brushType,
    transformable: guiObject.brushMoved,
    removeOnClick: guiObject.removeOnClick,
    xRange: [guiObject.xRange0, guiObject.xRange1],
    yRange: [guiObject.yRange0, guiObject.yRange1],
    delayType: guiObject.delayType,
    delayTime: guiObject.delayTime,
    interactiveRange: {
      minY: guiObject.interactiveRangeY1,
      maxY: guiObject.interactiveRangeY2,
      minX: guiObject.interactiveRangeX1,
      maxX: guiObject.interactiveRangeX2
    },
    sizeThreshold: 100
  };

  const brush = new Brush({
    ...attr,
    hasMask: false,
    interactiveRange: {
      minX: 0,
      minY: 0,
      maxX: 250,
      maxY: 250
    },
    xRange: [0, 250],
    yRange: [0, 250],
    brushStyle: {
      fill: 'red',
      fillOpacity: 0.2,
      stroke: '#B0C8F9',
      strokeWidth: 2
    }
  });

  brush.setUpdateDragMaskCallback(a => {
    console.log(a);
  });

  const brush2 = new Brush({
    ...attr,
    xRange: [250, 500],
    yRange: [250, 500],
    interactiveRange: {
      minX: 250,
      minY: 250,
      maxX: 500,
      maxY: 500
    }
  });
  // brush.setUpdateDragMaskCallback((...parmas) => console.log('parmas', parmas));

  const stage = render([brush, brush2], 'main');

  const gui = new GUI();
  gui.add(guiObject, 'name');
  gui.add(guiObject, 'brushMode', ['single', 'multiple']).onChange(value => {
    brush.setAttribute('brushMode', value);
  });

  gui.add(guiObject, 'brushType', ['x', 'y', 'rect', 'polygon']).onChange(value => {
    brush.setAttribute('brushType', value);
  });
  gui.add(guiObject, 'brushMoved').onChange(value => {
    brush.setAttribute('brushMoved', value);
  });
  gui.add(guiObject, 'removeOnClick').onChange(value => {
    brush.setAttribute('removeOnClick', value);
  });
  gui.add(guiObject, 'xRange0', 0, 500).onChange(value => {
    brush.setAttribute('xRange', [value, brush.attribute?.xRange?.[1] ?? 0]);
  });
  gui.add(guiObject, 'xRange1', 0, 500).onChange(value => {
    brush.setAttribute('xRange', [brush.attribute?.xRange?.[0] ?? 0, value]);
  });
  gui.add(guiObject, 'yRange0', 0, 500).onChange(value => {
    brush.setAttribute('yRange', [value, brush.attribute?.yRange?.[1] ?? 0]);
  });
  gui.add(guiObject, 'yRange1', 0, 500).onChange(value => {
    brush.setAttribute('yRange', [brush.attribute?.yRange?.[0] ?? 0, value]);
  });
  gui.add(guiObject, 'delayType', ['throttle', 'debounce']).onChange(value => {
    brush.setAttribute('delayType', value);
  });
  gui.add(guiObject, 'delayTime').onChange(value => {
    brush.setAttribute('delayTime', value);
  });
  gui.add(guiObject, 'interactiveRangeY1').onChange(value => {
    brush.setAttribute('interactiveRange', {
      ...brush.attribute?.interactiveRange,
      minY: value
    });
  });
  gui.add(guiObject, 'interactiveRangeY2').onChange(value => {
    brush.setAttribute('interactiveRange', {
      ...brush.attribute?.interactiveRange,
      maxY: value
    });
  });
  gui.add(guiObject, 'interactiveRangeX1').onChange(value => {
    brush.setAttribute('interactiveRange', {
      ...brush.attribute?.interactiveRange,
      minX: value
    });
  });
  gui.add(guiObject, 'interactiveRangeX2').onChange(value => {
    brush.setAttribute('interactiveRange', {
      ...brush.attribute?.interactiveRange,
      maxX: value
    });
  });
}
