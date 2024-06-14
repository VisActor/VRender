import {
  createStage,
  createRect,
  createLine,
  createText,
  IncreaseCount,
  Stage,
  InputText,
  FadeInPlus,
  defaultTicker,
  createGroup,
  createCircle,
  builtinSymbolsMap,
  createPath,
  CustomPath2D,
  CurveContext,
  MotionPath,
  createArea,
  StreamLight,
  createSymbol,
  Meteor,
  AttributeUpdateType,
  IStage,
  Easing
} from '@visactor/vrender';
import { addShapesToStage, colorPools } from '../utils';

let stage: any;

defaultTicker.start();
function addCase(name: string, container: HTMLElement, cb: (stage: Stage) => void) {
  const button = document.createElement('button');
  button.innerText = name;
  container.appendChild(button);
  button.addEventListener('click', () => {
    stage && stage.release();
    stage = createStage({
      canvas: document.getElementById('main') as HTMLCanvasElement,
      width: 900,
      height: 600,
      disableDirtyBounds: false,
      canvasControled: false,
      autoRender: true
    });
    cb(stage);
  });
}

export const page = () => {
  const container = document.querySelector<HTMLDivElement>('#container')!;
  const br = document.createElement('br');
  container.appendChild(br);
  addCase('text', container, stage => {
    stage.background = 'black';
    const g = createGroup({});
    const x = 500;
    const y = 500;
    const delta = 7;
    const t1 = createText({
      text: 'VisActor',
      textAlign: 'center',
      textBaseline: 'middle',
      fontSize: 200,
      fontFamily: 'Lato',
      fontWeight: 'bolder',
      fill: '#08fff9',
      blend: 'lighten',
      x: x,
      y: y
    });
    g.add(t1);
    const t2 = createText({
      text: 'VisActor',
      textAlign: 'center',
      textBaseline: 'middle',
      fontSize: 200,
      fontFamily: 'Lato',
      fontWeight: 'bolder',
      blend: 'lighten',
      fill: '#f00044',
      x: x + delta,
      y: y + delta
    });
    g.add(t2);

    stage.defaultLayer.add(g);
    t1.animate()
      .to({ dx: delta, dy: delta }, 70, 'backOut')
      .to({ dx: -delta / 2, dy: -delta / 2 }, 100, 'backOut')
      .to({ dx: 0, dy: 0 }, 30, 'backOut')
      .wait(2000)
      .loop(Infinity);
    t2.animate()
      .to({ dx: -delta, dy: -delta }, 70, 'backOut')
      .to({ dx: delta / 2, dy: delta / 2 }, 100, 'backOut')
      .to({ dx: 0, dy: 0 }, 30, 'backOut')
      .wait(2000)
      .loop(Infinity);

    const colors = ['#f00', '#0f0', '#00f', '#ff0', '#f0f', '#0ff'];
    const lines = new Array(16).fill(0).map(() => {
      const line = createLine({
        x: x + (Math.random() - 0.5) * x * 2,
        y: y + (Math.random() - 0.5) * y * 0.8,
        lineWidth: Math.random() * 5,
        points: [
          { x: 0, y: 0 },
          { x: Math.random() * 200 + 60, y: 0 }
        ],
        stroke: colors[Math.floor(Math.random() * colors.length)],
        opacity: 0
      });
      g.add(line);
      return line;
    });

    lines.forEach(line => {
      line
        .animate()
        .wait(1000)
        .to({ opacity: 1 }, 1, 'linear')
        .to({ x: (line.attribute?.x ?? 0) > x ? -2000 : 2000 }, 500, 'linear')
        .runCb(() => {
          console.log('回调');
          line.setAttributes({
            x: x + (Math.random() - 0.5) * x * 2,
            y: y + (Math.random() - 0.5) * y * 0.8,
            lineWidth: Math.random() * 5,
            points: [
              { x: 0, y: 0 },
              { x: Math.random() * 200 + 60, y: 0 }
            ],
            opacity: 0
          });
        })
        .loop(Infinity);
    });
    //   setInterval(function () {
    //     if (Math.random() > 0.2) {
    //       t2.set
    //         t2.attr('position', [w / 2 + Math.random() * 50, h / 2]);

    //         setTimeout(function () {
    //             t2.attr('position', [w / 2, h / 2]);

    //             for (var i = 0; i < lines.length; ++i) {
    //                 lines[i].attr('style', {
    //                     opacity: 0
    //                 });
    //             }
    //         }, 100);
    //     }
    // }, 500);
  });
  addCase('car🚗', container, stage => {
    const text = createText({
      text: '🚗',
      fontSize: 37,
      fill: true,
      textAlign: 'center',
      textBaseline: 'middle'
    });
    const text2 = createText({
      text: '🐶',
      fontSize: 37,
      fill: true,
      textAlign: 'center',
      textBaseline: 'middle'
    });

    const pathStr = builtinSymbolsMap['arrow'].pathStr;
    const pathStr2 = builtinSymbolsMap['circle'].pathStr;

    const path = createPath({
      path: pathStr,
      scaleX: 600,
      scaleY: 600,
      x: 350,
      y: 500,
      stroke: 'grey',
      strokeOpacity: 0.6,
      lineDash: [0.01, 0.01]
    });
    const path2 = createPath({
      path: pathStr2,
      scaleX: 700,
      scaleY: 700,
      x: 350,
      y: 500,
      stroke: 'grey',
      strokeOpacity: 0.6,
      lineDash: [0.01, 0.01]
    });
    stage.defaultLayer.add(path as any);
    stage.defaultLayer.add(path2 as any);
    stage.defaultLayer.add(text as any);
    stage.defaultLayer.add(text2 as any);
    {
      const cp = new CustomPath2D();
      cp.setCtx(new CurveContext(cp));
      cp.fromString(pathStr, 350, 500, 600, 600);
      console.log(cp);
      text
        .animate()
        .play(new MotionPath(null, null, 10000, 'quadIn', { path: cp, distance: 1, changeAngle: true }))
        .reversed(true);
    }
    {
      const cp = new CustomPath2D();
      cp.setCtx(new CurveContext(cp));
      cp.fromString(pathStr2, 350, 500, 700, 700);
      console.log(cp);
      text2
        .animate()
        .play(new MotionPath(null, null, 10000, 'quadIn', { path: cp, distance: 1, changeAngle: true }))
        .reversed(true);
    }
    stage.render();
  });
  addCase('stream-light', container, stage => {
    for (let i = 0; i < 6; i++) {
      const r = createRect({
        y: 100,
        x: 50 + i * 100,
        width: 20,
        height: 0,
        fill: 'blue'
      });
      r.animate()
        .to({ width: Math.random() * 900 + 300 }, 1000, 'quadIn')
        .subAnimate()
        .play(new StreamLight('', 0, 2000, 'quadIn', { isHorizontal: false }))
        .loop(Infinity);
      stage.defaultLayer.add(r as any);
    }
  });

  addCase('Meteor', container, stage => {
    const line = createLine({
      visible: true,
      curveType: 'basis',
      points: [
        {
          x: 131.35000101725262,
          y: 100
        },
        {
          x: 306.4833357069228,
          y: 881
        },
        {
          x: 481.6166703965929,
          y: 770.875
        },
        {
          x: 656.7500050862631,
          y: 660.75
        },
        {
          x: 100.7500050862631,
          y: 200.75
        }
      ].reverse()
    });

    const cp = new CustomPath2D();
    cp.fromLine(line as any);

    for (let i = 0; i < 6; i++) {
      const symbol = createSymbol({
        symbolType: 'star',
        x: 130,
        y: 100,
        opacity: 0,
        fill: colorPools[Math.floor(Math.random() * 10)]
      });
      symbol
        .animate()
        .startAt(i * 600)
        .to({ opacity: 1 }, 1, 'linear')
        .play(new MotionPath(null, null, 10000, 'quadInOut', { path: cp, distance: 1 }))
        .reversed(true);
      symbol
        .animate()
        .startAt(i * 600)
        .play(new Meteor(10, 10000, 'quadIn'));
      stage.defaultLayer.add(symbol);
    }
  });

  addCase('textInput', container, stage => {
    const text = createText({
      text: '',
      fontSize: 28,
      x: 100,
      y: 200,
      fill: 'black',
      stroke: 'black',
      textBaseline: 'top'
    });
    text
      .animate()
      .play(
        new InputText(
          { text: '' },
          { text: 'The more beauty you see, the more insights you gain. VisActor, presenting the beauty of data.' },
          3000,
          'quadIn'
        )
      );
    stage.defaultLayer.add(text as any);
  });

  addCase('multi-animate', container, stage => {
    const symbol = createSymbol({
      x: 100,
      y: 100,
      symbolType: 'circle',
      size: 100,
      fill: 'red'
    });
    symbol.animate().to({ size: 1000 }, 1000, 'linear');
    const stage2 = createStage({ container: 'container', width: 500, height: 500, autoRender: true });
    stage.defaultLayer.add(symbol);
    console.time();
    new Array(6000000).fill(0).forEach(item => {
      const s = createSymbol({
        x: Math.random() * 1000,
        y: Math.random() * 1000,
        symbolType: 'circle',
        size: 100,
        fill: 'red'
      });
      stage2.defaultLayer.add(s);
    });
    console.timeEnd();
  });

  // addCase('numberIncrease', container, stage => {
  //   const text = createText({
  //     text: 10000,
  //     fontSize: 36,
  //     x: 200,
  //     y: 200,
  //     fill: 'red'
  //   });
  //   text
  //     .animate()
  //     .play(new IncreaseCount({ text: 'fjdkalfjdklfjasdf;' }, { text: 'fdfdfdasfadsfasdfasdf' }, 1000, 'quadIn'));
  //   stage.defaultLayer.add(text as any);
  // });
  // addCase('area', container, stage => {
  //   const area = createArea({
  //     visible: true,
  //
  //     stroke: '#000',
  //     lineWidth: 4,
  //     fillOpacity: 0.3,
  //
  //     fill: '#6690F2',
  //     defined: true,
  //     points: [
  //       {
  //         x: 122.61342947823661,
  //         y: 238.57999999999998,
  //         x1: null,
  //         y1: 453
  //       },
  //       {
  //         x: 286.0980021158854,
  //         y: 260.7266666666667,
  //         x1: null,
  //         y1: 453
  //       },
  //       {
  //         x: 449.58257475353423,
  //         y: 236.31500000000003,
  //         x1: null,
  //         y1: 453
  //       },
  //       {
  //         x: 613.067147391183,
  //         y: 273.81333333333333,
  //         x1: null,
  //         y1: 453
  //       },
  //       {
  //         x: 776.5517200288318,
  //         y: 270.0383333333333,
  //         x1: null,
  //         y1: 453
  //       },
  //       {
  //         x: 940.0362926664807,
  //         y: 295.205,
  //         x1: null,
  //         y1: 453
  //       },
  //       {
  //         x: 1103.5208653041293,
  //         y: 285.8933333333334,
  //         x1: null,
  //         y1: 453
  //       },
  //       {
  //         x: 1267.0054379417782,
  //         y: 235.3083333333333,
  //         x1: null,
  //         y1: 453
  //       }
  //     ],
  //     pickable: true,
  //     zIndex: 300,
  //     clipRange: 0
  //   });
  //   console.log(area);
  //   area.animate().to({ clipRange: 1 }, 2000, 'quadIn');
  //   stage.defaultLayer.add(area as any);
  // });

  addCase('textFadeIn', container, stage => {
    const text = createText({
      text: ['这是一段很长的文字这是一段很长的文字这是一段很长的文字', 'abcdefghijklmn'],
      fontSize: 36,
      x: 200,
      y: 200
      // stroke: 'red',
      // fill: 'red'
    });
    console.log('text添加');
    text
      .animate()
      // .wait(4000)
      .play(new FadeInPlus(0, null, 2000, 'quadIn'));

    // text.onBeforeAttributeUpdate = (val: any, attributes: any, key: null | string | string[], context?: any) => {
    //   if (
    //     context &&
    //     context.type === AttributeUpdateType.ANIMATE_UPDATE &&
    //     context.animationState &&
    //     context.animationState.isFirstFrameOfStep &&
    //     context.animationState.step.type !== 'wait'
    //   ) {
    //     console.log(val, attributes, key, context);
    //   }
    // };

    text.on('afterAttributeUpdate', e => {
      console.log('事件监听', e);
    });
    stage.defaultLayer.add(text as any);
  });

  // addCase('defaultAttr', container, stage => {
  //   const text = createText({
  //     text: ['这是一段很长的文字这是一段很长的文字这是一段很长的文字', 'abcdefghijklmn'],
  //     fontSize: 36,
  //     x: 200,
  //     y: 200,
  //     fill: 'red',
  //     stroke: 'black'
  //   });
  //   text.animate().to({ fill: undefined }, 2000, 'quadIn');
  //   stage.defaultLayer.add(text as any);
  //   // stage.render();
  // });

  // addCase('textInput', container, stage => {
  //   const text = createText({
  //     text: '这是一段很长的文字这是一段很长的文字这是一段很长的文字',
  //     fontSize: 36,
  //     x: 200,
  //     y: 200,
  //     fill: 'black',
  //     stroke: 'black',
  //     textBaseline: 'top'
  //   });
  //   text
  //     .animate()
  //     .play(new InputText({ text: 'fjdkalfjdklfjasdf;' }, { text: 'fdfdfdasfadsfasdfasdf' }, 2000, 'quadIn'));
  //   stage.defaultLayer.add(text as any);
  // });

  // addCase('动画组合', container, stage => {
  //   const bottom = 800;
  //   const arr = new Array(6).fill(0).map((_, i) => {
  //     const rect = createRect({
  //       x: i * 100,
  //       y: bottom,
  //       width: 50,
  //       height: 0,
  //       fill: 'red'
  //     });
  //     const height = 600;
  //     rect.animate().to({ y: bottom - height, height }, 3000, 'quadIn');
  //     stage.defaultLayer.add(rect as any);
  //     return rect;
  //   });
  //   const button = document.createElement('button');
  //   button.style.position = 'fixed';
  //   button.style.left = '600px';
  //   button.style.top = '100px';
  //   button.innerText = 'update';
  //   button.addEventListener('click', () => {
  //     arr.forEach(rect => {
  //       const height = Math.random() * 600;
  //       rect.animate().to({ y: bottom - height, height }, 600, 'quadIn');
  //     });
  //   });
  //   document.body.appendChild(button);
  // });

  // addCase('stream-light', container, stage => {
  //   for (let i = 0; i < 6; i++) {
  //     const r = createRect({
  //       x: 100,
  //       y: 50 + i * 100,
  //       width: 0,
  //       height: 30,
  //       fill: 'blue'
  //     });
  //     r.animate()
  //       .to({ width: Math.random() * 900 + 300 }, 1000, 'quadIn')
  //       .runCb(() => {
  //         console.log('abc');
  //       })
  //       .play(new StreamLight('', 0, 2000, 'quadIn'))
  //       .loop(Infinity);
  //     stage.defaultLayer.add(r as any);
  //   }
  //   // const text = createText({
  //   //   text: '这是一段很长的文字这是一段很长的文字这是一段很长的文字',
  //   //   fontSize: 36,
  //   //   x: 200,
  //   //   y: 200,
  //   //   fill: 'black',
  //   //   stroke: 'black',
  //   //   textBaseline: 'top'
  //   // });
  // });

  // addCase('blur', container, stage => {
  //   const line1 = createLine({
  //     x: 0,
  //     y: 0,
  //     points: [
  //       { x: 100, y: 100 },
  //       { x: 200, y: 700 }
  //     ],
  //     stroke: 'red',
  //     lineWidth: 6,
  //     blur: 60
  //   });
  //   line1.animate().to({ blur: 0 }, 1000, 'quadIn');
  //   stage.defaultLayer.add(line1 as any);
  //   for (let i = 0; i < 6; i++) {
  //     const r = createRect({
  //       x: 100,
  //       y: 50 + i * 100,
  //       width: Math.random() * 900 + 300,
  //       height: 60,
  //       fill: 'blue'
  //     });
  //     r.animate().to({ blur: 30 }, 1000, 'quadIn');
  //     stage.defaultLayer.add(r as any);
  //   }
  //   const line2 = createLine({
  //     x: 0,
  //     y: 200,
  //     points: [
  //       { x: 100, y: 100 },
  //       { x: 200, y: 700 }
  //     ],
  //     stroke: 'orange',
  //     lineWidth: 6
  //   });
  //   stage.defaultLayer.add(line2 as any);
  // });

  // addCase('gradient-color', container, stage => {
  //   const text = createText({
  //     text: '这是一段很长的文字这是一段很长的文字这是一段很长的文字',
  //     fontSize: 36,
  //     x: 200,
  //     y: 200,
  //     fill: {
  //       gradient: 'linear',
  //       x0: 0,
  //       y0: 0,
  //       x1: 1,
  //       y1: 0,
  //       stops: [
  //         { offset: 0, color: 'pink' },
  //         { offset: 0.5, color: 'orange' },
  //         { offset: 1, color: 'red' }
  //       ]
  //     }
  //   });
  //   text.animate().to(
  //     {
  //       fill: {
  //         gradient: 'linear',
  //         x0: 0,
  //         y0: 0,
  //         x1: 1,
  //         y1: 0,
  //         stops: [
  //           { offset: 0, color: 'red' },
  //           { offset: 0.5, color: 'pink' },
  //           { offset: 1, color: 'orange' }
  //         ]
  //       }
  //     },
  //     1000,
  //     'quadIn'
  //   );
  //   stage.defaultLayer.add(text as any);
  //   stage.render();
  // });

  // addCase('爆炸💥', container, stage => {
  //   const line = createLine({
  //     visible: true,
  //     lineWidth: 20,
  //     strokeOpacity: 0.7,
  //     lineCap: 'round',
  //     lineJoin: 'bevel',
  //     curveType: 'linear',
  //     shadowColor: 'rgba(0, 0, 0, 0.1)',
  //     shadowBlur: 10,
  //     shadowOffsetX: 0,
  //     shadowOffsetY: 4,
  //
  //     stroke: {
  //       x0: 0,
  //       y0: 0.5,
  //       x1: 1,
  //       y1: 0.5,
  //       stops: [
  //         {
  //           offset: 0,
  //           color: '#009DB5'
  //         },
  //         {
  //           offset: 1,
  //           color: '#F0B71F'
  //         }
  //       ],
  //       gradient: 'linear'
  //     },
  //     clipRangeByDimension: 'x',
  //     points: [
  //       {
  //         x: 131.35000101725262,
  //         y: 700
  //       },
  //       {
  //         x: 306.4833357069228,
  //         y: 781
  //       },
  //       {
  //         x: 581.6166703965929,
  //         y: 200.875
  //       },
  //       {
  //         x: 656.7500050862631,
  //         y: 660.75
  //       }
  //     ].reverse()
  //   });
  //   const text = createText({
  //     text: '💥',
  //     fontSize: 37,
  //     x: 100,
  //     y: 100,
  //     fill: 'red',
  //     textAlign: 'center',
  //     textBaseline: 'middle'
  //   });
  //   stage.defaultLayer.add(line as any);
  //   stage.defaultLayer.add(text as any);
  //   {
  //     const cp = new CustomPath2D();
  //     cp.fromLine(line as any);
  //     text
  //       .animate({
  //         onEnd() {
  //           text.animate().to(
  //             {
  //               opacity: 0
  //             },
  //             1000,
  //             'quadIn'
  //           );
  //         }
  //       })
  //       .play(new MotionPath(null, null, 10000, 'quadInOut', { path: cp, distance: 1 }))
  //       .reversed(true);
  //     line.animate().to({ clipRange: 0 }, 10000, 'quadInOut');
  //   }
  //   // stage.render();
  // });

  // addCase('car🚗', container, stage => {
  //   const text = createText({
  //     text: '🚗',
  //     fontSize: 37,
  //     x: 100,
  //     y: 100,
  //     fill: 'red',
  //     textAlign: 'center',
  //     textBaseline: 'middle'
  //   });
  //   const text2 = createText({
  //     text: '🐶',
  //     fontSize: 37,
  //     x: 100,
  //     y: 100,
  //     fill: 'red',
  //     textAlign: 'center',
  //     textBaseline: 'middle'
  //   });

  //   const pathStr = builtinSymbolsMap['arrow'].pathStr;
  //   const pathStr2 = builtinSymbolsMap['circle'].pathStr;

  //   const path = createPath({
  //     path: pathStr,
  //     scaleX: 600,
  //     scaleY: 600,
  //     x: 350,
  //     y: 500,
  //     stroke: 'grey',
  //     strokeOpacity: 0.6,
  //     lineDash: [0.01, 0.01]
  //   });
  //   const path2 = createPath({
  //     path: pathStr2,
  //     scaleX: 700,
  //     scaleY: 700,
  //     x: 350,
  //     y: 500,
  //     stroke: 'grey',
  //     strokeOpacity: 0.6,
  //     lineDash: [0.01, 0.01]
  //   });
  //   stage.defaultLayer.add(path as any);
  //   stage.defaultLayer.add(path2 as any);
  //   stage.defaultLayer.add(text as any);
  //   stage.defaultLayer.add(text2 as any);
  //   {
  //     const cp = new CustomPath2D();
  //     cp.setCtx(new CurveContext(cp));
  //     cp.fromString(pathStr, 350, 500, 600, 600);
  //     console.log(cp);
  //     text
  //       .animate()
  //       .play(new MotionPath(null, null, 10000, 'quadIn', { path: cp, distance: 1 }))
  //       .reversed(true);
  //   }
  //   {
  //     const cp = new CustomPath2D();
  //     cp.setCtx(new CurveContext(cp));
  //     cp.fromString(pathStr2, 350, 500, 700, 700);
  //     console.log(cp);
  //     text2
  //       .animate()
  //       .play(new MotionPath(null, null, 10000, 'quadIn', { path: cp, distance: 1 }))
  //       .reversed(true);
  //   }
  //   stage.render();
  // });

  // addCase('Meteor', container, stage => {
  //   const line = createLine({
  //     visible: true,
  //     curveType: 'basis',
  //     points: [
  //       {
  //         x: 131.35000101725262,
  //         y: 100
  //       },
  //       {
  //         x: 306.4833357069228,
  //         y: 881
  //       },
  //       {
  //         x: 481.6166703965929,
  //         y: 770.875
  //       },
  //       {
  //         x: 656.7500050862631,
  //         y: 660.75
  //       },
  //       {
  //         x: 100.7500050862631,
  //         y: 200.75
  //       }
  //     ].reverse()
  //   });

  //   const cp = new CustomPath2D();
  //   cp.fromLine(line as any);

  //   const symbol = createSymbol({
  //     symbolType: 'star',
  //     x: 100,
  //     y: 100,
  //     fill: 'red'
  //   });
  //   symbol
  //     .animate()
  //     .play(new MotionPath(null, null, 10000, 'quadInOut', { path: cp, distance: 1 }))
  //     .reversed(true);
  //   symbol.animate().play(new Meteor(10, 10000, 'quadIn'));

  //   stage.defaultLayer.add(symbol);
  // });

  // addCase('旋转的小人', container, stage => {
  //   const group = createGroup({
  //     anchor: [350, 350],
  //     angle: 0
  //   });
  //   group.add(
  //     createCircle({
  //       startAngle: 0,
  //       endAngle: Math.PI * 2,
  //       radius: 50,
  //       x: 350,
  //       y: 150,
  //       fill: colorPools[10],
  //       // stroke: 'red',
  //       lineWidth: 2
  //     })
  //   );

  //   group.add(
  //     createRect({
  //       x: 250,
  //       y: 200,
  //       width: 200,
  //       height: 300,
  //       fill: colorPools[8]
  //     })
  //   );

  //   const leftHand = createRect({
  //     x: 150,
  //     y: 250,
  //     width: 100,
  //     height: 50,
  //     fill: colorPools[7]
  //   });

  //   group.add(leftHand);

  //   const rightHand = createRect({
  //     x: 450,
  //     y: 250,
  //     width: 100,
  //     height: 50,
  //     fill: colorPools[7]
  //   });

  //   group.add(rightHand);

  //   group.add(
  //     createRect({
  //       x: 270,
  //       y: 500,
  //       width: 50,
  //       height: 50,
  //       fill: colorPools[7]
  //     })
  //   );

  //   group.add(
  //     createRect({
  //       x: 380,
  //       y: 500,
  //       width: 50,
  //       height: 50,
  //       fill: colorPools[7]
  //     })
  //   );

  //   const rotateCenter = [350, 350];

  //   group.add(
  //     createRect({
  //       x: rotateCenter[0],
  //       y: rotateCenter[1],
  //       width: 5,
  //       height: 5,
  //       fill: 'green'
  //     })
  //   );

  //   const circle = createCircle({
  //     startAngle: 0,
  //     endAngle: Math.PI * 2,
  //     radius: 50,
  //     x: 3500,
  //     y: -1500,
  //     fill: 'red',
  //     // stroke: 'red',
  //     lineWidth: 2
  //   });
  //   group.add(circle);

  //   stage.defaultLayer.add(group as any);

  //   const lA = leftHand
  //     .animate()
  //     .to({ y: 200 }, 300, 'quadIn')
  //     .to({ y: 300 }, 300, 'quadIn')
  //     .to({ y: 250 }, 150, 'quadIn')
  //     .loop(6);
  //   const rA = rightHand
  //     .animate()
  //     .to({ y: 300 }, 300, 'quadIn')
  //     .to({ y: 200 }, 300, 'quadIn')
  //     .to({ y: 250 }, 150, 'quadIn')
  //     .loop(6);

  //   const comming = circle
  //     .animate({
  //       onEnd() {
  //         lA.stop();
  //         rA.stop();
  //       }
  //     })
  //     .to({ x: 350, y: 100 }, 1000, 'quadIn');

  //   group
  //     .animate()
  //     .after(comming)
  //     .to({ angle: -Math.PI * 2 }, 600, '')
  //     .loop(Infinity);
  //   circle.animate().after(comming).to({ opacity: 0 }, 300, 'quadIn');
  // });
};
