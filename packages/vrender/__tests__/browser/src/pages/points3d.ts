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

type IModalParams = {
  title:
    | {
        text: string;
        attribute: Record<string, any>;
      }
    | false;
  content: {
    text: string[];
    attribute: Record<string, any>;
  };
  panel: {
    width: number;
    height: number;
    [key: string]: any;
  };
  during: number;
} & IGroupGraphicAttribute;

class ModalComponents extends AbstractComponent<IModalParams> {
  title: IText;
  content: IText;
  container: IGroup;

  constructor(params: IModalParams) {
    super({
      ...params,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center'
    });
  }
  render() {
    const { title, content, panel } = this.attribute;
    const group = this.createOrUpdateChild(
      'container',
      {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        width: panel.width,
        height: panel.height,
        ...panel
      },
      'group'
    ) as IGroup;
    this.container = group;
    if (title) {
      this.title = group.createOrUpdateChild(
        'title',
        {
          text: title.text,
          ...title.attribute
        },
        'text'
      ) as IText;
    }

    this.content = group.createOrUpdateChild(
      'content',
      {
        text: content.text,
        dy: this.title ? this.title.AABBBounds.height() / 2 : 0,
        maxLineWidth: 600,
        textBaseline: 'top',
        wrap: true,
        wordBreak: 'break-word',
        textAlign: 'left',
        ...content.attribute
      },
      'text'
    ) as IText;
  }
  play(during?: number): void {}
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

  const group = createGroup({});
  group.setMode('3d');
  const symbols = new Array(2000).fill(0).map((_, i) => {
    return createSymbol({
      symbolType: 'circle',
      size: 7,
      fill: 'white',
      x: Math.random() * stage.width + 300 - Math.random() * 600,
      y: stage.height + Math.random() * 100,
      z: 600 - Math.random() * 1200,
      keepDirIn3d: false,
      fillOpacity: 0,
      shadowBlur: 10,
      shadowColor: 'white',
      shadowOffsetX: 3,
      shadowOffsetY: 3
    });
  });

  const totalTime = 7000;
  symbols.forEach(s => {
    // 保持速度一致
    const target = stage.height * Math.random();
    const current = s.attribute.y;
    const deltaDistance = Math.abs(current - target);
    const deltaTime = (deltaDistance / (stage.height + 100)) * totalTime;
    const delayTime = totalTime - deltaTime;
    s.animate()
      .startAt(delayTime)
      .to(
        {
          y: stage.height * Math.random()
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

  function toCircle(r: number, cx: number, cy: number, cz: number) {
    symbols.forEach(s => {
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
  }

  setTimeout(() => {
    toCircle(300, stage.width / 2, stage.height / 2, 300);
  }, totalTime);

  symbols.forEach(s => {
    group.add(s);
  });
  stage.defaultLayer.add(group);
};
