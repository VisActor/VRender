import GUI from 'lil-gui';
import '@visactor/vrender';
import render from '../../util/render';
import { MarkArea } from '../../../src';

export function run() {
  console.log('MarkArea');

  const guiObject = {
    name: 'MarkArea',
    labelPos: 'left',
    cornerRadius: 0,
    labelDx: 0,
    labelDy: 0
  };

  const styleAttr = {
    label: {
      text: '平均值: 17.7',
      position: guiObject.labelPos,
      dx: guiObject.labelDx,
      dy: guiObject.labelDy,
      areaStyle: {
        cornerRadius: guiObject.cornerRadius
      }
    },
    clipInRange: true,
    limitRect: {
      x: 50,
      y: 50,
      width: 200,
      height: 200
    }
  };

  const markArea = new MarkArea({
    points: [
      {
        x: 100,
        y: 50
      },
      {
        x: 400,
        y: 100
      },
      {
        x: 200,
        y: 150
      },
      {
        x: 100,
        y: 50
      }
    ],
    ...(styleAttr as any)
  });

  const markArea2 = new MarkArea({
    points: [
      {
        x: 100,
        y: 250
      },
      {
        x: 200,
        y: 250
      },
      {
        x: 200,
        y: 450
      },
      {
        x: 100,
        y: 450
      }
    ],
    ...(styleAttr as any),
    areaStyle: {
      cornerRadius: guiObject.cornerRadius
    }
  });

  const markAreas = [markArea, markArea2];

  const stage = render(markAreas, 'main');

  const gui = new GUI();
  gui.add(guiObject, 'name');
  gui
    .add(guiObject, 'labelPos', [
      'left',
      'right',
      'top',
      'bottom',
      'middle',
      'insideLeft',
      'insideRight',
      'insideTop',
      'insideBottom'
    ])
    .onChange(value => {
      markAreas.forEach(markArea =>
        markArea.setAttribute('label', {
          position: value
        })
      );
    });

  gui.add(guiObject, 'labelDx').onChange(value => {
    markAreas.forEach(markArea =>
      markArea.setAttribute('label', {
        dx: value
      })
    );
  });

  gui.add(guiObject, 'labelDy').onChange(value => {
    markAreas.forEach(markArea =>
      markArea.setAttribute('label', {
        dy: value
      })
    );
  });

  gui.add(guiObject, 'cornerRadius').onChange(value => {
    markAreas.forEach(markArea =>
      markArea.setAttribute('areaStyle', {
        cornerRadius: value
      })
    );
  });
}
