import GUI from 'lil-gui';
import '@visactor/vrender';
import { degreeToRadian } from '@visactor/vutils';
import render from '../../util/render';
import { Segment } from '../../../src';

export function run() {
  const guiObject = {
    name: 'Segment',
    startSymbolVisible: true,
    startSymbolType: 'triangle',
    startSymbolRefX: 5,
    startSymbolRefY: 0,
    startSymbolRefAngle: 0,
    endSymbolVisible: true,
    endSymbolType: 'triangle',
    endSymbolRefX: 5,
    endSymbolRefY: 0,
    endSymbolRefAngle: 0
  };

  const styleAttr = {
    lineStyle: {
      lineWidth: 2,
      fill: '#08979c'
    },
    startSymbol: {
      visible: guiObject.startSymbolVisible,
      symbolType: guiObject.startSymbolType,
      size: 12,
      refX: guiObject.startSymbolRefX,
      refY: guiObject.startSymbolRefY,
      refAngle: degreeToRadian(guiObject.startSymbolRefAngle),
      style: {
        fill: 'blue',
        fillOpacity: 0.5
      }
    },
    endSymbol: {
      visible: guiObject.endSymbolVisible,
      symbolType: guiObject.endSymbolType,
      refX: guiObject.endSymbolRefX,
      refY: guiObject.endSymbolRefY,
      refAngle: degreeToRadian(guiObject.endSymbolRefAngle),
      size: 12,
      style: {
        fill: 'red',
        fillOpacity: 0.5
      }
    }
  };

  const startPos = {
    x: 250,
    y: 250
  };

  const segment = new Segment({
    points: [
      startPos,
      {
        x: startPos.x - 50,
        y: startPos.y - 50
      }
    ],
    ...styleAttr
  });
  const segment2 = new Segment({
    points: [
      startPos,
      {
        x: startPos.x - 50,
        y: startPos.y + 50
      }
    ],
    ...styleAttr
  });
  const segment3 = new Segment({
    points: [
      startPos,
      {
        x: startPos.x + 50,
        y: startPos.y - 50
      }
    ],
    ...styleAttr
  });

  const segment4 = new Segment({
    points: [
      startPos,
      {
        x: startPos.x + 50,
        y: startPos.y + 50
      }
    ],
    ...styleAttr
  });

  const segment5 = new Segment({
    points: [
      {
        x: startPos.x - 100,
        y: startPos.y - 100
      },
      {
        x: startPos.x - 40,
        y: startPos.y - 120
      },
      {
        x: startPos.x + 20,
        y: startPos.y - 180
      },
      {
        x: startPos.x + 100,
        y: startPos.y - 200
      }
    ],
    ...styleAttr
  });

  const segment6 = new Segment({
    points: [
      {
        x: startPos.x - 100,
        y: startPos.y + 100
      },
      {
        x: startPos.x - 40,
        y: startPos.y + 120
      },
      {
        x: startPos.x + 20,
        y: startPos.y + 180
      },
      {
        x: startPos.x + 100,
        y: startPos.y + 200
      }
    ],
    ...styleAttr
  });

  const segment7 = new Segment({
    points: [
      {
        x: startPos.x,
        y: startPos.y
      },
      {
        x: startPos.x - 100,
        y: startPos.y
      }
    ],
    ...styleAttr
  });
  const segment8 = new Segment({
    points: [
      {
        x: startPos.x,
        y: startPos.y
      },
      {
        x: startPos.x + 100,
        y: startPos.y
      }
    ],
    ...styleAttr
  });
  const segment9 = new Segment({
    points: [
      {
        x: startPos.x,
        y: startPos.y
      },
      {
        x: startPos.x,
        y: startPos.y - 100
      }
    ],
    ...styleAttr
  });
  const segment10 = new Segment({
    points: [
      {
        x: startPos.x,
        y: startPos.y
      },
      {
        x: startPos.x,
        y: startPos.y + 100
      }
    ],
    ...styleAttr
  });
  const segments = [segment, segment2, segment3, segment4, segment5, segment6, segment7, segment8, segment9, segment10];
  const stage = render(segments, 'main');

  // gui
  const gui = new GUI();
  gui.add(guiObject, 'name');

  gui.add(guiObject, 'startSymbolVisible').onChange(value => {
    segments.forEach(segment =>
      segment.setAttribute('startSymbol', {
        visible: value
      })
    );
  });
  gui
    .add(guiObject, 'startSymbolType', [
      'circle',
      'cross',
      'diamond',
      'square',
      'arrow',
      'wedge',
      'triangle',
      'triangleUp',
      'triangleDown',
      'triangleRight',
      'triangleLeft',
      'stroke',
      'star',
      'wye'
    ])
    .onChange(value => {
      segments.forEach(segment =>
        segment.setAttribute('startSymbol', {
          symbolType: value
        })
      );
    });
  gui.add(guiObject, 'endSymbolVisible').onChange(value => {
    segments.forEach(segment =>
      segment.setAttribute('endSymbol', {
        visible: value
      })
    );
  });
  gui
    .add(guiObject, 'endSymbolType', [
      'circle',
      'cross',
      'diamond',
      'square',
      'arrow',
      'wedge',
      'triangle',
      'triangleUp',
      'triangleDown',
      'triangleRight',
      'triangleLeft',
      'stroke',
      'star',
      'wye'
    ])
    .onChange(value => {
      segments.forEach(segment =>
        segment.setAttribute('endSymbol', {
          symbolType: value
        })
      );
    });

  gui.add(guiObject, 'startSymbolRefX').onChange(value => {
    segments.forEach(segment =>
      segment.setAttribute('startSymbol', {
        refX: value
      })
    );
  });

  gui.add(guiObject, 'startSymbolRefY').onChange(value => {
    segments.forEach(segment =>
      segment.setAttribute('startSymbol', {
        refY: value
      })
    );
  });

  gui.add(guiObject, 'startSymbolRefAngle').onChange(value => {
    segments.forEach(segment =>
      segment.setAttribute('startSymbol', {
        refAngle: degreeToRadian(value)
      })
    );
  });

  gui.add(guiObject, 'endSymbolRefX').onChange(value => {
    segments.forEach(segment =>
      segment.setAttribute('endSymbol', {
        refX: value
      })
    );
  });

  gui.add(guiObject, 'endSymbolRefY').onChange(value => {
    segments.forEach(segment =>
      segment.setAttribute('endSymbol', {
        refY: value
      })
    );
  });

  gui.add(guiObject, 'endSymbolRefAngle').onChange(value => {
    segments.forEach(segment =>
      segment.setAttribute('endSymbol', {
        refAngle: degreeToRadian(value)
      })
    );
  });
}
