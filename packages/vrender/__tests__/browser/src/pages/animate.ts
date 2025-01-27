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
        .from({ defined: true }, 1000, 'linear')
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
  addCase('leaf', container, stage => {
    const leaf =
      'M 534.3246 -939.6686 C 530.5211 -970.608 527.1566 -996.3543 526.2789 -1013.1771 c -14.4091 -23.6983 -40.8137 -20.1143 -50.3954 -2.4137 c -0.8777 1.4629 -6.0709 8.9966 -36.5714 25.6 c -23.3326 12.5806 -53.6869 26.3314 -88.9417 42.5691 c -70.4366 32.1829 -158.3543 72.2651 -234.496 123.904 c -92.5257 62.6103 -148.992 129.024 -172.6171 203.0446 a 276.9189 276.9189 0 0 0 -3.6571 11.776 c -8.9966 -5.7783 -48.128 -61.8057 -124.928 -128.5851 C -243.7691 -788.4091 -328.3954 -846.1189 -424.5783 -862.5029 c -19.5291 -3.3646 -37.2297 12.288 -38.2537 34.0114 l -2.048 41.0331 c -8.4846 156.3063 -21.1383 392.4114 109.1291 543.4514 c 23.9909 27.7943 53.6869 50.1029 88.3566 67.5109 c 67.2914 33.9383 152.4297 49.8103 249.2709 53.9063 c 12.8731 0.512 17.2617 0.4389 17.1886 -3.5109 h 0.6583 c 0.5851 26.7703 -4.7543 54.272 -16.0914 82.2126 a 27.5749 27.5749 0 0 0 25.0149 37.8149 a 27.2091 27.2091 0 0 0 25.088 -16.9691 c 15.6526 -38.6194 20.5531 -73.1429 20.1143 -102.4 c 80.6034 -0.2926 152.4297 -12.1417 213.7234 -35.0354 a 399.5063 399.5063 0 0 0 160.4754 -107.52 c 39.8629 -44.3246 70.4366 -99.4743 91.2823 -163.84 c 17.5543 -54.1257 28.5257 -115.7851 32.6949 -183.9543 c 7.8994 -123.1726 -7.5337 -243.8583 -17.7006 -323.9497 z M 359.0011 -684.7657 c -347.0629 224.1829 -306.7611 509.0743 -306.7611 509.0743 c 4.1691 41.6183 -3.2914 51.0537 -10.1669 55.0034 a 25.8926 25.8926 0 0 1 -20.1874 2.56 c -16.0914 -4.8274 -17.2617 -18.6514 -16.9691 -24.9417 a 70.9486 70.9486 0 0 0 0 -7.9726 c -6.2171 -124.0503 8.192 -152.4297 20.48 -200.0457 c 6.5829 -25.3806 21.2846 -50.176 32.0366 -74.0206 c 80.0183 -176.9326 238.6651 -278.6011 278.6743 -302.08 a 30.5737 30.5737 0 0 1 25.0149 -3.072 c 10.5326 3.584 13.5314 11.1177 13.5314 18.5783 a 32.1829 32.1829 0 0 1 -15.6526 26.9166 z';

    const pathStr2 = builtinSymbolsMap['circle'].pathStr;
    const windPath1 =
      'M 0 0 C 0.1666 1 16.9 11.6 86.5 2 C 173.5 -10 352 -111.5 405.5 -232.5 C 448.299 -329.3 307.999 -300.8333 232.5 -274.5 C 183.5 -252 94.3996 -187.9 130 -111.5 C 174.5 -16 381 -77.5 405.5 -88.5 S 569.5 -173 666 -329';
    const windPath2 =
      'M 0 0 C 20.045 5.173 20.045 3.247 29.9996 3.5 C 101.5 2 286.5 -126 309 -153 S 322.5 -202.5004 309 -233.0004 S 220.5 -277.0004 201.5 -265.0004 S 164 -236.5004 178 -202.5004 C 192 -168.5 263 -81.5 365 -63 S 691.5 -81.5 810.5 -265.0004';
    const windPath3 =
      'M 0 0 C 50.305 17.954 71.476 9.45 107 0 S 196.075 -45.785 219.197 -77.898 S 278.649 -165.391 278.649 -189.483 S 274.401 -229.222 256.074 -236.01 S 203.128 -248.228 185.5 -217.5 S 182.765 -165.416 197.698 -147.768 S 332.098 -123.332 427 -141 S 602 -234.5 668.5 -384.5';
    const windPath4 = 'M 0 0 C 5 -2.5 18 -3 30 15 C 69.5 86.5 201 186 332.5 171 S 760.5 0 849 -306.5';

    const pathList = [windPath1, windPath2, windPath3, windPath4];
    const posList = [
      [100, 300],
      [30, 360],
      [160, 500],
      [130, 390]
    ];
    for (let i = 0; i < pathList.length; i++) {
      const pos = posList[i];
      const symbol = createSymbol({
        symbolType: leaf,
        fill: 'green',
        size: 100,
        x: pos[0],
        y: pos[1]
      });
      const path = createSymbol({
        symbolType: pathList[i],
        size: 600,
        x: pos[0],
        y: pos[1],
        stroke: false,
        strokeOpacity: 0.6,
        lineDash: [0.01, 0.01]
      });
      stage.defaultLayer.add(path as any);
      stage.defaultLayer.add(symbol as any);
      console.log(path.getParsedPath().path.toString());
      {
        const cp = new CustomPath2D();
        cp.setCtx(new CurveContext(cp));
        cp.fromString(path.getParsedPath().path.toString(), pos[0], pos[1], 600, 600);
        console.log(cp);
        symbol
          .animate()
          // .startAt(i * 3000)
          .play(new MotionPath(null, null, 2000, 'linear', { path: cp, distance: 1, changeAngle: true }))
          .reversed(true);
      }
      console.log(symbol);
    }
    stage.render();
  });
  addCase('stream-light', container, stage => {
    for (let i = 0; i < 5; i++) {
      const r = createRect({
        x: 400,
        y: 50 + i * 100,
        x1: 400,
        // width: 0,
        height: 20,
        fill: 'blue'
      });
      r.animate()
        .to({ x: Math.random() * 400 + 400 }, 1000, 'quadIn')
        .subAnimate()
        .play(new StreamLight('', 0, 2000, 'quadIn'))
        .loop(Infinity);
      stage.defaultLayer.add(r as any);
    }

    for (let i = 0; i < 3; i++) {
      const r = createRect({
        y: 400,
        y1: 400,
        x: 80 + i * 100,
        width: 20,
        // height: 300,
        fill: 'blue'
      });
      r.animate()
        .to({ y: Math.random() * 200 + 100 }, 1000, 'quadIn')
        .subAnimate()
        .play(new StreamLight('', 0, 2000, 'quadIn', { isHorizontal: false }))
        .loop(Infinity);
      stage.defaultLayer.add(r as any);
    }

    // for (let i = 0; i < 3; i++) {
    //   const r = createRect({
    //     y: 400,
    //     y1: 400,
    //     x: 80 + i * 100,
    //     x1: 80 + i * 100 + 20,
    //     // height: 300,
    //     fill: 'blue'
    //   });
    //   r.animate()
    //     .to({ y: Math.random() * 200 + 100 }, 1000, 'quadIn')
    //     .subAnimate()
    //     .play(new StreamLight('', 0, 2000, 'quadIn', { isHorizontal: false }))
    //     .loop(Infinity);
    //   stage.defaultLayer.add(r as any);
    // }
  });
  addCase('stream-light2', container, stage => {
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
    ].map(item => ({ x: item[0], y: item[1], x1: null, y1: 300 }));

    const line = createLine({
      points,
      curveType: 'basis',
      x: 300,
      y: 300,
      stroke: 'red'
    });
    // line
    //   .animate()
    //   .play(new StreamLight('', 0, 2000, 'quadIn', { streamLength: 30, attribute: { stroke: 'green', lineWidth: 2 } }))
    //   .loop(Infinity);

    const area = createArea({
      points,
      curveType: 'linear',
      x: 300,
      y: 300,
      stroke: ['green', false, false, false],
      lineWidth: 2,
      fill: 'red'
    });
    area
      .animate()
      .play(
        new StreamLight('', 0, 2000, 'quadIn', {
          streamLength: 30,
          attribute: { stroke: 'pink', lineWidth: 2 }
        })
      )
      .loop(Infinity);
    stage.defaultLayer.add(area as any);
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
