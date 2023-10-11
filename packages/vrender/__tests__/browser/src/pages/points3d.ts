import {
  createStage,
  createText,
  createRect,
  createCircle,
  IGraphic,
  IText,
  IRichText,
  createRichText,
  IRichTextAttribute,
  IGroupGraphicAttribute,
  LayoutType,
  IGroup,
  createSymbol,
  createGroup,
  RotateBySphereAnimate
} from '@visactor/vrender';
import { addShapesToStage, colorPools } from '../utils';
import { AbstractComponent } from '@visactor/vrender-components';

type IPoints3dParams = {
  count: number;
  width: number;
  height: number;
} & IGroupGraphicAttribute;

class Points3dComponents extends AbstractComponent<IPoints3dParams> {
  container: IGroup;

  constructor(params: IPoints3dParams) {
    super({
      ...params,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center'
    });
  }
  render() {
    const { count, width, height } = this.attribute;
    const group = this.createOrUpdateChild('container', {}, 'group') as IGroup;
    group.setMode('3d');
    this.container = group;
    const symbols = new Array(count).fill(0).map((_, i) => {
      return createSymbol({
        symbolType: 'circle',
        size: 7,
        fill: 'white',
        x: Math.random() * width + 300 - Math.random() * 600,
        y: height + Math.random() * 100,
        z: width / 2 - Math.random() * width,
        keepDirIn3d: false,
        fillOpacity: 0,
        shadowBlur: 10,
        shadowColor: 'white',
        shadowOffsetX: 3,
        shadowOffsetY: 3
      });
    });
    symbols.forEach(s => {
      group.add(s);
    });
  }
  play(during: number = 10000): void {
    const upTime = (during - 1000) * 0.8;
    const { width, height } = this.attribute;
    this.container.forEachChildren((s: symbol) => {
      // 保持速度一致
      const target = height * Math.random();
      const current = s.attribute.y;
      const deltaDistance = Math.abs(current - target);
      const deltaTime = (deltaDistance / (height + 100)) * upTime;
      const delayTime = upTime - deltaTime;
      s.animate()
        .startAt(delayTime)
        .to(
          {
            y: height * Math.random()
          },
          deltaTime,
          'circOut'
        );
      s.animate().startAt(delayTime).to(
        {
          fillOpacity: 1
        },
        1000,
        'linear'
      );
    });

    const toCircle = (r: number, cx: number, cy: number, cz: number) => {
      this.container.forEachChildren(s => {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;
        const nx = r * Math.sin(phi) * Math.cos(theta) + cx;
        const ny = r * Math.cos(phi) + cy;
        const nz = r * Math.sin(phi) * Math.sin(theta) + cz;
        s.setAttributes({
          keepDirIn3d: true
        });
        s.animate()
          .to(
            {
              x: nx,
              y: ny,
              z: nz
            },
            2000,
            'cubicIn'
          )
          .wait(500)
          .subAnimate()
          .play(
            new RotateBySphereAnimate(null, null, 30000, 'linear', {
              center: { x: cx, y: cy, z: cz },
              r,
              cb(out: any) {
                const dz = cz - out.z;
                const scale = 1 + dz / (r * 3);
                console.log(scale);
                out.scaleX = scale;
                out.scaleY = scale;
              }
            })
          )
          .loop(Infinity);
      });
    };

    setTimeout(() => {
      toCircle(300, width / 2, height / 2, 300);
    }, upTime + 100);
  }
}

// global.setEnv('browser');

export const page = () => {
  const graphics: IGraphic[] = [];

  const stage = createStage({
    canvas: 'main',
    autoRender: true,
    enableLayout: true,
    background: 'black'
  });

  stage.set3dOptions({
    center: { x: 800, y: 450 },
    fieldRatio: 0.8,
    light: {
      dir: [1, 1, -1],
      color: 'white',
      ambient: 0.3
    }
  });

  const tfc = new Points3dComponents({
    width: stage.width,
    height: stage.height,
    count: 1000
  });

  stage.defaultLayer.add(tfc);

  tfc.play();
  console.log(tfc);

  // const group = createGroup({});
  // group.setMode('3d');
  // const symbols = new Array(2000).fill(0).map((_, i) => {
  //   return createSymbol({
  //     symbolType: 'circle',
  //     size: 7,
  //     fill: 'white',
  //     x: Math.random() * stage.width + 300 - Math.random() * 600,
  //     y: stage.height + Math.random() * 100,
  //     z: 600 - Math.random() * 1200,
  //     keepDirIn3d: false,
  //     fillOpacity: 0,
  //     shadowBlur: 10,
  //     shadowColor: 'white',
  //     shadowOffsetX: 3,
  //     shadowOffsetY: 3
  //   });
  // });

  // const totalTime = 7000;
  // symbols.forEach(s => {
  //   // 保持速度一致
  //   const target = stage.height * Math.random();
  //   const current = s.attribute.y;
  //   const deltaDistance = Math.abs(current - target);
  //   const deltaTime = (deltaDistance / (stage.height + 100)) * totalTime;
  //   const delayTime = totalTime - deltaTime;
  //   s.animate()
  //     .startAt(delayTime)
  //     .to(
  //       {
  //         y: stage.height * Math.random()
  //       },
  //       deltaTime,
  //       'circOut'
  //     );
  //   s.animate().startAt(delayTime).to(
  //     {
  //       fillOpacity: 1
  //     },
  //     1000,
  //     'linear'
  //   );
  // });

  // setTimeout(() => {
  //   toCircle(300, stage.width / 2, stage.height / 2, 300);
  // }, totalTime);

  // symbols.forEach(s => {
  //   group.add(s);
  // });
  // stage.defaultLayer.add(group);
};
