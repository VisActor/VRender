import GUI from 'lil-gui';
import { createLine, createText, IText } from '@visactor/vrender-core';
import render from '../../util/render';
import { PopTip, loadPoptip } from '../../../src';
loadPoptip();

export function run() {
  const guiObject = {
    name: 'PopTip',
    title: '我是一个title',
    content: ['我是一个content1', '我是一个content2'],
    space: 0,
    symbolVisible: true,
    symbolType: 'square',
    backgroundVisible: true
  };

  const poptip = new PopTip({
    // visible: false,
    x: 300,
    y: 200,
    title: guiObject.title,
    titleStyle: {
      fontSize: 16,
      fill: '#08979c'
    },
    content: guiObject.content,
    contentStyle: {
      fontSize: 12,
      fill: 'green'
    },
    panel: {
      visible: guiObject.backgroundVisible,

      fill: '#e6fffb',

      stroke: '#87e8de',
      lineWidth: 1,
      cornerRadius: 4
    }
  });
  const stage = render(
    [
      poptip,
      createLine({
        points: [
          { x: 0, y: 200 },
          { x: 600, y: 200 }
        ],
        lineWidth: 1,

        stroke: '#ccc',
        lineDash: [2]
      }),
      createLine({
        points: [
          { x: 300, y: 0 },
          { x: 300, y: 600 }
        ],
        lineWidth: 1,

        stroke: '#ccc',
        lineDash: [2]
      }),
      createText({
        text: 'hover这个text，你就能看到poptip这个poptip实在是太长了呀',
        maxLineWidth: 80,
        textBaseline: 'middle',
        fill: 'red',
        x: 160,
        y: 100,
        poptip: {
          position: 'auto',
          contentFormatMethod: t => t + '=========aaa=====',
          panel: {
            size: 0,
            space: 12
          }
        }
      }),
      createText({
        text: 'hover那个text，你就能看到poptiphover这个text，你就能看到poptip这个poptip实在是太长了呀',
        maxLineWidth: 80,
        textBaseline: 'middle',
        fill: 'red',
        x: 30,
        y: 10,
        poptip: {
          position: 'auto',
          panel: {
            size: 0,
            space: 12
          }
        }
      })
    ],
    'main'
  );

  console.log(poptip, poptip.AABBBounds.width(), poptip.AABBBounds.height());
  poptip.addEventListener('pointerenter', () => {
    poptip.setAttribute('panel', {
      fill: 'yellow'
    });
  });

  poptip.addEventListener('pointerleave', () => {
    poptip.setAttribute('panel', {
      fill: '#e6fffb'
    });
  });

  stage.addEventListener('pointerdown', () => {
    console.log('3333');
    poptip.hide();
  });

  // gui
  const gui = new GUI();
  gui.add(guiObject, 'name');
  gui.add(guiObject, 'title').onChange(value => {
    poptip.setAttribute('title', value);
  });
  // gui.add(guiObject, 'content').onChange(value => {
  //   poptip.setAttribute('content', value);
  // });
  gui.add(guiObject, 'backgroundVisible').onChange(value => {
    poptip.setAttribute('panel', {
      visible: value
    });
  });
}
