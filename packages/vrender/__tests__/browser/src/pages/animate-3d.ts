import {
  createStage,
  createArc,
  container,
  newThemeObj,
  defaultTicker,
  IGraphic,
  createCircle,
  createGroup,
  createText
} from '@visactor/vrender';
import { addShapesToStage, colorPools } from '../utils';

export const page = () => {
  const graphics: IGraphic[] = [];
  const sun = createCircle({
    x: 500,
    y: 500,
    radius: 696340 / 5000,
    fill: 'red'
  });

  const ship = createGroup({
    x: 800,
    y: 450
  });
  ship.setMode('3d');

  const t1 = createText({
    text: '♢',
    x: 0,
    y: -60,
    z: 0,
    beta: -Math.PI / 8,
    fontSize: 60,
    keepDirIn3d: false,
    fill: 'blue'
  });
  ship.add(t1);

  //机头
  const t2 = createText({
    text: '〔',
    x: -60,
    y: -60,
    z: 30,
    beta: -Math.PI / 8,
    keepDirIn3d: false,
    fontSize: 60,
    fill: 'blue'
  });
  ship.add(t2);

  const t3 = createText({
    text: '〕',
    x: 60,
    y: -60,
    z: 30,
    beta: -Math.PI / 8,
    keepDirIn3d: false,
    fontSize: 60,
    fill: 'blue'
  });
  ship.add(t3);

  const t4 = createText({
    text: '〔',
    x: -80,
    y: -60,
    z: 60,
    beta: -Math.PI / 8,
    keepDirIn3d: false,
    fontSize: 60,
    fill: 'blue'
  });
  ship.add(t4);

  const t5 = createText({
    text: '〕',
    x: 80,
    y: -60,
    z: 60,
    beta: -Math.PI / 8,
    keepDirIn3d: false,
    fontSize: 60,
    fill: 'blue'
  });
  ship.add(t5);

  // 机身
  const s1 = createText({
    text: '┠',
    x: -30,
    y: -30,
    z: 100,
    alpha: Math.PI / 2,
    // anchor3d: [60, 0],
    keepDirIn3d: false,
    fontSize: 60,
    fill: 'grey'
  });
  ship.add(s1);

  ship.setTheme({
    text: {
      textAlign: 'center',
      fontWeight: 'lighter'
    }
  });

  const s2 = createText({
    text: '┨',
    x: 30,
    y: -30,
    z: 100,
    alpha: -Math.PI / 2,
    keepDirIn3d: false,
    fontSize: 60,
    fill: 'grey'
  });
  ship.add(s2);

  const s3 = createText({
    text: '♢',
    x: -30,
    y: -30,
    z: 130,
    alpha: Math.PI / 2,
    // anchor3d: [60, 0],
    keepDirIn3d: false,
    fontSize: 60,
    fill: 'grey'
  });
  ship.add(s3);

  const s4 = createText({
    text: '♢',
    x: 30,
    y: -30,
    z: 130,
    alpha: -Math.PI / 2,
    keepDirIn3d: false,
    fontSize: 60,
    fill: 'grey'
  });
  ship.add(s4);

  const s5 = createText({
    text: '＠',
    x: -30,
    y: -30,
    z: 180,
    alpha: Math.PI / 2,
    // anchor3d: [60, 0],
    keepDirIn3d: false,
    fontSize: 60,
    fill: 'grey'
  });
  ship.add(s5);

  const s6 = createText({
    text: '＠',
    x: 30,
    y: -30,
    z: 180,
    alpha: -Math.PI / 2,
    keepDirIn3d: false,
    fontSize: 60,
    fill: 'grey'
  });
  ship.add(s6);

  const s7 = createText({
    text: '＾',
    x: -30,
    y: -30,
    z: 210,
    alpha: Math.PI / 2,
    // anchor3d: [60, 0],
    keepDirIn3d: false,
    fontSize: 60,
    fill: 'grey'
  });
  ship.add(s7);

  const s8 = createText({
    text: '＾',
    x: 30,
    y: -30,
    z: 210,
    alpha: -Math.PI / 2,
    keepDirIn3d: false,
    fontSize: 60,
    fill: 'grey'
  });
  ship.add(s8);

  const s9 = createText({
    text: 'Ⅲ',
    x: -30,
    y: -30,
    z: 240,
    alpha: Math.PI / 2,
    // anchor3d: [60, 0],
    keepDirIn3d: false,
    fontSize: 60,
    fill: 'grey'
  });
  ship.add(s9);

  const s10 = createText({
    text: 'Ⅲ',
    x: 30,
    y: -30,
    z: 240,
    alpha: -Math.PI / 2,
    keepDirIn3d: false,
    fontSize: 60,
    fill: 'grey'
  });
  ship.add(s10);

  // 踏板
  const b1 = createText({
    text: '-',
    x: 30,
    y: 30,
    z: 130,
    alpha: -Math.PI / 2,
    keepDirIn3d: false,
    fontSize: 50,
    fill: 'black'
  });
  ship.add(b1);
  const b2 = createText({
    text: '-',
    x: 30,
    y: 30,
    z: 180,
    alpha: -Math.PI / 2,
    keepDirIn3d: false,
    fontSize: 50,
    fill: 'black'
  });
  ship.add(b2);

  const b3 = createText({
    text: '-',
    x: -30,
    y: 30,
    z: 130,
    alpha: -Math.PI / 2,
    keepDirIn3d: false,
    fontSize: 50,
    fill: 'black'
  });
  ship.add(b3);
  const b4 = createText({
    text: '-',
    x: -30,
    y: 30,
    z: 180,
    alpha: -Math.PI / 2,
    keepDirIn3d: false,
    fontSize: 50,
    fill: 'black'
  });
  ship.add(b4);

  // 子机身
  const s11 = createText({
    text: 'L',
    x: 0,
    y: -15,
    z: 300,
    alpha: -Math.PI / 2,
    keepDirIn3d: false,
    fontSize: 50,
    fill: 'grey'
  });
  ship.add(s11);

  const s12 = createText({
    text: '♢',
    x: 0,
    y: -15,
    z: 330,
    alpha: -Math.PI / 2,
    keepDirIn3d: false,
    fontSize: 50,
    fill: 'grey'
  });
  ship.add(s12);
  const s13 = createText({
    text: '〔',
    x: 0,
    y: -15,
    z: 340,
    alpha: -Math.PI / 2,
    keepDirIn3d: false,
    fontSize: 50,
    fill: 'grey'
  });
  ship.add(s13);

  const s14 = createText({
    text: 'L',
    x: 0,
    y: -15,
    z: 420,
    alpha: -Math.PI / 2,
    keepDirIn3d: false,
    fontSize: 50,
    fill: 'grey'
  });
  ship.add(s14);

  const s15 = createText({
    text: '♢',
    x: 0,
    y: -15,
    z: 450,
    alpha: -Math.PI / 2,
    keepDirIn3d: false,
    fontSize: 50,
    fill: 'grey'
  });
  ship.add(s15);
  const s16 = createText({
    text: '〔',
    x: 0,
    y: -15,
    z: 460,
    alpha: -Math.PI / 2,
    keepDirIn3d: false,
    fontSize: 50,
    fill: 'grey'
  });
  ship.add(s16);

  const s17 = createText({
    text: 'L',
    x: 0,
    y: -15,
    z: 540,
    alpha: -Math.PI / 2,
    keepDirIn3d: false,
    fontSize: 50,
    fill: 'grey'
  });
  ship.add(s17);

  const s18 = createText({
    text: '♢',
    x: 0,
    y: -15,
    z: 570,
    alpha: -Math.PI / 2,
    keepDirIn3d: false,
    fontSize: 50,
    fill: 'grey'
  });
  ship.add(s18);
  const s19 = createText({
    text: '〔',
    x: 0,
    y: -15,
    z: 580,
    alpha: -Math.PI / 2,
    keepDirIn3d: false,
    fontSize: 50,
    fill: 'grey'
  });
  ship.add(s19);

  // 尾翼
  const w1 = createText({
    text: '-',
    x: 0,
    y: -40,
    z: 630,
    alpha: -Math.PI / 2,
    angle: -Math.PI / 6,
    keepDirIn3d: false,
    fontSize: 50,
    fill: 'grey'
  });
  ship.add(w1);

  const w2 = createText({
    text: '♢',
    x: 0,
    y: -40,
    z: 660,
    alpha: -Math.PI / 2,
    angle: -Math.PI / 6,
    keepDirIn3d: false,
    fontSize: 50,
    fill: 'grey'
  });
  ship.add(w2);

  const w3 = createText({
    text: '-',
    x: 0,
    y: -70,
    z: 680,
    alpha: -Math.PI / 2,
    angle: -Math.PI / 6,
    keepDirIn3d: false,
    fontSize: 50,
    fill: 'grey'
  });
  ship.add(w3);

  const createWg = (x: number, y: number, z: number, beta: number, alpha: number) => {
    const group = createGroup({
      x,
      y,
      z,
      anchor3d: [-10, 0, 0],
      beta
    });
    group.setTheme({
      text: {
        textAlign: 'left',
        textBaseline: 'bottom'
      }
    });

    const t1 = createText({
      text: '_',
      x: 0,
      y: 0,
      z: 0,
      alpha,
      keepDirIn3d: false,
      fontSize: 30,
      fill: 'black'
    });

    const t2 = createText({
      text: 'L',
      x: 0,
      y: 0,
      z: 30,
      alpha,
      keepDirIn3d: false,
      fontSize: 30,
      fill: 'black'
    });

    const t3 = createText({
      text: '♢',
      x: 0,
      y: 0,
      z: 50,
      alpha,
      keepDirIn3d: false,
      fontSize: 30,
      fill: 'black'
    });

    const t4 = createText({
      text: '♢',
      x: 0,
      y: 0,
      z: 70,
      alpha,
      keepDirIn3d: false,
      fontSize: 30,
      fill: 'black'
    });

    const t5 = createText({
      text: 'L',
      x: 0,
      y: 0,
      z: 90,
      alpha,
      keepDirIn3d: false,
      fontSize: 30,
      fill: 'black'
    });

    const t6 = createText({
      text: '※',
      x: 0,
      y: 0,
      z: 100,
      alpha,
      keepDirIn3d: false,
      fontSize: 30,
      fill: 'red'
    });

    group.add(t1);
    group.add(t2);
    group.add(t3);
    group.add(t4);
    group.add(t5);
    group.add(t6);
    group
      .animate()
      .to(
        {
          beta: beta + Math.PI * 2
        },
        30000,
        'linear'
      )
      .loop(Infinity)
      .onFrame((_, ratio) => {
        group.setTheme({
          text: {
            fillOpacity: Math.random() > 0.5 ? 1 : 0
          }
        });
      });
    return group;
  };

  for (let i = 0; i < 8; i++) {
    ship.add(createWg(0, -60, 650, ((Math.PI * 2) / 8) * i, -Math.PI / 2));
  }

  // 上身的风扇
  const tt1 = createText({
    text: '|',
    x: 0,
    y: -120,
    z: 180,
    textBaseline: 'top',
    fontSize: 20,
    keepDirIn3d: false,
    fill: 'black'
  });
  ship.add(tt1);

  // 上身的风扇
  const tt2 = createText({
    text: '|',
    x: 0,
    y: -150,
    z: 180,
    textBaseline: 'top',
    fontSize: 20,
    keepDirIn3d: false,
    fill: 'black'
  });
  ship.add(tt2);

  const createWg2 = (x: number, y: number, z: number, alpha: number) => {
    const group = createGroup({
      x,
      y,
      z,
      anchor3d: [0, 0, 0],
      alpha: alpha
    });
    group.setTheme({
      text: {
        textAlign: 'left',
        textBaseline: 'bottom'
      }
    });

    const t1 = createText({
      text: '_',
      x: 0,
      y: 0,
      z: 0,
      beta: Math.PI / 2 + Math.PI / 8,
      keepDirIn3d: false,
      fontSize: 30,
      fill: 'black'
    });

    const t2 = createText({
      text: 'L',
      x: 30,
      y: 0,
      z: 0,
      beta: Math.PI / 2 + Math.PI / 8,
      keepDirIn3d: false,
      fontSize: 30,
      fill: 'black'
    });

    const t3 = createText({
      text: '♢',
      x: 50,
      y: 0,
      z: 0,
      beta: Math.PI / 2 + Math.PI / 8,
      keepDirIn3d: false,
      fontSize: 30,
      fill: 'black'
    });

    const t4 = createText({
      text: '♢',
      x: 70,
      y: 0,
      z: 0,
      beta: Math.PI / 2 + Math.PI / 8,
      keepDirIn3d: false,
      fontSize: 30,
      fill: 'black'
    });

    const t5 = createText({
      text: 'L',
      x: 90,
      y: 0,
      z: 0,
      beta: Math.PI / 2 + Math.PI / 8,
      keepDirIn3d: false,
      fontSize: 30,
      fill: 'black'
    });

    const t6 = createText({
      text: '※',
      x: 100,
      y: 0,
      z: 0,
      beta: Math.PI / 2 + Math.PI / 8,
      keepDirIn3d: false,
      fontSize: 30,
      fill: 'red'
    });

    group.add(t1);
    group.add(t2);
    group.add(t3);
    group.add(t4);
    group.add(t5);
    group.add(t6);
    group
      .animate()
      .to(
        {
          alpha: alpha + Math.PI * 2
        },
        30000,
        'linear'
      )
      .loop(Infinity)
      .onFrame((_, ratio) => {
        group.setTheme({
          text: {
            fillOpacity: Math.random() > 0.5 ? 1 : 0
          }
        });
      });
    return group;
  };
  for (let i = 0; i < 8; i++) {
    ship.add(createWg2(0, -160, 180, ((Math.PI * 2) / 8) * i));
  }

  graphics.push(ship);

  const stage = createStage({
    canvas: 'main',
    autoRender: true
  });
  stage.set3dOptions({
    alpha: 0,
    beta: 0,
    center: { x: 800, y: 450 },
    fieldRatio: 0.8,
    fieldDepth: 900000,
    enableView3dTransform: true
  });

  graphics.forEach(g => {
    stage.defaultLayer.add(g);
  });
};
