import { createLine, InputText, FadeInPlus } from '@visactor/vrender';
import render from '../../util/render';
import { Title } from '../../../src';

export function run() {
  const title = new Title({
    x: 0,
    y: 10,
    padding: 10,
    text: '柱形图',
    subtext: `柱形图，又称长条图、柱状统计图、条图、条状图、棒形图，是一种以长方形的长度为变量的统计图表。长条图用来比较两个或以上的价值（不同时间或者不同条件），只有一个变量，通常利用于较小的数据集分析。长条图亦可横向排列，或用多维方式表达。`,

    align: 'left',
    verticalAlign: 'top',
    width: 480,
    maxWidth: 480,
    maxHeight: 190
  });

  const stage = render(
    [
      title,
      createLine({
        points: [
          { x: 0, y: 10 },
          { x: 500, y: 10 }
        ],
        lineWidth: 1,

        stroke: '#ccc',
        lineDash: [2]
      }),
      createLine({
        points: [
          { x: 0, y: 0 },
          { x: 0, y: 200 }
        ],
        lineWidth: 1,

        stroke: '#ccc',
        lineDash: [2]
      }),
      createLine({
        points: [
          { x: 250, y: 0 },
          { x: 250, y: 200 }
        ],
        lineWidth: 1,

        stroke: '#ccc',
        lineDash: [2]
      }),
      createLine({
        points: [
          { x: 500, y: 0 },
          { x: 500, y: 200 }
        ],
        lineWidth: 1,

        stroke: '#ccc',
        lineDash: [2]
      })
    ],
    'main'
  );

  console.log(title);

  // 副标题增添打字机动画
  title._subTitle.animate().play(
    new InputText(
      { text: '' },
      {
        text: `柱形图，又称长条图、柱状统计图、条图、条状图、棒形图，是一种以长方形的长度为变量的统计图表。长条图用来比较两个或以上的价值（不同时间或者不同条件），只有一个变量，通常利用于较小的数据集分析。长条图亦可横向排列，或用多维方式表达。`
      },
      5000,
      'quadIn'
    )
  );

  // 主标题增添fadeIn动画
  title._mainTitle.animate().wait(10).play(new FadeInPlus(0, {}, 2000, 'quadIn'));
}
