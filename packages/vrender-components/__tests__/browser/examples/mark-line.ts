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
      },
      endSymbol: {
        hover: {
          fill: 'red'
        },
        selected: {
          fill: 'green'
        }
      }
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
      visible: false,
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
  console.log('markline', markLine);

  const stage = render(markLines, 'main');
  markLine.setAttributes({
    points: [
      {
        x: 100,
        y: 250
      },
      {
        x: 300,
        y: 150
      },
      {
        x: 500,
        y: 350
      }
    ]
  });
  console.log('markLine', markLine);

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
