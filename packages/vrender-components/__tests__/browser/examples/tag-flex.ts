import GUI from 'lil-gui';
import '@visactor/vrender';
import { createLine } from '@visactor/vrender';
import render from '../../util/render';
import { Tag } from '../../../src';
import { createGroup, createStage } from '@visactor/vrender-core';

export function run() {
  const tag = new Tag({
    text: 'aaa',
    minWidth: 50,
    // textAlwaysCenter: true,
    textStyle: {
      fontSize: 12,
      fill: '#08979c'
    },
    panel: {
      visible: true,
      fill: '#e6fffb',
      stroke: '#87e8de',
      lineWidth: 1,
      cornerRadius: 4
    }
    // boundsPadding: [0, 4, 0, 4]
  });

  const tag1 = new Tag({
    text: 'bbb',
    minWidth: 50,
    // textAlwaysCenter: true,
    textStyle: {
      fontSize: 12,
      fill: '#08979c'
    },
    panel: {
      visible: true,
      fill: '#e6fffb',
      stroke: '#87e8de',
      lineWidth: 1,
      cornerRadius: 4
    }
    // boundsPadding: [0, 4, 0, 4]
  });

  const group = createGroup({
    x: 50,
    y: 50,
    width: 200,
    height: 80,
    fill: '#ccc',
    stroke: '#333',
    display: 'flex',
    flexWrap: 'nowrap',
    alignItems: 'center',
    justifyContent: 'center', // cause Maximum call stack size exceeded
    overflow: 'hidden'
  });

  group.add(tag);
  group.add(tag1);

  const stage = createStage({
    canvas: 'main',
    width: 600,
    height: 600,
    autoRender: true,
    disableDirtyBounds: true,
    // canvasControled: false,
    background: 'rgba(238,238,238,0.5)',
    viewBox: {
      x1: 50,
      y1: 50,
      x2: 550,
      y2: 550
    },
    pluginList: ['poptipForText', 'scrollbar'],
    enableHtmlAttribute: true,
    enableLayout: true
  });
  stage.defaultLayer.add(group);
  stage.render();

  window.stage = stage;
}
