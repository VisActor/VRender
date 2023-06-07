import GUI from 'lil-gui';
import { createLine } from '@visactor/vrender';
import render from '../../util/render';
import { Tag } from '../../../src';

export function run() {
  const guiObject = {
    name: 'Tag',
    textAlign: 'left',
    textBaseline: 'top',
    text: '我是一个标签',
    symbolVisible: true,
    symbolType: 'square',
    backgroundVisible: true
  };

  const tag = new Tag({
    // visible: false,
    x: 100,
    y: 50,
    text: guiObject.text,
    textStyle: {
      fontSize: 12,
      fillColor: '#08979c'
    },
    panel: {
      visible: guiObject.backgroundVisible,
      fill: true,
      fillColor: '#e6fffb',
      stroke: true,
      strokeColor: '#87e8de',
      lineWidth: 1,
      borderRadius: 4
    },
    shape: {
      visible: guiObject.symbolVisible,
      symbolType: guiObject.symbolType,
      fillColor: '#08979c'
    }
    // padding: 0
    // minWidth: 500
    // maxWidth: 80
  });
  const stage = render(
    [
      tag,
      createLine({
        points: [
          { x: 0, y: 50 },
          { x: 200, y: 50 }
        ],
        lineWidth: 1,
        stroke: true,
        strokeColor: '#ccc',
        lineDash: [2]
      }),
      createLine({
        points: [
          { x: 100, y: 0 },
          { x: 100, y: 200 }
        ],
        lineWidth: 1,
        stroke: true,
        strokeColor: '#ccc',
        lineDash: [2]
      })
    ],
    'main'
  );

  console.log(tag, tag.AABBBounds.width(), tag.AABBBounds.height());
  tag.addEventListener('pointerenter', () => {
    tag.setAttribute('panel', {
      fillColor: 'yellow'
    });
  });

  tag.addEventListener('pointerleave', () => {
    tag.setAttribute('panel', {
      fillColor: '#e6fffb'
    });
  });

  stage.addEventListener('pointerdown', () => {
    console.log('3333');
    tag.hide();
  });

  // gui
  const gui = new GUI();
  gui.add(guiObject, 'name');
  gui.add(guiObject, 'textAlign', ['left', 'center', 'right']).onChange(value => {
    tag.setAttribute('textStyle', {
      textAlign: value
    });
  });
  gui.add(guiObject, 'textBaseline', ['top', 'middle', 'bottom']).onChange(value => {
    tag.setAttribute('textStyle', {
      textBaseline: value
    });
  });
  gui.add(guiObject, 'text').onChange(value => {
    tag.setAttribute('text', value);
  });
  gui.add(guiObject, 'symbolVisible').onChange(value => {
    tag.setAttribute('shape', {
      visible: value
    });
  });
  gui
    .add(guiObject, 'symbolType', [
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
      tag.setAttribute('shape', {
        symbolType: value
      });
    });
  gui.add(guiObject, 'backgroundVisible').onChange(value => {
    tag.setAttribute('panel', {
      visible: value
    });
  });
}
