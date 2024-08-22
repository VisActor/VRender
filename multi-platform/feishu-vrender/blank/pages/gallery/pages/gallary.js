// logs.ts
// const util = require('../../utils/util.js')
// import { formatTime } from '../../utils/util'
import VRender from './index';

const { global, createStage, createRect, createSymbol, createText, createArc, createLine, createArea, createImage } =
  VRender;

Page({
  data: {},
  options: undefined,
  stage: undefined,
  onLoad(options) {
    console.log(options);
    this.options = options;
    // this.setData({
    //   logs: (wx.getStorageSync('logs') || []).map((log: string) => {
    //     return {
    //       date: 'aaa',
    //       timeStamp: log
    //     }
    //   }),
    // })
  },
  onReady() {
    this.init(this.options.name);
  },
  init(name) {
    tt.createSelectorQuery()
      .select(`#draw`)
      .boundingClientRect(domref => {
        if (!domref) {
          console.error(`未找到 #draw 组件`);
          return;
        }
        console.log(domref, domref.width, domref.height);
        const canvasIdLists = ['draw', 'backup', 'interactive'];
        global.setEnv('feishu', { domref, force: true, canvasIdLists, freeCanvasIdx: 0 });
        const stage = createStage({
          canvas: global.getElementById('draw'),
          width: domref.width,
          height: domref.height,
          autoRender: true
        });
        this.stage = stage;
        // const ctx = stage.window.getContext().nativeContext;
        // const ctx = tt.createCanvasContext('draw');
        // ctx.beginPath();
        // ctx.fillStyle = 'red';
        // ctx.rect(0, 0, 100, 100);
        // ctx.fill();
        // ctx.draw();
        switch (name) {
          case 'rect':
            return this.drawRect(stage);
          case 'symbol':
            return this.drawSymbol(stage);
          case 'text':
            return this.drawText(stage);
          case 'arc':
            return this.drawArc(stage);
          case 'line':
            return this.drawLine(stage);
          case 'area':
            return this.drawArea(stage);
          case 'image':
            return this.drawImage(stage);
        }
      })
      .exec();
  },
  bindEvent(event) {
    // const { type } = event;
    // console.log(type);

    // hack for offsetX offsetY
    if (event.changedTouches && event.changedTouches[0]) {
      event.offsetX = event.changedTouches[0].x;
      event.changedTouches[0].offsetX = event.changedTouches[0].x ?? event.changedTouches[0].pageX;
      event.changedTouches[0].clientX = event.changedTouches[0].x ?? event.changedTouches[0].pageX;
      event.offsetY = event.changedTouches[0].y;
      event.changedTouches[0].offsetY = event.changedTouches[0].y ?? event.changedTouches[0].pageY;
      event.changedTouches[0].clientY = event.changedTouches[0].y ?? event.changedTouches[0].pageY;
    }
    event.preventDefault = () => {};
    event.stopPropagation = () => {};
    // debugger;
    this.stage && this.stage.window.dispatchEvent(event);
  },
  drawRect(stage) {
    const graphics = [];
    const r = createRect({
      x: 30,
      y: 30,
      width: 20,
      height: 100,
      fill: 'red',
      stroke: 'pink',
      cornerRadius: 10,
      lineWidth: 5
    });
    r.addEventListener('pointerdown', () => {
      r.setAttribute('fill', 'green');
    });
    graphics.push(r);

    graphics.push(
      createRect({
        x: 100,
        y: 30,
        width: 100,
        height: 100,
        fill: {
          gradient: 'linear',
          x0: 0,
          y0: 0,
          x1: 1,
          y1: 0,
          stops: [
            { offset: 0, color: 'green' },
            { offset: 0.5, color: 'orange' },
            { offset: 1, color: 'red' }
          ]
        },
        cornerRadius: [5, 10, 15, 20],
        lineWidth: 5
      })
    );

    graphics.forEach(g => {
      stage.defaultLayer.add(g);
    });

    // stage.render();
    console.log(stage);
  },
  drawSymbol(stage) {
    const symbolList = [
      'circle',
      'cross',
      'diamond',
      'square',
      'arrow',
      'arrow2Left',
      'arrow2Right',
      'wedge',
      'thinTriangle',
      'triangle',
      'triangleUp',
      'triangleDown',
      'triangleRight',
      'triangleLeft',
      'stroke',
      'star',
      'wye',
      'rect',
      'M -2 2 L 4 -5 L 7 -6 L 6 -3 L -1 3 C 0 4 0 5 1 4 C 1 5 2 6 1 6 A 1.42 1.42 0 0 1 0 7 A 5 5 0 0 0 -2 4 Q -2.5 3.9 -2.5 4.5 T -4 5.8 T -4.8 5 T -3.5 3.5 T -3 3 A 5 5 90 0 0 -6 1 A 1.42 1.42 0 0 1 -5 0 C -5 -1 -4 0 -3 0 C -4 1 -3 1 -2 2 M 4 -5 L 4 -3 L 6 -3 L 5 -4 L 4 -5'
    ];
    const graphics = [];

    symbolList.forEach((st, i) => {
      const symbol = createSymbol({
        symbolType: st,
        x: ((i * 30) % 150) + 30,
        y: (Math.floor((i * 30) / 150) + 1) * 30,
        size: 60,
        // fill: 'pink',
        stroke: 'green',
        background:
          'data:image/png;base64,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',
        // '<svg t="1683876749384" class="icon" viewBox="0 0 1059 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="5625" width="200" height="200"><path d="M928.662069 17.655172h-812.137931v208.331035h812.137931z" fill="#F1543F" p-id="5626"></path><path d="M1020.468966 275.42069l-236.579311 367.227586c0-17.655172-3.531034-35.310345-14.124138-49.434483-17.655172-24.717241-56.496552-28.248276-81.213793-45.903448-21.186207-14.124138-35.310345-42.372414-60.027586-56.496552L928.662069 17.655172l24.717241 14.124138c88.275862 49.434483 116.524138 158.896552 67.089656 243.64138M416.662069 490.813793c-21.186207 14.124138-38.841379 42.372414-60.027586 56.496552-24.717241 17.655172-63.558621 24.717241-81.213793 45.903448-10.593103 14.124138-10.593103 31.77931-14.124138 49.434483L24.717241 275.42069C-24.717241 190.675862 3.531034 81.213793 91.806897 31.77931l24.717241-14.124138 300.137931 473.158621z" fill="#FF7058" p-id="5627"></path><path d="M893.351724 656.772414c0 38.841379-35.310345 70.62069-45.903448 102.4-10.593103 35.310345-3.531034 81.213793-24.717242 109.462069-21.186207 28.248276-67.089655 35.310345-98.868965 56.496551-31.77931 28.248276-52.965517 70.62069-88.275862 81.213794-35.310345 10.593103-77.682759-10.593103-112.993104-10.593104-38.841379 0-81.213793 21.186207-116.524137 10.593104S349.572414 953.37931 317.793103 932.193103c-31.77931-21.186207-77.682759-28.248276-98.868965-56.496551-21.186207-28.248276-14.124138-74.151724-24.717241-109.462069-10.593103-35.310345-45.903448-67.089655-45.903449-102.4 0-38.841379 35.310345-70.62069 45.903449-105.931035 10.593103-35.310345 3.531034-81.213793 24.717241-109.462069 21.186207-28.248276 67.089655-35.310345 98.868965-56.496551 28.248276-21.186207 49.434483-63.558621 88.275863-74.151725 35.310345-10.593103 77.682759 10.593103 116.524137 10.593104 38.841379 0 81.213793-21.186207 112.993104-10.593104 35.310345 10.593103 56.496552 52.965517 88.275862 74.151725 31.77931 21.186207 77.682759 28.248276 98.868965 56.496551 21.186207 28.248276 14.124138 74.151724 24.717242 109.462069 10.593103 31.77931 45.903448 63.558621 45.903448 98.868966" fill="#F8B64C" p-id="5628"></path><path d="M790.951724 656.772414c0 144.772414-120.055172 264.827586-268.358621 264.827586-148.303448 0-268.358621-120.055172-268.35862-264.827586s120.055172-264.827586 268.35862-264.827586c148.303448 0 268.358621 120.055172 268.358621 264.827586" fill="#FFD15C" p-id="5629"></path><path d="M706.206897 589.682759h-123.586207c-7.062069 0-10.593103-3.531034-14.124138-10.593104L529.655172 466.096552c-3.531034-14.124138-21.186207-14.124138-28.248275 0l-38.84138 112.993103c-3.531034 7.062069-7.062069 10.593103-14.124138 10.593104H335.448276c-14.124138 0-21.186207 17.655172-7.062069 24.717241l98.868965 70.62069c3.531034 3.531034 7.062069 10.593103 3.531035 14.124138L391.944828 812.137931c-3.531034 14.124138 10.593103 24.717241 21.186206 14.124138l98.868966-70.62069c3.531034-3.531034 10.593103-3.531034 17.655172 0l98.868966 70.62069c10.593103 7.062069 24.717241-3.531034 21.186207-14.124138l-38.841379-112.993103c-3.531034-7.062069 0-10.593103 3.531034-14.124138l98.868966-70.62069c14.124138-7.062069 7.062069-24.717241-7.062069-24.717241" fill="#F8B64C" p-id="5630"></path></svg>',
        texture: 'diamond',
        texturePadding: 0,
        textureSize: 3,
        textureColor: 'red'
      });
      symbol.addEventListener('mouseenter', () => {
        symbol.setAttribute('fill', 'blue');
      });
      graphics.push(symbol);
    });

    graphics.forEach(g => {
      stage.defaultLayer.add(g);
    });
  },
  drawText(stage) {
    const graphics = [];

    graphics.push(
      createText({
        x: 0,
        y: 100,
        fill: 'green',
        stroke: 'red',
        text: 'Testabcdefg',
        fontSize: 20,
        textBaseline: 'top'
      })
    );

    graphics.push(
      createText({
        x: 100,
        y: 20,
        fill: {
          gradient: 'linear',
          x0: 0,
          y0: 0,
          x1: 1,
          y1: 1,
          stops: [
            { offset: 0, color: 'green' },
            { offset: 0.5, color: 'orange' },
            { offset: 1, color: 'red' }
          ]
        },
        text: ['这'],
        fontSize: 180,
        textBaseline: 'top'
      })
    );

    graphics.forEach(g => {
      stage.defaultLayer.add(g);
    });
  },
  drawImage(stage) {
    const graphics = [];
    const urlPng = 'https://vega.github.io/images/idl-logo.png';
    // const svg =
    //   '<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="6" cy="6" r="6" fill="#FD9C87"></circle><circle opacity="0.6" cx="6" cy="6" r="1" stroke="white" stroke-width="2"></circle></svg>';
    const base64 =
      'data:image/png;base64,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';
    graphics.push(
      createImage({
        x: 0,
        y: 0,
        width: 100,
        height: 100,
        image: urlPng,
        repeatX: 'repeat',
        repeatY: 'repeat'
      })
    );

    // const svgImage = createImage({
    //   x: 100,
    //   y: 100,
    //   width: 100,
    //   height: 100,
    //   image: svg
    // });
    // graphics.push(svgImage);

    const image = createImage({
      x: 200,
      y: 100,
      width: 100,
      height: 100,
      image: base64
    });
    graphics.push(image);

    graphics.forEach(g => {
      stage.defaultLayer.add(g);
    });
  },
  drawArc(stage) {
    const graphics = [];

    graphics.push(
      createArc({
        innerRadius: 60,
        outerRadius: 137.8,
        startAngle: -1.5707963267948966,
        endAngle: -0.3141592653589793,
        x: 100,
        y: 200,
        cornerRadius: 6,
        stroke: 'green',
        lineWidth: 2,
        cap: false
      })
    );

    graphics.push(
      createArc({
        innerRadius: 20,
        outerRadius: 60,
        startAngle: 0,
        endAngle: Math.PI * 2,
        x: 100,
        y: 120,
        fill: {
          gradient: 'linear',
          x0: 0,
          y0: 0,
          x1: 1,
          y1: 0,
          stops: [
            { offset: 0, color: 'green' },
            { offset: 0.5, color: 'orange' },
            { offset: 1, color: 'red' }
          ]
        },
        fillOpacity: 0.3,
        stroke: 'green',
        lineWidth: 2,
        cap: false
      })
    );

    graphics.forEach(g => {
      stage.defaultLayer.add(g);
    });
  },
  drawLine(stage) {
    const graphics = [];

    const subP1 = [
      [0, 100],
      [20, 40],
      [40, 60],
      [60, 20],
      [70, 30]
    ].map(item => ({ x: item[0] / 5, y: item[1] / 5, defined: item[0] !== 70 }));

    const subP2 = [
      [80, 80],
      [120, 60],
      [160, 40],
      [200, 20],
      [240, 50]
    ].map(item => ({ x: item[0] / 5, y: item[1] / 5 }));

    const points = [
      [0, 100],
      [20, 40],
      [40, 60],
      [60, 20],
      [70, 30],
      [80, 80],
      [120, 60],
      [160, 40],
      [200, 20],
      [240, 50]
    ].map(item => ({ x: item[0] / 5, y: item[1] / 5, defined: item[0] !== 70 }));

    ['linear', 'step', 'stepBefore', 'stepAfter', 'basis', 'monotoneX', 'monotoneY'].forEach((type, i) => {
      graphics.push(
        createLine({
          points,
          curveType: type,
          x: (((i * 300) % 900) + 100) / 5,
          y: (Math.floor((i * 300) / 900) * 200) / 5,
          stroke: 'red'
        })
      );
    });

    ['linear', 'step', 'stepBefore', 'stepAfter', 'basis', 'monotoneX', 'monotoneY'].forEach((type, i) => {
      i += 7;
      graphics.push(
        createLine({
          points,
          curveType: type,
          x: (((i * 300) % 900) + 100) / 5,
          y: (Math.floor((i * 300) / 900) * 200) / 5,
          segments: [
            { points: subP1, stroke: 'blue', lineWidth: 6 },
            { points: subP2, stroke: 'pink', lineWidth: 2, lineDash: [3, 3] }
          ],
          stroke: 'red'
        })
      );
    });

    graphics.forEach(g => {
      stage.defaultLayer.add(g);
    });
  },
  drawArea(stage) {
    const graphics = [];

    const subP1 = [
      [0, 100],
      [20, 40],
      [40, 60],
      [60, 20],
      [70, 30]
    ].map(item => ({ x: item[0] / 5, y: item[1] / 5, y1: 120 / 5, defined: item[0] !== 70 }));

    const subP2 = [
      [80, 80],
      [120, 60],
      [160, 40],
      [200, 20],
      [240, 50]
    ].map(item => ({ x: item[0] / 5, y1: 120 / 5, y: item[1] / 5 }));

    const points = [
      [0, 100],
      [20, 40],
      [40, 60],
      [60, 20],
      [70, 30],
      [80, 80],
      [120, 60],
      [160, 40],
      [200, 20],
      [240, 50]
    ].map(item => ({ x: item[0] / 5, y: item[1] / 5, y1: 120 / 5, defined: item[0] !== 70 }));

    ['linear', 'step', 'stepBefore', 'stepAfter', 'basis', 'monotoneX', 'monotoneY'].forEach((type, i) => {
      graphics.push(
        createArea({
          points,
          curveType: type,
          x: (((i * 300) % 900) + 100) / 5,
          y: (Math.floor((i * 300) / 900) * 200) / 5,
          fill: {
            gradient: 'linear',
            x0: 0,
            y0: 0,
            x1: 1,
            y1: 0,
            stops: [
              { offset: 0, color: 'green' },
              { offset: 0.5, color: 'orange' },
              { offset: 1, color: 'red' }
            ]
          }
        })
      );
    });

    ['linear', 'step', 'stepBefore', 'stepAfter', 'basis', 'monotoneX', 'monotoneY'].forEach((type, i) => {
      i += 7;
      graphics.push(
        createArea({
          points,
          curveType: type,
          x: (((i * 300) % 900) + 100) / 5,
          y: (Math.floor((i * 300) / 900) * 200) / 5,
          segments: [
            { points: subP1, fill: 'red' },
            {
              points: subP2,
              fill: 'pink'
            }
          ],
          fill: true
        })
      );
    });

    graphics.forEach(g => {
      stage.defaultLayer.add(g);
    });
  }
});
