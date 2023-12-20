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
  title!: IText;
  content!: IText;
  container!: IGroup;

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
        width: panel!.width,
        height: panel!.height,
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
          fillOpacity: 0,
          ...title.attribute
        },
        'text'
      ) as IText;
    }

    this.content = group.createOrUpdateChild(
      'content',
      {
        text: content!.text,
        dy: this.title ? this.title.AABBBounds.height() / 2 : 0,
        maxLineWidth: 600,
        textBaseline: 'top',
        fillOpacity: 0,
        wrap: true,
        wordBreak: 'break-word',
        textAlign: 'left',
        ...content!.attribute
      },
      'text'
    ) as IText;
  }
  play(during?: number): void {
    this.title &&
      this.title.animate().to(
        {
          fillOpacity: 1
        },
        (during ?? 2000) / 2,
        'linear'
      );
    this.content &&
      this.content.animate().to(
        {
          fillOpacity: 1
        },
        (during ?? 2000) / 2,
        'linear'
      );
  }
}

// global.setEnv('browser');

export const page = () => {
  const graphics: IGraphic[] = [];

  const stage = createStage({
    canvas: 'main',
    autoRender: true,
    enableLayout: true,
    width: 660,
    height: 560,
    background: 'black'
  });

  const tfc = new ModalComponents({
    x: 0,
    y: 0,
    width: stage.width,
    height: stage.height,
    title: false,
    content: {
      text: ['地图散点图显示了美国各州的疫情蔓延情况', '随着时间的推移', '各州的确诊人数不断增加'],
      attribute: {
        fontSize: 18,
        lineHeight: 80,
        fill: 'white'
      }
    },
    panel: {
      fill: 'grey',
      fillOpacity: 0.3,
      width: stage.width * 0.8,
      height: stage.height * 0.8
    },
    during: 6000
  });

  stage.defaultLayer.add(tfc);

  tfc.play();
  console.log(tfc);

  // text
  //   .animate()
  //   .to({ alpha: Math.PI * 2, beta: Math.PI * 2, angle: Math.PI * 2, x: 500, y: 500 }, 1000, 'linear')
  //   .to({ blur: 0 }, 100, 'linear');
};
