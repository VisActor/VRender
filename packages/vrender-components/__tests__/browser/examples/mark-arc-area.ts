import GUI from 'lil-gui';
import '@visactor/vrender';
import render from '../../util/render';
import { MarkArcArea } from '../../../src';
import { degreeToRadian } from '@visactor/vutils';

export function run() {
  console.log('MarkArea');

  const guiObject = {
    name: 'MarkArea',
    labelPos: 'arcOuterMiddle',
    cornerRadius: 0,
    labelDx: 0,
    labelDy: 0,
    labelAutoRotate: false,
    labelRefX: 5,
    labelRefY: 5,
    labelRefAngle: 0
  };

  const styleAttr = {
    label: {
      text: '平均值: 17.7',
      // type: 'rich',
      // text: [
      //   {
      //     text: 'Mapbox',
      //     fontWeight: 'bold',
      //     fontSize: 25,
      //     fill: '#3f51b5',
      //     height: 25
      //   },
      //   {
      //     text: '替代方案',
      //     fontStyle: 'italic',
      //     textDecoration: 'underline',
      //     fill: '#3f51b5',
      //     height: 25
      //   }
      // ],
      panel: {
        visible: true
      },
      textStyle: {
        fontSize: 12
      },
      position: guiObject.labelPos,
      dx: guiObject.labelDx,
      dy: guiObject.labelDy,
      areaStyle: {
        cornerRadius: guiObject.cornerRadius
      }
    },
    clipInRange: false,
    state: {
      area: {
        hover: {
          fill: 'red'
        }
      },
      label: {
        hover: {
          fill: 'red'
        }
      },
      labelBackground: {
        hover: {
          fill: 'red'
        }
      }
    },
    hover: true,
    select: true
    // limitRect: {
    //   x: 50,
    //   y: 50,
    //   width: 200,
    //   height: 200
    // }
  };

  const markArea = new MarkArcArea({
    center: {
      x: 100,
      y: 100
    },
    innerRadius: 50,
    outerRadius: 70,
    startAngle: 0,
    endAngle: Math.PI / 2,
    ...(styleAttr as any)
  });

  const markArea2 = new MarkArcArea({
    center: {
      x: 100,
      y: 300
    },
    innerRadius: 50,
    outerRadius: 70,
    startAngle: 0,
    endAngle: Math.PI / 2,
    ...(styleAttr as any)
  });

  const markAreas = [markArea2];
  console.log('markArea', markArea2);

  const stage = render(markAreas, 'main');

  const gui = new GUI();
  gui.add(guiObject, 'name');
  gui
    .add(guiObject, 'labelPos', [
      'arcInnerStart',
      'arcInnerEnd',
      'arcOuterStart',
      'arcOuterEnd',
      'arcInnerMiddle',
      'arcOuterMiddle',
      'center'
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

  gui.add(guiObject, 'labelAutoRotate').onChange(value => {
    markAreas.forEach(markArea =>
      markArea.setAttribute('label', {
        autoRotate: value
      })
    );
  });
  gui.add(guiObject, 'labelRefX').onChange(value => {
    markAreas.forEach(markArea =>
      markArea.setAttribute('label', {
        refX: value
      })
    );
  });
  gui.add(guiObject, 'labelRefY').onChange(value => {
    markAreas.forEach(markArea =>
      markArea.setAttribute('label', {
        refY: value
      })
    );
  });

  gui.add(guiObject, 'labelRefAngle').onChange(value => {
    markAreas.forEach(markArea =>
      markArea.setAttribute('label', {
        refAngle: degreeToRadian(value)
      })
    );
  });
}
