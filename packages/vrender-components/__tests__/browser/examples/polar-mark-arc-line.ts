import GUI from 'lil-gui';
import '@visactor/vrender';
import { degreeToRadian } from '@visactor/vutils';
import render from '../../util/render';
import { PolarMarkArcLine } from '../../../src';

export function run() {
  console.log('MarkLine');

  const guiObject = {
    name: 'MarkLine',
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
      startSymbol: {
        // hover: {
        //   fill: 'red'
        // },
        selected: {
          fill: 'blue'
        }
      }
      // endSymbol: {
      //   hover: {
      //     fill: 'red'
      //   },
      //   selected: {
      //     fill: 'green'
      //   }
      // }
    },
    lineStyle: {
      curveType: 'monotoneX',
      state: {
        hover: {
          stroke: 'red'
        },
        selected: {
          stroke: 'blue'
        }
      }
    },
    startSymbol: {
      visible: true,
      state: {
        hover: {
          fill: 'red'
        },
        selected: {
          fill: 'blue'
        }
      }
    },
    endSymbol: {
      //  symbolType: 'triangleLeft',
      // symbolType: 'M0 0l-2 1 0.7289-1-0.7289-1z',
      size: 20,
      autoRotate: true,
      // refAngle: degreeToRadian(-90)
      state: {
        hover: {
          fill: 'red'
        },
        selected: {
          fill: 'green'
        }
      }
    },
    label: {
      text: 'aaa',
      // position: 'insideStartTop',
      visible: true,
      textStyle: {
        fill: 'red',
        fontSize: 20,
        state: {
          hover: {
            fill: 'green'
          },
          selected: {
            fill: 'blue'
          }
        }
      },
      panel: {
        visible: true,
        state: {
          hover: {
            fill: 'red'
          },
          selected: {
            fill: 'blue'
          }
        }
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
  const markLine = new PolarMarkArcLine({
    radius: 100,
    startAngle: 3.141592653589793,
    endAngle: 0,
    center: {
      x: 150,
      y: 150
    },
    ...(styleAttr as any)
  });

  const markLine2 = new PolarMarkArcLine({
    center: {
      x: 200,
      y: 200
    },
    ...(styleAttr as any)
  });

  const markLine3 = new PolarMarkArcLine({
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
