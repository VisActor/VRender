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
  IGroup
} from '@visactor/vrender';
import { addShapesToStage, colorPools } from '../utils';
import { AbstractComponent } from '@visactor/vrender-components';

type ITextFlyInParams = {
  title: {
    text: string;
    attribute: Record<string, any>;
  };
  content: {
    text: string[];
    attribute: Record<string, any>;
  };
  during: number;
} & IGroupGraphicAttribute;

class TextFlyInComponents extends AbstractComponent<ITextFlyInParams> {
  titleGroup: IGroup;
  contentGroup: IGroup;
  container: IGroup;

  constructor(params: ITextFlyInParams) {
    super({
      ...params
    });
    this.setMode('3d');
  }
  render() {
    const group = this.createOrUpdateChild('container', {}, 'group') as IGroup;
    this.container = group;
    const { title, content } = this.attribute;
    // this.container.createOrUpdateChild(
    //   'debug-symbol',
    //   {
    //     symbolType: 'circle',
    //     fill: 'green'
    //   },
    //   'symbol'
    // );
    // 布局
    const layoutText = createText({
      text: [title.text],
      fontSize: 30,
      textAlign: 'center',
      textBaseline: 'middle',
      ...title.attribute
    });
    const addText = (layoutData: LayoutType, attribute: any, name: string, group: IGroup) => {
      const { xOffset, yOffset } = layoutData.bbox;
      layoutData.lines.forEach((l, i) => {
        let x = xOffset;
        let y = yOffset;
        l.str.split('').forEach((char, j) => {
          const t = group.createOrUpdateChild(
            `${name}-${i}-${j}`,
            {
              text: char,
              fontSize: 30,
              x: x + l.leftOffset,
              y: y + l.topOffset,
              keepDirIn3d: false,
              shadowBlur: 10,
              shadowColor: 'white',
              shadowOffsetX: 3,
              shadowOffsetY: 3,
              ...attribute,
              textAlign: 'left',
              textBaseline: 'alphabetic'
            },
            'text'
          ) as IText;
          x += t.clipedWidth;
        });
      });
    };
    // 计算cache
    layoutText.AABBBounds;
    const titleGroup = this.container.createOrUpdateChild(
      'title-group',
      {
        visibleAll: false
      },
      'group'
    ) as IGroup;
    addText(layoutText.cache.layoutData, title.attribute, 'title', titleGroup);
    layoutText.setAttributes({
      text: content.text,
      fontSize: 30,
      ...content.attribute
    });
    layoutText.AABBBounds;
    const contentGroup = this.container.createOrUpdateChild(
      'content-group',
      {
        visibleAll: false
      },
      'group'
    ) as IGroup;
    console.log(layoutText);
    addText(layoutText.cache.layoutData, content.attribute, 'content', contentGroup);
    // 偏移titleGroup
    const tb = titleGroup.AABBBounds;
    const cb = contentGroup.AABBBounds;
    const deltaY = cb.y1 - tb.y2;
    titleGroup.setAttributes({
      y: deltaY
    });
    this.titleGroup = titleGroup;
    this.contentGroup = contentGroup;
    const bounds = group.AABBBounds;
    const centerX = (bounds.x1 + bounds.x2) / 2;
    const centerY = (bounds.y1 + bounds.y2) / 2;
    const { x, y, width, height } = this.attribute;
    this.container.setAttributes({
      x: x + width / 2 - centerX,
      y: y + height / 2 - centerY
    });
  }
  play(during?: number): void {
    this.titleGroup.setAttributes({
      visibleAll: true
    });
    this.contentGroup.setAttributes({
      visibleAll: true
    });

    const ra = (text: IText) => {
      const r = Math.random();
      const { x, y } = text.attribute;
      const deltaX = 1000 * r * Math.random();
      const deltaY = 1000 * r * Math.random();
      text.setAttributes({
        x: x - deltaX,
        y: y + deltaY,
        blur: 2,
        alpha: Math.PI * 10 * r * Math.random(),
        beta: Math.PI * 10 * r * Math.random(),
        angle: Math.PI * 10 * r * Math.random()
      });
      text
        .animate()
        .to(
          {
            alpha: 0,
            beta: 0,
            angle: 0,
            x,
            y
          },
          (during ?? this.attribute.during ?? 3000) * r,
          'cubicOut'
        )
        .to({ blur: 0 }, 100, 'linear');
    };
    this.titleGroup.forEachChildren((text: IText) => {
      ra(text);
    });
    this.contentGroup.forEachChildren((text: IText) => {
      ra(text);
    });
  }
}

// global.setEnv('browser');

export const page = () => {
  const graphics: IGraphic[] = [];

  const stage = createStage({
    canvas: 'main',
    width: 640,
    height: 360,
    autoRender: true,
    enableLayout: true,
    background: 'black'
  });

  const tfc = new TextFlyInComponents({
    x: 0,
    y: 0,
    width: stage.width,
    height: stage.height,
    title: {
      text: '尘埃',
      attribute: {
        fontSize: 60,
        textAlign: 'center',
        fill: 'white'
      }
    },
    content: {
      text: ['我们是无缘无故的尘埃', '无缘无故的游走', '黑暗只需要张开一张缝隙', '就能挂起飓风'],
      attribute: {
        fontSize: 18,
        textAlign: 'center',
        lineHeight: 50,
        fill: 'white'
      }
    },
    during: 6000
  });

  stage.defaultLayer.add(tfc);

  stage.set3dOptions({
    center: { x: 800, y: 450 },
    fieldRatio: 0.8,
    light: {
      dir: [1, 1, -1],
      color: 'white',
      ambient: 0.3
    }
  });

  tfc.play();
  console.log(tfc);

  // text
  //   .animate()
  //   .to({ alpha: Math.PI * 2, beta: Math.PI * 2, angle: Math.PI * 2, x: 500, y: 500 }, 1000, 'linear')
  //   .to({ blur: 0 }, 100, 'linear');
};
