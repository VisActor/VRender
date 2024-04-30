import GUI from 'lil-gui';
import '@visactor/vrender';
import { degreeToRadian } from '@visactor/vutils';
import render from '../../util/render';
import { ArcSegment } from '../../../src';
import { Arc, graphicCreator } from '@visactor/vrender-core';

export function run() {
  const guiObject = {
    name: 'ArcSegment',
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
    x: 100,
    y: 100
  };

  const segment = new ArcSegment({
    // innerRadius: 50,
    lineWidth: 1,
    stroke: '#000',
    dx: 0,
    dy: 0,
    radius: 100,
    startAngle: 3.141592653589793,
    endAngle: 0,
    center: {
      x: 100,
      y: 100
    },
    x: 100,
    y: 100,
    lineDash: [2, 2],
    startSymbol: {
      visible: true,
      style: {
        fill: 'red'
      }
    },
    endSymbol: {
      visible: true
    }
  });

  const segments = [segment];
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
