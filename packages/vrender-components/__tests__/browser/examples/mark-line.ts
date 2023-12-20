import GUI from 'lil-gui';
import '@visactor/vrender';
import { degreeToRadian } from '@visactor/vutils';
import render from '../../util/render';
import { MarkLine } from '../../../src';

export function run() {
  console.log('MarkLine');

  const guiObject = {
    name: 'MarkLine',
    labelPos: 'start',
    labelAutoRotate: false,
    labelRefX: 5,
    labelRefY: 5,
    labelRefAngle: 0
  };

  const styleAttr = {
    endSymbol: {
      //  symbolType: 'triangleLeft',
      // symbolType: 'M0 0l-2 1 0.7289-1-0.7289-1z',
      size: 10,
      autoRotate: false
      // refAngle: degreeToRadian(-90)
    },
    label: {
      // text: '平均值: 17.7',
      type: 'rich',
      text: [
        {
          text: 'Mapbox',
          fontWeight: 'bold',
          fontSize: 25,
          fill: '#3f51b5',
          height: 25
        },
        {
          text: '替代方案',
          fontStyle: 'italic',
          textDecoration: 'underline',
          fill: '#3f51b5',
          height: 25
        }
      ],
      panel: {
        visible: false
      },
      position: guiObject.labelPos,
      autoRotate: guiObject.labelAutoRotate,
      refX: guiObject.labelRefX,
      refY: guiObject.labelRefY,
      refAngle: degreeToRadian(guiObject.labelRefAngle)
    },
    clipInRange: false
    // limitRect: {
    //   x: 50,
    //   y: 50,
    //   width: 200,
    //   height: 200
    // }
  };
  const markLine = new MarkLine({
    points: [],
    ...(styleAttr as any)
  });

  const markLine2 = new MarkLine({
    points: [
      {
        x: 100,
        y: 250
      },
      {
        x: 400,
        y: 150
      }
    ],
    ...(styleAttr as any)
  });

  const markLine3 = new MarkLine({
    points: [
      {
        x: 100,
        y: 350
      },
      {
        x: 400,
        y: 450
      }
    ],
    ...(styleAttr as any)
  });

  const markLines = [markLine];

  const stage = render(markLines, 'main');
  markLine.setAttributes({
    points: [
      {
        x: 100,
        y: 250
      },
      {
        x: 400,
        y: 150
      }
    ]
  });

  // gui
  const gui = new GUI();
  gui.add(guiObject, 'name');
  gui
    .add(guiObject, 'labelPos', [
      'start',
      'middle',
      'end',
      'insideStartTop',
      'insideStartBottom',
      'insideMiddleTop',
      'insideMiddleBottom',
      'insideEndTop',
      'insideEndBottom'
    ])
    .onChange(value => {
      markLines.forEach(markLine =>
        markLine.setAttribute('label', {
          position: value
        })
      );
    });
  gui.add(guiObject, 'labelAutoRotate').onChange(value => {
    markLines.forEach(markLine =>
      markLine.setAttribute('label', {
        autoRotate: value
      })
    );
  });
  gui.add(guiObject, 'labelRefX').onChange(value => {
    markLines.forEach(markLine =>
      markLine.setAttribute('label', {
        refX: value
      })
    );
  });
  gui.add(guiObject, 'labelRefY').onChange(value => {
    markLines.forEach(markLine =>
      markLine.setAttribute('label', {
        refY: value
      })
    );
  });

  gui.add(guiObject, 'labelRefAngle').onChange(value => {
    markLines.forEach(markLine =>
      markLine.setAttribute('label', {
        refAngle: degreeToRadian(value)
      })
    );
  });
}
