// logs.ts
// const util = require('../../utils/util.js')
// import { formatTime } from '../../utils/util'
import VRender from './index';

const { global, createStage, createRect, createSymbol, createText, createArc, createLine, createArea } = VRender;

Page({
  data: {
  },
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
          console.log(domref, domref.width, domref.height)
          const canvasIdLists = ['draw', 'backup', 'interactive'];
          global.setEnv('feishu', { domref, force: true, canvasIdLists, freeCanvasIdx: 0 });
          const stage = createStage({ canvas: global.getElementById('draw'), width: domref.width, height: domref.height, autoRender: true });
          this.stage = stage;
          // const ctx = stage.window.getContext().nativeContext;
          // const ctx = tt.createCanvasContext('draw');
          // ctx.beginPath();
          // ctx.fillStyle = 'red';
          // ctx.rect(0, 0, 100, 100);
          // ctx.fill();
          // ctx.draw();
          switch(name) {
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
          }
        }).exec()
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
    this.stage && (this.stage).window.dispatchEvent(event);
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
  
    graphics.push(createRect({
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
    }));
  
    graphics.forEach(g => {
      stage.defaultLayer.add(g);
    })

    // stage.render();
    console.log(stage);
  },
  drawSymbol(stage) {
    const symbolList = [
      'circle', 'cross', 'diamond', 'square', 'arrow', 'arrow2Left', 'arrow2Right', 'wedge', 'thinTriangle', 'triangle', 'triangleUp', 'triangleDown', 'triangleRight', 'triangleLeft', 'stroke', 'star', 'wye', 'rect',
      'M -2 2 L 4 -5 L 7 -6 L 6 -3 L -1 3 C 0 4 0 5 1 4 C 1 5 2 6 1 6 A 1.42 1.42 0 0 1 0 7 A 5 5 0 0 0 -2 4 Q -2.5 3.9 -2.5 4.5 T -4 5.8 T -4.8 5 T -3.5 3.5 T -3 3 A 5 5 90 0 0 -6 1 A 1.42 1.42 0 0 1 -5 0 C -5 -1 -4 0 -3 0 C -4 1 -3 1 -2 2 M 4 -5 L 4 -3 L 6 -3 L 5 -4 L 4 -5'
    ]
    const graphics = [];
    
    symbolList.forEach((st, i) => {
      const symbol = createSymbol({
        symbolType: st,
        x: (i * 30) % 150 + 30,
        y: (Math.floor(i * 30 / 150) + 1) * 30,
        size: 20,
        fill: 'red',
        stroke: 'green'
      });
      symbol.addEventListener('mouseenter', () => {
        symbol.setAttribute('fill', 'blue');
      })
      graphics.push(symbol);
    })
  
    graphics.forEach(g => {
      stage.defaultLayer.add(g);
    })
  },
  drawText(stage) {
    const graphics = [];
    
    graphics.push(createText({
      x: 0,
      y: 100,
      fill: 'green',
      stroke: 'red',
      text: 'Testabcdefg',
      fontSize: 20,
      textBaseline: 'top'
    }));
  
    graphics.push(createText({
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
    }));
  
    graphics.forEach(g => {
      stage.defaultLayer.add(g);
    })
  },
  drawArc(stage) {
    const graphics = [];
    
    graphics.push(createArc({
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
    }));
  
    graphics.push(createArc({
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
    }));
  
    graphics.forEach(g => {
      stage.defaultLayer.add(g);
    })
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
      graphics.push(createLine({
        points,
        curveType: type,
        x: ((i * 300) % 900 + 100) / 5,
        y: ((Math.floor(i * 300 / 900)) * 200) / 5,
        stroke: 'red'
      }));
    });
  
    ['linear', 'step', 'stepBefore', 'stepAfter', 'basis', 'monotoneX', 'monotoneY'].forEach((type, i) => {
      i += 7;
      graphics.push(createLine({
        points,
        curveType: type,
        x: ((i * 300) % 900 + 100) / 5,
        y: ((Math.floor(i * 300 / 900)) * 200) / 5,
        segments: [
          { points: subP1, stroke: 'blue', lineWidth: 6 },
          { points: subP2, stroke: 'pink', lineWidth: 2, lineDash: [3, 3] }
        ],
        stroke: 'red'
      }));
    });
  
    graphics.forEach(g => {
      stage.defaultLayer.add(g);
    })
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
      graphics.push(createArea({
        points,
        curveType: type,
        x: ((i * 300) % 900 + 100) / 5,
        y: ((Math.floor(i * 300 / 900)) * 200) / 5,
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
      }));
    });
  
    ['linear', 'step', 'stepBefore', 'stepAfter', 'basis', 'monotoneX', 'monotoneY'].forEach((type, i) => {
      i += 7;
      graphics.push(createArea({
        points,
        curveType: type,
        x: ((i * 300) % 900 + 100) / 5,
        y: ((Math.floor(i * 300 / 900)) * 200) / 5,
        segments: [
          { points: subP1, fill: 'red' },
          {
            points: subP2,
            fill: 'pink'
          }
        ],
        fill: true
      }));
    });
  
    graphics.forEach(g => {
      stage.defaultLayer.add(g);
    })
  }
})
