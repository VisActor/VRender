import GUI from 'lil-gui';
import '@visactor/vrender';
import { degreeToRadian } from '@visactor/vutils';
import render from '../../util/render';
import { MarkArcLine, registerMarkArcLineAnimate } from '../../../src';

registerMarkArcLineAnimate();

export function run() {
  console.log('MarkArcLine');

  const guiObject = {
    name: 'MarkArcLine',
    labelPos: 'arcOuterMiddle',
    labelDx: 0,
    labelDy: 0,
    labelAutoRotate: false,
    labelRefX: 5,
    labelRefY: 5,
    labelRefAngle: 0
  };

  const styleAttr = {
    state: {
      line: {
        hover: {
          stroke: 'red'
        },
        selected: {
          stroke: 'blue'
        }
      },
      lineStartSymbol: {
        hover: {
          fill: 'red'
        },
        selected: {
          fill: 'blue'
        }
      },
      lineEndSymbol: {
        hover: {
          fill: 'red'
        },
        selected: {
          fill: 'green'
        }
      }
    },
    lineStyle: {
      curveType: 'monotoneX'
    },
    startSymbol: {
      visible: true
    },
    endSymbol: {
      //  symbolType: 'triangleLeft',
      // symbolType: 'M0 0l-2 1 0.7289-1-0.7289-1z',
      size: 20,
      autoRotate: true
      // refAngle: degreeToRadian(-90)
    },
    label: {
      text: 'aaa',
      // position: 'insideStartTop',
      visible: true,
      textStyle: {
        fill: 'red',
        fontSize: 20
      },
      panel: {
        visible: true
      },
      position: guiObject.labelPos,
      autoRotate: guiObject.labelAutoRotate,
      refX: guiObject.labelRefX,
      refY: guiObject.labelRefY,
      refAngle: degreeToRadian(guiObject.labelRefAngle)
    },
    autoRotate: true,
    clipInRange: false,
    interactive: true,
    hover: true,
    select: true
    // limitRect: {
    //   x: 50,
    //   y: 50,
    //   width: 200,
    //   height: 200
    // }
  };
  const markLine = new MarkArcLine({
    radius: 100,
    startAngle: 3.141592653589793,
    endAngle: 0,
    center: {
      x: 150,
      y: 150
    },
    ...(styleAttr as any)
  });

  const markLine2 = new MarkArcLine({
    center: {
      x: 200,
      y: 200
    },
    ...(styleAttr as any)
  });

  const markLine3 = new MarkArcLine({
    center: {
      x: 300,
      y: 300
    },
    ...(styleAttr as any)
  });

  const markLines = [markLine];
  console.log('markline', markLine);

  const stage = render(markLines, 'main');
  // markLine.setAttributes({
  //   center: {
  //     x: 400,
  //     y: 400
  //   }
  // });
  // console.log('markLine', markLine);

  setTimeout(() => {
    // markLine.release();
  }, 500);

  // gui
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
      markLines.forEach(markLine =>
        markLine.setAttribute('label', {
          position: value
        })
      );
    });

  gui.add(guiObject, 'labelDx').onChange(value => {
    markLines.forEach(markLine =>
      markLine.setAttribute('label', {
        dx: value
      })
    );
  });

  gui.add(guiObject, 'labelDy').onChange(value => {
    markLines.forEach(markLine =>
      markLine.setAttribute('label', {
        dy: value
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
