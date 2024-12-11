import GUI from 'lil-gui';
import '@visactor/vrender';
import { createLine, createText, IText } from '@visactor/vrender';
import render from '../../util/render';
import { PopTip, loadPoptip } from '../../../src';
// import { initBrowserEnv } from '@visactor/vrender-kits';
// initBrowserEnv();
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

  const shadow = {
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowBlur: 10,
    shadowOffsetX: 4,
    shadowOffsetY: 4
  };
  const poptip1 = new PopTip({
    x: 50,
    y: 50,
    content: '$123,45',
    position: 'tl',
    padding: { top: 6, bottom: 6, left: 6, right: 6 },
    contentStyle: {
      fontSize: 12,
      fill: '#08979c'
    },
    panel: {
      visible: guiObject.backgroundVisible,
      fill: 'white',
      cornerRadius: 4,
      size: 9,
      ...shadow
    }
  });
  const poptip2 = new PopTip({
    x: 150,
    y: 50,
    content: '$123,45',
    position: 'tl',
    padding: { top: 6, bottom: 6, left: 6, right: 6 },
    contentStyle: {
      fontSize: 12,
      fill: '#08979c'
    },
    triangleMode: 'concise',
    panel: {
      visible: guiObject.backgroundVisible,
      fill: 'white',
      // cornerRadius: 4,
      size: 9,
      ...shadow
    }
  });
  const poptip3 = new PopTip({
    x: 250,
    y: 50,
    content: '$123,45',
    position: 'tl',
    padding: { top: 6, bottom: 6, left: 6, right: 6 },
    contentStyle: {
      fontSize: 12,
      fill: '#08979c'
    },
    triangleMode: 'concise',
    panel: {
      visible: guiObject.backgroundVisible,
      stroke: 'white',
      // cornerRadius: 4,
      size: 0,
      ...shadow
    }
  });
  const poptip4 = new PopTip({
    x: 350,
    y: 50,
    content: '$123,45',
    position: 'top',
    padding: { top: 3, bottom: 3, left: 3, right: 3 },
    contentStyle: {
      fontSize: 12,
      fill: '#08979c'
    },
    panel: {
      square: true,
      visible: guiObject.backgroundVisible,
      fill: 'white',
      cornerRadius: 100,
      // cornerRadius: 4,
      size: 10,
      ...shadow
    }
  });
  const poptip5 = new PopTip({
    x: 50,
    y: 150,
    content: '123,45',
    position: 'right',
    padding: { top: 3, bottom: 3, left: 12, right: 6 },
    contentStyle: {
      fontSize: 12,
      fill: '#08979c'
    },
    panel: {
      visible: guiObject.backgroundVisible,
      fill: 'white',
      cornerRadius: [0, 20, 20, 0],
      size: 0,
      ...shadow
    },
    logoSymbol: {
      symbolType: 'circle',
      fill: 'red',
      size: 'auto'
    },
    logoText: '$',
    logoTextStyle: {
      fill: 'white',
      fontSize: 12
    }
  });
  const poptip6 = new PopTip({
    x: 150,
    y: 150,
    content: '123,45',
    position: 'right',
    padding: { top: 3, bottom: 3, left: 8, right: 8 },
    contentStyle: {
      fontSize: 12,
      fill: '#08979c'
    },
    panel: {
      visible: guiObject.backgroundVisible,
      fill: 'white',
      cornerRadius: [0, 0, 6, 0],
      cornerType: 'bevel',
      size: 0,
      ...shadow
    },
    logoSymbol: {
      symbolType: 'rect',
      fill: 'red',
      size: [12, 'auto']
    },
    logoText: '$',
    logoTextStyle: {
      fill: 'white',
      fontSize: 12
    }
  });

  const poptipList = [poptip1, poptip2, poptip3, poptip4, poptip5, poptip6];

  const stage = render(
    [
      // poptip,
      ...poptipList,
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
        y: 400,
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
  stage.render();
  poptipList.forEach(poptip => {
    poptip.appearAnimate({ duration: 300, easing: 'quadOut', wave: 0.3 });
    setTimeout(() => {
      poptip.disappearAnimate({ duration: 300, easing: 'aIn3' });
    }, 2000);
  });

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
