import { createStage, DragNDrop, createCircle, container, vglobal } from '@visactor/vrender';
import { colorPools } from '../utils';
import { createGroup } from '@visactor/vrender';
import { createLottie, lottieCanvasPickModule, lottieModule } from '@visactor/vrender-kits';

container.load(lottieModule);
container.load(lottieCanvasPickModule);
export const page = () => {
  const t = performance.now();
  const stage = createStage({
    canvas: 'main',
    autoRender: true
  });
  const delta = performance.now() - t;
  window.delta = delta;
  const graphics: any[] = [];

  const lottie = createLottie({
    data: {
      v: '5.7.4',
      fr: 60,
      ip: 0,
      op: 240,
      w: 1024,
      h: 1024,
      nm: 'Blustery',
      ddd: 0,
      assets: [],
      layers: [
        {
          ddd: 0,
          ind: 1,
          ty: 4,
          nm: 'Blustery 2',
          sr: 1,
          ks: {
            o: { a: 0, k: 100, ix: 11 },
            r: { a: 0, k: 0, ix: 10 },
            p: {
              a: 1,
              k: [
                {
                  i: { x: 0.667, y: 1 },
                  o: { x: 0.333, y: 0 },
                  t: 30,
                  s: [477.8, 579.851, 0],
                  to: [6.667, 0, 0],
                  ti: [0, 0, 0]
                },
                {
                  i: { x: 0.667, y: 1 },
                  o: { x: 0.333, y: 0 },
                  t: 90,
                  s: [517.8, 579.851, 0],
                  to: [0, 0, 0],
                  ti: [6.667, 0, 0]
                },
                { t: 180, s: [477.8, 579.851, 0] }
              ],
              ix: 2,
              l: 2
            },
            a: { a: 0, k: [0, 0, 0], ix: 1, l: 2 },
            s: { a: 0, k: [100, 100, 100], ix: 6, l: 2 }
          },
          ao: 0,
          shapes: [
            {
              ty: 'gr',
              it: [
                {
                  ind: 0,
                  ty: 'sh',
                  ix: 1,
                  ks: {
                    a: 0,
                    k: {
                      i: [
                        [1.3, 0.1],
                        [0, 0],
                        [0, 0],
                        [0, 0],
                        [0, 0],
                        [0, 0],
                        [-2.3, 21.9],
                        [21.9, 2.3],
                        [1.4, 0],
                        [1.3, -0.1],
                        [0, 0],
                        [-1.4, 0],
                        [0, -39.7],
                        [39.7, 0]
                      ],
                      o: [
                        [0, 0],
                        [0, 0],
                        [0, 0],
                        [0, 0],
                        [0, 0],
                        [21.9, 2.2],
                        [2.2, -21.9],
                        [-1.4, -0.1],
                        [-1.4, 0],
                        [0, 0],
                        [1.3, -0.1],
                        [39.7, 0],
                        [0, 39.7],
                        [-1.3, 0.1]
                      ],
                      v: [
                        [93.95, 71.75],
                        [93.95, 71.95],
                        [-169.75, 71.95],
                        [-169.75, 39.95],
                        [93.85, 39.95],
                        [93.85, 39.75],
                        [137.65, 4.05],
                        [101.95, -39.75],
                        [97.85, -39.95],
                        [93.85, -39.75],
                        [93.85, -71.75],
                        [97.85, -71.95],
                        [169.75, -0.05],
                        [97.85, 71.85]
                      ],
                      c: true
                    },
                    ix: 2
                  },
                  nm: '路径 1',
                  mn: 'ADBE Vector Shape - Group',
                  hd: false
                },
                {
                  ty: 'fl',
                  c: { a: 0, k: [1, 0.86274510622, 0, 1], ix: 4 },
                  o: { a: 0, k: 100, ix: 5 },
                  r: 1,
                  bm: 0,
                  nm: '填充 1',
                  mn: 'ADBE Vector Graphic - Fill',
                  hd: false
                },
                {
                  ty: 'tr',
                  p: { a: 0, k: [0, 0], ix: 2 },
                  a: { a: 0, k: [0, 0], ix: 1 },
                  s: { a: 0, k: [100, 100], ix: 3 },
                  r: { a: 0, k: 0, ix: 6 },
                  o: { a: 0, k: 100, ix: 7 },
                  sk: { a: 0, k: 0, ix: 4 },
                  sa: { a: 0, k: 0, ix: 5 },
                  nm: '变换'
                }
              ],
              nm: 'Blustery',
              np: 2,
              cix: 2,
              bm: 0,
              ix: 1,
              mn: 'ADBE Vector Group',
              hd: false
            }
          ],
          ip: 0,
          op: 240,
          st: 0,
          bm: 0
        },
        {
          ddd: 0,
          ind: 2,
          ty: 4,
          nm: 'Blustery',
          sr: 1,
          ks: {
            o: { a: 0, k: 100, ix: 11 },
            r: { a: 0, k: 0, ix: 10 },
            p: {
              a: 1,
              k: [
                {
                  i: { x: 0.667, y: 1 },
                  o: { x: 0.333, y: 0 },
                  t: 30,
                  s: [568.9, 699.701, 0],
                  to: [-7.5, 0, 0],
                  ti: [0, 0, 0]
                },
                {
                  i: { x: 0.667, y: 1 },
                  o: { x: 0.333, y: 0 },
                  t: 90,
                  s: [523.9, 699.701, 0],
                  to: [0, 0, 0],
                  ti: [-7.5, 0, 0]
                },
                { t: 180, s: [568.9, 699.701, 0] }
              ],
              ix: 2,
              l: 2
            },
            a: { a: 0, k: [0, 0, 0], ix: 1, l: 2 },
            s: { a: 0, k: [100, 100, 100], ix: 6, l: 2 }
          },
          ao: 0,
          shapes: [
            {
              ty: 'gr',
              it: [
                {
                  ind: 0,
                  ty: 'sh',
                  ix: 1,
                  ks: {
                    a: 0,
                    k: {
                      i: [
                        [0, 0],
                        [0, 0],
                        [0, 0],
                        [0, 0]
                      ],
                      o: [
                        [0, 0],
                        [0, 0],
                        [0, 0],
                        [0, 0]
                      ],
                      v: [
                        [-119.85, 16],
                        [-119.85, -16],
                        [119.85, -16],
                        [119.85, 16]
                      ],
                      c: true
                    },
                    ix: 2
                  },
                  nm: '路径 1',
                  mn: 'ADBE Vector Shape - Group',
                  hd: false
                },
                {
                  ty: 'fl',
                  c: { a: 0, k: [1, 0.86274510622, 0, 1], ix: 4 },
                  o: { a: 0, k: 100, ix: 5 },
                  r: 1,
                  bm: 0,
                  nm: '填充 1',
                  mn: 'ADBE Vector Graphic - Fill',
                  hd: false
                },
                {
                  ty: 'tr',
                  p: { a: 0, k: [0, 0], ix: 2 },
                  a: { a: 0, k: [0, 0], ix: 1 },
                  s: { a: 0, k: [100, 100], ix: 3 },
                  r: { a: 0, k: 0, ix: 6 },
                  o: { a: 0, k: 100, ix: 7 },
                  sk: { a: 0, k: 0, ix: 4 },
                  sa: { a: 0, k: 0, ix: 5 },
                  nm: '变换'
                }
              ],
              nm: 'Blustery',
              np: 2,
              cix: 2,
              bm: 0,
              ix: 1,
              mn: 'ADBE Vector Group',
              hd: false
            }
          ],
          ip: 0,
          op: 240,
          st: 0,
          bm: 0
        },
        {
          ddd: 0,
          ind: 3,
          ty: 4,
          nm: 'Shape',
          sr: 1,
          ks: {
            o: { a: 0, k: 100, ix: 11 },
            r: { a: 0, k: 0, ix: 10 },
            p: {
              a: 1,
              k: [
                {
                  i: { x: 0.667, y: 1 },
                  o: { x: 0.333, y: 0 },
                  t: 0,
                  s: [411.799, 483.851, 0],
                  to: [4.667, 0, 0],
                  ti: [0, 0, 0]
                },
                {
                  i: { x: 0.667, y: 1 },
                  o: { x: 0.333, y: 0 },
                  t: 120,
                  s: [439.799, 483.851, 0],
                  to: [0, 0, 0],
                  ti: [4.667, 0, 0]
                },
                { t: 239, s: [411.799, 483.851, 0] }
              ],
              ix: 2,
              l: 2
            },
            a: { a: 0, k: [0, 0, 0], ix: 1, l: 2 },
            s: { a: 0, k: [100, 100, 100], ix: 6, l: 2 }
          },
          ao: 0,
          shapes: [
            {
              ty: 'gr',
              it: [
                {
                  ind: 0,
                  ty: 'sh',
                  ix: 1,
                  ks: {
                    a: 0,
                    k: {
                      i: [
                        [0, 0],
                        [9.8, -47.3],
                        [22.6, 0.1],
                        [-0.9, -42.7],
                        [-41.5, -0.7],
                        [0, 0],
                        [1, 57.4],
                        [56, 1]
                      ],
                      o: [
                        [-48.3, 0.3],
                        [-14.1, -17.6],
                        [-42.6, 0.8],
                        [0.8, 41.5],
                        [0, 0],
                        [57.4, -1],
                        [-1, -55.9],
                        [0, 0]
                      ],
                      v: [
                        [65.551, -103.95],
                        [-34.049, -22.35],
                        [-92.049, -50.45],
                        [-167.749, 28.25],
                        [-92.049, 103.95],
                        [65.551, 103.95],
                        [167.751, -1.85],
                        [65.551, -103.95]
                      ],
                      c: true
                    },
                    ix: 2
                  },
                  nm: '路径 1',
                  mn: 'ADBE Vector Shape - Group',
                  hd: false
                },
                {
                  ty: 'fl',
                  c: { a: 0, k: [1, 1, 1, 1], ix: 4 },
                  o: { a: 0, k: 100, ix: 5 },
                  r: 1,
                  bm: 0,
                  nm: '填充 1',
                  mn: 'ADBE Vector Graphic - Fill',
                  hd: false
                },
                {
                  ty: 'tr',
                  p: { a: 0, k: [0, 0], ix: 2 },
                  a: { a: 0, k: [0, 0], ix: 1 },
                  s: { a: 0, k: [100, 100], ix: 3 },
                  r: { a: 0, k: 0, ix: 6 },
                  o: { a: 0, k: 100, ix: 7 },
                  sk: { a: 0, k: 0, ix: 4 },
                  sa: { a: 0, k: 0, ix: 5 },
                  nm: '变换'
                }
              ],
              nm: 'Shape',
              np: 2,
              cix: 2,
              bm: 0,
              ix: 1,
              mn: 'ADBE Vector Group',
              hd: false
            }
          ],
          ip: 0,
          op: 240,
          st: 0,
          bm: 0
        },
        {
          ddd: 0,
          ind: 4,
          ty: 4,
          nm: 'Shape ',
          sr: 1,
          ks: {
            o: { a: 0, k: 60, ix: 11 },
            r: { a: 0, k: 0, ix: 10 },
            p: {
              a: 1,
              k: [
                {
                  i: { x: 0.667, y: 1 },
                  o: { x: 0.333, y: 0 },
                  t: 0,
                  s: [572.951, 448.051, 0],
                  to: [-6.5, 0, 0],
                  ti: [0, 0, 0]
                },
                {
                  i: { x: 0.667, y: 1 },
                  o: { x: 0.333, y: 0 },
                  t: 120,
                  s: [533.951, 448.051, 0],
                  to: [0, 0, 0],
                  ti: [-6.5, 0, 0]
                },
                { t: 239, s: [572.951, 448.051, 0] }
              ],
              ix: 2,
              l: 2
            },
            a: { a: 0, k: [0, 0, 0], ix: 1, l: 2 },
            s: { a: 0, k: [100, 100, 100], ix: 6, l: 2 }
          },
          ao: 0,
          shapes: [
            {
              ty: 'gr',
              it: [
                {
                  ind: 0,
                  ty: 'sh',
                  ix: 1,
                  ks: {
                    a: 0,
                    k: {
                      i: [
                        [0, 0],
                        [0, 0.9],
                        [-77.3, -0.1],
                        [-26.4, -34.5],
                        [-3.7, 0],
                        [-0.3, -62.2],
                        [62.2, -0.3],
                        [0.4, 0],
                        [0, 0],
                        [0.3, 37.9],
                        [-34.7, 4.2]
                      ],
                      o: [
                        [0, -0.9],
                        [0.1, -77.3],
                        [43.5, 0.1],
                        [3.7, -0.4],
                        [62.2, -0.4],
                        [0.4, 62.2],
                        [-0.4, 0],
                        [0, 0],
                        [-38, 0.2],
                        [-0.2, -34.9],
                        [0, 0]
                      ],
                      v: [
                        [-157.401, 2.85],
                        [-157.5, 0.05],
                        [-17.301, -139.75],
                        [93.599, -84.95],
                        [104.699, -85.55],
                        [217.999, 26.45],
                        [105.999, 139.75],
                        [104.699, 139.75],
                        [-148.801, 139.75],
                        [-218.001, 71.45],
                        [-157.401, 2.85]
                      ],
                      c: true
                    },
                    ix: 2
                  },
                  nm: '路径 1',
                  mn: 'ADBE Vector Shape - Group',
                  hd: false
                },
                {
                  ty: 'fl',
                  c: { a: 0, k: [1, 1, 1, 1], ix: 4 },
                  o: { a: 0, k: 100, ix: 5 },
                  r: 1,
                  bm: 0,
                  nm: '填充 1',
                  mn: 'ADBE Vector Graphic - Fill',
                  hd: false
                },
                {
                  ty: 'tr',
                  p: { a: 0, k: [0, 0], ix: 2 },
                  a: { a: 0, k: [0, 0], ix: 1 },
                  s: { a: 0, k: [100, 100], ix: 3 },
                  r: { a: 0, k: 0, ix: 6 },
                  o: { a: 0, k: 100, ix: 7 },
                  sk: { a: 0, k: 0, ix: 4 },
                  sa: { a: 0, k: 0, ix: 5 },
                  nm: '变换'
                }
              ],
              nm: 'Shape ',
              np: 2,
              cix: 2,
              bm: 0,
              ix: 1,
              mn: 'ADBE Vector Group',
              hd: false
            }
          ],
          ip: 0,
          op: 240,
          st: 0,
          bm: 0
        },
        {
          ddd: 0,
          ind: 5,
          ty: 4,
          nm: 'Bg',
          sr: 1,
          ks: {
            o: { a: 0, k: 100, ix: 11 },
            r: { a: 0, k: 0, ix: 10 },
            p: { a: 0, k: [512, 512, 0], ix: 2, l: 2 },
            a: { a: 0, k: [0, 0, 0], ix: 1, l: 2 },
            s: { a: 0, k: [100, 100, 100], ix: 6, l: 2 }
          },
          ao: 0,
          shapes: [
            {
              ty: 'gr',
              it: [
                {
                  ind: 0,
                  ty: 'sh',
                  ix: 1,
                  ks: {
                    a: 0,
                    k: {
                      i: [
                        [0, 0],
                        [0, 0],
                        [0, 0],
                        [0, 0]
                      ],
                      o: [
                        [0, 0],
                        [0, 0],
                        [0, 0],
                        [0, 0]
                      ],
                      v: [
                        [512, 512],
                        [-512, 512],
                        [-512, -512],
                        [512, -512]
                      ],
                      c: true
                    },
                    ix: 2
                  },
                  nm: '路径 1',
                  mn: 'ADBE Vector Shape - Group',
                  hd: false
                },
                {
                  ty: 'fl',
                  c: { a: 0, k: [0.06274510175, 0.078431375325, 0.156862750649, 1], ix: 4 },
                  o: { a: 0, k: 100, ix: 5 },
                  r: 1,
                  bm: 0,
                  nm: '填充 1',
                  mn: 'ADBE Vector Graphic - Fill',
                  hd: false
                },
                {
                  ty: 'tr',
                  p: { a: 0, k: [0, 0], ix: 2 },
                  a: { a: 0, k: [0, 0], ix: 1 },
                  s: { a: 0, k: [100, 100], ix: 3 },
                  r: { a: 0, k: 0, ix: 6 },
                  o: { a: 0, k: 100, ix: 7 },
                  sk: { a: 0, k: 0, ix: 4 },
                  sa: { a: 0, k: 0, ix: 5 },
                  nm: '变换'
                }
              ],
              nm: 'Bg',
              np: 2,
              cix: 2,
              bm: 0,
              ix: 1,
              mn: 'ADBE Vector Group',
              hd: false
            }
          ],
          ip: 0,
          op: 240,
          st: 0,
          bm: 0
        }
      ],
      markers: []
    },
    width: 300,
    height: 300,
    x: 100,
    y: 100,
    cornerRadius: 20,
    background: 'pink'
  });
  graphics.push(lottie);

  setTimeout(() => {
    lottie.setAttributes({ data: 'https://labs.nearpod.com/bodymovin/demo/markus/halloween/markus.json' });
  }, 10000);
  stage.setTheme({
    common: {
      lineWidth: 6
    }
  });

  graphics.forEach(g => {
    stage.defaultLayer.add(g);
  });

  console.log(stage);
};
